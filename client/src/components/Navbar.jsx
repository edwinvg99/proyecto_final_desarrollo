import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from '../context/UserContextDef';
import { Menu, X, Zap } from 'lucide-react';

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useContext(UserContext);

  const handleLogout = () => {
    logoutUser();
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  // Desktop link: always has a bottom border (transparent when inactive, emerald when active)
  const desktopLink = (path) =>
    `font-medium text-sm transition pb-0.5 border-b-2 ${
      location.pathname === path
        ? 'text-emerald-400 border-emerald-400'
        : 'text-white hover:text-emerald-400 border-transparent'
    }`;

  // Mobile link: left border indicator
  const mobileLink = (path) =>
    `block transition font-medium py-2 pl-3 border-l-2 ${
      location.pathname === path
        ? 'text-emerald-400 border-emerald-400'
        : 'text-white hover:text-emerald-400 border-transparent'
    }`;

  return (
    <nav className="bg-linear-to-r from-slate-900 to-slate-800 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition group">
            <div className="bg-linear-to-br from-emerald-400 to-emerald-600 rounded-lg p-2 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300">
              <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-white font-bold text-lg leading-tight">Energía Clara</span>
              <span className="text-emerald-400 text-xs">TDEA</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className={desktopLink('/')}>Inicio</Link>
            <Link to="/beneficios" className={desktopLink('/beneficios')}>Beneficios</Link>
            <Link to="/procesos" className={desktopLink('/procesos')}>Proceso</Link>
            <Link to="/actores" className={desktopLink('/actores')}>Actores</Link>
            <Link to="/normativas" className={desktopLink('/normativas')}>Normativas</Link>
            <Link to="/noticias" className={desktopLink('/noticias')}>Noticias</Link>
            <Link to="/documentos-creg" className={desktopLink('/documentos-creg')}>Docs CREG</Link>
            <Link to="/mercado-energia" className={desktopLink('/mercado-energia')}>Mercado Energía</Link>
            <Link to="/educativo" className={desktopLink('/educativo')}>Educativo</Link>
            <Link to="/indicadores" className={desktopLink('/indicadores')}>Indicadores</Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 bg-emerald-500/90 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/50"
                >
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-sm font-semibold">{user.nombre?.charAt(0)}</span>
                  </div>
                  <span className="font-medium text-sm">{user.nombre}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
                    <div className="px-5 py-4 bg-linear-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{user.nombre} {user.apellido}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-emerald-700 font-medium">Sesión activa</span>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg transition font-medium text-sm shadow-lg hover:shadow-emerald-500/50"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition"
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="lg:hidden bg-slate-800 border-t border-slate-700 animate-fadeIn">
          <div className="px-4 py-4 space-y-1">
            <Link to="/" onClick={closeMobileMenu} className={mobileLink('/')}>Inicio</Link>
            <Link to="/beneficios" onClick={closeMobileMenu} className={mobileLink('/beneficios')}>Beneficios</Link>
            <Link to="/procesos" onClick={closeMobileMenu} className={mobileLink('/procesos')}>Proceso</Link>
            <Link to="/actores" onClick={closeMobileMenu} className={mobileLink('/actores')}>Actores</Link>
            <Link to="/normativas" onClick={closeMobileMenu} className={mobileLink('/normativas')}>Normativas</Link>
            <Link to="/noticias" onClick={closeMobileMenu} className={mobileLink('/noticias')}>Noticias</Link>
            <Link to="/documentos-creg" onClick={closeMobileMenu} className={mobileLink('/documentos-creg')}>Docs CREG</Link>
            <Link to="/mercado-energia" onClick={closeMobileMenu} className={mobileLink('/mercado-energia')}>Mercado Energía</Link>
            <Link to="/educativo" onClick={closeMobileMenu} className={mobileLink('/educativo')}>Educativo</Link>
            <Link to="/indicadores" onClick={closeMobileMenu} className={mobileLink('/indicadores')}>Indicadores</Link>

            {user ? (
              <div className="pt-3 border-t border-slate-700 space-y-3">
                <div className="flex items-center space-x-3 py-2 pl-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{user.nombre?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{user.nombre} {user.apellido}</p>
                    <p className="text-emerald-400 text-xs">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition flex items-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg transition font-medium shadow-lg mt-3"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
