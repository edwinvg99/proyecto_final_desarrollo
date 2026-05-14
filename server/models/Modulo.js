const mongoose = require('mongoose');

const seccionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  parrafos: [{ type: String }],
  puntos: [{ type: String }],
}, { _id: false });

const recursoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  icono: { type: String },
  url: { type: String },
}, { _id: false });

const preguntaSchema = new mongoose.Schema({
  pregunta: { type: String, required: true },
  opciones: [{ type: String }],
  correcta: { type: Number, required: true },
}, { _id: false });

const moduloSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  titulo: { type: String, required: true },
  icono: { type: String },
  descripcion: { type: String },
  color: { type: String },
  contenido: [seccionSchema],
  recursos: [recursoSchema],
  examen: [preguntaSchema],
}, { timestamps: true });

module.exports = mongoose.model('Modulo', moduloSchema);
