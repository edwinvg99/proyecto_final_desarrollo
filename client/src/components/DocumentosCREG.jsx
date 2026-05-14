import React, { useState, useEffect } from "react";
import { ExternalLink, RefreshCw, FileText, AlertCircle, Clock, Info } from "lucide-react";
import API_URL from "../api";

const TIPO_ACCENT = {
  RE: { hex: "#34D399", glow: "rgba(52,211,153,0.4)", bg: "rgba(52,211,153,0.12)" },
  PR: { hex: "#38BDF8", glow: "rgba(56,189,248,0.4)", bg: "rgba(56,189,248,0.12)" },
  CI: { hex: "#FCD34D", glow: "rgba(252,211,77,0.4)",  bg: "rgba(252,211,77,0.12)"  },
  AU: { hex: "#94A3B8", glow: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.10)" },
};

const TIPO_LINK = {
  RE: "bg-emerald-400/8 text-emerald-300 border border-emerald-400/20 hover:bg-emerald-400/18 hover:border-emerald-400/40",
  PR: "bg-sky-400/8 text-sky-300 border border-sky-400/20 hover:bg-sky-400/18 hover:border-sky-400/40",
  CI: "bg-amber-300/8 text-amber-200 border border-amber-300/20 hover:bg-amber-300/18 hover:border-amber-300/40",
  AU: "bg-slate-400/8 text-slate-300 border border-slate-400/20 hover:bg-slate-400/18 hover:border-slate-400/40",
};

const DEFAULT_ACCENT = { hex: "#94A3B8", glow: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.10)" };

function accent(tipo) { return TIPO_ACCENT[tipo] || DEFAULT_ACCENT; }

function formatFecha(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function CardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-700" />
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-700 rounded-lg" />
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-700 rounded w-32" />
          <div className="h-3 bg-slate-800 rounded w-20" />
        </div>
      </div>
      <div className="p-5 space-y-2.5">
        {[1, 2, 3, 4].map((j) => (
          <div key={j} className="h-9 bg-slate-800 rounded-lg" />
        ))}
        <div className="h-9 bg-slate-800 rounded-xl w-28 mt-4" />
      </div>
    </div>
  );
}

function DocumentosCREG() {
  const [categorias, setCategorias] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocumentos = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/creg/documentos`);
      if (!res.ok) throw new Error("Error al cargar los documentos");
      const data = await res.json();
      setCategorias(data.categorias || []);
      setUltimaActualizacion(data.ultimaActualizacion);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDocumentos(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch(`${API_URL}/api/creg/refresh`, { method: "POST" });
    await fetchDocumentos();
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
        <div className="absolute -top-20 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-48 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Actualización automática
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Documentos{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-sky-400">
              CREG
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Últimas resoluciones, circulares y autos publicados por la Comisión
            de Regulación de Energía y Gas de Colombia.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <a
              href="https://creg.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              creg.gov.co
            </a>
            {ultimaActualizacion && (
              <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                <Clock className="h-3.5 w-3.5" />
                Actualizado: {formatFecha(ultimaActualizacion)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Controles */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Últimos documentos publicados</h2>
            <p className="text-slate-500 text-sm mt-1">
              Información obtenida directamente de la fuente oficial
            </p>
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

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-red-400/10 border border-red-400/20 rounded-full p-5 mb-5">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No se pudieron cargar los documentos</h3>
            <p className="text-slate-500 text-sm mb-7 max-w-md">{error}</p>
            <button
              onClick={fetchDocumentos}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de categorías */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categorias.map((cat) => {
              const a = accent(cat.tipo);
              return (
                <div
                  key={cat.tipo}
                  className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/80 transition-colors"
                >
                  {/* Accent top bar */}
                  <div
                    style={{
                      height: "3px",
                      background: a.hex,
                      boxShadow: `0 0 14px ${a.glow}`,
                    }}
                  />

                  {/* Header */}
                  <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: a.bg }}
                    >
                      <FileText className="h-4 w-4" style={{ color: a.hex }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold leading-tight">{cat.nombre}</h3>
                      <span className="text-slate-500 text-xs">
                        {cat.documentos.length} documentos recientes
                      </span>
                    </div>
                  </div>

                  {/* Lista de documentos */}
                  <div className="px-5 py-4 space-y-2">
                    {cat.documentos.length === 0 ? (
                      <p className="text-slate-600 text-sm italic">
                        No se encontraron documentos.
                      </p>
                    ) : (
                      cat.documentos.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block text-sm px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${TIPO_LINK[cat.tipo] || TIPO_LINK.AU}`}
                        >
                          <span className="flex items-start gap-2">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                            <span className="leading-snug">{doc.titulo}</span>
                          </span>
                        </a>
                      ))
                    )}
                  </div>

                  {/* Botón Ver más */}
                  <div className="px-5 pb-5">
                    <a
                      href={cat.verMas}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-slate-200 text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Ver más
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Atribución */}
        {!loading && !error && (
          <div className="mt-8 p-4 bg-blue-500/8 border border-blue-500/20 rounded-xl flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-300/80 text-sm">
              Esta información se obtiene directamente del sitio oficial de la{" "}
              <a
                href="https://creg.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
              >
                CREG (creg.gov.co)
              </a>{" "}
              y se actualiza automáticamente cada hora. Haz clic en el título para ver el documento completo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentosCREG;
