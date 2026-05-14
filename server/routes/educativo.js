const express = require('express');
const Modulo = require('../models/Modulo');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Público: solo metadatos para listado externo (Visual Community)
// No expone contenido, examen ni respuestas correctas
router.get('/modulos', async (req, res) => {
  try {
    const modulos = await Modulo.find(
      {},
      'id titulo icono descripcion color contenido examen recursos -_id'
    ).lean();

    const resultado = modulos.map(({ contenido, examen, recursos, ...meta }) => ({
      ...meta,
      totalSecciones: contenido.length,
      totalPreguntas: examen.length,
      totalRecursos: recursos.length,
    }));

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
});

// Protegido: detalle completo incluyendo examen con respuestas correctas
router.get('/modulos/:id', authMiddleware, async (req, res) => {
  try {
    const modulo = await Modulo.findOne({ id: req.params.id }, '-__v').lean();
    if (!modulo) return res.status(404).json({ message: 'Módulo no encontrado' });
    res.json(modulo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el módulo' });
  }
});

module.exports = router;
