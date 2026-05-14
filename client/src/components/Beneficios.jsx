import React from "react";
import { DollarSign, Leaf, Zap, Home, BarChart2, Shield, CheckCircle } from "lucide-react";
import { useFadeInStagger, useFadeInReveal } from "../hooks/useAnime";

const C = {
  hex:     "#7DD3FC",
  glow:    "rgba(125,211,252,0.2)",
  iconBg:  "bg-sky-400/10",
  iconText:"text-sky-300",
  stat:    "text-sky-300",
};

const benefits = [
  { icon: DollarSign, title: "Reducción de Costos",      description: "Ahorra hasta un 40% en tu factura eléctrica con un sistema de paneles solares residencial",        stat: "40%",      statLabel: "Ahorro promedio"       },
  { icon: Leaf,       title: "Impacto Ambiental",        description: "Reduce la huella de carbono y contribuye a los objetivos climáticos de Colombia",                    stat: "25 ton",   statLabel: "CO₂ evitado/año"       },
  { icon: Zap,        title: "Independencia Energética", description: "Genera tu propia energía y reduce la dependencia de la red eléctrica nacional",                      stat: "70%",      statLabel: "Autosuficiencia"       },
  { icon: Home,       title: "Valorización",             description: "Los inmuebles con sistemas de energía renovable tienen mayor valor en el mercado",                   stat: "+15%",     statLabel: "Valorización"          },
  { icon: BarChart2,  title: "Retorno de Inversión",     description: "Recupera tu inversión con incentivos gubernamentales y ahorro en factura",                           stat: "5–7 años", statLabel: "Período de retorno"    },
  { icon: Shield,     title: "Estabilidad Tarifaria",    description: "Protégete de futuros aumentos en tarifas con generación propia garantizada",                        stat: "20 años",  statLabel: "Vida útil garantizada" },
];

const highlights = [
  { label: "Hogares beneficiados", value: "+120K", icon: Home  },
  { label: "Reducción CO₂ anual",  value: "3M ton", icon: Leaf  },
  { label: "Capacidad instalada",  value: "1.5 GW", icon: Zap   },
];

function BenefitCard({ icon: Icon, title, description, stat, statLabel }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 hover:border-sky-400/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 overflow-hidden flex flex-col">
      <div style={{ height: "3px", background: C.hex, boxShadow: `0 0 10px ${C.glow}` }} />

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${C.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${C.iconText}`} />
          </div>
          <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed flex-1">{description}</p>

        <div className="pt-4 border-t border-slate-700/60">
          <p
            className={`text-2xl font-bold mb-0.5 ${C.stat}`}
            style={{ textShadow: `0 0 16px ${C.glow}` }}
          >
            {stat}
          </p>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{statLabel}</p>
        </div>
      </div>
    </div>
  );
}

function Beneficios() {
  const cardsRef = useFadeInStagger(0.02);
  const attrRef  = useFadeInReveal(0.1);
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="absolute -top-20 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-4">
            <CheckCircle className="h-3 w-3" />
            Impacto comprobado
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Beneficios de las{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
              Energías Renovables
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Descubre el impacto económico, ambiental y social de implementar
            energías renovables en Colombia
          </p>
        </div>
      </div>

      {/* Highlights bar */}
      <div className="bg-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-slate-700/50">
            {highlights.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-center gap-3 py-5 px-4">
                <div className={`w-9 h-9 ${C.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${C.iconText}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-tight">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* <div className="mb-7">
          <span className="inline-block text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1 rounded-full">
            Impacto directo
          </span>
          <h2 className="text-xl font-bold text-white mt-2">6 razones para adoptar energías renovables</h2>
        </div> */}

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {benefits.map((b) => <BenefitCard key={b.title} {...b} />)}
        </div>

        {/* Attribution */}
        <div ref={attrRef} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* <div className="w-10 h-10 bg-emerald-400/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div> */}
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1">Información basada en fuentes oficiales</h3>
              <p className="text-sm text-slate-400 mb-4 max-w-2xl">
                Toda la información presentada está respaldada por normativas gubernamentales,
                estudios técnicos y datos verificados de instituciones reconocidas en Colombia.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Ministerio de Energía", "UPME", "CREG", "Normativa Técnica"].map((s) => (
                  <span key={s} className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Beneficios;
