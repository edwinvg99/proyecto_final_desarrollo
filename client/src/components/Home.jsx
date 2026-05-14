import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, BookOpen, Users, TrendingUp,
  ListChecks, Scale, Newspaper, FileText, Zap, Activity,
  Shield, GraduationCap,
} from "lucide-react";
import { useFadeInStagger, useHeroEntrance } from "../hooks/useAnime";

const HERO_IMAGE_URL =
  "https://www.thecircularlab.com/web/app/uploads/2024/07/post-tcl-energia-limpia.jpg";

// 4-color palette — same as /educativo module cards
const PALETTE = [
  { hex: "#7DD3FC", glow: "rgba(125,211,252,0.15)", iconBg: "bg-sky-400/15",    iconText: "text-sky-300"    },
  { hex: "#34D399", glow: "rgba(52,211,153,0.15)",  iconBg: "bg-emerald-400/15",iconText: "text-emerald-300"},
  { hex: "#A78BFA", glow: "rgba(167,139,250,0.15)", iconBg: "bg-violet-400/15", iconText: "text-violet-300" },
  { hex: "#FB923C", glow: "rgba(251,146,60,0.15)",  iconBg: "bg-orange-400/15", iconText: "text-orange-300" },
];

const sections = [
  { to: "/educativo",       icon: BookOpen,   title: "Módulos Educativos",        description: "Aprende con módulos interactivos y certificados sobre energías renovables"    },
  { to: "/beneficios",      icon: TrendingUp, title: "Beneficios",                description: "Ahorro económico, impacto ambiental e independencia energética"               },
  { to: "/procesos",        icon: ListChecks, title: "Proceso de Implementación", description: "Guía paso a paso para instalar energía renovable en tu comunidad"             },
  { to: "/actores",         icon: Users,      title: "Actores Involucrados",      description: "Instituciones, empresas y comunidades del ecosistema renovable"               },
  { to: "/normativas",      icon: Scale,      title: "Normativas y Leyes",        description: "Ley 1715, Ley 2099, resoluciones CREG e incentivos tributarios"               },
  { to: "/noticias",        icon: Newspaper,  title: "Noticias del Sector",       description: "Últimas novedades sobre energías renovables en Colombia"                      },
  { to: "/documentos-creg", icon: FileText,   title: "Documentos CREG",           description: "Resoluciones, circulares y autos publicados por la CREG"                     },
  { to: "/mercado-energia",  icon: Zap,       title: "Mercado de Energía",        description: "Mix de generación eléctrica del SIN por tipo de fuente (SIMEM)"              },
  { to: "/indicadores",     icon: Activity,   title: "Indicadores XM",            description: "Demanda, precio de bolsa, volumen útil y emisiones CO₂"                      },
];

const stats = [
  { number: "9", label: "Secciones"           },
  { number: "4", label: "Módulos educativos"  },
  { number: "3", label: "APIs en tiempo real" },
  { number: "8", label: "Indicadores del SIN" },
];

// "¿Por qué Energía Clara?" — 3 cards with unique colors
const features = [
  { icon: Shield,        color: PALETTE[0], title: "Datos verificados",   description: "Información respaldada por fuentes oficiales: SIMEM, XM y CREG" },
  { icon: BookOpen,      color: PALETTE[1], title: "Contenido educativo", description: "Módulos didácticos con evaluación y certificado digital al aprobar" },
  { icon: GraduationCap,color: PALETTE[2], title: "Para todos",          description: "Diseñado para hogares, comunidades, empresas e instituciones" },
];

function SectionCard({ to, icon: Icon, title, description, idx }) {
  const MC = PALETTE[idx % PALETTE.length];
  return (
    <Link
      to={to}
      className="group flex flex-col bg-slate-900 rounded-2xl border border-slate-700/50 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = MC.hex + "33";
        e.currentTarget.style.boxShadow   = `0 8px 28px ${MC.glow}, 0 0 0 1px ${MC.hex}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow   = "";
      }}
    >
      {/* Accent bar */}
      <div style={{ height: "3px", background: MC.hex, boxShadow: `0 0 8px ${MC.glow}` }} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className={`${MC.iconBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${MC.iconText}`} />
        </div>

        <h3 className="text-base font-bold text-white leading-snug">{title}</h3>

        <p className="text-sm text-slate-400 leading-relaxed flex-1">{description}</p>

        <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: MC.hex }}>
          Ver sección
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon: Icon, color: MC, title, description }) {
  return (
    <div
      className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = MC.hex + "33";
        e.currentTarget.style.boxShadow   = `0 8px 28px ${MC.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow   = "";
      }}
    >
      {/* Accent bar */}
      <div style={{ height: "3px", background: MC.hex, boxShadow: `0 0 8px ${MC.glow}` }} />

      <div className="p-6">
        <h3 className="flex items-center gap-2 text-base font-bold text-white mb-2">
          {title}
          <Icon className={`w-4 h-4 flex-shrink-0 ${MC.iconText}`} />
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Home() {
  const heroRef  = useHeroEntrance();
  const statsRef = useFadeInStagger(0.1);
  const cardsRef = useFadeInStagger(0.02);
  const featRef  = useFadeInStagger(0.1);

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── HERO ── */}
      <section className="relative min-h-[520px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE_URL}
            alt="Turbinas de energía renovable"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/70" />
        </div>

        <div ref={heroRef} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl space-y-6">
            <span data-hero className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-500/40">
              <CheckCircle2 className="w-4 h-4" />
              Plataforma de información energética
            </span>

            <h1 data-hero className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Información clara sobre{" "}
              <span className="text-emerald-400">energías renovables</span>
            </h1>

            <p data-hero className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Accede a datos verificados, módulos educativos y normativas
              actualizadas sobre la transición energética en Colombia.
            </p>

            <div data-hero className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/educativo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-colors duration-200 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                Módulos educativos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/indicadores"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/50 transition-colors duration-200 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                Ver indicadores en vivo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-700/50">
            {stats.map((s, i) => {
              const MC = PALETTE[i % PALETTE.length];
              return (
                <div key={s.label} className="text-center py-5 px-3">
                  <p className="text-2xl font-bold" style={{ color: MC.hex }}>{s.number}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── QUICK ACCESS GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full mb-3 ring-1 ring-emerald-500/25">
            Navegación
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Acceso rápido</h2>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Explora todas las secciones de la plataforma
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((s, idx) => <SectionCard key={s.to} {...s} idx={idx} />)}
        </div>
      </div>

      {/* ── ¿POR QUÉ ENERGÍA CLARA? ── */}
      <div className="bg-slate-900 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            ¿Por qué Energía Clara?
          </h2>
          <div ref={featRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
