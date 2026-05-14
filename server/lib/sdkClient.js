const { AuthServiceSdk } = require('energy-community-auth-sdk');

if (!process.env.AUTH_SDK_API_KEY) {
  console.error('[sdkClient] ADVERTENCIA: AUTH_SDK_API_KEY no está definida en las variables de entorno');
} else {
  console.log('[sdkClient] AUTH_SDK_API_KEY cargada (longitud=%d)', process.env.AUTH_SDK_API_KEY.length);
}

const sdk = new AuthServiceSdk({
  appId: 'energia-clara',
  apiKey: process.env.AUTH_SDK_API_KEY,
});

module.exports = sdk;
