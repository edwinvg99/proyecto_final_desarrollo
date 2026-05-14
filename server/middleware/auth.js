const sdk = require('../lib/sdkClient');
const { AuthServiceSdkError } = require('energy-community-auth-sdk');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const result = await sdk.auth.validate({ accessToken });
    req.userId = result.user?.id;
    next();
  } catch (err) {
    if (err instanceof AuthServiceSdkError && err.status === 401) {
      return res.status(401).json({ message: 'Sesión expirada. Renueva tu token.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
