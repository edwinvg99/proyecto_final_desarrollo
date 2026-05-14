import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import API_URL from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [devResetURL, setDevResetURL] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un email válido.');
      return;
    }

    setLoading(true);
    setError('');
    setDevResetURL('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      console.log('[ForgotPassword] Enviando solicitud a /api/password/forgot-password para:', email.trim());
      const res = await fetch(`${API_URL}/api/password/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[ForgotPassword] Respuesta recibida, status:', res.status);
      const data = await res.json();
      console.log('[ForgotPassword] Datos:', data);

      if (res.ok) {
        if (data.devResetURL) {
          setDevResetURL(data.devResetURL);
        }
        setSent(true);
      } else {
        setError(data.message || 'Error al procesar la solicitud.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('[ForgotPassword] Timeout: el servidor no respondió en 20s');
        setError('El servidor tardó demasiado en responder. Intenta de nuevo.');
      } else {
        console.error('[ForgotPassword] Error de red:', err);
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {devResetURL ? 'Enlace generado' : 'Correo enviado'}
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {devResetURL
                ? 'No se pudo enviar el correo, pero se generó el enlace de recuperación. Usa el enlace de abajo para restablecer tu contraseña.'
                : <>Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.</>
              }
            </p>

            {devResetURL && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                <p className="text-amber-800 text-xs font-semibold mb-2">Modo desarrollo — Enlace de recuperación:</p>
                <a
                  href={devResetURL}
                  className="text-blue-700 text-sm underline break-all hover:text-blue-900"
                >
                  {devResetURL}
                </a>
              </div>
            )}

            <p className="text-sm text-gray-400 mb-6">
              El enlace expira en 30 minutos.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-900 hover:to-blue-950 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contraseña</h2>
            <p className="text-gray-500 text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white text-gray-900 placeholder-gray-400 transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white font-semibold py-3 rounded-lg hover:from-blue-900 hover:to-blue-950 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Enviar enlace de recuperación'
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

export default ForgotPassword;
