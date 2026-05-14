const SIMEM_BASE = 'https://www.simem.co/backend-files/api/PublicData';
const DATASET_GENERACION = 'E17D25';
const CACHE_TTL = 60 * 60 * 1000;

const TIPOS_RENOVABLES = new Set(['Solar', 'Eólica', 'Hidráulica', 'Filo de Agua']);

const TIPO_MAP = {
  hidraulica: 'Hidráulica', hidráulica: 'Hidráulica',
  solar: 'Solar',
  eolica: 'Eólica', eólica: 'Eólica',
  termica: 'Térmica', térmica: 'Térmica',
  cogeneracion: 'Cogeneración', cogeneración: 'Cogeneración',
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

const generacionCacheMap = new Map();

export async function fetchGeneracion(rangoDias = 7) {
  const now = Date.now();
  const cached = generacionCacheMap.get(rangoDias);
  if (cached && (now - cached.lastFetch) < CACHE_TTL) return cached.data;

  const { startDate, endDate } = buildDateRange(rangoDias);
  const url = `${SIMEM_BASE}?startDate=${startDate}&endDate=${endDate}&datasetId=${DATASET_GENERACION}`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'es-CO,es;q=0.9',
    },
  });

  if (!res.ok) throw new Error(`SIMEM respondió con status ${res.status}`);
  const apiResponse = await res.json();

  const records = apiResponse?.result?.records || apiResponse?.result?.data || [];
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('SIMEM devolvió respuesta vacía o formato inesperado');
  }

  const normalized = records.map(r => ({
    fecha: r.Fecha || r.fecha || '',
    tipo: normalizarTipo(r.TipoGeneracion || r.tipoGeneracion || r.tipogeneracion || ''),
    generacion: parseFloat(r.GeneracionRealEstimada || r.generacionRealEstimada || r.generacionrealestimada || 0),
  }));

  const byDateType = new Map();
  for (const row of normalized) {
    if (!row.fecha || isNaN(row.generacion)) continue;
    const key = `${row.fecha}|${row.tipo}`;
    if (!byDateType.has(key)) byDateType.set(key, { fecha: row.fecha, tipo: row.tipo, totalMWh: 0 });
    byDateType.get(key).totalMWh += row.generacion;
  }

  const agregado = Array.from(byDateType.values());
  const fechas = Array.from(new Set(agregado.map(r => r.fecha))).sort();

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

  const ultimoDia = mixPorDia[mixPorDia.length - 1] || { fecha: '', porTipo: {}, total: 0 };
  const totalUltimoDia = ultimoDia.total;
  let renovableUltimoDia = 0;
  for (const [tipo, mwh] of Object.entries(ultimoDia.porTipo)) {
    if (TIPOS_RENOVABLES.has(tipo)) renovableUltimoDia += mwh;
  }
  const pctRenovable = totalUltimoDia > 0 ? Math.round((renovableUltimoDia / totalUltimoDia) * 100) : 0;
  const fuenteDominante = Object.entries(ultimoDia.porTipo).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/D';

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
    meta: { startDate, endDate, dataset: DATASET_GENERACION, totalRegistros: records.length, fechasConDatos: fechas.length },
    kpis: { totalMWhUltimoDia: totalUltimoDia, fechaUltimoDia: ultimoDia.fecha, pctRenovable, fuenteDominante },
    mixPorDia,
    resumenPorTipo,
    cache: { lastFetch: new Date(now).toISOString(), ttlMinutes: CACHE_TTL / 60000 },
  };

  generacionCacheMap.set(rangoDias, { data: resultado, lastFetch: now });
  return resultado;
}

export function clearSimemCache() {
  generacionCacheMap.clear();
}
