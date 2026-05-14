const CACHE_TTL = 60 * 60 * 1000;

const METRICAS = {
  Gene: { label: 'Generación Total', unidad: 'kWh', color: 'emerald', entity: 'Sistema', url: 'https://servapibi.xm.com.co/hourly', agregacion: 'suma' },
  DemaSIN: { label: 'Demanda SIN', unidad: 'kWh', color: 'blue', entity: 'Sistema', url: 'https://servapibi.xm.com.co/daily', agregacion: null },
  PPPrecBolsNaci: { label: 'Precio de Bolsa', unidad: 'COP/kWh', color: 'amber', entity: 'Sistema', url: 'https://servapibi.xm.com.co/daily', agregacion: null },
  VoluUtilDiarEner: { label: 'Volumen Útil Embalses', unidad: 'kWh', color: 'cyan', entity: 'Sistema', url: 'https://servapibi.xm.com.co/daily', agregacion: null },
  factorEmisionCO2e: { label: 'Factor de Emisión CO₂', unidad: 'gCO2e/kWh', color: 'rose', entity: 'Sistema', url: 'https://servapibi.xm.com.co/hourly', agregacion: 'promedio' },
  ENFICC: { label: 'Energía Firme (ENFICC)', unidad: 'kWh', color: 'purple', entity: 'Sistema', url: 'https://servapibi.xm.com.co/daily', agregacion: null },
  PerdidasEner: { label: 'Pérdidas de Energía', unidad: 'kWh', color: 'orange', entity: 'Sistema', url: 'https://servapibi.xm.com.co/hourly', agregacion: 'suma' },
  GeneIdea: { label: 'Generación Ideal', unidad: 'kWh', color: 'teal', entity: 'Sistema', url: 'https://servapibi.xm.com.co/hourly', agregacion: 'suma' },
};

const indicadoresCache = new Map();

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function buildDateRange(rangoDias) {
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
  if (cached && (now - cached.lastFetch) < CACHE_TTL) return cached.data;

  const body = { MetricId: metricId, StartDate: startDate, EndDate: endDate, Entity: meta.entity, Filter: [] };

  const res = await fetch(meta.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const apiResponse = await res.json();

  const items = apiResponse?.Items || [];
  const datos = items.map(item => {
    const entity = (item.DailyEntities || item.HourlyEntities || [])[0];
    let valor = null;
    if (entity) {
      if (entity.Value !== undefined) {
        const n = parseFloat(entity.Value);
        valor = isNaN(n) ? null : n;
      } else if (entity.Values && typeof entity.Values === 'object') {
        const vals = Object.entries(entity.Values)
          .filter(([k]) => k !== 'code')
          .map(([, v]) => parseFloat(v))
          .filter(v => !isNaN(v));
        if (vals.length > 0) {
          if (meta.agregacion === 'suma') valor = vals.reduce((a, b) => a + b, 0);
          else if (meta.agregacion === 'promedio') valor = vals.reduce((a, b) => a + b, 0) / vals.length;
          else valor = vals[0];
        }
      }
    }
    return { fecha: item.Date, valor };
  }).filter(d => d.fecha);

  const valoresValidos = datos.filter(d => d.valor !== null).map(d => d.valor);
  const ultimo = valoresValidos[valoresValidos.length - 1] ?? null;
  const penultimo = valoresValidos[valoresValidos.length - 2] ?? null;
  const promedio = valoresValidos.length > 0 ? valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length : null;
  const variacion = (ultimo !== null && penultimo !== null && penultimo !== 0)
    ? ((ultimo - penultimo) / penultimo) * 100 : null;
  const fechaUltimo = datos.filter(d => d.valor !== null).at(-1)?.fecha ?? null;

  const resultado = {
    metricId, label: meta.label, unidad: meta.unidad, color: meta.color,
    datos,
    kpis: { ultimo, promedio, variacion, fechaUltimo },
    cache: { lastFetch: new Date(now).toISOString() },
  };

  indicadoresCache.set(cacheKey, { data: resultado, lastFetch: now });
  return resultado;
}

export async function fetchIndicadores(rangoDias = 7) {
  const dias = Math.min(Math.max(rangoDias, 1), 30);
  return Promise.all(
    Object.keys(METRICAS).map(id =>
      fetchMetrica(id, dias).catch(err => ({
        metricId: id,
        label: METRICAS[id].label,
        unidad: METRICAS[id].unidad,
        color: METRICAS[id].color,
        error: true,
        message: err.message,
      }))
    )
  );
}

export function clearSinergoxCache() {
  indicadoresCache.clear();
}
