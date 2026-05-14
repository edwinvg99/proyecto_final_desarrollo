import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContextDef';
import {
  Zap, Home, CheckCircle2, GitBranch, Users, BookOpen,
  Newspaper, FileText, TrendingUp, BarChart2, GraduationCap,
  LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Plataforma',
    items: [
      { path: '/', icon: Home, label: 'Inicio' },
      { path: '/beneficios', icon: CheckCircle2, label: 'Beneficios' },
      { path: '/procesos', icon: GitBranch, label: 'Proceso' },
      { path: '/actores', icon: Users, label: 'Actores' },
      { path: '/normativas', icon: BookOpen, label: 'Normativas' },
    ],
  },
  {
    label: 'Mercado',
    items: [
      { path: '/noticias', icon: Newspaper, label: 'Noticias' },
      { path: '/documentos-creg', icon: FileText, label: 'Docs CREG' },
      { path: '/mercado-energia', icon: TrendingUp, label: 'Mercado Energía' },
      { path: '/indicadores', icon: BarChart2, label: 'Indicadores' },
    ],
  },
  {
    label: 'Educativo',
    items: [
      { path: '/educativo', icon: GraduationCap, label: 'Módulos' },
    ],
  },
];

function NavItem({ path, icon: Icon, label, collapsed, onClick }) {
  const location = useLocation();
  const active =
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <li>
      <Link
        to={path}
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group ${
          active
            ? 'bg-emerald-500/15 text-emerald-400'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
        } ${collapsed ? 'justify-center' : ''}`}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${active ? 'text-emerald-400' : 'group-hover:text-slate-100'}`} />
        {!collapsed && (
          <>
            <span className="text-sm font-medium truncate">{label}</span>
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
          </>
        )}
      </Link>
    </li>
  );
}

function SidebarContent({ collapsed, setCollapsed, onNavClick }) {
  const { user, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
        <Link
          to="/"
          onClick={onNavClick}
          className={`flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity ${collapsed ? 'justify-center w-full' : ''}`}
        >
          <div className="bg-linear-to-br from-emerald-400 to-emerald-600 rounded-lg p-2 shadow-lg flex-shrink-0">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white font-bold text-sm leading-tight">Energía Clara</span>
              <span className="text-emerald-400 text-xs">TDEA</span>
            </div>
          )}
        </Link>
        {!collapsed && setCollapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer flex-shrink-0"
            title="Colapsar menú"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-5 mb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                {section.label}
              </p>
            )}
            {collapsed && (
              <div className="mx-3 mb-1.5 h-px bg-slate-700/50" />
            )}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => (
                <NavItem key={item.path} {...item} collapsed={collapsed} onClick={onNavClick} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User / Auth */}
      <div className="border-t border-slate-700/50 p-3">
        {user ? (
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-sm font-bold">{user.nombre?.charAt(0).toUpperCase()}</span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer flex-shrink-0"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
            {collapsed && (
              <button
                onClick={handleLogout}
                className="hidden"
                title="Cerrar sesión"
              />
            )}
          </div>
        ) : (
          <Link
            to="/login"
            onClick={onNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer shadow-md ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Iniciar Sesión' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Iniciar Sesión</span>}
          </Link>
        )}
      </div>
    </div>
  );
}

function Sidebar({ collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-slate-900 border-r border-slate-700/50 z-40 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} onNavClick={null} />

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-[72px] w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shadow-lg"
            title="Expandir menú"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </aside>

      {/* Mobile: floating toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 shadow-xl cursor-pointer hover:bg-slate-800 transition-colors"
        title="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile: backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-700/50 z-50 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer z-10"
          title="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent collapsed={false} setCollapsed={null} onNavClick={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}

export default Sidebar;
