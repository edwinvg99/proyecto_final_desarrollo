require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');
const passwordResetRoutes = require('./routes/passwordReset');
const noticiasRoutes = require('./routes/noticias');
const cregRoutes = require('./routes/creg');
const simemRoutes = require('./routes/simem');
const sinergoxRoutes = require('./routes/sinergox');
const educativoRoutes = require('./routes/educativo');
const Modulo = require('./models/Modulo');
const modulosData = require('./data/modulosData');

// Override DNS — public resolvers first (fast for Railway, simem.co, etc.),
// Colombian ISP DNS as fallback for domains that need local resolution.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '200.21.64.2', '200.21.64.65', '190.7.214.91']);
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.set('trust proxy', 1);

// ============================================================
// SEGURIDAD: Helmet (cabeceras HTTP seguras)
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Deshabilitado para SPA en desarrollo
}));

// ============================================================
// SEGURIDAD: CORS restringido
// ============================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================
// SEGURIDAD: Rate limiting global
// ============================================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por ventana por IP
  message: {
    error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Rate limiter más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // máximo 20 intentos de login/registro por ventana
  message: {
    error: 'Demasiados intentos de autenticación. Espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '1mb' })); // Limitar tamaño del body

// ============================================================
// BASE DE DATOS
// ============================================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Atlas conectado');
    const count = await Modulo.countDocuments();
    if (count === 0) {
      await Modulo.insertMany(modulosData);
      console.log(`Seed: ${modulosData.length} módulos educativos insertados`);
    }
  })
  .catch(err => console.error(err));

// ============================================================
// RUTAS
// ============================================================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/password', authLimiter, passwordResetRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/creg', cregRoutes);
app.use('/api/simem', simemRoutes);
app.use('/api/sinergox', sinergoxRoutes);
app.use('/api/educativo', educativoRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================
// MANEJO GLOBAL DE ERRORES
// ============================================================
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server en puerto ${PORT}`));
