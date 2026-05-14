import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus,
  Activity, Zap, BarChart2, Droplets, Wind, DollarSign,
  ArrowUpDown, Flame, X, Info,
} from "lucide-react";
import API_URL from "../api";

/* ─── Colores vibrantes para dark mode ───────────────────────── */
const COLOR_CONFIG = {
  emerald: { hex: "#34D399", glow: "rgba(52,211,153,0.35)",   text: "text-emerald-400", iconBg: "bg-emerald-400/15", iconText: "text-emerald-400", badge: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20", contextBg: "bg-emerald-400/8 border-emerald-400/15" },
  blue:    { hex: "#38BDF8", glow: "rgba(56,189,248,0.35)",   text: "text-sky-400",     iconBg: "bg-sky-400/15",     iconText: "text-sky-400",     badge: "bg-sky-400/10 text-sky-400 border border-sky-400/20",         contextBg: "bg-sky-400/8 border-sky-400/15"     },
  amber:   { hex: "#FCD34D", glow: "rgba(252,211,77,0.35)",   text: "text-amber-300",   iconBg: "bg-amber-300/15",   iconText: "text-amber-300",   badge: "bg-amber-300/10 text-amber-300 border border-amber-300/20",   contextBg: "bg-amber-300/8 border-amber-300/15" },
  cyan:    { hex: "#22D3EE", glow: "rgba(34,211,238,0.35)",   text: "text-cyan-400",    iconBg: "bg-cyan-400/15",    iconText: "text-cyan-400",    badge: "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20",       contextBg: "bg-cyan-400/8 border-cyan-400/15"   },
  rose:    { hex: "#F87171", glow: "rgba(248,113,113,0.35)",  text: "text-red-400",     iconBg: "bg-red-400/15",     iconText: "text-red-400",     badge: "bg-red-400/10 text-red-400 border border-red-400/20",         contextBg: "bg-red-400/8 border-red-400/15"     },
  purple:  { hex: "#A78BFA", glow: "rgba(167,139,250,0.35)",  text: "text-violet-400",  iconBg: "bg-violet-400/15",  iconText: "text-violet-400",  badge: "bg-violet-400/10 text-violet-400 border border-violet-400/20", contextBg: "bg-violet-400/8 border-violet-400/15"},
  orange:  { hex: "#FB923C", glow: "rgba(251,146,60,0.35)",   text: "text-orange-400",  iconBg: "bg-orange-400/15",  iconText: "text-orange-400",  badge: "bg-orange-400/10 text-orange-400 border border-orange-400/20", contextBg: "bg-orange-400/8 border-orange-400/15"},
  teal:    { hex: "#2DD4BF", glow: "rgba(45,212,191,0.35)",   text: "text-teal-400",    iconBg: "bg-teal-400/15",    iconText: "text-teal-400",    badge: "bg-teal-400/10 text-teal-400 border border-teal-400/20",       contextBg: "bg-teal-400/8 border-teal-400/15"   },
};

const METRIC_ICONS = {
  Gene: Zap, DemaSIN: Activity, PPPrecBolsNaci: DollarSign,
  VoluUtilDiarEner: Droplets, factorEmisionCO2e: Wind,
  ENFICC: BarChart2, PerdidasEner: Flame, GeneIdea: ArrowUpDown,
};

const METRIC_INFO = {
  Gene: {
    titulo: "Generación Total del SIN",
    descripcion: "Es la energía eléctrica total producida por todas las plantas del Sistema Interconectado Nacional durante el día: hidráulicas, térmicas, solares, eólicas y de cogeneración.",
    contexto: "Colombia genera el 65–70% de su electricidad con agua. Por eso este indicador sube en temporadas de lluvias (alta hidrología) y puede bajar en períodos de sequía como el fenómeno de El Niño.",
    dato: "Un día típico en Colombia, el SIN genera entre 140 y 200 GWh de energía eléctrica.",
  },
  DemaSIN: {
    titulo: "Demanda del SIN",
    descripcion: "La energía eléctrica total consumida en Colombia a través del SIN. Incluye usuarios regulados (hogares, pequeños comercios) y no regulados (grandes industrias), pero excluye el alumbrado público.",
    contexto: "La demanda refleja directamente la actividad económica del país. Sube en días laborables y en horas pico (6–9 am y 6–9 pm), y baja los fines de semana y festivos.",
    dato: "La demanda energética de Colombia ha crecido cerca del 2–3% anual en la última década.",
  },
  PPPrecBolsNaci: {
    titulo: "Precio de Bolsa Nacional (Ponderado)",
    descripcion: "El precio promedio ponderado al que se transó la energía en la bolsa mayorista de Colombia. Es el precio que paga un comercializador cuando no tiene suficientes contratos para cubrir su demanda.",
    contexto: "Cuando hay abundancia de agua y los embalses están llenos, el precio cae porque las hidroeléctricas tienen bajo costo marginal. Cuando entra generación térmica (más costosa), el precio sube notoriamente.",
    dato: "Los precios de bolsa en Colombia pueden variar de menos de 100 a más de 600 COP/kWh dependiendo de la hidrología.",
  },
  VoluUtilDiarEner: {
    titulo: "Volumen Útil Diario de Embalses",
    descripcion: "El agua almacenada en los embalses del SIN, expresada en energía equivalente (kWh). Representa cuánta electricidad se podría generar con el agua disponible hoy.",
    contexto: "Es el indicador de 'salud hídrica' del sistema. Si el volumen cae por debajo del 30–40% de la capacidad útil, se activan alertas de desabastecimiento y el precio de bolsa sube.",
    dato: "Los principales embalses del SIN están en los ríos Magdalena, Cauca, Nare y Sogamoso.",
  },
  factorEmisionCO2e: {
    titulo: "Factor de Emisión de CO₂",
    descripcion: "Los gramos de CO₂ equivalente emitidos por cada kWh de electricidad generado en el SIN. Indica qué tan limpia es la matriz energética en un momento dado.",
    contexto: "Colombia tiene uno de los menores factores de emisión eléctrica de América Latina gracias a su matriz predominantemente hidráulica. El valor sube cuando las termoeléctricas generan más.",
    dato: "El factor de emisión eléctrico de Colombia (~130–200 gCO₂e/kWh) es mucho menor que el promedio mundial (~450 gCO₂e/kWh).",
  },
  ENFICC: {
    titulo: "Energía en Firme para el Cargo por Confiabilidad",
    descripcion: "La máxima energía que una planta de generación puede entregar continuamente bajo condiciones de hidrología crítica (año muy seco). Es la base del mecanismo de confiabilidad del sistema eléctrico colombiano.",
    contexto: "A través del Cargo por Confiabilidad (CxC), las plantas que se comprometen a entregar su ENFICC reciben un pago que les permite mantenerse disponibles ante sequías extremas.",
    dato: "El ENFICC fue creado por la CREG para reemplazar el antiguo Cargo por Capacidad y mejorar las señales de inversión en generación.",
  },
  PerdidasEner: {
    titulo: "Pérdidas de Energía en Transmisión",
    descripcion: "La energía que se pierde durante el transporte desde las plantas generadoras hasta los puntos de consumo, principalmente por el calentamiento de los cables en el Sistema de Transmisión Nacional.",
    contexto: "Las pérdidas son inevitables en todo sistema eléctrico, pero se minimizan usando altas tensiones (230–500 kV). Reducirlas es clave para la eficiencia energética.",
    dato: "Las pérdidas técnicas en transmisión en Colombia representan aproximadamente el 2–4% de la energía total generada.",
  },
  GeneIdea: {
    titulo: "Generación Ideal del SIN",
    descripcion: "La generación eléctrica que resultaría si la red de transmisión no tuviera restricciones — como si las líneas fueran infinitas y no hubiera cuellos de botella entre regiones.",
    contexto: "Al comparar la Generación Ideal con la Generación Real se puede cuantificar el impacto de las restricciones de red. Las restricciones tienen un costo millonario anual.",
    dato: "Cuando difieren mucho, significa que hay plantas más baratas o renovables que no pueden generar porque la línea no da abasto.",
  },
};

/* ─── Helpers ─────────────────────────────────────────────── */
function formatValor(valor, unidad) {
  if (valor === null || valor === undefined) return "N/D";
  if (unidad === "kWh" || unidad === "MWh" || unidad === "GWh") {
    if (valor >= 1_000_000_000) return `${(valor / 1_000_000_000).toFixed(2)} TWh`;
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(2)} GWh`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(1)} MWh`;
    return `${Math.round(valor)} kWh`;
  }
  if (unidad === "COP/kWh") return `$${valor.toLocaleString("es-CO", { maximumFractionDigits: 2 })} COP/kWh`;
  if (unidad === "gCO2e/kWh") return `${valor.toFixed(1)} gCO₂e/kWh`;
  if (unidad === "tCO2/MWh") return `${valor.toFixed(4)} tCO₂/MWh`;
  return valor.toFixed(2);
}

