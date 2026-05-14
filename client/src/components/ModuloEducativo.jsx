import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContextDef';
import jsPDF from 'jspdf';
import tdeaLogoPng from '../assets/TDEA LOGO FINAL.png';
import API_URL from '../api';
import { getAuthHeaders } from '../services/authService';
import {
  ArrowLeft, BookOpen, CheckCircle2, ClipboardList, ExternalLink,
  FileText, Play, Link2, ChevronDown, ChevronUp, GraduationCap,
  Trophy, RotateCcw, Download, Leaf, Zap, Share2, Users2, Globe, Sun,
} from 'lucide-react';

const C = {
  hex:     '#7DD3FC',
  glow:    'rgba(125,211,252,0.2)',
  iconBg:  'bg-sky-400/10',
  iconText:'text-sky-300',
};

const MODULE_ICONS = [Leaf, Zap, Share2, Users2, Globe, Sun, BookOpen, GraduationCap];

function getRecursoIcon(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('video') || t.includes('youtube')) return Play;
  if (t.includes('pdf') || t.includes('documento'))  return FileText;
  if (t.includes('art') || t.includes('lectura'))    return BookOpen;
  return ExternalLink;
}

function ModuloEducativo() {
  const { moduloId } = useParams();
  const [modulo, setModulo]           = useState(null);
  const [loadingModulo, setLoading]   = useState(true);
  const [errorModulo, setError]       = useState(null);
  const [mostrarExamen, setMostrarExamen] = useState(false);
  const [respuestas, setRespuestas]   = useState({});
  const [resultados, setResultados]   = useState(null);
  const [recursosOpen, setRecursosOpen] = useState(false);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [previewFilename, setPreviewFilename] = useState('');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Derive a stable icon from module list index via id
  const iconIdx = modulo
    ? ['transicion-energetica','autogeneracion','generacion-distribuida','comunidades-energeticas']
        .indexOf(modulo.id)
    : 0;
  const ModIcon = MODULE_ICONS[Math.max(iconIdx, 0) % MODULE_ICONS.length];

  useEffect(() => {
    fetch(`${API_URL}/api/educativo/modulos/${moduloId}`, { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 404) throw new Error('not_found');
        if (!res.ok) throw new Error('error');
        return res.json();
      })
      .then((data) => setModulo(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [moduloId]);

  /* ── Loading ── */
  if (loadingModulo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Cargando módulo...</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (errorModulo === 'not_found' || !modulo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Módulo no encontrado</h2>
          <button
            onClick={() => navigate('/educativo')}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Volver a módulos
          </button>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (errorModulo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">Error al cargar el módulo. Intenta de nuevo.</p>
      </div>
    );
  }

  const handleRespuesta = (i, opcion) => setRespuestas({ ...respuestas, [i]: opcion });

  const evaluarExamen = () => {
    let correctas = 0;
    modulo.examen.forEach((p, i) => { if (respuestas[i] === p.correcta) correctas++; });
    setResultados({ correctas, total: modulo.examen.length });
  };

  /* ── Certificate PDF — dark premium ── */
  const generarCertificado = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297;
    const H = 210;

    // Base dark color [r, g, b] — deep navy, matches SVG texture #010518
    const BG = [1, 5, 24];

    const loadImg = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => resolve(img);
        img.onerror = () => reject();
        img.src = src;
      });

    const filename = `Certificado_${modulo.id}_${user.nombre}_${user.apellido}.pdf`;

    const buildAndPreview = (logoImg) => {
      // ── Background ──
      doc.setFillColor(BG[0], BG[1], BG[2]);
      doc.rect(0, 0, W, H, 'F');

      // ── Subtle corner glows for depth (sky blue, off-page centers) ──
      const blendToward = (fg, t) =>
        fg.map((c, i) => Math.round(BG[i] * (1 - t) + c * t));
      const drawSoftGlow = (cx, cy, rx, ry, fg, maxT = 0.35) => {
        const N = 50;
        for (let i = 0; i < N; i++) {
          const s = 1.0 - (i / (N - 1)) * 0.96;
          const t = 0.01 + (i / (N - 1)) * (maxT - 0.01);
          const [R, G, B] = blendToward(fg, t);
          doc.setFillColor(R, G, B);
          doc.ellipse(cx, cy, rx * s, ry * s, 'F');
        }
      };
      // Two diagonal sky-blue glows with off-page centers
      drawSoftGlow(W + 30, -30, 260, 220, [0, 174, 255], 0.32);
      drawSoftGlow(-30, H + 30, 260, 220, [0, 174, 255], 0.32);

      // ── Texture: grid of tiny blue diagonal slashes (overlays glows) ──
      // doc.setDrawColor(0, 174, 255); // #00aeff
      // doc.setLineWidth(0.1);
      // const SP = 6.5;   // grid spacing in mm
      // const SZ = 0.7;   // slash length in mm
      // for (let y = SP; y < H; y += SP) {
      //   for (let x = SP; x < W; x += SP) {
      //     // "\" diagonal slash centered at (x,y)
      //     doc.line(x - SZ / 2, y - SZ / 2, x + SZ / 2, y + SZ / 2);
      //   }
      // }

      // ── Vertical centering ──
      // Content block spans ~157mm; offset pushes it to vertical center of 210mm page
      const YO = 28; // vertical offset (mm) to center all content

      // ── Logo (PNG with transparency) ──
      if (logoImg) {
        const LW = 100;
        const LH = 35;
        doc.addImage(logoImg, 'PNG', (W - LW) / 2, YO - 10, LW, LH);
      }

      // Decorative line below logo
      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.3);
      doc.line(W / 2 - 55, YO + 27, W / 2 + 55, YO + 27);

      // ── "Hace constar que:" ──
      doc.setFontSize(14);
      doc.setTextColor(148, 180, 215);
      doc.setFont('helvetica', 'normal');
      doc.text('Hace constar que:', W / 2, YO + 54, { align: 'center' });

      // ── Nombre del estudiante ──
      doc.setFontSize(34);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      const nombre = `${user.nombre} ${user.apellido}`.toUpperCase();
      doc.text(nombre, W / 2, YO + 70, { align: 'center' });

      // Separator line (sky-blue)
      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.5);
      doc.line(W / 2 - 78, YO + 76, W / 2 + 78, YO + 76);

      // ── "Realizó el curso:" ──
      doc.setFontSize(14);
      doc.setTextColor(148, 180, 215);
      doc.setFont('helvetica', 'normal');
      doc.text('Realizó el curso:', W / 2, YO + 92, { align: 'center' });

      // ── Título del módulo ──
      doc.setFontSize(26);
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.setFont('helvetica', 'bold');
      const tituloLines = doc.splitTextToSize(modulo.titulo, W - 80);
      doc.text(tituloLines, W / 2, YO + 106, { align: 'center' });

      // ── Fecha ──
      const fecha = new Date().toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const fechaY = YO + 106 + tituloLines.length * 10 + 14;
      doc.setFontSize(12);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(`Realizado el ${fecha}`, W / 2, fechaY, { align: 'center' });

      // ── URL de la plataforma ──
      doc.setFontSize(9);
      doc.setTextColor(56, 189, 248);
      doc.text('https://energiaclara.up.railway.app/', W / 2, fechaY + 9, { align: 'center' });

      // ── Código discreto ──
      const codigo = `EC-${Date.now().toString(36).toUpperCase()}-${user.nombre.substring(0, 2).toUpperCase()}`;
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Código: ${codigo}`, W / 2, fechaY + 17, { align: 'center' });

      // Blob URL for preview modal
      const blob = doc.output('blob');
      const url  = URL.createObjectURL(blob);
      setPreviewFilename(filename);
      setPreviewUrl(url);
    };

    loadImg(tdeaLogoPng)
      .then((logoImg) => buildAndPreview(logoImg))
      .catch(() => buildAndPreview(null));
  };

  const descargarCertificado = () => {
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = previewFilename;
    a.click();
    URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  /* ════════════════════════════════════════════
     VISTA: Contenido del módulo
  ════════════════════════════════════════════ */
  if (!mostrarExamen) {
    return (
      <div className="min-h-screen bg-slate-950">
        {/* Hero */}
        <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
          />
          <div className="absolute -top-20 right-10 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <button
              onClick={() => navigate('/educativo')}
              className="mb-6 flex items-center gap-2 text-slate-400 hover:text-sky-300 text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a módulos
            </button>
            <div className="flex items-start gap-4">
              <div className={`${C.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <ModIcon className={`w-7 h-7 ${C.iconText}`} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-2">
                  <GraduationCap className="h-3 w-3" /> Módulo educativo
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{modulo.titulo}</h1>
                <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">{modulo.descripcion}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

          {/* Secciones de contenido */}
          {(modulo.contenido || []).map((seccion, index) => (
            <div key={index} className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
              <div style={{ height: '3px', background: C.hex, boxShadow: `0 0 10px ${C.glow}` }} />
              <div className="p-6">
                <h2 className="text-lg font-bold text-white mb-4">{seccion.titulo}</h2>
                <div className="space-y-3">
                  {(seccion.parrafos || []).map((p, i) => (
                    <p key={i} className="text-slate-400 text-sm leading-relaxed">{p}</p>
                  ))}
                </div>
                {seccion.puntos && seccion.puntos.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {seccion.puntos.map((punto, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-sky-300 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm leading-relaxed">{punto}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {/* Recursos — acordeón */}
          {modulo.recursos && modulo.recursos.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
              <div style={{ height: '3px', background: C.hex, boxShadow: `0 0 10px ${C.glow}` }} />
              <button
                onClick={() => setRecursosOpen(!recursosOpen)}
                className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`${C.iconBg} w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Link2 className={`w-4 h-4 ${C.iconText}`} />
                  </div>
                  <span className="font-bold text-white text-base">Recursos Adicionales</span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    {modulo.recursos.length} {modulo.recursos.length === 1 ? 'recurso' : 'recursos'}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  {recursosOpen
                    ? <ChevronUp className="w-5 h-5 text-slate-500" />
                    : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </div>
              </button>

              {recursosOpen && (
                <div className="px-6 pb-5 space-y-2">
                  {modulo.recursos.map((recurso, i) => {
                    const RIcon = getRecursoIcon(recurso.tipo);
                    return (
                      <a
                        key={i}
                        href={recurso.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/40 rounded-xl hover:border-sky-400/20 hover:bg-slate-800 transition-all duration-150 cursor-pointer group"
                      >
                        <div className={`${C.iconBg} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <RIcon className={`w-3.5 h-3.5 ${C.iconText}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 text-sm truncate">{recurso.nombre}</p>
                          <p className="text-xs text-slate-500">{recurso.tipo}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-300 transition-colors flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Autoevaluación info */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className={`${C.iconBg} p-2.5 rounded-xl flex-shrink-0`}>
                <ClipboardList className={`w-5 h-5 ${C.iconText}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base mb-2">Autoevaluación</h3>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  Para completar este módulo responde un cuestionario de 5 preguntas.
                  Necesitas al menos 3 respuestas correctas para aprobar y obtener tu certificado.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['5 preguntas', '3 correctas para aprobar', 'Certificado PDF'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400/70 flex-shrink-0" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setMostrarExamen(true)}
            className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 cursor-pointer"
          >
            Iniciar Autoevaluación
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     VISTA: Examen
  ════════════════════════════════════════════ */
  if (!resultados) {
    return (
      <div className="min-h-screen bg-slate-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden mb-6">
            <div style={{ height: '3px', background: C.hex, boxShadow: `0 0 10px ${C.glow}` }} />
            <div className="p-6 flex items-center gap-4">
              <div className={`${C.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <ClipboardList className={`w-6 h-6 ${C.iconText}`} />
              </div>
              <div>
                <h2 className="font-bold text-white text-xl">Autoevaluación</h2>
                <p className="text-slate-400 text-sm mt-0.5">{modulo.titulo} · Necesitas 3 correctas para aprobar</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {modulo.examen.map((pregunta, index) => (
              <div key={index} className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6">
                <p className="font-semibold text-white text-sm mb-4">
                  <span className="text-sky-300 mr-2">{index + 1}.</span>{pregunta.pregunta}
                </p>
                <div className="space-y-2">
                  {pregunta.opciones.map((opcion, opIndex) => (
                    <label
                      key={opIndex}
                      className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-150 border ${
                        respuestas[index] === opIndex
                          ? 'bg-sky-400/10 border-sky-400/30 text-sky-200'
                          : 'bg-slate-800/60 border-slate-700/40 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${index}`}
                        checked={respuestas[index] === opIndex}
                        onChange={() => handleRespuesta(index, opIndex)}
                        className="w-4 h-4 accent-sky-400 flex-shrink-0"
                      />
                      <span className="text-sm">{opcion}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={evaluarExamen}
            disabled={Object.keys(respuestas).length !== modulo.examen.length}
            className="mt-6 w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Enviar Respuestas
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     VISTA: Resultados
  ════════════════════════════════════════════ */
  const aprobado = resultados.correctas >= 3;

  return (
    <>
      {/* ── Modal de vista previa del certificado ── */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Modal header */}
            <div style={{ height: '3px', background: '#34D399', boxShadow: '0 0 10px rgba(52,211,153,0.4)' }} />
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Vista Previa del Certificado</p>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{previewFilename}</p>
                </div>
              </div>
              <button
                onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* PDF embed */}
            <div className="flex-1 overflow-hidden bg-slate-950 min-h-0">
              <iframe
                src={previewUrl}
                title="Vista previa certificado"
                className="w-full h-full"
                style={{ minHeight: '500px', border: 'none' }}
              />
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-700/50">
              <button
                onClick={descargarCertificado}
                className="flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-sm"
              >
                <Download className="w-4 h-4" /> Descargar
              </button>
              <button
                onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden text-center">
            <div style={{ height: '3px', background: aprobado ? '#34D399' : '#F87171', boxShadow: aprobado ? '0 0 10px rgba(52,211,153,0.4)' : '0 0 10px rgba(248,113,113,0.4)' }} />

            <div className="p-8">
              <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ${aprobado ? 'bg-emerald-400/10' : 'bg-amber-400/10'}`}>
                {aprobado
                  ? <Trophy className="w-9 h-9 text-emerald-400" />
                  : <BookOpen className="w-9 h-9 text-amber-400" />}
              </div>

              <h2 className={`text-2xl font-bold mb-2 ${aprobado ? 'text-emerald-400' : 'text-amber-400'}`}>
                {aprobado ? '¡Felicitaciones!' : 'Sigue Practicando'}
              </h2>

              <p className="text-slate-300 text-base mb-1">
                Obtuviste <span className="font-bold text-white">{resultados.correctas}</span> de <span className="font-bold text-white">{resultados.total}</span> respuestas correctas
              </p>
              <p className="text-slate-500 text-sm mb-7">
                {aprobado
                  ? 'Has aprobado el módulo exitosamente. Descarga tu certificado.'
                  : 'Necesitas al menos 3 respuestas correctas. Revisa el contenido e intenta de nuevo.'}
              </p>

              <div className="space-y-3">
                {aprobado && (
                  <button
                    onClick={generarCertificado}
                    className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Ver y Descargar Certificado
                  </button>
                )}
                {!aprobado && (
                  <button
                    onClick={() => { setMostrarExamen(false); setRespuestas({}); setResultados(null); }}
                    className="w-full flex items-center justify-center gap-2 bg-sky-400/10 border border-sky-400/20 hover:bg-sky-400/15 text-sky-300 font-semibold py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Revisar contenido e intentar de nuevo
                  </button>
                )}
                <button
                  onClick={() => navigate('/educativo')}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Volver a Módulos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModuloEducativo;
