const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sdkUserId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  universidad: { type: String, required: true },
  ciudad: { type: String, required: true },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
