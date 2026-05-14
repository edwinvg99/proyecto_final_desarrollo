const express = require('express');
const axios = require('axios');
const router = express.Router();

async function withRetry(fn, retries = 3, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
}

const SIMEM_BASE = 'https://www.simem.co/backend-files/api/PublicData';
const DATASET_GENERACION = 'E17D25';
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

const TIPOS_RENOVABLES = new Set(['Solar', 'Eólica', 'Hidráulica', 'Filo de Agua']);

// Caché por rango de días para que 7/14/30 sean independientes
const generacionCacheMap = new Map(); // rangoDias -> { data, lastFetch }

// Normaliza los nombres de tipo que devuelve SIMEM (pueden venir sin acentos)
const TIPO_MAP = {
  'hidraulica': 'Hidráulica',
  'hidráulica': 'Hidráulica',
  'solar': 'Solar',
  'eolica': 'Eólica',
  'eólica': 'Eólica',
  'termica': 'Térmica',
  'térmica': 'Térmica',
  'cogeneracion': 'Cogeneración',
  'cogeneración': 'Cogeneración',
  'filo de agua': 'Filo de Agua',
};

function normalizarTipo(tipo) {
  if (!tipo) return 'Desconocido';
  return TIPO_MAP[tipo.toLowerCase()] || tipo;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function buildDateRange(rangoDias) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (rangoDias - 1));
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
}

async function fetchGeneracion(rangoDias = 7) {
  const now = Date.now();
  const cached = generacionCacheMap.get(rangoDias);

  if (cached && (now - cached.lastFetch) < CACHE_TTL) {
    console.log(`[SIMEM] Usando caché existente para ${rangoDias} días`);
    return cached.data;
  }

  const { startDate, endDate } = buildDateRange(rangoDias);
  console.log(`[SIMEM] Consultando E17D25 del ${startDate} al ${endDate}`);

  const url = `${SIMEM_BASE}?startDate=${startDate}&endDate=${endDate}&datasetId=${DATASET_GENERACION}`;

  const { data: apiResponse } = await withRetry(() => axios.get(url, {
    timeout: 25000,
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'es-CO,es;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  }));

  // SIMEM puede devolver records bajo result.records o result.data
  const records = apiResponse?.result?.records
    || apiResponse?.result?.data
    || [];

  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('SIMEM devolvió respuesta vacía o formato inesperado');
  }

  // Normalizar columnas y corregir acentos en TipoGeneracion
  const normalized = records.map(r => ({
    fecha: r.Fecha || r.fecha || '',
    tipo: normalizarTipo(r.TipoGeneracion || r.tipoGeneracion || r.tipogeneracion || ''),
    generacion: parseFloat(r.GeneracionRealEstimada || r.generacionRealEstimada || r.generacionrealestimada || 0),
  }));

  // Agregar por [fecha, tipo] — suma de MWh
  const byDateType = new Map();
  for (const row of normalized) {
    if (!row.fecha || isNaN(row.generacion)) continue;
    const key = `${row.fecha}|${row.tipo}`;
    if (!byDateType.has(key)) {
      byDateType.set(key, { fecha: row.fecha, tipo: row.tipo, totalMWh: 0 });
    }
    byDateType.get(key).totalMWh += row.generacion;
  }

  const agregado = Array.from(byDateType.values());

  // Fechas únicas ordenadas
  const fechas = Array.from(new Set(agregado.map(r => r.fecha))).sort();

  // Construir mixPorDia
  const mixPorDia = fechas.map(fecha => {
    const filasDia = agregado.filter(r => r.fecha === fecha);
    const porTipo = {};
    let total = 0;
    for (const fila of filasDia) {
      porTipo[fila.tipo] = (porTipo[fila.tipo] || 0) + fila.totalMWh;
      total += fila.totalMWh;
    }
    return { fecha, porTipo, total: Math.round(total) };
  });

  // KPIs del día más reciente con datos
  const ultimoDia = mixPorDia[mixPorDia.length - 1] || { fecha: '', porTipo: {}, total: 0 };
  const totalUltimoDia = ultimoDia.total;

  let renovableUltimoDia = 0;
  for (const [tipo, mwh] of Object.entries(ultimoDia.porTipo)) {
    if (TIPOS_RENOVABLES.has(tipo)) renovableUltimoDia += mwh;
  }
  const pctRenovable = totalUltimoDia > 0
    ? Math.round((renovableUltimoDia / totalUltimoDia) * 100)
    : 0;

  const fuenteDominante = Object.entries(ultimoDia.porTipo)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/D';

  // Totales por tipo para todo el período
  const totalesPorTipo = {};
  for (const row of agregado) {
    totalesPorTipo[row.tipo] = (totalesPorTipo[row.tipo] || 0) + row.totalMWh;
  }
  const totalPeriodo = Object.values(totalesPorTipo).reduce((a, b) => a + b, 0);

  const resumenPorTipo = Object.entries(totalesPorTipo)
    .map(([tipo, mwh]) => ({
      tipo,
      totalMWh: Math.round(mwh),
      pctDelTotal: totalPeriodo > 0 ? Math.round((mwh / totalPeriodo) * 100) : 0,
      esRenovable: TIPOS_RENOVABLES.has(tipo),
    }))
    .sort((a, b) => b.totalMWh - a.totalMWh);

  const resultado = {
    meta: {
      startDate,
      endDate,
      dataset: DATASET_GENERACION,
      totalRegistros: records.length,
      fechasConDatos: fechas.length,
    },
    kpis: {
      totalMWhUltimoDia: totalUltimoDia,
      fechaUltimoDia: ultimoDia.fecha,
      pctRenovable,
      fuenteDominante,
    },
    mixPorDia,
    resumenPorTipo,
    cache: {
      lastFetch: new Date(now).toISOString(),
      ttlMinutes: CACHE_TTL / 60000,
    },
  };

  generacionCacheMap.set(rangoDias, { data: resultado, lastFetch: now });
  console.log(`[SIMEM] Procesado (${rangoDias}d): ${fechas.length} días, ${records.length} registros, ${resumenPorTipo.length} tipos`);
  return resultado;
}

router.get('/generacion', async (req, res) => {
  try {
    const dias = Math.min(Math.max(parseInt(req.query.dias) || 7, 1), 31);
    const data = await fetchGeneracion(dias);
    res.json(data);
  } catch (error) {
    console.error('[SIMEM] Error en /generacion:', error.message);
    res.status(502).json({
      error: 'No se pudo obtener datos de SIMEM',
      message: error.message,
      sugerencia: 'La API de SIMEM puede estar temporalmente no disponible. Intenta de nuevo en unos minutos.',
    });
  }
});

router.post('/refresh', async (req, res) => {
  generacionCacheMap.clear();
  try {
    const data = await fetchGeneracion();
    res.json({
      success: true,
      fechas: data.meta.fechasConDatos,
      registros: data.meta.totalRegistros,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

module.exports = router;
