// src/models/Usuario.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class Usuario {
  // ==================== LISTAR TODOS LOS USUARIOS ====================
  static async findAll() {
    const query = `
      SELECT 
        id, 
        ci,
        nombre_completo, 
        email, 
        rol, 
        municipio, 
        club, 
        categoria, 
        estado, 
        fecha_registro 
      FROM usuarios 
      ORDER BY id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // ==================== BUSCAR POR ID ====================
  static async findById(id) {
    const query = `
      SELECT 
        id, 
        ci,
        nombre_completo, 
        email, 
        rol, 
        municipio, 
        club, 
        categoria, 
        estado, 
        fecha_registro 
      FROM usuarios 
      WHERE id = $1
    `;
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== BUSCAR POR EMAIL (para login) ====================
  static async findByEmail(email) {
    const query = `
      SELECT * 
      FROM usuarios 
      WHERE email = $1
    `;
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== BUSCAR POR CI ====================
  static async findByCI(ci) {
    const query = `
      SELECT * 
      FROM usuarios 
      WHERE ci = $1
    `;
    const values = [ci];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== VERIFICAR SI CI EXISTE ====================
  static async existsCI(ci, excludeId = null) {
    let query = 'SELECT id FROM usuarios WHERE ci = $1';
    const values = [ci];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  // ==================== VERIFICAR SI EMAIL EXISTE ====================
  static async existsEmail(email, excludeId = null) {
    let query = 'SELECT id FROM usuarios WHERE email = $1';
    const values = [email];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  // ==================== CREAR USUARIO ====================
  static async create(userData) {
    const {
      ci,
      nombre_completo,
      email,
      contrasena,
      rol,
      municipio,
      club,
      categoria,
      estado = true
    } = userData;

    // Validar campos requeridos
    if (!ci || !nombre_completo || !email || !contrasena || !rol) {
      throw new Error('CI, nombre completo, email, contraseña y rol son obligatorios');
    }

    // Verificar si el CI ya existe
    const ciExists = await this.existsCI(ci);
    if (ciExists) {
      throw new Error('Ya existe un usuario con ese CI');
    }

    // Verificar si el email ya existe
    const emailExists = await this.existsEmail(email);
    if (emailExists) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // Cifrar la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);

    const query = `
      INSERT INTO usuarios (
        ci,
        nombre_completo, 
        email, 
        contrasena, 
        rol, 
        municipio, 
        club, 
        categoria, 
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id, 
        ci,
        nombre_completo, 
        email, 
        rol, 
        municipio, 
        club, 
        categoria, 
        estado, 
        fecha_registro
    `;

    const values = [
      ci,
      nombre_completo,
      email,
      hashedPassword, // Contraseña cifrada
      rol,
      municipio || null,
      club || null,
      categoria || null,
      estado
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== ACTUALIZAR USUARIO ====================
  static async update(id, updateData) {
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
    } = updateData;

    // Verificar si el usuario existe
    const userExists = await this.findById(id);
    if (!userExists) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar CI duplicado (excepto el mismo usuario)
    if (ci) {
      const ciExists = await this.existsCI(ci, id);
      if (ciExists) {
        throw new Error('Ya existe otro usuario con ese CI');
      }
    }

    // Verificar email duplicado (excepto el mismo usuario)
    if (email) {
      const emailExists = await this.existsEmail(email, id);
      if (emailExists) {
        throw new Error('Ya existe otro usuario con ese email');
      }
    }

    // Construir la consulta dinámicamente
    const fields = [];
    const values = [];
    let index = 1;

    if (ci !== undefined) {
      fields.push(`ci = $${index}`);
      values.push(ci);
      index++;
    }

    if (nombre_completo !== undefined) {
      fields.push(`nombre_completo = $${index}`);
      values.push(nombre_completo);
      index++;
    }

    if (email !== undefined) {
      fields.push(`email = $${index}`);
      values.push(email);
      index++;
    }

    if (rol !== undefined) {
      fields.push(`rol = $${index}`);
      values.push(rol);
      index++;
    }

    if (municipio !== undefined) {
      fields.push(`municipio = $${index}`);
      values.push(municipio);
      index++;
    }

    if (club !== undefined) {
      fields.push(`club = $${index}`);
      values.push(club);
      index++;
    }

    if (categoria !== undefined) {
      fields.push(`categoria = $${index}`);
      values.push(categoria);
      index++;
    }

    if (estado !== undefined) {
      fields.push(`estado = $${index}`);
      values.push(estado);
      index++;
    }

    // Si se proporciona una nueva contraseña, cifrarla
    if (contrasena && contrasena.trim() !== '') {
      const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);
      fields.push(`contrasena = $${index}`);
      values.push(hashedPassword);
      index++;
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar el ID al final para el WHERE
    values.push(id);

    const query = `
      UPDATE usuarios
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING 
        id, 
        ci,
        nombre_completo, 
        email, 
        rol, 
        municipio, 
        club, 
        categoria, 
        estado, 
        fecha_registro
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== DESACTIVAR USUARIO (soft delete) ====================
  static async deactivate(id) {
    const query = 'UPDATE usuarios SET estado = FALSE WHERE id = $1 RETURNING id';
    const values = [id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    return result.rows[0];
  }

  // ==================== ELIMINAR PERMANENTEMENTE ====================
  static async delete(id) {
    // Verificar si el usuario existe
    const userExists = await this.findById(id);
    if (!userExists) {
      throw new Error('Usuario no encontrado');
    }

    const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre_completo';
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== VERIFICAR CONTRASEÑA ====================
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // ==================== AUTENTICAR USUARIO (login) ====================
  static async authenticate(email, contrasena) {
    // Buscar usuario por email
    const user = await this.findByEmail(email);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.estado) {
      throw new Error('Usuario inactivo. Contacte al administrador');
    }

    // Verificar contraseña
    const passwordMatch = await this.verifyPassword(contrasena, user.contrasena);
    
    if (!passwordMatch) {
      throw new Error('Credenciales inválidas');
    }

    // No devolver la contraseña
    delete user.contrasena;
    
    return user;
  }

  // ==================== BUSCAR USUARIOS (con filtros) ====================
  static async search(filters = {}) {
    const { searchTerm, rol, estado } = filters;
    
    let query = `
      SELECT 
        id, 
        ci,
        nombre_completo, 
        email, 
        rol, 
        municipio, 
        club, 
        categoria, 
        estado, 
        fecha_registro 
      FROM usuarios 
      WHERE 1=1
    `;
    
    const values = [];
    let paramIndex = 1;

    // Filtro de búsqueda
    if (searchTerm) {
      query += ` AND (
        LOWER(nombre_completo) LIKE LOWER($${paramIndex}) OR
        LOWER(email) LIKE LOWER($${paramIndex}) OR
        LOWER(ci) LIKE LOWER($${paramIndex}) OR
        LOWER(municipio) LIKE LOWER($${paramIndex}) OR
        LOWER(club) LIKE LOWER($${paramIndex}) OR
        LOWER(categoria) LIKE LOWER($${paramIndex})
      )`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Filtro de rol
    if (rol) {
      query += ` AND rol = $${paramIndex}`;
      values.push(rol);
      paramIndex++;
    }

    // Filtro de estado
    if (estado !== undefined) {
      query += ` AND estado = $${paramIndex}`;
      values.push(estado);
      paramIndex++;
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // ==================== CONTAR USUARIOS ====================
  static async count(filters = {}) {
    const { rol, estado } = filters;
    
    let query = 'SELECT COUNT(*) as total FROM usuarios WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (rol) {
      query += ` AND rol = $${paramIndex}`;
      values.push(rol);
      paramIndex++;
    }

    if (estado !== undefined) {
      query += ` AND estado = $${paramIndex}`;
      values.push(estado);
      paramIndex++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // ==================== ESTADÍSTICAS ====================
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN rol = 'atleta' AND estado = TRUE THEN 1 END) as atletas_activos,
        COUNT(CASE WHEN estado = TRUE THEN 1 END) as usuarios_activos,
        COUNT(CASE WHEN estado = FALSE THEN 1 END) as usuarios_inactivos,
        COUNT(DISTINCT club) FILTER (WHERE club IS NOT NULL) as total_clubes
      FROM usuarios
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Usuario;

// ==================== DEPENDENCIAS NECESARIAS ====================
/*
Instalar bcrypt:
npm install bcrypt
*/