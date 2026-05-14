import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContextDef';
import API_URL from '../api';

export default function AuthCallback() {
  const { loginUser } = useContext(UserContext);
  const navigate = useNavigate();
  const executed = useRef(false);

  useEffect(() => {
    // Guard para evitar doble ejecución en Strict Mode
    if (executed.current) return;
    executed.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true });
      return;
    }

    async function initSession() {
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login', { replace: true });
          return;
        }

        const user = await res.json();
        loginUser(user);

        // Eliminar tokens visibles de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/', { replace: true });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login', { replace: true });
      }
    }

    initSession();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Iniciando sesión...</p>
    </div>
  );
}
