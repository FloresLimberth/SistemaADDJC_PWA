const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rutas
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuarios.routes');

// Montar routers
app.use('/api/auth', authRoutes);       
app.use('/api/usuarios', usuarioRoutes); 

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Sistema ADDJC en marcha!');
});

module.exports = app;