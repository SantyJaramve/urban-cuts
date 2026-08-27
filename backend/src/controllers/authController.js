// ============================================================
// ARCHIVO: authController.js
// RESPONSABILIDAD: Recibir requests HTTP de autenticacion,
// invocar el servicio correspondiente y retornar la
// respuesta JSON al cliente.
// ============================================================

const authService   = require('../services/authService');
const { pool }      = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * POST /api/v1/auth/register
 * Registrar un nuevo usuario
 */
const register = async (req, res, next) => {
  try {
    const usuario = await authService.registrarUsuario(req.body);
    return successResponse(res, usuario, 'Usuario registrado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Autenticar usuario y retornar token JWT
 */
const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;
    const resultado = await authService.login(correo, contrasena);
    return successResponse(res, resultado, 'Login exitoso');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/profile
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res, next) => {
  try {
    const query = `
      SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono,
             u.activo, u.created_at, r.nombre_rol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
    `;
    const result = await pool.query(query, [req.user.id]);
    if (result.rows.length === 0) {
      return next(require('../middlewares/errorHandler').createError(404, 'Usuario no encontrado'));
    }
    return successResponse(res, result.rows[0], 'Perfil del usuario');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
