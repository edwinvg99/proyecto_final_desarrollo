/**
 * Test rápido del endpoint de noticias
 */

const axios = require('axios');

async function testNoticias() {
  try {
    console.log('Probando endpoint /api/noticias...\n');
    
    const response = await axios.get('http://localhost:5000/api/noticias', {
      timeout: 120000 // 2 minutos
    });
    
    const data = response.data;
    const noticias = data.noticias || data; // Soporte para ambas estructuras
    console.log(`✓ Total de noticias: ${data.total || noticias.length}\n`);
    
    // Agrupar por fuente
    const porFuente = {};
    noticias.forEach(n => {
      if (!porFuente[n.fuente]) {
        porFuente[n.fuente] = [];
      }
      porFuente[n.fuente].push(n);
    });
    
    console.log('=== NOTICIAS POR FUENTE ===');
    Object.keys(porFuente).forEach(fuente => {
      console.log(`\n${fuente}: ${porFuente[fuente].length} noticias`);
      porFuente[fuente].slice(0, 3).forEach((n, i) => {
        console.log(`  ${i + 1}. ${n.titulo.substring(0, 70)}...`);
      });
    });
    
    // Verificar Semana Sostenible
    console.log('\n=== SEMANA SOSTENIBLE ===');
    const semana = noticias.filter(n => n.fuenteId === 'semana-sostenible');
    console.log(`Total: ${semana.length} noticias`);
    semana.slice(0, 5).forEach((n, i) => {
      console.log(`\n[${i + 1}] ${n.titulo}`);
      console.log(`    URL: ${n.url}`);
      console.log(`    IMG: ${n.imagen ? 'Sí' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nEl servidor no está corriendo. Inicia el servidor con:');
      console.error('  cd server && npm start');
    }
  }
}

testNoticias();
