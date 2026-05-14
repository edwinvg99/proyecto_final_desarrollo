const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

const CREG_URL = 'https://creg.gov.co/';
const CACHE_TTL = 60 * 60 * 1000; // 60 minutos

const CATEGORIAS = {
  RE: {
    nombre: 'Resoluciones',
    verMas: 'https://creg.gov.co/loader.php?lServicio=Documentos&lFuncion=infoCategoriaConsumo&tipo=RE',
  },
  PR: {
    nombre: 'Proyectos de resolución',
    verMas: 'https://creg.gov.co/loader.php?lServicio=Documentos&lFuncion=infoCategoriaConsumo&tipo=PR',
  },
  CI: {
    nombre: 'Circulares',
    verMas: 'https://creg.gov.co/loader.php?lServicio=Documentos&lFuncion=infoCategoriaConsumo&tipo=CI',
  },
  AU: {
    nombre: 'Autos',
    verMas: 'https://creg.gov.co/loader.php?lServicio=Documentos&lFuncion=infoCategoriaConsumo&tipo=AU',
  },
};

let cregCache = { data: null, lastFetch: 0 };

async function scrapeCREG() {
  const now = Date.now();
  if (cregCache.data && (now - cregCache.lastFetch) < CACHE_TTL) {
    console.log('[CREG] Usando caché existente');
    return cregCache.data;
  }

  console.log('[CREG] Iniciando scraping de creg.gov.co...');

  const { data: html } = await axios.get(CREG_URL, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-CO,es;q=0.9',
    },
  });

  const $ = cheerio.load(html);
  const grupos = { RE: [], PR: [], CI: [], AU: [] };

  // Links con idDirectorio son los documentos individuales
  $('a[href*="idDirectorio"]').each((_, el) => {
    const href = $(el).attr('href');
    const titulo = ($(el).text() || '').replace(/\s+/g, ' ').trim();
    if (!titulo) return;

    const tipoMatch = href.match(/tipo=([A-Z]+)/);
    if (!tipoMatch) return;
    const tipo = tipoMatch[1];
    if (!grupos[tipo]) return;

    grupos[tipo].push({ titulo, url: href });
  });

  const resultado = Object.entries(CATEGORIAS).map(([tipo, meta]) => ({
    tipo,
    nombre: meta.nombre,
    verMas: meta.verMas,
    documentos: grupos[tipo].slice(0, 5),
  }));

  cregCache = { data: resultado, lastFetch: now };
  console.log(`[CREG] Scraping completado. Documentos por categoría: ${resultado.map(c => `${c.nombre}: ${c.documentos.length}`).join(', ')}`);

  return resultado;
}

router.get('/documentos', async (req, res) => {
  try {
    const data = await scrapeCREG();
    res.json({
      categorias: data,
      ultimaActualizacion: new Date(cregCache.lastFetch).toISOString(),
      fuente: 'CREG - Comisión de Regulación de Energía y Gas',
      fuenteUrl: CREG_URL,
    });
  } catch (error) {
    console.error('[CREG] Error en scraping:', error.message);
    res.status(500).json({
      error: 'No se pudo obtener los documentos de la CREG. Intenta de nuevo más tarde.',
    });
  }
});

router.post('/refresh', async (req, res) => {
  cregCache.lastFetch = 0;
  try {
    const data = await scrapeCREG();
    const total = data.reduce((acc, c) => acc + c.documentos.length, 0);
    res.json({ success: true, total, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
