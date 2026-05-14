const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId:      { type: String, required: true },
  userEmail:   { type: String, required: true },
  userName:    { type: String, required: true },
  moduloId:    { type: String, required: true },
  moduloTitulo:{ type: String, required: true },
  certCode:    { type: String, required: true, unique: true },
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Certificate', certificateSchema);
