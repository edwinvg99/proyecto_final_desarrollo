import React, { useState, useContext } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from '../context/UserContextDef';
import API_URL from '../api';
const InputField = ({ label, name, type = "text", placeholder, value, onChange, error }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
        error
          ? "border-blue-400 focus:ring-blue-900 bg-red-50"
          : "border-gray-300 focus:border-blue-300 focus:ring-blue-500 bg-white"
      }`}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {error && (
      <p id={`${name}-error`} className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useContext(UserContext);

  const validators = {
    email: (value) => {
      if (!value.trim()) return "El email es requerido";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
      return "";
    },
    password: (value) => {
      if (!value) return "La contraseña es requerida";
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(validators).forEach(field => {
      const error = validators[field](formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user) loginUser(data.user);
        navigate("/educativo");
      } else {
        setServerError(data.message || "Credenciales inválidas");
      }
    } catch (error) {
      console.error(error);
      setServerError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-3xl">
          
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm flex items-center gap-2">
                  <span>❌</span> {serverError}
                </p>
              </div>
            )}

            <InputField 
              label="Email" 
              name="email" 
              type="email" 
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <InputField 
              label="Contraseña" 
              name="password" 
              type="password" 
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white font-semibold py-3 rounded-lg hover:from-blue-900 hover:to-blue-950 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center mb-4">
              <Link to="/forgot-password" className="text-blue-700 hover:text-blue-900 text-sm font-medium transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-blue-800 hover:text-blue-900 font-semibold transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;