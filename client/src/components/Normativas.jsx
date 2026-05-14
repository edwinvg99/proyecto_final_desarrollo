import { useState } from "react";
import { Scale, FileText, BookOpen, Award, ChevronDown, ChevronUp, ExternalLink, Info } from "lucide-react";
import { useFadeInStagger } from "../hooks/useAnime";

const C = {
  hex:     "#7DD3FC",
  glow:    "rgba(125,211,252,0.2)",
  iconBg:  "bg-sky-400/10",
  iconText:"text-sky-300",
  itemBorderColor: "rgba(125,211,252,0.25)",
  noteBg:  "bg-sky-400/8 text-sky-300 border border-sky-400/15",
};

const categorias = [
  {
    Icono: Scale,
    titulo: "Leyes y Decretos",
    items: [
      { title: "Ley 1715 de 2014", description: "Regula la integración de energías renovables no convencionales al Sistema Energético Nacional", note: "Marco legal principal"   },
      { title: "Ley 2099 de 2021", description: "Dicta disposiciones para la transición energética y modernización del mercado",                 note: "Actualización normativa" },
    ],
  },
  {
    Icono: FileText,
    titulo: "Resoluciones CREG",
    items: [
      { title: "Resolución CREG 030 de 2018", description: "Regula la autogeneración a pequeña escala y generación distribuida",     note: "Permite venta de excedentes a la red"   },
      { title: "Resolución CREG 174 de 2021", description: "Define metodología para cálculo de costos de conexión",                  note: "Clarifica costos de conexión al sistema" },
    ],
  },
  {
    Icono: BookOpen,
    titulo: "Normas Técnicas",
    items: [
      { title: "NTC 2050 (RETIE)", description: "Reglamento Técnico de Instalaciones Eléctricas — estándares de seguridad",                     note: "Obligatorio para instalaciones" },
      { title: "NTC 5746",         description: "Sistemas fotovoltaicos conectados a la red eléctrica — especificaciones técnicas",             note: "Aplica a sistemas solares"     },
    ],
  },
  {
    Icono: Award,
    titulo: "Incentivos Tributarios",
    items: [
      { title: "Deducción de Renta",   description: "Hasta el 50% del valor de la inversión deducible del impuesto de renta por 5 años",              note: "Beneficio por 5 años"              },
      { title: "Exclusión de IVA",     description: "Equipos para generación renovable exentos de IVA — reducción directa de costos",                 note: "Aplica a equipos importados"       },
      { title: "Exención Arancelaria", description: "No pago de aranceles para importación de equipos no producidos en Colombia",                     note: "Reducción costos de importación"   },
    ],
  },
];

const fuentes = [
  { label: "Ministerio de Minas y Energía", href: "https://www.minenergia.gov.co" },
  { label: "UPME",                          href: "https://www1.upme.gov.co"      },
  { label: "CREG",                          href: "https://creg.gov.co"           },
  { label: "ICONTEC",                       href: "https://icontec.org"           },
];

function Accordion({ Icono, titulo, items }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 mb-4 overflow-hidden hover:border-sky-400/15 transition-colors">
      <div style={{ height: "3px", background: C.hex, boxShadow: `0 0 10px ${C.glow}` }} />

      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`${C.iconBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icono className={`w-5 h-5 ${C.iconText}`} />
          </div>
          <span className="font-bold text-white text-base text-left">{titulo}</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            {items.length} {items.length === 1 ? "norma" : "normas"}
          </span>
        </div>
        <div className="flex-shrink-0 ml-2">
          {open
            ? <ChevronUp className="w-5 h-5 text-slate-500" />
            : <ChevronDown className="w-5 h-5 text-slate-500" />
          }
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-800/60 rounded-xl border border-slate-700/40 border-l-4 p-4"
              style={{ borderLeftColor: C.itemBorderColor }}
            >
              <h3 className="font-bold text-slate-100 text-sm">{item.title}</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">{item.description}</p>
              <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${C.noteBg}`}>
                {item.note}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Normativas() {
  const listRef = useFadeInStagger(0.05);
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="absolute -top-16 right-10 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-4">
            <Scale className="h-3 w-3" />
            Marco regulatorio
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Normativas y{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
              Regulaciones
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Marco legal simplificado: leyes, resoluciones CREG, normas técnicas
            e incentivos para energías renovables en Colombia
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-slate-900 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-4 divide-x divide-slate-700/50">
            {[
              { value: "2", label: "Leyes base"           },
              { value: "2", label: "Resoluciones CREG"    },
              { value: "2", label: "Normas técnicas"      },
              { value: "3", label: "Incentivos tributarios"},
            ].map(({ value, label }) => (
              <div key={label} className="text-center py-4 px-2">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* <div className="mb-7">
          <span className="inline-block text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1 rounded-full">
            Regulación vigente
          </span>
          <h2 className="text-xl font-bold text-white mt-2">Marco normativo de energías renovables</h2>
        </div> */}

        <div ref={listRef}>
          {categorias.map((cat, idx) => (
            <Accordion key={idx} {...cat} />
          ))}
        </div>

        {/* Sources */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-400/15 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-base">Fuentes Oficiales</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fuentes.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-300/8 border-l-4 border-amber-400 rounded-r-xl p-4 mt-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-400 text-sm leading-relaxed">
              <span className="font-semibold text-amber-300">Nota:</span> Esta información tiene fines educativos.
              Para casos específicos, consulta con asesores legales y técnicos especializados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
