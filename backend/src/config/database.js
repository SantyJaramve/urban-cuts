// ============================================================
// ARCHIVO: database.js
// RESPONSABILIDAD: Configurar el pool de conexiones a
// PostgreSQL usando la libreria 'pg'. Centraliza la
// conexion a la base de datos para todos los services.
// ============================================================

const { Pool } = require('pg');

// Crear pool de conexiones con variables de entorno
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max:      20,
});

// Establecer search_path para buscar en el esquema barberia
pool.on('connect', (client) => {
  client.query('SET search_path TO barberia, public');
});

// Funcion para obtener una conexion del pool
// Se usa en cada service que necesite ejecutar queries
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = { pool, getClient };
