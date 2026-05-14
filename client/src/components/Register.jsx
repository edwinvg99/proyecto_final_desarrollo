import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from "react-router-dom";
import API_URL from '../api';

const UNIVERSIDADES = [
  "Tecnologico de Antioquia",
  "Universidad de Antioquia",
  "Universidad Nacional de Colombia",
  "Pontificia Universidad Javeriana",
  "Universidad de los Andes",
  "Universidad del Valle",
  "Universidad Industrial de Santander",
  "Universidad de Córdoba",
  "Universidad de Cartagena",
  "Otra"
];

const CIUDADES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Santa Marta",
  "Cúcuta",
  "Otra"
];

const FORM_INITIAL_STATE = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  confirmPassword: "",
  universidad: "",
  ciudad: "",
  telefono: "",
  direccion: ""
};

// Componentes con React.memo para evitar re-renders innecesarios
const InputField = React.memo(({ label, name, type = "text", placeholder, className = "", value, onChange, error }) => {
  const inputClasses = `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
    error
      ? "border-emerald-400 focus:ring-emerald-900 bg-red-50"
      : "border-gray-300 focus:border-emerald-300 focus:ring-emerald-500 bg-white"
  }`;

  return (
    <div className={className}>
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
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

const SelectField = React.memo(({ label, name, options, placeholder, className = "", value, onChange, error }) => {
  const selectClasses = `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${
    error
      ? "border-emerald-400 focus:ring-emerald-900 bg-red-50"
      : "border-gray-300 focus:border-emerald-300 focus:ring-emerald-500 bg-white"
  }`;

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={selectClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';

const ErrorMessage = React.memo(({ message }) => (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-700 text-sm flex items-center gap-2">
      <span>❌</span> {message}
    </p>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

const LoadingSpinner = React.memo(() => (
  <span className="flex items-center justify-center gap-2">
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    Registrando...
  </span>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Custom Hook para la lógica del formulario
const useFormValidation = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validators = useMemo(() => ({
    nombre: (value) => !value.trim() ? "El nombre es requerido" : "",
    apellido: (value) => !value.trim() ? "El apellido es requerido" : "",
    email: (value) => {
      if (!value.trim()) return "El email es requerido";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
      return "";
    },
    password: (value) => {
      if (!value) return "La contraseña es requerida";
      if (value.length < 6) return "Mínimo 6 caracteres";
      return "";
    },
    confirmPassword: (value, allValues) => {
      if (value !== allValues.password) return "Las contraseñas no coinciden";
      return "";
    },
    universidad: (value) => !value ? "La universidad es requerida" : "",
    ciudad: (value) => !value ? "La ciudad es requerida" : "",
    telefono: (value) => {
      if (!value.trim()) return "El teléfono es requerido";
      if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) return "Debe tener 10 dígitos";
      return "";
    },
    direccion: (value) => !value.trim() ? "La dirección es requerida" : ""
  }), []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(validators).forEach(field => {
      const error = field === 'confirmPassword' 
        ? validators[field](formData[field], formData)
        : validators[field](formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validators]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  return { formData, errors, handleChange, validateForm, resetForm };
};

// Componente principal
function Register() {
  const { formData, errors, handleChange, validateForm, resetForm } = useFormValidation(FORM_INITIAL_STATE);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        resetForm();
        navigate("/login");
      } else {
        setServerError(data.message || "Error en el registro");
      }
    } catch (err) {
      console.error(err);
      setServerError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, resetForm, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 via-teal-800 to-cyan-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-500 transform transition-all duration-300 hover:shadow-emerald-500/20 hover:shadow-3xl">
          
          <div className="px-8 pt-10 pb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {serverError && <ErrorMessage message={serverError} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField 
                label="Nombre" 
                name="nombre" 
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={errors.nombre}
              />
              <InputField 
                label="Apellido" 
                name="apellido" 
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={handleChange}
                error={errors.apellido}
              />
            </div>

            <InputField 
              label="Email" 
              name="email" 
              type="email" 
              placeholder="tu@email.com"
              className="mb-4"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField 
                label="Contraseña" 
                name="password" 
                type="password" 
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <InputField 
                label="Confirmar Contraseña" 
                name="confirmPassword" 
                type="password" 
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SelectField 
                label="Universidad" 
                name="universidad" 
                options={UNIVERSIDADES}
                placeholder="Selecciona una universidad"
                value={formData.universidad}
                onChange={handleChange}
                error={errors.universidad}
              />
              <SelectField 
                label="Ciudad" 
                name="ciudad" 
                options={CIUDADES}
                placeholder="Selecciona una ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                error={errors.ciudad}
              />
            </div>

            <InputField 
              label="Teléfono" 
              name="telefono" 
              type="tel" 
              placeholder="10 dígitos"
              className="mb-4"
              value={formData.telefono}
              onChange={handleChange}
              error={errors.telefono}
            />

            <InputField 
              label="Dirección" 
              name="direccion" 
              placeholder="Tu dirección completa"
              className="mb-6"
              value={formData.direccion}
              onChange={handleChange}
              error={errors.direccion}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? <LoadingSpinner /> : 'Crear Cuenta'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Register;
