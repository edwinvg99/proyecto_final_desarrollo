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

const CACHE_TTL = 60 * 60 * 1000;

// Métricas con MetricId, endpoint, entity y tipo de agregación para datos horarios
const XM_PROXY = 'https://sinergox-proxy.velasquezgiraldoedwin.workers.dev';

const METRICAS = {
  Gene: {
    label: 'Generación Total',
    unidad: 'kWh',
    color: 'emerald',
    entity: 'Sistema',
    url: `${XM_PROXY}/hourly`,
    agregacion: 'suma',
  },
  DemaSIN: {
    label: 'Demanda SIN',
    unidad: 'kWh',
    color: 'blue',
    entity: 'Sistema',
    url: `${XM_PROXY}/daily`,
    agregacion: null,
  },
  PPPrecBolsNaci: {
    label: 'Precio de Bolsa',
    unidad: 'COP/kWh',
    color: 'amber',
    entity: 'Sistema',
    url: `${XM_PROXY}/daily`,
    agregacion: null,
  },
  VoluUtilDiarEner: {
    label: 'Volumen Útil Embalses',
    unidad: 'kWh',
    color: 'cyan',
    entity: 'Sistema',
    url: `${XM_PROXY}/daily`,
    agregacion: null,
  },
  factorEmisionCO2e: {
    label: 'Factor de Emisión CO₂',
    unidad: 'gCO2e/kWh',
    color: 'rose',
    entity: 'Sistema',
    url: `${XM_PROXY}/hourly`,
    agregacion: 'promedio',
  },
  ENFICC: {
    label: 'Energía Firme (ENFICC)',
    unidad: 'kWh',
    color: 'purple',
    entity: 'Sistema',
    url: `${XM_PROXY}/daily`,
    agregacion: null,
  },
  PerdidasEner: {
    label: 'Pérdidas de Energía',
    unidad: 'kWh',
    color: 'orange',
    entity: 'Sistema',
    url: `${XM_PROXY}/hourly`,
    agregacion: 'suma',
  },
  GeneIdea: {
    label: 'Generación Ideal',
    unidad: 'kWh',
    color: 'teal',
    entity: 'Sistema',
    url: `${XM_PROXY}/hourly`,
    agregacion: 'suma',
  },
};

const indicadoresCache = new Map();

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function buildDateRange(rangoDias) {
  // endDate = ayer para evitar datos parciales del día en curso
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (rangoDias - 1));
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
}

async function fetchMetrica(metricId, rangoDias) {
  const now = Date.now();
  const meta = METRICAS[metricId];
  const { startDate, endDate } = buildDateRange(Math.min(rangoDias, 30));
  const cacheKey = `${metricId}|${startDate}|${endDate}`;

  const cached = indicadoresCache.get(cacheKey);
  if (cached && (now - cached.lastFetch) < CACHE_TTL) {
    return cached.data;
  }

  const body = {
    MetricId: metricId,
    StartDate: startDate,
    EndDate: endDate,
    Entity: meta.entity,
    Filter: [],
  };

  console.log(`[SINERGOX] POST ${meta.url} body=${JSON.stringify(body)}`);

  let apiResponse;
  try {
    const res = await withRetry(() => axios.post(meta.url, body, {
      timeout: 25000,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    }));
    apiResponse = res.data;
  } catch (err) {
    console.error(`[SINERGOX] ${metricId} error: ${JSON.stringify(err.response?.data) || err.message}`);
    throw err;
  }

  const items = apiResponse?.Items || [];
  if (items[0]) {
    console.log(`[SINERGOX] ${metricId} sample:`, JSON.stringify(items[0]));
  }

  const datos = items.map(item => {
    const entity = (item.DailyEntities || item.HourlyEntities || [])[0];
    let valor = null;

    if (entity) {
      if (entity.Value !== undefined) {
        // Diario: campo "Value" como string individual
        const n = parseFloat(entity.Value);
        valor = isNaN(n) ? null : n;
      } else if (entity.Values && typeof entity.Values === 'object') {
        // Horario: objeto con claves Hour01-Hour24 (más "code" que hay que ignorar)
        const vals = Object.entries(entity.Values)
          .filter(([k]) => k !== 'code')
          .map(([, v]) => parseFloat(v))
          .filter(v => !isNaN(v));
        if (vals.length > 0) {
          if (meta.agregacion === 'suma') {
            valor = vals.reduce((a, b) => a + b, 0);
          } else if (meta.agregacion === 'promedio') {
            valor = vals.reduce((a, b) => a + b, 0) / vals.length;
          } else {
            valor = vals[0];
          }
        }
      }
    }
    return { fecha: item.Date, valor };
  }).filter(d => d.fecha);

  const valoresValidos = datos.filter(d => d.valor !== null).map(d => d.valor);
  const ultimo = valoresValidos[valoresValidos.length - 1] ?? null;
  const penultimo = valoresValidos[valoresValidos.length - 2] ?? null;
  const promedio = valoresValidos.length > 0
    ? valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length
    : null;
  const variacion = (ultimo !== null && penultimo !== null && penultimo !== 0)
    ? ((ultimo - penultimo) / penultimo) * 100
    : null;
  const fechaUltimo = datos.filter(d => d.valor !== null).at(-1)?.fecha ?? null;

  const resultado = {
    metricId,
    label: meta.label,
    unidad: meta.unidad,
    color: meta.color,
    datos,
    kpis: { ultimo, promedio, variacion, fechaUltimo },
    cache: { lastFetch: new Date(now).toISOString() },
  };

  indicadoresCache.set(cacheKey, { data: resultado, lastFetch: now });
  console.log(`[SINERGOX] ${metricId} OK: ${datos.length} puntos, último=${ultimo?.toFixed(2)}`);
  return resultado;
}

