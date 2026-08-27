// ============================================================
// ARCHIVO: database.js
// RESPONSABILIDAD: Configurar el pool de conexiones a
// PostgreSQL usando la libreria 'pg'. Centraliza la
// conexion a la base de datos para todos los services.
// ============================================================

const { Pool } = require('pg');

// Crear pool de conexiones con variables de entorno.
// Soporta SSL para proveedores en la nube (Supabase, Render, etc.)
// y conexion local sin SSL.
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max:      20,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
});

// Establecer search_path segun el esquema configurado.
// Por defecto usa 'barberia'; puede sobrescribirse con DB_SCHEMA.
const schema = process.env.DB_SCHEMA || 'barberia';
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${schema}, public`);
});

// Funcion para obtener una conexion del pool
// Se usa en cada service que necesite ejecutar queries
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = { pool, getClient };
