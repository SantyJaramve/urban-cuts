// ============================================================
// ARCHIVO: app.js
// RESPONSABILIDAD: Punto de entrada del servidor Express.
// Configura middleware global (CORS, JSON parsing),
// registra las rutas de la API y levanta el servidor.
// ============================================================

// Cargar variables de entorno ANTES de cualquier otro import
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');

// Importar rutas de la API
const authRoutes       = require('./routes/authRoutes');
const serviceRoutes    = require('./routes/serviceRoutes');
const barberRoutes     = require('./routes/barberRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');

// Middleware centralizado de errores
const { errorHandler } = require('./middlewares/errorHandler');

// Crear instancia de Express
const app = express();
const PORT = process.env.PORT || 4000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// Habilitar CORS para permitir peticiones del frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Parsear bodies JSON (max 10mb)
app.use(express.json({ limit: '10mb' }));

// Parsear bodies URL-encoded
app.use(express.urlencoded({ extended: true }));

// ============================================================
// RUTAS DE LA API
// Prefijo base: /api/v1
// ============================================================
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/servicios',    serviceRoutes);
app.use('/api/v1/barberos',     barberRoutes);
app.use('/api/v1/citas',        appointmentRoutes);
app.use('/api/v1/dashboard',    dashboardRoutes);

// Ruta de salud del servidor
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'API Barberia Medellin funcionando correctamente' });
});

// ============================================================
// MIDDLEWARE DE ERRORES GLOBAL
// Captura errores no manejados y retorna respuesta JSON
// ============================================================
app.use(errorHandler);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================
const startServer = async () => {
  try {
    // Verificar conexion a la base de datos
    const client = await pool.connect();
    console.log('Conectado a PostgreSQL exitosamente');
    client.release();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`API disponible en http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    process.exit(1);
  }
};

startServer();
