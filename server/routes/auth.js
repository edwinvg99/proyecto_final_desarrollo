const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sdk = require('../lib/sdkClient');
const { AuthServiceSdkError } = require('energy-community-auth-sdk');

const router = express.Router();

const validateRegister = (req) => {
  const { nombre, apellido, email, password, universidad, ciudad, telefono, direccion } = req.body;
  const errors = {};

  if (!nombre || nombre.trim() === '') errors.nombre = 'El nombre es requerido';
  if (!apellido || apellido.trim() === '') errors.apellido = 'El apellido es requerido';

  if (!email || email.trim() === '') {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email inválido';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!universidad) errors.universidad = 'La universidad es requerida';
  if (!ciudad) errors.ciudad = 'La ciudad es requerida';

  if (!telefono || telefono.trim() === '') {
    errors.telefono = 'El teléfono es requerido';
  } else if (!/^\d{10}$/.test(telefono.replace(/\D/g, ''))) {
    errors.telefono = 'El teléfono debe tener 10 dígitos';
  }

  if (!direccion || direccion.trim() === '') errors.direccion = 'La dirección es requerida';

  return errors;
};

router.post('/register', async (req, res) => {
  const errors = validateRegister(req);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validación fallida', errors });
  }

  const { nombre, apellido, email, password, universidad, ciudad, telefono, direccion } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Este email ya está registrado' });

    const sdkResult = await sdk.auth.register({
      firstName: nombre,
      lastName: apellido,
      email,
      password,
    });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      sdkUserId: sdkResult.user.id,
      nombre,
      apellido,
      email,
      password: hashed,
      universidad,
      ciudad,
      telefono,
      direccion,
    });

    res.json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    if (err instanceof AuthServiceSdkError) {
      return res.status(err.status || 400).json({ message: err.message || 'Error en el registro' });
    }
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    let sdkResult;

    try {
      sdkResult = await sdk.auth.login({ email, password });
    } catch (sdkErr) {
      // Usuario podría existir localmente pero no en el SDK (registrado antes de la migración)
      const localUser = await User.findOne({ email });
      if (localUser && localUser.password && await bcrypt.compare(password, localUser.password)) {
        // Migración silenciosa: registrar en SDK
        try {
          const reg = await sdk.auth.register({
            firstName: localUser.nombre,
            lastName: localUser.apellido,
            email,
            password,
          });
          localUser.sdkUserId = reg.user.id;
          await localUser.save();
          sdkResult = await sdk.auth.login({ email, password });
        } catch (migErr) {
          console.error('Error migrando usuario al SDK:', migErr);
          return res.status(500).json({ message: 'Error migrando cuenta. Contacta soporte.' });
        }
      } else {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado en el sistema' });

    if (!user.sdkUserId) {
      user.sdkUserId = sdkResult.user.id;
      await user.save();
    }

    res.json({
      accessToken: sdkResult.accessToken,
      refreshToken: sdkResult.refreshToken,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        universidad: user.universidad,
        ciudad: user.ciudad,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken requerido' });
  }
  try {
    const result = await sdk.auth.refresh({ refreshToken });
    res.json({ accessToken: result.accessToken, refreshToken: result.refreshToken });
  } catch (err) {
    res.status(401).json({ message: 'Sesión expirada. Inicia sesión de nuevo.' });
  }
});

router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];
    try {
      await sdk.auth.logout(accessToken);
    } catch (_) {
      // Ignorar errores al cerrar sesión en el SDK
    }
  }
  res.json({ message: 'Sesión cerrada' });
});

router.get('/sessions', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const sessions = await sdk.auth.sessions(accessToken);
    res.json(sessions);
  } catch (err) {
    if (err instanceof AuthServiceSdkError) {
      return res.status(err.status || 401).json({ message: err.message || 'Error al obtener sesiones' });
    }
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.delete('/sessions/:sessionId', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  const accessToken = authHeader.split(' ')[1];
  const { sessionId } = req.params;
  try {
    await sdk.auth.revokeSession(accessToken, sessionId);
    res.json({ message: 'Sesión revocada' });
  } catch (err) {
    if (err instanceof AuthServiceSdkError) {
      return res.status(err.status || 400).json({ message: err.message || 'Error al revocar sesión' });
    }
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.get('/user/:sdkId', async (req, res) => {
  try {
    const sdkUser = await sdk.auth.getUserById(req.params.sdkId);
    res.json(sdkUser);
  } catch (err) {
    if (err instanceof AuthServiceSdkError) {
      return res.status(err.status || 404).json({ message: err.message || 'Usuario no encontrado' });
    }
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const result = await sdk.auth.validate({ accessToken });
    const sdkUserId = result.user?.id;
    const user = await User.findOne({ sdkUserId });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado en el sistema' });
    res.json({
      id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      universidad: user.universidad,
      ciudad: user.ciudad,
    });
  } catch (err) {
    if (err instanceof AuthServiceSdkError) {
      return res.status(err.status || 401).json({ message: err.message || 'Token inválido' });
    }
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
