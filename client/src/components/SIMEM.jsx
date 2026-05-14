import React, { useState, useEffect, useCallback } from "react";
import {
  Zap,
  TrendingUp,
  Leaf,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Clock,
  BarChart2,
  Table2,
  Info,
} from "lucide-react";
import API_URL from "../api";

// Vivid colors optimized for dark backgrounds
const TIPO_CONFIG = {
  Hidráulica: {
    hex: "#38BDF8",
    gradient: "linear-gradient(90deg, #7DD3FC, #0284C7)",
    glow: "rgba(2,132,199,0.5)",
    text: "text-sky-400",
    badge: "bg-sky-400/10 text-sky-300 border border-sky-400/20",
    iconBg: "bg-sky-400/15",
    iconText: "text-sky-400",
  },
  Solar: {
    hex: "#FCD34D",
    gradient: "linear-gradient(90deg, #FDE68A, #D97706)",
    glow: "rgba(217,119,6,0.5)",
    text: "text-amber-300",
    badge: "bg-amber-300/10 text-amber-300 border border-amber-300/20",
    iconBg: "bg-amber-300/15",
    iconText: "text-amber-300",
  },
  Eólica: {
    hex: "#34D399",
    gradient: "linear-gradient(90deg, #6EE7B7, #059669)",
    glow: "rgba(5,150,105,0.5)",
    text: "text-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
    iconBg: "bg-emerald-400/15",
    iconText: "text-emerald-400",
  },
  Térmica: {
    hex: "#F87171",
    gradient: "linear-gradient(90deg, #FCA5A5, #DC2626)",
    glow: "rgba(220,38,38,0.5)",
    text: "text-red-400",
    badge: "bg-red-400/10 text-red-400 border border-red-400/20",
    iconBg: "bg-red-400/15",
    iconText: "text-red-400",
  },
  Cogeneración: {
    hex: "#A78BFA",
    gradient: "linear-gradient(90deg, #C4B5FD, #7C3AED)",
    glow: "rgba(124,58,237,0.5)",
    text: "text-violet-400",
    badge: "bg-violet-400/10 text-violet-400 border border-violet-400/20",
    iconBg: "bg-violet-400/15",
    iconText: "text-violet-400",
  },
  "Filo de Agua": {
    hex: "#22D3EE",
    gradient: "linear-gradient(90deg, #67E8F9, #0891B2)",
    glow: "rgba(8,145,178,0.5)",
    text: "text-cyan-400",
    badge: "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20",
    iconBg: "bg-cyan-400/15",
    iconText: "text-cyan-400",
  },
};

const DEFAULT_CFG = {
  hex: "#94A3B8",
  gradient: "linear-gradient(90deg, #CBD5E1, #475569)",
  glow: "rgba(71,85,105,0.4)",
  text: "text-slate-400",
  badge: "bg-slate-400/10 text-slate-400 border border-slate-400/20",
  iconBg: "bg-slate-400/15",
  iconText: "text-slate-400",
};

const TIPOS_RENOVABLES = new Set(["Solar", "Eólica", "Hidráulica", "Filo de Agua"]);

const RANGOS = [
  { label: "7 días", dias: 7 },
  { label: "14 días", dias: 14 },
  { label: "30 días", dias: 30 },
];

function cfg(tipo) {
  return TIPO_CONFIG[tipo] || DEFAULT_CFG;
}

function formatMWh(n) {
  if (!n || isNaN(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} TWh`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} GWh`;
  return `${Math.round(n).toLocaleString("es-CO")} MWh`;
}

function formatFecha(str) {
  if (!str) return "—";
  const parts = str.split("T")[0].split("-");
  if (parts.length !== 3) return str;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function KpiSkeleton() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-700 rounded-xl" />
        <div className="h-4 bg-slate-700 rounded w-32" />
      </div>
      <div className="h-9 bg-slate-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
    </div>
  );
}

