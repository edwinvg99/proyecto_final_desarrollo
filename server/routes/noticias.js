/**
 * ============================================================
 * MÓDULO DE AGREGACIÓN DE NOTICIAS - ENERGÍA CLARA
 * ============================================================
 * Sistema de web scraping para recolectar noticias de energías
 * renovables en Colombia desde múltiples fuentes oficiales.
 * 
 * Características:
 * - Web scraping con Playwright (sitios dinámicos) y Cheerio (sitios estáticos)
 * - Sistema de caché para optimizar rendimiento
 * - Filtrado por palabras clave relevantes
 * - Manejo robusto de errores
 * - Soporte para múltiples fuentes con scrapers personalizados
 * 
 * @module routes/noticias
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

const router = express.Router();

// ============================================================
// CONFIGURACIÓN
// ============================================================

/**
 * Fuentes de noticias sobre energías renovables en Colombia
 * Cada fuente tiene metadatos y puede tener un scraper personalizado
 */
const FUENTES = [
  {
    id: 'minenergia',
    nombre: 'Ministerio de Minas y Energía',
    url: 'https://www.minenergia.gov.co/es/sala-de-prensa/noticias-index/',
    logo: 'https://www.minenergia.gov.co/o/portalcss-theme/images/favicon.ico',
    categoria: 'Gobierno',
    scraper: 'playwright', // Requiere scraping dinámico
  },
  {
    id: 'ser-colombia',
    nombre: 'SER Colombia',
    url: 'https://ser-colombia.org/prensa-menciones-en-prensa/',
    logo: 'https://ser-colombia.org/wp-content/uploads/2019/09/cropped-favicon-1-32x32.png',
    categoria: 'Gremio',
    scraper: 'custom', // Scraper personalizado
  },
  {
    id: 'semana-sostenible',
    nombre: 'Semana Sostenible',
    url: 'https://www.semana.com/sostenible/negocios-verdes/',
    logo: 'https://www.semana.com/favicon.ico',
    categoria: 'Medios',
    scraper: 'playwright', // Requiere scraping dinámico
  },
  {
    id: 'eltiempo-ambiente',
    nombre: 'El Tiempo - Medio Ambiente',
    url: 'https://www.eltiempo.com/vida/medio-ambiente',
    logo: 'https://www.eltiempo.com/favicon.ico',
    categoria: 'Medios',
    scraper: 'generic',
  },
];

/**
 * Palabras clave para filtrado de relevancia
 * Las noticias deben contener al menos una de estas palabras
 */
const KEYWORDS = [
  'energía renovable', 'energías renovables', 'energía solar', 'energía eólica',
  'paneles solares', 'transición energética', 'autogeneración', 'generación distribuida',
  'comunidades energéticas', 'sostenibilidad', 'carbono neutro', 'descarbonización',
  'hidrógeno verde', 'cambio climático', 'energía limpia', 'FNCER',
  'renovable', 'solar', 'eólica', 'fotovoltaica', 'biomasa', 'geotérmica',
];

/**
 * Configuración del sistema de caché
 */
const CACHE_CONFIG = {
  ttl: 30 * 60 * 1000, // 30 minutos
  maxArticlesPorFuente: 20,
  resumeMaxLength: 300,
};

/**
 * Configuración de timeouts y reintentos
 */
const SCRAPING_CONFIG = {
  httpTimeout: 15000,
  playwrightTimeout: 60000,
  playwrightWaitForJs: 3000,
  playwrightPageLoadDelay: 2000,
  maxPaginasPorFuente: 2,
};

// Caché en memoria
let noticiasCache = {
  data: [],
  lastFetch: 0,
  ttl: CACHE_CONFIG.ttl,
};

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Realiza petición HTTP con timeout y headers personalizados
 * @param {string} url - URL a consultar
 * @param {number} timeout - Timeout en milisegundos
 * @returns {Promise<AxiosResponse>}
 */
async function fetchWithTimeout(url, timeout = SCRAPING_CONFIG.httpTimeout) {
  return axios.get(url, {
    timeout,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
    },
  });
}

/**
 * Verifica si un texto contiene palabras clave relevantes
 * @param {string} text - Texto a verificar
 * @returns {boolean}
 */
function isRelevant(text) {
  const lower = (text || '').toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Normaliza una URL relativa a absoluta
 * @param {string} url - URL a normalizar
 * @param {string} baseUrl - URL base
 * @returns {string}
 */
function normalizeUrl(url, baseUrl) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  try {
    const base = new URL(baseUrl);
    return new URL(url, base.origin).href;
  } catch {
    return '';
  }
}

