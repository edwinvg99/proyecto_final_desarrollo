import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Search, Filter, Loader2, AlertTriangle, Globe } from 'lucide-react';
import API_URL from '../api';

const CATEGORIAS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Gobierno', label: 'Gobierno' },
  { value: 'Medios', label: 'Medios' },
];

const CATEGORIA_BADGE = {
  Gobierno: 'bg-sky-400/10 text-sky-300 border border-sky-400/20',
  Medios:   'bg-amber-300/10 text-amber-300 border border-amber-300/20',
};

const FUENTE_BADGE = {
  Gobierno: 'bg-sky-400/8 text-sky-400',
  Medios:   'bg-amber-300/8 text-amber-300',
};

function NoticiaCard({ noticia }) {
  return (
    <article className="bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/80 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 flex flex-col cursor-pointer">
      {/* Source header */}
      <div className="px-4 pt-4 pb-2.5 flex items-center gap-2 border-b border-slate-800">
        <div className="w-5 h-5 rounded overflow-hidden bg-slate-700 flex items-center justify-center shrink-0">
          <img
            src={noticia.logo}
            alt=""
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <span className="text-xs font-medium text-slate-500 truncate flex-1">{noticia.fuente}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CATEGORIA_BADGE[noticia.categoria] || 'bg-slate-400/10 text-slate-400 border border-slate-400/20'}`}>
          {noticia.categoria}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-100 text-sm leading-snug mb-2 line-clamp-3">
          {noticia.titulo}
        </h3>
        {noticia.resumen && (
          <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-3 flex-1">
            {noticia.resumen}
          </p>
        )}
        <a
          href={noticia.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-semibold mt-auto transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Leer más
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}

function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [fuentes, setFuentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [fuenteFiltro, setFuenteFiltro] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);

  const fetchNoticias = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        await fetch(`${API_URL}/api/noticias/refresh`, { method: 'POST' });
      }

      const params = new URLSearchParams();
      if (categoriaFiltro) params.set('categoria', categoriaFiltro);
      if (fuenteFiltro) params.set('fuente', fuenteFiltro);
      if (busqueda.trim()) params.set('q', busqueda.trim());

      const res = await fetch(`${API_URL}/api/noticias?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setNoticias(data.noticias || []);
        setFuentes(data.fuentes || []);
        setCacheInfo(data.cache || null);
        setError('');
      } else {
        setError(data.error || 'Error al cargar noticias.');
      }
    } catch {
      setError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNoticias(); }, [categoriaFiltro, fuenteFiltro]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchNoticias();
  };

  const selectClass = "bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 cursor-pointer";

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
        <div className="absolute -top-16 right-10 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-56 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">
              <Newspaper className="h-3 w-3" />
              Actualización automática
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Noticias de{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-sky-400">
              Energía
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            Últimas noticias sobre energías renovables en Colombia, recopiladas
            automáticamente de fuentes oficiales y medios especializados.
          </p>
          {cacheInfo && (
            <p className="text-xs text-slate-600 mt-3">
              Última actualización:{" "}
              {new Date(cacheInfo.lastFetch).toLocaleString("es-CO")}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filtros */}
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Búsqueda */}
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar noticias..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 text-slate-200 placeholder-slate-600 text-sm"
                />
              </div>
            </form>

            {/* Filtros */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-600 shrink-0" />
              <select
                value={categoriaFiltro}
                onChange={(e) => { setCategoriaFiltro(e.target.value); setLoading(true); }}
                className={selectClass}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>
                ))}
              </select>

              <select
                value={fuenteFiltro}
                onChange={(e) => { setFuenteFiltro(e.target.value); setLoading(true); }}
                className={selectClass}
              >
                <option value="" className="bg-slate-900">Todas las fuentes</option>
                {fuentes.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900">{f.nombre}</option>
                ))}
              </select>
            </div>

            {/* Botón actualizar */}
            <button
              onClick={() => fetchNoticias(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-400/8 border border-red-400/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Cargando noticias...</p>
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-5">
              <Globe className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No se encontraron noticias</h3>
            <p className="text-slate-600">Intenta cambiar los filtros o actualizar las fuentes.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-5">
              <span className="text-slate-400 font-medium">{noticias.length}</span> noticias encontradas
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {noticias.map((noticia, index) => (
                <NoticiaCard key={`${noticia.url}-${index}`} noticia={noticia} />
              ))}
            </div>
          </>
        )}

        {/* Fuentes */}
        {!loading && fuentes.length > 0 && (
          <div className="mt-10 bg-slate-900 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" />
              Fuentes de información
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fuentes.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-sm py-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                  <span className="text-slate-400">{f.nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${FUENTE_BADGE[f.categoria] || 'bg-slate-400/8 text-slate-500'}`}>
                    {f.categoria}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Noticias;