// Debug: listado de métricas con búsqueda opcional ?q= y ?entity=
router.get('/listado-metricas', async (req, res) => {
  try {
    const { data } = await axios.post(`${XM_PROXY}/lists`,
      { MetricId: 'ListadoMetricas' },
      { timeout: 20000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
    const rawItems = data?.Items || [];
    const metrics = rawItems.flatMap(item =>
      (item.ListEntities || []).map(e => ({
        metricId:    e.Values?.MetricId,
        metricName:  e.Values?.MetricName,
        entity:      e.Values?.Entity,
        type:        e.Values?.Type,
        url:         e.Values?.Url,
        maxDays:     e.Values?.MaxDays,
        units:       e.Values?.MetricUnits,
        filter:      e.Values?.Filter,
        description: e.Values?.MetricDescription,
      }))
    );
    const q      = req.query.q?.toLowerCase();
    const entity = req.query.entity;
    let filtrado = metrics;
    if (entity) filtrado = filtrado.filter(m => m.entity === entity);
    if (q)      filtrado = filtrado.filter(m =>
      (m.metricId + ' ' + m.metricName + ' ' + m.description).toLowerCase().includes(q)
    );
    res.json({ total: metrics.length, filtrado: filtrado.length, items: filtrado });
  } catch (err) {
    res.status(502).json({ error: err.message, details: err.response?.data });
  }
});

// Debug: prueba un MetricId con todas las entities
router.get('/test/:metricId', async (req, res) => {
  const { startDate, endDate } = buildDateRange(7);
  const entities = req.query.entity ? [req.query.entity] : ['Sistema', 'Recurso', 'Embalse', ''];
  const results = {};
  for (const entity of entities) {
    const body = { MetricId: req.params.metricId, StartDate: startDate, EndDate: endDate, Entity: entity, Filter: [] };
    for (const url of [`${XM_PROXY}/daily`, `${XM_PROXY}/hourly`]) {
      const key = `${entity}@${url.split('/').pop()}`;
      try {
        const { data } = await axios.post(url, body, { timeout: 10000, headers: { 'Content-Type': 'application/json' } });
        results[key] = { ok: true, items: data?.Items?.length ?? 0, firstItem: data?.Items?.[0] };
      } catch (err) {
        results[key] = { ok: false, error: err.response?.data || err.message };
      }
    }
  }
  res.json({ metricId: req.params.metricId, startDate, endDate, results });
});

router.get('/indicadores', async (req, res) => {
  try {
    const dias = Math.min(Math.max(parseInt(req.query.dias) || 7, 1), 30);
    const resultados = await Promise.all(
      Object.keys(METRICAS).map(id =>
        fetchMetrica(id, dias).catch(err => {
          console.error(`[SINERGOX] Error en ${id}:`, err.message);
          return {
            metricId: id,
            label: METRICAS[id].label,
            unidad: METRICAS[id].unidad,
            color: METRICAS[id].color,
            error: true,
            message: err.message,
          };
        })
      )
    );
    res.json(resultados);
  } catch (error) {
    console.error('[SINERGOX] Error en /indicadores:', error.message);
    res.status(502).json({ error: 'No se pudo obtener datos de SINERGOX', message: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  indicadoresCache.clear();
  try {
    const resultados = await Promise.all(
      Object.keys(METRICAS).map(id =>
        fetchMetrica(id, 7).catch(() => ({ metricId: id, error: true }))
      )
    );
    const exitosos = resultados.filter(r => !r.error).length;
    res.json({ success: true, metricas: exitosos, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

module.exports = router;