/**
 * Limpia espacios en blanco excesivos de un texto
 * @param {string} text - Texto a limpiar
 * @returns {string}
 */
function cleanText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

/**
 * Crea objeto de noticia con estructura estandarizada
 * @param {Object} data - Datos de la noticia
 * @param {Object} fuente - Fuente de la noticia
 * @returns {Object}
 */
function createArticle(data, fuente) {
  return {
    titulo: cleanText(data.titulo),
    resumen: data.resumen ? cleanText(data.resumen).substring(0, CACHE_CONFIG.resumeMaxLength) : '',
    url: data.url,
    fecha: data.fecha || null,
    sector: data.sector || null,
    imagen: data.imagen || null,
    fuente: fuente.nombre,
    fuenteId: fuente.id,
    categoria: fuente.categoria,
    logo: fuente.logo,
    fechaScraping: new Date().toISOString(),
  };
}

// ============================================================
// SCRAPERS ESPECIALIZADOS
// ============================================================

/**
 * Scraper para Ministerio de Minas y Energía (Playwright)
 * Sitio dinámico con tabla paginada renderizada por JavaScript
 * 
 * @param {Object} fuente - Configuración de la fuente
 * @returns {Promise<Array>} Lista de artículos
 */
async function scrapeMinenergia(fuente) {
  const baseUrl = 'https://www.minenergia.gov.co';
  const listUrl = fuente.url;
  const articles = [];
  const seen = new Set();
  let browser = null;

  try {
    console.log('[Minenergía] Iniciando scraping con Playwright...');
    
    // Lanzar navegador headless
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('[Minenergía] Navegando a:', listUrl);
    await page.goto(listUrl, { 
      waitUntil: 'load', 
      timeout: SCRAPING_CONFIG.playwrightTimeout 
    });
    
    // Esperar a que JavaScript cargue la tabla
    console.log('[Minenergía] Esperando carga de contenido dinámico...');
    await page.waitForTimeout(SCRAPING_CONFIG.playwrightWaitForJs);
    
    // Verificar que la tabla existe
    await page.waitForSelector('#tabledataset', { timeout: 20000 });
    await page.waitForSelector('#tabledataset tr', { timeout: 20000 });

    let pageNum = 1;
    let keepPaging = true;
    
    while (keepPaging && pageNum <= SCRAPING_CONFIG.maxPaginasPorFuente) {
      console.log(`[Minenergía] Procesando página ${pageNum}...`);
      
      // Esperar a que la tabla se estabilice
      await page.waitForTimeout(SCRAPING_CONFIG.playwrightPageLoadDelay);
      
      // Extraer datos de todas las filas
      const rowsData = await page.$$eval('#tabledataset tr', rows => {
        return rows.map(tr => {
          const a = tr.querySelector('a[href]');
          const h4 = tr.querySelector('h4.news-list-item-title');
          const resumen = tr.querySelector('p.news-list-item-text');
          const meta = tr.querySelector('p.fs-6');
          const img = tr.querySelector('img');
          
          return {
            href: a ? a.getAttribute('href') : '',
            titulo: h4 ? h4.textContent : '',
            resumen: resumen ? resumen.textContent : '',
            meta: meta ? meta.textContent : '',
            imagen: img ? img.getAttribute('src') : '',
          };
        });
      });
      
      console.log(`[Minenergía] Encontradas ${rowsData.length} filas en página ${pageNum}`);
      
      // Procesar cada fila
      let validCount = 0;
      for (const item of rowsData) {
        const titulo = cleanText(item.titulo);
        const resumen = cleanText(item.resumen);
        const meta = cleanText(item.meta);
        const href = item.href.trim();
        
        // Validar datos mínimos
        if (!titulo || titulo.length < 10 || !href) continue;
        
        // Construir URL completa
        const link = normalizeUrl(href, baseUrl);
        if (!link || seen.has(link)) continue;

        // Parsear metadatos: "18 de Marzo de 2026. Minenergía, Bogotá. Sector: Energía"
        let fecha = null, sector = null;
        if (meta) {
          const parts = meta.split('.');
          if (parts.length > 0) fecha = parts[0].trim();
          
          const match = meta.match(/Sector:\s*([^\n.]*)/i);
          if (match) sector = match[1].trim();
        }
        
        // Normalizar imagen
        const imagen = normalizeUrl(item.imagen.trim(), baseUrl);

        seen.add(link);
        validCount++;
        
        articles.push(createArticle({
          titulo,
          resumen,
          url: link,
          fecha,
          sector,
          imagen,
        }, fuente));
      }
      
      console.log(`[Minenergía] ${validCount} noticias válidas en página ${pageNum}`);

      // Intentar paginar si es la primera página
      if (pageNum === 1) {
        const btnNext = await page.$('#dataset_next:not(.disabled)');
        if (btnNext) {
          console.log('[Minenergía] Navegando a siguiente página...');
          await btnNext.click();
          await page.waitForTimeout(2500);
          pageNum++;
        } else {
          keepPaging = false;
        }
      } else {
        keepPaging = false;
      }
    }
    
    console.log(`[Minenergía] Scraping completado: ${articles.length} noticias`);
  } catch (error) {
    console.error(`[Minenergía] Error en scraping:`, error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return articles.slice(0, CACHE_CONFIG.maxArticlesPorFuente);
}

/**
 * Scraper para Semana Sostenible - Negocios Verdes (Playwright)
 * Sitio dinámico con grid de artículos renderizado por JavaScript
 * 
 * @param {Object} fuente - Configuración de la fuente
 * @returns {Promise<Array>} Lista de artículos
 */
async function scrapeSemanaSostenible(fuente) {
  const articles = [];
  const seen = new Set();
  let browser = null;

  try {
    console.log('[Semana Sostenible] Iniciando scraping con Playwright...');
    
    // Lanzar navegador headless
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('[Semana Sostenible] Navegando a:', fuente.url);
    await page.goto(fuente.url, { 
      waitUntil: 'load', 
      timeout: SCRAPING_CONFIG.playwrightTimeout 
    });
    
    // Esperar a que JavaScript cargue el contenido
    console.log('[Semana Sostenible] Esperando carga de contenido dinámico...');
    await page.waitForTimeout(SCRAPING_CONFIG.playwrightWaitForJs);
    
    // Extraer artículos del grid
    const articlesData = await page.evaluate(() => {
      // Selector: div con clases "flex flex-col items-start flex-1 lg:max-w-none"
      const items = document.querySelectorAll('.flex.flex-col.items-start.flex-1.lg\\:max-w-none');
      const results = [];

      items.forEach(item => {
        // Buscar el enlace del título (h3 > a)
        const titleEl = item.querySelector('h3 a');
        if (!titleEl) return;

        const titulo = titleEl.textContent.trim();
        const url = titleEl.href;

        // Buscar la imagen
        const imgEl = item.querySelector('img');
        const imagen = imgEl ? imgEl.src : '';
        const imagenAlt = imgEl ? imgEl.alt : '';

        results.push({
          titulo,
          url,
          imagen,
          imagenAlt,
        });
      });

      return results;
    });
    
    console.log(`[Semana Sostenible] Encontrados ${articlesData.length} artículos`);
    
    // Procesar cada artículo
    for (const item of articlesData) {
      const titulo = cleanText(item.titulo);
      const url = item.url;
      const imagen = item.imagen || '';
      
      // Validar datos mínimos
      if (!titulo || titulo.length < 15 || !url) continue;
      if (seen.has(url)) continue;
      
      // Verificar relevancia
      if (!isRelevant(titulo)) continue;
      
      seen.add(url);
      articles.push(createArticle({
        titulo,
        resumen: item.imagenAlt || '', // Usar el alt de la imagen como resumen si está disponible
        url,
        imagen,
      }, fuente));
    }
    
    console.log(`[Semana Sostenible] Scraping completado: ${articles.length} noticias relevantes`);
  } catch (error) {
    console.error(`[Semana Sostenible] Error en scraping:`, error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return articles.slice(0, CACHE_CONFIG.maxArticlesPorFuente);
}

/**
 * Scraper personalizado para SER Colombia
 * Estructura HTML específica del sitio
 * 
 * @param {Object} fuente - Configuración de la fuente
 * @returns {Promise<Array>} Lista de artículos
 */
async function scrapeSerColombia(fuente) {
  const articles = [];
  
  try {
    console.log('[SER Colombia] Iniciando scraping...');
    const { data: html } = await fetchWithTimeout(fuente.url);
    const $ = cheerio.load(html);
    const seen = new Set();
    
    // Selector específico: div.container-grid.blog_masonry > div.wgl_col-4.item
    $('div.container-grid.blog_masonry div.wgl_col-4.item').each((_, el) => {
      const $el = $(el);
      
      // Extraer datos
      const $a = $el.find('h3.blog-post_title a').first();
      const titulo = cleanText($a.text());
      let url = $a.attr('href') || '';
      const resumen = cleanText($el.find('div.blog-post_text > p').first().text());
      const fecha = cleanText($el.find('span.post_date').first().text());

      // Normalizar URL
      url = normalizeUrl(url, fuente.url);
      
      // Validaciones
      if (!titulo || titulo.length < 10) return;
      if (!url || seen.has(url)) return;
      
      // Verificar relevancia
      const fullText = `${titulo} ${resumen}`;
      if (!isRelevant(fullText)) return;
      
      seen.add(url);
      articles.push(createArticle({
        titulo,
        resumen,
        url,
        fecha,
      }, fuente));
    });
    
    console.log(`[SER Colombia] ${articles.length} noticias encontradas`);
  } catch (error) {
    console.error(`[SER Colombia] Error en scraping:`, error.message);
  }
  
  return articles.slice(0, CACHE_CONFIG.maxArticlesPorFuente);
}

/**
 * Scraper genérico para sitios con estructura HTML estándar
 * Intenta múltiples selectores comunes de noticias
 * 
 * @param {Object} fuente - Configuración de la fuente
 * @returns {Promise<Array>} Lista de artículos
 */
async function scrapeGeneric(fuente) {
  const articles = [];
  
  try {
    console.log(`[${fuente.nombre}] Iniciando scraping genérico...`);
    const { data: html } = await fetchWithTimeout(fuente.url);
    const $ = cheerio.load(html);

    // Selectores comunes de artículos de noticias
    const selectors = [
      'article', '.article', '.news-item', '.post', '.card',
      '.noticia', '.item-noticia', '.entry', '.story',
      '[class*="article"]', '[class*="news"]', '[class*="card"]',
      'h2 a', 'h3 a', '.title a', '.headline a',
    ];

    const seen = new Set();

    selectors.forEach(selector => {
      $(selector).each((_, el) => {
        const $el = $(el);

        let titulo = '';
        let url = '';
        let resumen = '';

        // Extraer título y URL según el tipo de elemento
        if (el.tagName === 'a') {
          titulo = cleanText($el.text());
          url = $el.attr('href') || '';
        } else {
          const $a = $el.find('a').first();
          titulo = cleanText($a.text() || $el.find('h2, h3, h4, .title, .headline').first().text());
          url = $a.attr('href') || '';
          resumen = cleanText($el.find('p, .summary, .excerpt, .description, .lead').first().text());
        }

        // Normalizar URL
        url = normalizeUrl(url, fuente.url);

        // Validaciones
        if (!titulo || titulo.length < 15 || titulo.length > 300) return;
        if (!url || seen.has(url)) return;

        // Verificar relevancia
        const fullText = `${titulo} ${resumen}`;
        if (!isRelevant(fullText)) return;

        seen.add(url);
        articles.push(createArticle({
          titulo,
          resumen,
          url,
        }, fuente));
      });
    });
    
    console.log(`[${fuente.nombre}] ${articles.length} noticias encontradas`);
  } catch (error) {
    console.error(`[${fuente.nombre}] Error en scraping:`, error.message);
  }

  return articles.slice(0, CACHE_CONFIG.maxArticlesPorFuente);
}

// ============================================================
// FUNCIÓN PRINCIPAL DE RECOLECCIÓN
// ============================================================

/**
 * Recolecta noticias de todas las fuentes configuradas
 * Utiliza caché para optimizar rendimiento
 * 
 * @returns {Promise<Array>} Lista de todas las noticias recolectadas
 */
async function recolectarNoticias() {
  const now = Date.now();

  // Verificar si el caché es válido
  if (noticiasCache.data.length > 0 && (now - noticiasCache.lastFetch) < noticiasCache.ttl) {
    console.log('[Noticias] Usando caché existente');
    return noticiasCache.data;
  }

  console.log('[Noticias] Iniciando recolección desde fuentes...');
  const startTime = Date.now();

  // Ejecutar scrapers en paralelo
  const promesas = FUENTES.map(fuente => {
    switch (fuente.scraper) {
      case 'playwright':
        // Decidir qué scraper Playwright usar según el ID de fuente
        if (fuente.id === 'semana-sostenible') {
          return scrapeSemanaSostenible(fuente);
        } else if (fuente.id === 'minenergia') {
          return scrapeMinenergia(fuente);
        }
        return scrapeGeneric(fuente);
      case 'custom':
        return scrapeSerColombia(fuente);
      case 'generic':
      default:
        return scrapeGeneric(fuente);
    }
  });

  const resultados = await Promise.allSettled(promesas);

  // Consolidar resultados
  let todasNoticias = [];
  resultados.forEach((resultado, index) => {
    if (resultado.status === 'fulfilled') {
      const articulos = resultado.value;
      todasNoticias = [...todasNoticias, ...articulos];
      console.log(`[Noticias] ${FUENTES[index].nombre}: ${articulos.length} artículos`);
    } else {
      console.error(`[Noticias] Error en ${FUENTES[index].nombre}:`, resultado.reason?.message);
    }
  });

  // Eliminar duplicados por URL
  const uniqueMap = new Map();
  todasNoticias.forEach(n => {
    if (!uniqueMap.has(n.url)) {
      uniqueMap.set(n.url, n);
    }
  });

  const noticias = Array.from(uniqueMap.values());

  // Actualizar caché
  noticiasCache = {
    data: noticias,
    lastFetch: now,
    ttl: CACHE_CONFIG.ttl,
  };

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Noticias] Recolección completada en ${elapsedTime}s - Total: ${noticias.length} noticias`);
  
  return noticias;
}

// ============================================================
// ENDPOINTS DE LA API
// ============================================================

/**
 * GET /api/noticias
 * Obtiene todas las noticias con filtros opcionales
 * 
 * Query params:
 * - categoria: Filtrar por categoría (Gobierno, Medios, Gremio)
 * - fuente: Filtrar por ID de fuente
 * - q: Búsqueda por texto en título o resumen
 */
router.get('/', async (req, res) => {
  try {
    const noticias = await recolectarNoticias();

    // Aplicar filtros opcionales
    const { categoria, fuente, q } = req.query;
    let filtradas = noticias;

    if (categoria) {
      filtradas = filtradas.filter(n => 
        n.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }
    
    if (fuente) {
      filtradas = filtradas.filter(n => n.fuenteId === fuente);
    }
    
    if (q) {
      const query = q.toLowerCase();
      filtradas = filtradas.filter(n =>
        n.titulo.toLowerCase().includes(query) ||
        n.resumen.toLowerCase().includes(query)
      );
    }

    res.json({
      total: filtradas.length,
      fuentes: FUENTES.map(f => ({ 
        id: f.id, 
        nombre: f.nombre, 
        categoria: f.categoria 
      })),
      noticias: filtradas,
      cache: {
        lastFetch: new Date(noticiasCache.lastFetch).toISOString(),
        ttlMinutes: noticiasCache.ttl / 60000,
      },
    });
  } catch (error) {
    console.error('[Noticias] Error en endpoint GET /:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener noticias',
      message: error.message 
    });
  }
});

/**
 * GET /api/noticias/fuentes
 * Lista todas las fuentes de noticias configuradas
 */
router.get('/fuentes', (req, res) => {
  res.json({
    total: FUENTES.length,
    fuentes: FUENTES.map(f => ({
      id: f.id,
      nombre: f.nombre,
      url: f.url,
      categoria: f.categoria,
      logo: f.logo,
      scraper: f.scraper,
    })),
  });
});

/**
 * POST /api/noticias/refresh
 * Fuerza actualización del caché de noticias
 */
router.post('/refresh', async (req, res) => {
  try {
    console.log('[Noticias] Forzando actualización de caché...');
    noticiasCache.lastFetch = 0; // Invalidar caché
    const noticias = await recolectarNoticias();
    
    res.json({
      success: true,
      message: 'Noticias actualizadas correctamente',
      total: noticias.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Noticias] Error al refrescar:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar noticias',
      message: error.message 
    });
  }
});

/**
 * GET /api/noticias/stats
 * Estadísticas del sistema de noticias
 */
router.get('/stats', async (req, res) => {
  try {
    const noticias = await recolectarNoticias();
    
    // Agrupar por fuente
    const porFuente = {};
    noticias.forEach(n => {
      porFuente[n.fuenteId] = (porFuente[n.fuenteId] || 0) + 1;
    });
    
    // Agrupar por categoría
    const porCategoria = {};
    noticias.forEach(n => {
      porCategoria[n.categoria] = (porCategoria[n.categoria] || 0) + 1;
    });
    
    res.json({
      total: noticias.length,
      porFuente,
      porCategoria,
      cache: {
        activo: (Date.now() - noticiasCache.lastFetch) < noticiasCache.ttl,
        lastFetch: new Date(noticiasCache.lastFetch).toISOString(),
        ttlMinutes: noticiasCache.ttl / 60000,
      },
      config: {
        fuentesActivas: FUENTES.length,
        maxArticlesPorFuente: CACHE_CONFIG.maxArticlesPorFuente,
      }
    });
  } catch (error) {
    console.error('[Noticias] Error en stats:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      message: error.message 
    });
  }
});

module.exports = router;
