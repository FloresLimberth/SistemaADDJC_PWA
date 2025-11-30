// src/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');

// ==================== RUTAS PÚBLICAS ====================
router.post('/login', UsuariosController.login);

// ==================== RUTAS DE USUARIOS ====================
router.get('/', UsuariosController.getAll);               
router.get('/search', UsuariosController.search);
router.get('/stats', UsuariosController.getStats);
router.get('/count', UsuariosController.count);
router.get('/:id', UsuariosController.getById);
router.post('/', UsuariosController.create);             
router.put('/:id', UsuariosController.update);
router.delete('/:id', UsuariosController.delete);
router.patch('/:id/deactivate', UsuariosController.deactivate);

module.exports = router;