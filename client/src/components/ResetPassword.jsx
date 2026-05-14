import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, AlertTriangle, Loader2, XCircle } from 'lucide-react';
import API_URL from '../api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Verificar token al montar
  useEffect(() => {
    const verifyToken = async () => {
      console.log('[ResetPassword] Verificando token (primeros 20 chars):', token?.substring(0, 20));
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        const res = await fetch(`${API_URL}/api/password/verify-token/${token}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log('[ResetPassword] verify-token status:', res.status);
        const data = await res.json();
        console.log('[ResetPassword] verify-token data:', data);
        setTokenValid(data.valid === true);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.error('[ResetPassword] Timeout verificando token');
        } else {
          console.error('[ResetPassword] Error verificando token:', err);
        }
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s — resetPassword hace 2 llamadas al SDK

    try {
      console.log('[ResetPassword] Enviando reset-password para token (primeros 20 chars):', token?.substring(0, 20));
      const res = await fetch(`${API_URL}/api/password/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[ResetPassword] reset-password status:', res.status);
      const data = await res.json();
      console.log('[ResetPassword] reset-password data:', data);

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Error al restablecer la contraseña.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('[ResetPassword] Timeout al restablecer contraseña');
        setError('El servidor tardó demasiado en responder. Intenta de nuevo.');
      } else {
        console.error('[ResetPassword] Error de red:', err);
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Estado de carga mientras verifica token
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Enlace inválido o expirado</h2>
            <p className="text-gray-600 mb-6">
              Este enlace de recuperación ya no es válido. Los enlaces expiran después de 30 minutos.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-900 hover:to-blue-950 transition-all"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contraseña actualizada</h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña fue restablecida exitosamente. Serás redirigido al inicio de sesión...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de nueva contraseña
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nueva contraseña</h2>
            <p className="text-gray-500 text-sm">
              Ingresa y confirma tu nueva contraseña.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 bg-white text-gray-900 placeholder-gray-400 transition-all"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 bg-white text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Actualizando...
                </span>
              ) : (
                'Restablecer contraseña'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-blue-800 hover:text-blue-900 font-medium text-sm transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