function formatFecha(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

function cfg(color) { return COLOR_CONFIG[color] || COLOR_CONFIG.emerald; }

/* ─── Sparkline con colores vibrantes ─────────────────────── */
function Sparkline({ datos, hex, glow, height = "h-10" }) {
  const vals = (datos || []).map((d) => d.valor).filter((v) => v !== null && v !== undefined);
  if (vals.length === 0)
    return <div className={`${height} flex items-center justify-center text-xs text-slate-700`}>Sin datos</div>;
  const max = Math.max(...vals);
  return (
    <div className={`flex items-end gap-px ${height}`}>
      {vals.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${max > 0 ? Math.max((v / max) * 100, 4) : 4}%`,
            backgroundColor: hex,
            opacity: i === vals.length - 1 ? 1 : 0.55,
            boxShadow: i === vals.length - 1 ? `0 0 6px ${glow}` : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5 animate-pulse">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 bg-slate-700 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-800 rounded w-1/3" />
        </div>
      </div>
      <div className="h-8 bg-slate-700 rounded w-2/3 mb-1.5" />
      <div className="h-3 bg-slate-800 rounded w-1/2 mb-4" />
      <div className="h-10 bg-slate-800 rounded" />
    </div>
  );
}

/* ─── Card ────────────────────────────────────────────────── */
function IndicadorCard({ indicador, onClick }) {
  const c = cfg(indicador.color);
  const Icon = METRIC_ICONS[indicador.metricId] || Activity;
  const { ultimo, promedio, variacion, fechaUltimo } = indicador.kpis || {};
  const variacionPositiva = variacion > 0;
  const variacionNula = variacion === null || variacion === undefined || isNaN(variacion);

  return (
    <div
      onClick={onClick}
      className="bg-slate-900 rounded-xl border border-slate-700/50 p-5 hover:border-slate-600/80 hover:shadow-xl hover:shadow-black/30 hover:scale-[1.01] transition-all cursor-pointer group relative"
    >
      {/* Hint de clic */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="w-4 h-4 text-slate-600" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 pr-6">
        <div className={`${c.iconBg} p-2 rounded-lg shrink-0`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200 leading-tight">{indicador.label}</p>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${c.badge}`}>{indicador.unidad}</span>
        </div>
      </div>

      {indicador.error ? (
        <p className="text-sm text-red-400 mb-2">No disponible</p>
      ) : (
        <>
          <p
            className={`text-2xl font-bold ${c.text} mb-0.5 tabular-nums`}
            style={{ textShadow: `0 0 16px ${c.glow}` }}
          >
            {formatValor(ultimo, indicador.unidad)}
          </p>
          <p className="text-xs text-slate-600 mb-2">
            {fechaUltimo ? `Último dato: ${formatFecha(fechaUltimo)}` : "Sin fecha"}
          </p>

          {/* Variación */}
          <div className="flex items-center gap-1.5 mb-3">
            {variacionNula ? (
              <Minus className="w-3.5 h-3.5 text-slate-600" />
            ) : variacionPositiva ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className={`text-xs font-medium ${variacionNula ? "text-slate-600" : variacionPositiva ? "text-emerald-400" : "text-red-400"}`}>
              {variacionNula ? "Sin variación" : `${variacionPositiva ? "+" : ""}${variacion.toFixed(1)}% vs día anterior`}
            </span>
          </div>

          {/* Promedio */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-600">
              Prom.:{" "}
              <span className="font-medium text-slate-400">{formatValor(promedio, indicador.unidad)}</span>
            </p>
            <span className="text-xs text-slate-700">{indicador.datos?.length ?? 0} días</span>
          </div>

          {/* Sparkline */}
          <div className="bg-slate-800/60 rounded-lg p-2">
            <Sparkline datos={indicador.datos} hex={c.hex} glow={c.glow} />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Panel de detalle ────────────────────────────────────── */
function MetricDetail({ indicador, onClose }) {
  const open = !!indicador;
  const c = open ? cfg(indicador?.color) : cfg("emerald");
  const Icon = open ? (METRIC_ICONS[indicador.metricId] || Activity) : Activity;
  const info = open ? (METRIC_INFO[indicador.metricId] || null) : null;
  const { ultimo, promedio, variacion, fechaUltimo } = (open && indicador.kpis) ? indicador.kpis : {};
  const variacionPositiva = variacion > 0;
  const variacionNula = variacion === null || variacion === undefined || isNaN(variacion);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-700/60 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {open && (
          <>
            {/* Header del panel */}
            <div className="bg-slate-900 border-b border-slate-700/60 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${c.iconBg} p-2.5 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${c.iconText}`} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Indicador</p>
                    <h2 className="text-lg font-bold text-white leading-tight">{indicador.label}</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-slate-700/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Valor actual */}
              {!indicador.error && (
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3">
                  <p
                    className={`text-3xl font-bold ${c.text} tabular-nums`}
                    style={{ textShadow: `0 0 20px ${c.glow}` }}
                  >
                    {formatValor(ultimo, indicador.unidad)}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-sm text-slate-500">
                      {fechaUltimo ? formatFecha(fechaUltimo) : "Sin fecha"}
                    </p>
                    {!variacionNula && (
                      <span className={`text-sm font-semibold ${variacionPositiva ? "text-emerald-400" : "text-red-400"}`}>
                        {variacionPositiva ? "▲" : "▼"} {Math.abs(variacion).toFixed(1)}% vs ayer
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Sparkline grande */}
              {!indicador.error && indicador.datos?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2">
                    Evolución últimos {indicador.datos.length} días
                  </p>
                  <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-3">
                    <Sparkline datos={indicador.datos} hex={c.hex} glow={c.glow} height="h-20" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 text-right">
                    Prom. período:{" "}
                    <span className={`font-semibold ${c.text}`}>{formatValor(promedio, indicador.unidad)}</span>
                  </p>
                </div>
              )}

              {/* Descripción educativa */}
              {info ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2">¿Qué es?</p>
                    <h3 className="text-base font-bold text-white mb-2">{info.titulo}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{info.descripcion}</p>
                  </div>

                  <div className={`${c.contextBg} border rounded-xl p-4`}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Contexto del mercado</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{info.contexto}</p>
                  </div>

                  <div className="bg-amber-300/8 border border-amber-300/15 rounded-xl p-4">
                    <p className="text-sm text-amber-200/80 leading-relaxed">
                      <span className="font-semibold text-amber-300">Dato clave: </span>
                      {info.dato}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">Sin descripción disponible para esta métrica.</p>
              )}

              {/* Unidad y fuente */}
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-500">Unidad:</span> {indicador.unidad}{" "}
                  · <span className="font-semibold text-slate-500">Fuente:</span>{" "}
                  <a
                    href="https://sinergox.xm.com.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    SINERGOX XM
                  </a>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ─── Página principal ────────────────────────────────────── */
export default function Indicadores() {
  const [indicadores, setIndicadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [rangoDias, setRangoDias] = useState(7);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);

  const fetchTodos = useCallback(async (dias) => {
    setIndicadores([]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sinergox/indicadores?dias=${dias}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIndicadores(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(rangoDias); }, [rangoDias, fetchTodos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`${API_URL}/api/sinergox/refresh`, { method: "POST" });
      await fetchTodos(rangoDias);
    } catch {
      await fetchTodos(rangoDias);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-20 -right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-48 bg-sky-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                  <BarChart2 className="h-3 w-3" />
                  Sistema Interconectado Nacional
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Indicadores del{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-sky-400">
                  Mercado Eléctrico
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
                Datos del SIN de Colombia, provistos por{" "}
                <a
                  href="https://sinergox.xm.com.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  XM S.A. E.S.P.
                </a>
                {" "}· Haz clic en cualquier tarjeta para más información.
              </p>
               {lastUpdate && (
              <p className="text-xs text-slate-600  shrink-0 mt-2">
                Actualizado: {lastUpdate.toLocaleTimeString("es-CO")}
              </p>
            )}
            </div>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Controles */}
        <div className="flex flex-wrap items-center gap-3 mb-7">
          <div className="flex rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setRangoDias(d)}
                className={`px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  rangoDias === d
                    ? "bg-emerald-500 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {d} días
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-medium text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-400/8 border border-red-400/20 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <div>
              <p className="font-semibold text-white">No se pudo cargar los indicadores</p>
              <p className="text-sm text-red-400/70 mt-1">{error}</p>
            </div>
            <button
              onClick={() => fetchTodos(rangoDias)}
              className="mt-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && indicadores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {indicadores.map((ind) => (
              <IndicadorCard
                key={ind.metricId}
                indicador={ind}
                onClick={() => setSelectedMetric(ind)}
              />
            ))}
          </div>
        )}

        {/* Atribución */}
        {!loading && (
          <div className="mt-8 p-4 bg-blue-500/8 border border-blue-500/20 rounded-xl flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-300/80 text-sm">
              Datos provistos por{" "}
              <a href="https://sinergox.xm.com.co" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors">
                SINERGOX — XM S.A. E.S.P.
              </a>
              , operador del SIN y administrador del Mercado de Energía Mayorista de Colombia. API documentada en{" "}
              <a href="https://github.com/EquipoAnaliticaXM/API_XM" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors">
                github.com/EquipoAnaliticaXM/API_XM
              </a>.
            </p>
          </div>
        )}
      </div>

      {/* Drawer de detalle */}
      <MetricDetail indicador={selectedMetric} onClose={() => setSelectedMetric(null)} />
    </div>
  );
}
