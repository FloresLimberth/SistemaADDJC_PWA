// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Railway provee DATABASE_URL, desarrollo local usa variables separadas
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway usa esto
  host: process.env.DB_HOST,                  // Desarrollo local usa esto
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Prueba de conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL');
    client.query('SELECT NOW()', (err, res) => {
      release();
      if (!err) {
        console.log('⏰ Hora del servidor:', res.rows[0].now);
      }
    });
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exportar pool para uso directo si es necesario
};