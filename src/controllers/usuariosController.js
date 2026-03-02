// src/controllers/usuariosController.js
const Usuario = require('../models/Usuario');

class UsuariosController {
  // ==================== GET: Listar todos los usuarios ====================
  static async getAll(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ 
        error: 'Error al obtener usuarios',
        message: error.message 
      });
    }
  }

  // ==================== GET: Buscar usuarios con filtros ====================
  static async search(req, res) {
    try {
      const { searchTerm, rol, estado } = req.query;
      
      const filters = {
        searchTerm: searchTerm || '',
        rol: rol || null,
        estado: estado === 'true' ? true : estado === 'false' ? false : undefined
      };

      const usuarios = await Usuario.search(filters);
      res.json(usuarios);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      res.status(500).json({ 
        error: 'Error al buscar usuarios',
        message: error.message 
      });
    }
  }

  // ==================== GET: Obtener un usuario por ID ====================
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ 
        error: 'Error al obtener usuario',
        message: error.message 
      });
    }
  }

  // ==================== POST: Crear nuevo usuario ====================
  static async create(req, res) {
    try {
      const {
        ci,
        nombre_completo,
        email,
        contrasena,
        rol,
        municipio,
        club,
        categoria,
        estado
      } = req.body;

      // Validar campos requeridos
      if (!ci || !nombre_completo || !email || !contrasena || !rol) {
        return res.status(400).json({ 
          error: 'Los campos CI, nombre completo, email, contraseña y rol son obligatorios' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'El formato del email no es válido' 
        });
      }

      // Validar longitud de contraseña
      if (contrasena.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      // Crear usuario
      const nuevoUsuario = await Usuario.create({
        ci,
        nombre_completo,
        email,
        contrasena,
        rol,
        municipio,
        club,
        categoria,
        estado: estado !== undefined ? estado : true
      });

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        usuario: nuevoUsuario
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      // Errores específicos
      if (error.message.includes('CI')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('email')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error al crear usuario',
        message: error.message 
      });
    }
  }

  // ==================== PUT: Actualizar usuario ====================
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validar formato de email si se proporciona
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return res.status(400).json({ 
            error: 'El formato del email no es válido' 
          });
        }
      }

      // Validar longitud de contraseña si se proporciona
      if (updateData.contrasena && updateData.contrasena.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      const usuarioActualizado = await Usuario.update(id, updateData);

      if (!usuarioActualizado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        message: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      
      // Errores específicos
      if (error.message.includes('CI')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('email')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error al actualizar usuario',
        message: error.message 
      });
    }
  }

  // ==================== DELETE: Eliminar usuario permanentemente ====================
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const usuarioEliminado = await Usuario.delete(id);

      res.json({
        message: 'Usuario eliminado permanentemente de la base de datos',
        usuario: usuarioEliminado
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error al eliminar usuario',
        message: error.message 
      });
    }
  }

  // ==================== PATCH: Desactivar usuario (soft delete) ====================
  static async deactivate(req, res) {
    try {
      const { id } = req.params;

      await Usuario.deactivate(id);

      res.json({
        message: 'Usuario desactivado exitosamente'
      });
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error al desactivar usuario',
        message: error.message 
      });
    }
  }

  // ==================== POST: Login ====================
  static async login(req, res) {
    try {
      const { email, contrasena } = req.body;

      if (!email || !contrasena) {
        return res.status(400).json({ 
          error: 'Email y contraseña son requeridos' 
        });
      }

      const usuario = await Usuario.authenticate(email, contrasena);

      // Aquí podrías generar un JWT token
      res.json({
        message: 'Login exitoso',
        usuario: usuario
      });
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message.includes('Credenciales')) {
        return res.status(401).json({ error: error.message });
      }
      if (error.message.includes('inactivo')) {
        return res.status(403).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error en el servidor',
        message: error.message 
      });
    }
  }

  // ==================== GET: Obtener estadísticas ====================
  static async getStats(req, res) {
    try {
      const stats = await Usuario.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ 
        error: 'Error al obtener estadísticas',
        message: error.message 
      });
    }
  }

  // ==================== GET: Contar usuarios ====================
  static async count(req, res) {
    try {
      const { rol, estado } = req.query;
      
      const filters = {
        rol: rol || null,
        estado: estado === 'true' ? true : estado === 'false' ? false : undefined
      };

      const total = await Usuario.count(filters);
      res.json({ total });
    } catch (error) {
      console.error('Error al contar usuarios:', error);
      res.status(500).json({ 
        error: 'Error al contar usuarios',
        message: error.message 
      });
    }
  }
}

module.exports = UsuariosController;