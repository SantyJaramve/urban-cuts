// ============================================================
// ARCHIVO: errorHandler.js
// RESPONSABILIDAD: Middleware centralizado para capturar
// errores no manejados en los controllers. Retorna una
// respuesta JSON estandarizada con estructura:
// { success: false, message: "...", error: "..." }
// ============================================================

// Middleware de errores - Express reconoce 4 parametros
// como middleware de error
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err.message);

  // Determinar el status code del error
  const statusCode = err.statusCode || 500;
  const message    = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message: message,
    // Solo enviar detalles del error en modo desarrollo
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// Funcion helper para crear errores con codigo de estado
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { errorHandler, createError };
