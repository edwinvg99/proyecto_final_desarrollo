import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, ChevronDown, Zap, Loader2, Sparkles } from 'lucide-react';
import API_URL from '../api';

const PREDEFINED_QUESTIONS = [
  { key: 'plataforma', label: '¿Qué es Energía Clara?' },
  { key: 'beneficios', label: '¿Beneficios de las renovables?' },
  { key: 'proceso', label: '¿Cómo implementar energía renovable?' },
  { key: 'normativas', label: '¿Qué normativas aplican?' },
  { key: 'actores', label: '¿Quiénes son los actores clave?' },
  { key: 'transicion', label: '¿Qué es la transición energética?' },
  { key: 'autogeneracion', label: '¿Cómo funciona la autogeneración?' },
  { key: 'comunidades', label: '¿Qué son las comunidades energéticas?' },
  { key: 'generacion-distribuida', label: '¿Qué es la generación distribuida?' },
  { key: 'certificados', label: '¿Cómo obtengo un certificado?' },
];

// Tip contextual por sección (aparece como burbuja sobre el botón)
const ROUTE_TIPS = {
  '/': '¿Tienes preguntas sobre energías renovables en Colombia? ¡Pregúntame!',
  '/beneficios': '¿Quieres saber cuánto puedes ahorrar o cuál es el retorno de inversión? ¡Pregúntame!',
  '/procesos': '¿Tienes dudas sobre algún paso del proceso de implementación o los trámites requeridos?',
  '/actores': '¿Quieres conocer el rol de la CREG, UPME u otros actores clave del sector?',
  '/normativas': '¿Dudas sobre la Ley 1715, Ley 2099 o la Resolución CREG 030? Puedo explicarte.',
  '/noticias': '¿Quieres contexto o más detalles sobre las noticias de energías renovables?',
  '/educativo': '¿Listo para aprender? Puedo orientarte sobre los 4 módulos educativos disponibles.',
  '/documentos-creg': '¿Tienes dudas sobre algún documento de la CREG? Puedo explicarte resoluciones, circulares o proyectos.',
  '/mercado-energia': '¿Quieres entender qué es el SIMEM o cómo funciona el mercado mayorista de energía en Colombia?',
  '/indicadores': '¿Quieres saber qué significan el precio de bolsa, el factor de emisión o el volumen útil de embalses?',
};

// Mensaje de bienvenida contextual al abrir el chat por primera vez en cada sección
const ROUTE_WELCOME = {
  '/': '¡Hola! Soy el asistente virtual de **Energía Clara**. Puedo ayudarte con preguntas sobre energías renovables en Colombia.\n\nSelecciona una pregunta predeterminada o escribe tu propia consulta.',
  '/beneficios': '¡Hola! Estás en la sección de **Beneficios**. Puedo explicarte sobre ahorros, retorno de inversión, impacto ambiental y más. ¿Qué quieres saber?',
  '/procesos': '¡Hola! Estás viendo el **Proceso de implementación**. Puedo ayudarte a entender cada etapa, desde la evaluación inicial hasta la puesta en marcha. ¿Tienes alguna duda?',
  '/actores': '¡Hola! Estás en la sección de **Actores clave**. Puedo explicarte el rol de cada entidad en el ecosistema de energías renovables. ¿Sobre quién quieres saber?',
  '/normativas': '¡Hola! Estás en la sección de **Normativas**. Puedo orientarte sobre la Ley 1715, Ley 2099, la Resolución CREG 030 e incentivos tributarios. ¿Qué necesitas?',
  '/noticias': '¡Hola! Estás en la sección de **Noticias**. ¿Quieres que te explique algún concepto o contexto sobre las noticias de energías renovables?',
  '/educativo': '¡Hola! Estás en la sección **Educativa**. Tengo información sobre los 4 módulos: Transición Energética, Autogeneración, Generación Distribuida y Comunidades Energéticas. ¿Por dónde empezamos?',
  '/documentos-creg': '¡Hola! Estás viendo los **Documentos CREG**. Puedo explicarte el contenido o alcance de cualquier resolución, circular o auto de la CREG. ¿Sobre qué documento tienes dudas?',
  '/mercado-energia': '¡Hola! Estás en el **Mercado de Energía SIMEM**. Puedo explicarte qué significa cada tipo de fuente (Hidráulica, Térmica, Solar, Eólica), cómo se calcula el % renovable y cómo funciona el mercado mayorista de energía en Colombia. ¿Tienes alguna duda?',
  '/indicadores': '¡Hola! Estás en los **Indicadores del Mercado Eléctrico**. Puedo explicarte qué es el precio de bolsa, el factor de emisión CO₂, el volumen útil de embalses, y cómo estos datos reflejan la salud del sistema energético colombiano. ¿Tienes alguna duda?',
};

function getRouteKey(pathname) {
  if (pathname.startsWith('/educativo')) return '/educativo';
  return pathname;
}

function Chatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [showTip, setShowTip] = useState(false);
  const [tipMessage, setTipMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const tipTimerRef = useRef(null);
  const lastTipRouteRef = useRef(null);
  const lastChatRouteRef = useRef(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Mensaje de bienvenida contextual al abrir por primera vez
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const routeKey = getRouteKey(location.pathname);
      lastChatRouteRef.current = routeKey;
      const welcome = ROUTE_WELCOME[routeKey] || ROUTE_WELCOME['/'];
      setMessages([{
        role: 'bot',
        content: welcome,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  // Mensaje contextual cuando el usuario navega a una nueva sección con el chat ya iniciado
  useEffect(() => {
    const routeKey = getRouteKey(location.pathname);
    if (messages.length === 0) return; // aún no hay conversación, lo maneja el effect de isOpen
    if (lastChatRouteRef.current === routeKey) return; // misma sección, no repetir

    lastChatRouteRef.current = routeKey;
    const welcome = ROUTE_WELCOME[routeKey] || ROUTE_WELCOME['/'];
    setMessages(prev => [...prev, {
      role: 'bot',
      content: welcome,
      timestamp: new Date(),
      isContextChange: true,
    }]);
  }, [location.pathname]);

  // Verificar disponibilidad del chatbot al montar
  useEffect(() => {
    fetch(`${API_URL}/api/chatbot/status`)
      .then(res => res.json())
      .then(data => setAiAvailable(data.active))
      .catch(() => setAiAvailable(false));
  }, []);

  // Mostrar tip contextual cuando el usuario navega a una nueva sección
  useEffect(() => {
    if (isOpen) return; // No mostrar tip si el chat está abierto

    const routeKey = getRouteKey(location.pathname);
    const tip = ROUTE_TIPS[routeKey];

    if (!tip || lastTipRouteRef.current === routeKey) return;

    // Esperar 1.5s antes de mostrar el tip (evitar flash en navegación rápida)
    const showDelay = setTimeout(() => {
      lastTipRouteRef.current = routeKey;
      setTipMessage(tip);
      setShowTip(true);

      // Auto-ocultar después de 8 segundos
      tipTimerRef.current = setTimeout(() => setShowTip(false), 8000);
    }, 1500);

    return () => {
      clearTimeout(showDelay);
      clearTimeout(tipTimerRef.current);
    };
  }, [location.pathname, isOpen]);

  const dismissTip = () => {
    clearTimeout(tipTimerRef.current);
    setShowTip(false);
  };

  const openChat = () => {
    dismissTip();
    setIsOpen(true);
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  };

  const sendMessage = async (message, predefinedKey = null) => {
    if (isLoading) return;
    if (!predefinedKey && (!message || message.trim().length === 0)) return;

    const userMessage = predefinedKey
      ? PREDEFINED_QUESTIONS.find(q => q.key === predefinedKey)?.label || message
      : message.trim();

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    setInputValue('');
    setIsLoading(true);
    setShowQuestions(false);

    try {
      const body = predefinedKey ? { predefinedKey } : { message: message.trim() };

      const response = await fetch(`${API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: data.error || 'Ocurrió un error. Intenta de nuevo.',
          timestamp: new Date(),
          isError: true,
          fallbackToPredefined: data.fallbackToPredefined,
        }]);
        if (data.fallbackToPredefined) setShowQuestions(true);
      } else {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: data.response,
          timestamp: new Date(),
          source: data.source,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'No se pudo conectar con el asistente. Verifica tu conexión a internet.',
        timestamp: new Date(),
        isError: true,
        fallbackToPredefined: true,
      }]);
      setShowQuestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handlePredefinedClick = (key) => sendMessage(null, key);
  const toggleQuestions = () => setShowQuestions(prev => !prev);

  return (
    <>
      {/* Burbuja de tip contextual */}
      {!isOpen && showTip && (
        <div className="fixed bottom-24 right-6 z-50 max-w-[260px] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3.5 relative">
            <button
              onClick={dismissTip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
              aria-label="Cerrar sugerencia"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-start gap-2 pr-4">
              <div className="shrink-0 bg-emerald-100 rounded-full p-1 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{tipMessage}</p>
            </div>
            {/* Flecha apuntando hacia el botón */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-200 rotate-45" />
          </div>
        </div>
      )}

      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
          aria-label="Abrir asistente virtual"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full" />
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-full sm:h-[600px] sm:max-h-[80vh] flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-lg p-1.5">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Asistente Energía Clara</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-xs">En línea</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition"
              aria-label="Cerrar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                    msg.isError ? 'bg-red-100' : 'bg-emerald-100'
                  }`}>
                    <Bot className={`h-4 w-4 ${msg.isError ? 'text-red-600' : 'text-emerald-600'}`} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-md'
                      : msg.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
                        : msg.isContextChange
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-bl-md'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
                {msg.role === 'user' && (
                  <div className="shrink-0 w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center mt-0.5">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="shrink-0 w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                    <span className="text-sm text-gray-500">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas predeterminadas */}
          <div className="shrink-0 border-t border-gray-200 bg-white">
            <button
              onClick={toggleQuestions}
              className="w-full px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
            >
              <span>Preguntas sugeridas</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showQuestions ? 'rotate-180' : ''}`} />
            </button>

            {showQuestions && (
              <div className="px-3 pb-3 max-h-36 overflow-y-auto">
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_QUESTIONS.map((q) => (
                    <button
                      key={q.key}
                      onClick={() => handlePredefinedClick(q.key)}
                      disabled={isLoading}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-full border border-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t border-gray-200 bg-white px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={aiAvailable ? 'Escribe tu pregunta...' : 'IA no disponible, usa las sugeridas'}
                disabled={isLoading || !aiAvailable}
                className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white border border-transparent focus:border-emerald-300 transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || inputValue.trim().length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-full p-2.5 transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/30"
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
