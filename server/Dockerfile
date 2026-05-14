# Node 20 Debian (necesario para Playwright + Chromium)
FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Instalar Chromium y sus dependencias del sistema para Playwright
RUN npx playwright install --with-deps chromium

# Copiar el resto del código
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
