import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, GraduationCap, FileText, Link2, ClipboardList,
  Leaf, Zap, Share2, Users2, Globe, Sun, ArrowRight, Clock,
} from "lucide-react";
import API_URL from "../api";
import { getAuthHeaders } from "../services/authService";
import { useFadeInStagger, useFadeInReveal } from "../hooks/useAnime";

// Cycled per card — no emojis
const MODULE_ICONS = [Leaf, Zap, Share2, Users2, Globe, Sun, BookOpen, GraduationCap];

// Subtle per-module accent colors (hex + glow + icon tint)
const MODULE_COLORS = [
  { hex: "#7DD3FC", glow: "rgba(125,211,252,0.18)", iconBg: "bg-sky-400/10",    iconText: "text-sky-300"    }, // sky
  { hex: "#34D399", glow: "rgba(52,211,153,0.18)",  iconBg: "bg-emerald-400/10",iconText: "text-emerald-300"}, // emerald
  { hex: "#A78BFA", glow: "rgba(167,139,250,0.18)", iconBg: "bg-violet-400/10", iconText: "text-violet-300" }, // violet
  { hex: "#FB923C", glow: "rgba(251,146,60,0.18)",  iconBg: "bg-orange-400/10", iconText: "text-orange-300" }, // orange
];

const Educativo = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const cardsRef   = useFadeInStagger(0.02);
  const howItRef   = useFadeInReveal(0.1);

  useEffect(() => {
    fetch(`${API_URL}/api/educativo/modulos`, { headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los módulos");
        return res.json();
      })
      .then((data) => setModulos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="absolute -top-20 right-10 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-4">
            <GraduationCap className="h-3 w-3" />
            Plataforma de aprendizaje
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Módulos{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
              Educativos
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Aprende sobre energías renovables y sostenibilidad energética. Cada
            módulo incluye contenido, recursos y evaluación con certificado digital.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-slate-700/50">
            {[
              { value: `${modulos.length}`, label: "Módulos disponibles" },
              { value: "20–30 min",         label: "Duración estimada"   },
              { value: "Certificado",        label: "Digital al aprobar"  },
            ].map(({ value, label }) => (
              <div key={label} className="text-center py-5">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* <div className="mb-7">
          <span className="inline-block text-xs font-semibold bg-sky-400/10 text-sky-400 border border-sky-400/20 px-3 py-1 rounded-full">
            {modulos.length} módulos
          </span>
          <h2 className="text-xl font-bold text-white mt-2">Explora el contenido disponible</h2>
        </div> */}

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modulos.map((modulo, idx) => {
            const Icon = MODULE_ICONS[idx % MODULE_ICONS.length];
            const MC   = MODULE_COLORS[idx % MODULE_COLORS.length];
            return (
              <Link
                key={modulo.id}
                to={`/educativo/${modulo.id}`}
                className="group bg-slate-900 rounded-2xl border border-slate-700/50 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
                style={{
                  "--mc-hex":  MC.hex,
                  "--mc-glow": MC.glow,
                  boxShadow: "0 0 0 0 transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = MC.hex + "33";
                  e.currentTarget.style.boxShadow   = `0 8px 30px ${MC.glow}, 0 0 0 1px ${MC.hex}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow   = "";
                }}
              >
                {/* Top accent */}
                <div style={{ height: "3px", background: MC.hex, boxShadow: `0 0 10px ${MC.glow}` }} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${MC.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${MC.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-white text-lg leading-tight">{modulo.titulo}</h2>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed line-clamp-2">{modulo.descripcion}</p>
                    </div>
                  </div>

                  {/* Stats pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-full">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      {modulo.totalSecciones ?? 0} secciones
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-full">
                      <ClipboardList className="w-3 h-3 flex-shrink-0" />
                      {modulo.totalPreguntas ?? 0} preguntas
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-full">
                      <Link2 className="w-3 h-3 flex-shrink-0" />
                      {modulo.totalRecursos ?? 0} recursos
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      20–30 min
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400/70">
                      <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                      Certificado digital al aprobar
                    </div>
                    <span
                      className="flex items-center gap-1 text-xs font-semibold transition-colors"
                      style={{ color: MC.hex }}
                    >
                      Comenzar
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* How it works */}
        <div ref={howItRef} className="mt-10 bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* <div className={`${C.iconBg} p-3 rounded-xl flex-shrink-0`}>
              <BookOpen className={`w-5 h-5 ${C.iconText}`} />
            </div> */}
            <div className="flex-1">
              <h3 className="font-bold text-white text-base mb-4">¿Cómo funcionan los módulos?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { n: "1", text: "Selecciona un módulo y estudia el contenido cuidadosamente" },
                  { n: "2", text: "Explora los recursos adicionales: videos, PDFs y enlaces" },
                  { n: "3", text: "Realiza la evaluación de preguntas para medir tu aprendizaje" },
                  { n: "4", text: "Obtén tu certificado digital si apruebas con 3 o más respuestas correctas" },
                ].map(({ n, text }) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {n}
                    </span>
                    <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Educativo;
