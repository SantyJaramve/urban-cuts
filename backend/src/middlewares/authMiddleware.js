// ============================================================
// ARCHIVO: authMiddleware.js
// RESPONSABILIDAD: Middleware de autenticacion JWT.
// Verifica que el request contenga un token valido en
// el header Authorization y decodifica los datos del
// usuario para inyectarlos en req.user.
// ============================================================

const jwt = require('jsonwebtoken');
const { createError } = require('./errorHandler');

// Middleware que protege rutas - requiere token valido
const authenticate = (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Token de autenticacion no proporcionado');
    }

    // El token viene como "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Inyectar datos del usuario en la request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Token de autenticacion invalido'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Token de autenticacion expirado'));
    }
    next(error);
  }
};

// Middleware que verifica el rol del usuario
// Se usa despues de authenticate
const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'No autenticado'));
    }

    if (!rolesPermitidos.includes(req.user.nombre_rol)) {
      return next(createError(403, 'No tiene permisos para acceder a este recurso'));
    }

    next();
  };
};

module.exports = { authenticate, authorize };