function BarSkeleton() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 animate-pulse space-y-6">
      {[75, 55, 40, 28, 18].map((w) => (
        <div key={w}>
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-slate-700 rounded w-24" />
            <div className="h-4 bg-slate-700 rounded w-16" />
          </div>
          <div className="h-2 bg-slate-800 rounded-full" style={{ width: "100%" }}>
            <div className="h-2 bg-slate-700 rounded-full" style={{ width: `${w}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SIMEM() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [rangoDias, setRangoDias] = useState(7);
  const [vistaActiva, setVistaActiva] = useState("mix");

  const fetchDatos = useCallback(async (dias) => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/simem/generacion?dias=${dias}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || data.error || `Error HTTP ${res.status}`);
      setDatos(data);
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setDatos(null);
    fetchDatos(rangoDias);
  }, [rangoDias, fetchDatos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch(`${API_URL}/api/simem/refresh`, { method: "POST" });
    await fetchDatos(rangoDias);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Blue glow top-right */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Datos en tiempo real
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Mercado de Energía{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-sky-400">
              SIMEM
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Generación eléctrica real por tipo de fuente en Colombia. Datos
            oficiales del Sistema de Información del Mercado de Energía
            Mayorista.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <a
              href="https://www.simem.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              simem.co
            </a>
            {datos?.cache?.lastFetch && (
              <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                <Clock className="h-3.5 w-3.5" />
                Actualizado:{" "}
                {new Date(datos.cache.lastFetch).toLocaleString("es-CO")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">
              Generación Real por Fuente
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Dataset E17D25 · Generación Real Estimada (MWh)
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Selector de rango */}
            <div className="flex rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
              {RANGOS.map((r) => (
                <button
                  key={r.dias}
                  onClick={() => setRangoDias(r.dias)}
                  disabled={loading}
                  className={`px-3 py-2 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                    rangoDias === r.dias
                      ? "bg-emerald-500 text-white shadow-inner"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-2 transition-all bg-slate-900 cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-red-400/10 border border-red-400/20 rounded-full p-5 mb-5">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No se pudo cargar la información de SIMEM
            </h3>
            <p className="text-slate-500 text-sm mb-7 max-w-md">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchDatos(rangoDias);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
        ) : (
          !error &&
          datos?.kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {/* KPI 1: Total generación */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 hover:border-sky-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-sky-400/15 rounded-xl p-2.5">
                    <Zap className="h-5 w-5 text-sky-400" />
                  </div>
                  <span className="text-sm text-slate-400 font-medium leading-tight">
                    Total generado
                    <span className="block text-xs text-slate-600">
                      {formatFecha(datos.kpis.fechaUltimoDia)}
                    </span>
                  </span>
                </div>
                <p
                  className="text-3xl font-bold text-white tabular-nums"
                  style={{ textShadow: "0 0 20px rgba(56,189,248,0.3)" }}
                >
                  {formatMWh(datos.kpis.totalMWhUltimoDia)}
                </p>
                <p className="text-xs text-slate-600 mt-2">Generación Real Estimada</p>
              </div>

              {/* KPI 2: % Renovable */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-400/15 rounded-xl p-2.5">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Porcentaje renovable
                  </span>
                </div>
                <p
                  className="text-3xl font-bold text-emerald-400 tabular-nums"
                  style={{ textShadow: "0 0 20px rgba(52,211,153,0.4)" }}
                >
                  {datos.kpis.pctRenovable}%
                </p>
                <div className="mt-3 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${datos.kpis.pctRenovable}%`,
                      background: "linear-gradient(90deg, #34D399, #38BDF8)",
                      boxShadow: "0 0 8px rgba(52,211,153,0.5)",
                    }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5">
                  Solar + Eólica + Hidráulica + Filo de Agua
                </p>
              </div>

              {/* KPI 3: Fuente dominante */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 hover:border-amber-400/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${cfg(datos.kpis.fuenteDominante).iconBg} rounded-xl p-2.5`}>
                    <TrendingUp className={`h-5 w-5 ${cfg(datos.kpis.fuenteDominante).iconText}`} />
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Fuente dominante
                  </span>
                </div>
                <p
                  className={`text-3xl font-bold ${cfg(datos.kpis.fuenteDominante).text}`}
                  style={{ textShadow: `0 0 20px ${cfg(datos.kpis.fuenteDominante).glow}` }}
                >
                  {datos.kpis.fuenteDominante}
                </p>
                <span
                  className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${cfg(datos.kpis.fuenteDominante).badge}`}
                >
                  {TIPOS_RENOVABLES.has(datos.kpis.fuenteDominante) ? "Renovable" : "No Renovable"}
                </span>
              </div>
            </div>
          )
        )}

        {/* Toggle de vista */}
        {!loading && !error && datos && (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setVistaActiva("mix")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  vistaActiva === "mix"
                    ? "bg-slate-700 text-white shadow border border-slate-600"
                    : "bg-slate-900 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                Mix Energético
              </button>
              <button
                onClick={() => setVistaActiva("tabla")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  vistaActiva === "tabla"
                    ? "bg-slate-700 text-white shadow border border-slate-600"
                    : "bg-slate-900 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Table2 className="h-4 w-4" />
                Por Día
              </button>
            </div>

            {/* Vista Mix Energético */}
            {vistaActiva === "mix" && (
              <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-1">
                  Mix energético — período completo
                </h3>
                <p className="text-sm text-slate-500 mb-8">
                  Distribución acumulada por tipo de fuente · últimos {rangoDias} días
                </p>

                <div className="space-y-5">
                  {datos.resumenPorTipo.map((item) => {
                    const c = cfg(item.tipo);
                    return (
                      <div key={item.tipo}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: c.hex,
                                boxShadow: `0 0 6px ${c.glow}`,
                              }}
                            />
                            <span className="text-sm font-medium text-slate-200">
                              {item.tipo}
                            </span>
                            {/* {item.esRenovable && (
                              <span className="text-xs bg-emerald-400/10 text-red-400 border border-emerald-400/20 px-1.5 py-0.5 rounded font-semibold">
                                Renovable
                              </span>
                            )} */}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 tabular-nums">
                              {formatMWh(item.totalMWh)}
                            </span>
                            <span
                              className={`text-sm font-bold tabular-nums ${c.text}`}
                            >
                              {item.pctDelTotal}%
                            </span>
                          </div>
                        </div>
                        {/* Bar track */}
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(item.pctDelTotal, 1)}%`,
                              background: c.gradient,
                              boxShadow: `0 0 8px ${c.glow}`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Barra apilada proporcional */}
                <div className="mt-10 ">
                  <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-widest">
                    Vista proporcional del mix
                  </p>
                  <div className="flex h-2.5 rounded-full overflow-hidden w-full gap-px">
                    {datos.resumenPorTipo.map((item) => {
                      if (item.pctDelTotal === 0) return null;
                      const c = cfg(item.tipo);
                      return (
                        <div
                          key={item.tipo}
                          className="transition-all"
                          style={{
                            width: `${item.pctDelTotal}%`,
                            background: c.gradient,
                          }}
                          title={`${item.tipo}: ${item.pctDelTotal}%`}
                        />
                      );
                    })}
                  </div>
                  {/* Leyenda */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {datos.resumenPorTipo.map((item) => {
                      const c = cfg(item.tipo);
                      return (
                        <span
                          key={item.tipo}
                          className="flex items-center gap-2 text-xs text-slate-400"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          {item.tipo}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Vista Tabla por Día */}
            {vistaActiva === "tabla" && (
              <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/60">
                  <h3 className="text-lg font-bold text-white">
                    Generación diaria por tipo de fuente
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Valores en MWh · Más reciente primero
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/80 border-b border-slate-700/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-300 whitespace-nowrap">
                          Fecha
                        </th>
                        {datos.resumenPorTipo.map((item) => {
                          const c = cfg(item.tipo);
                          return (
                            <th
                              key={item.tipo}
                              className="text-right px-5 py-3 font-semibold text-slate-300 whitespace-nowrap"
                            >
                              <span className="flex items-center justify-end gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: c.hex, boxShadow: `0 0 5px ${c.glow}` }}
                                />
                                {item.tipo}
                              </span>
                            </th>
                          );
                        })}
                        <th className="text-right px-5 py-3 font-semibold text-slate-300 whitespace-nowrap">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...datos.mixPorDia].reverse().map((dia, idx) => (
                        <tr
                          key={dia.fecha}
                          className={`border-b border-slate-800 transition-colors ${
                            idx === 0
                              ? "bg-emerald-400/5"
                              : "hover:bg-slate-800/50"
                          }`}
                        >
                          <td className="px-5 py-3 font-medium text-slate-300 whitespace-nowrap">
                            {formatFecha(dia.fecha)}
                            {idx === 0 && (
                              <span className="ml-2 text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded font-semibold">
                                Reciente
                              </span>
                            )}
                          </td>
                          {datos.resumenPorTipo.map((item) => {
                            const c = cfg(item.tipo);
                            return (
                              <td
                                key={item.tipo}
                                className={`px-5 py-3 text-right font-medium tabular-nums ${c.text}`}
                              >
                                {dia.porTipo[item.tipo] ? (
                                  formatMWh(Math.round(dia.porTipo[item.tipo]))
                                ) : (
                                  <span className="text-slate-700">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-5 py-3 text-right font-bold text-white tabular-nums whitespace-nowrap">
                            {formatMWh(dia.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Skeleton mix/tabla */}
        {loading && !error && (
          <>
            <div className="flex gap-2 mb-6">
              <div className="h-9 w-40 bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-slate-800/60 rounded-lg animate-pulse" />
            </div>
            <BarSkeleton />
          </>
        )}

        {/* Nota de atribución */}
        {!loading && !error && datos && (
          <div className="mt-8 p-4 bg-blue-500/8 border border-blue-500/20 rounded-xl flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-300/80 text-sm">
              Datos obtenidos del{" "}
              <a
                href="https://www.simem.co"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
              >
                SIMEM (simem.co)
              </a>{" "}
              — Sistema de Información del Mercado de Energía Mayorista de
              Colombia. Dataset{" "}
              <code className="bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">
                E17D25
              </code>{" "}
              — Generación Real por Recurso. Actualización automática cada hora.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SIMEM;
