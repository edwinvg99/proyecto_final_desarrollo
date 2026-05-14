import React from "react";
import { Building2, Zap, Briefcase, Users2, Landmark, GraduationCap, Lightbulb } from "lucide-react";
import { useFadeInStagger } from "../hooks/useAnime";

const C = {
  hex:     "#7DD3FC",
  glow:    "rgba(125,211,252,0.2)",
  iconBg:  "bg-sky-400/10",
  iconText:"text-sky-300",
  dot:     "bg-sky-400/50",
};

const categorias = [
  {
    Icono: Building2,
    titulo: "Instituciones Gubernamentales",
    items: [
      { nombre: "Ministerio de Minas y Energía", desc: "Define políticas energéticas nacionales y regula el sector" },
      { nombre: "UPME",                           desc: "Planifica y promueve el desarrollo energético del país"     },
      { nombre: "CREG",                           desc: "Regula tarifas y condiciones del mercado energético"        },
    ],
  },
  {
    Icono: Zap,
    titulo: "Operadores de Red",
    items: [
      { nombre: "Empresas Distribuidoras",   desc: "Gestionan conexión a red, medición y distribución de energía" },
      { nombre: "XM - Operador del Sistema", desc: "Coordina la operación del Sistema Interconectado Nacional"    },
    ],
  },
  {
    Icono: Briefcase,
    titulo: "Sector Privado",
    items: [
      { nombre: "Empresas Instaladoras",  desc: "Diseñan, suministran e instalan sistemas renovables" },
      { nombre: "Fabricantes de Equipos", desc: "Proveen paneles solares, inversores y componentes"   },
      { nombre: "Consultores Técnicos",   desc: "Asesoran en viabilidad y diseño de proyectos"        },
    ],
  },
  {
    Icono: Users2,
    titulo: "Comunidad",
    items: [
      { nombre: "Juntas de Acción Comunal", desc: "Representan intereses de la comunidad y gestionan proyectos" },
      { nombre: "Copropiedades",            desc: "Administran bienes comunes y toman decisiones de inversión"   },
      { nombre: "Usuarios Finales",         desc: "Beneficiarios directos de la generación de energía"          },
    ],
  },
  {
    Icono: Landmark,
    titulo: "Entidades Financieras",
    items: [
      { nombre: "Bancos",   desc: "Ofrecen líneas de crédito para proyectos de energía renovable" },
      { nombre: "Findeter", desc: "Financia proyectos de infraestructura sostenible"               },
    ],
  },
  {
    Icono: GraduationCap,
    titulo: "Academia y Sociedad Civil",
    items: [
      { nombre: "Universidades",    desc: "Investigan, capacitan y asesoran en tecnologías renovables" },
      { nombre: "ONGs Ambientales", desc: "Promueven adopción de energías limpias y sostenibilidad"    },
    ],
  },
];

function ActorCard({ Icono, titulo, items }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 hover:border-sky-400/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 overflow-hidden">
      <div style={{ height: "3px", background: C.hex, boxShadow: `0 0 10px ${C.glow}` }} />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`${C.iconBg} p-2.5 rounded-xl flex-shrink-0`}>
            <Icono className={`w-5 h-5 ${C.iconText}`} />
          </div>
          <h3 className="font-bold text-white text-sm leading-tight">{titulo}</h3>
        </div>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${C.dot} flex-shrink-0 mt-1.5`}
                style={{ boxShadow: `0 0 5px ${C.glow}` }}
              />
              <div className="min-w-0">
                <p className="font-semibold text-slate-200 text-sm leading-tight">{item.nombre}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const Actores = () => {
  const cardsRef = useFadeInStagger(0.02);
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="absolute -top-16 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-4">
            <Users2 className="h-3 w-3" />
            Ecosistema energético
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Actores{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
              Involucrados
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Conoce quiénes participan en el ecosistema de energías renovables en
            Colombia y el rol de cada uno
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-slate-700/50">
            {[
              { value: "6",    label: "Sectores clave"        },
              { value: "+20",  label: "Tipos de actores"      },
              { value: "100%", label: "Coordinación requerida"},
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
          <span className="inline-block text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1 rounded-full">
            Mapa de actores
          </span>
          <h2 className="text-xl font-bold text-white mt-2">¿Quién hace qué en el sector renovable?</h2>
        </div> */}

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categorias.map((cat, idx) => <ActorCard key={idx} {...cat} />)}
        </div>

        {/* Callout */}
        <div className="mt-10 bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* <div className="bg-linear-to-br from-violet-500 to-indigo-600 p-3 rounded-xl flex-shrink-0 shadow-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div> */}
            <div className="flex-1">
              <h3 className="font-bold text-white text-base mb-2">Colaboración entre actores</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                La implementación exitosa de sistemas de energías renovables requiere la{" "}
                <span className="font-semibold text-slate-200">coordinación y cooperación</span>{" "}
                de todos estos actores. Cada uno desempeña un rol fundamental en diferentes
                etapas del proceso, desde la planeación hasta la operación del sistema.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Planeación", "Financiamiento", "Instalación", "Operación", "Mantenimiento"].map((tag) => (
                  <span key={tag} className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Actores;
