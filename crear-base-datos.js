// ============================================================
// ARCHIVO: crear-base-datos.js
// RESPONSABILIDAD: Script de utilidad para crear (o recrear)
// la base de datos completa del Sistema de Citas de la
// Barberia Urbana Medellin.
//
// 1) Lee el archivo db-schema.sql (esquema + datos de prueba)
//    que esta en la misma carpeta raiz.
// 2) Ejecuta el SQL sobre la base configurada por variables
//    de entorno, con valores por defecto para la base local.
//
// USO:
//   npm run crear-db            (usa valores locales por defecto)
//   node crear-base-datos.js
//
// VARIABLES DE ENTORNO (opcional, para conectar a otra base):
//   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL
//   Ejemplo Supabase:
//     DB_HOST=aws-0-us-east-2.pooler.supabase.com \
//     DB_PORT=5432 DB_NAME=postgres \
//     DB_USER=postgres.tu_ref DB_PASSWORD=tu_pass DB_SSL=true \
//     node crear-base-datos.js
// ============================================================

const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, 'backend', 'node_modules', 'pg'));

// Valores por defecto para la base de datos LOCAL
const DB_CONFIG = {
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME     || 'barberia',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  family:   4,
};

const SCHEMA_FILE = path.join(__dirname, 'db-schema.sql');

// Funcion principal: conecta, ejecuta el script y reporta el resultado
async function crearBaseDeDatos() {
  console.log('==============================================');
  console.log('  Creacion de la base de datos - Barberia');
  console.log('==============================================');
  console.log(`  Host     : ${DB_CONFIG.host}`);
  console.log(`  Puerto   : ${DB_CONFIG.port}`);
  console.log(`  Base     : ${DB_CONFIG.database}`);
  console.log(`  Usuario  : ${DB_CONFIG.user}`);
  console.log('----------------------------------------------');

  // Verificar que el archivo de esquema exista
  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error(`[ERROR] No se encontro el archivo de esquema: ${SCHEMA_FILE}`);
    process.exit(1);
  }

  const schemaSQL = fs.readFileSync(SCHEMA_FILE, 'utf8');

  const cliente = new Client(DB_CONFIG);
  let terminoBien = false;

  try {
    // Conectar a la base de datos objetivo
    console.log('Conectando a PostgreSQL...');
    await cliente.connect();
    console.log('Conexion exitosa.');

    // Ejecutar el script completo (DROP/CREATE/INSERT/triggers)
    console.log('Ejecutando esquema y datos de prueba...');
    await cliente.query(schemaSQL);
    console.log('Esquema y datos creados correctamente.');

    // Verificar resumen de las tablas principales
    const resumen = await cliente.query(`
      SELECT 'roles'     AS tabla, COUNT(*) AS total FROM barberia.roles
      UNION ALL SELECT 'usuarios',  COUNT(*) FROM barberia.usuarios
      UNION ALL SELECT 'barberos',  COUNT(*) FROM barberia.barberos
      UNION ALL SELECT 'servicios', COUNT(*) FROM barberia.servicios
      UNION ALL SELECT 'horarios',  COUNT(*) FROM barberia.horarios
      UNION ALL SELECT 'citas',     COUNT(*) FROM barberia.citas
    `);

    console.log('----------------------------------------------');
    console.log('  RESULTADO:');
    for (const fila of resumen.rows) {
      console.log(`    - ${fila.tabla.padEnd(12)} : ${fila.total}`);
    }
    terminoBien = true;
  } catch (error) {
    console.error('[ERROR] Fallo la creacion de la base de datos:');
    console.error('  ', error.message);
  } finally {
    // Cerrar conexion de forma segura
    await cliente.end().catch(() => {});
    if (terminoBien) {
      console.log('----------------------------------------------');
      console.log('  Base de datos lista para usar.');
    } else {
      console.log('  El proceso termino con errores.');
      process.exitCode = 1;
    }
  }
}

// Ejecutar la funcion principal
crearBaseDeDatos();
