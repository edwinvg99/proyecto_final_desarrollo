import React, { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserContext } from './context/UserContextDef';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Beneficios from './components/Beneficios';
import Procesos from './components/Procesos';
import Actores from './components/Actores';
import Normativas from './components/Normativas';
import Educativo from './components/Educativo';
import ModuloEducativo from './components/ModuloEducativo';
import Chatbot from './components/Chatbot';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Noticias from './components/Noticias';
import DocumentosCREG from './components/DocumentosCREG';
import SIMEM from './components/SIMEM';
import Indicadores from './components/Indicadores';
import AuthCallback from './components/AuthCallback';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppLayout({ sidebarCollapsed, setSidebarCollapsed }) {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Mobile top spacing so content doesn't sit under the toggle button */}
        <div className="pt-16 lg:pt-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/educativo"
              element={
                <ProtectedRoute>
                  <Educativo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educativo/:moduloId"
              element={
                <ProtectedRoute>
                  <ModuloEducativo />
                </ProtectedRoute>
              }
            />
            <Route path="/beneficios" element={<Beneficios />} />
            <Route path="/procesos" element={<Procesos />} />
            <Route path="/actores" element={<Actores />} />
            <Route path="/normativas" element={<Normativas />} />
            <Route path="/documentos-creg" element={<DocumentosCREG />} />
            <Route path="/mercado-energia" element={<SIMEM />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/indicadores" element={<Indicadores />} />
          </Routes>
        </div>
        <Chatbot />
      </main>
    </div>
  );
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <AppLayout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
    </BrowserRouter>
  );
}

export default App;
