// src/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs'); // ← Añade esta línea
const Usuario = require('../models/Usuario');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const user = await Usuario.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // ✅ Comparar contraseña en texto plano con el hash almacenado
    const isValidPassword = await bcrypt.compare(password, user.contrasena);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Devolver solo lo necesario (sin la contraseña)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;