// ============================================================
// ARCHIVO: barberController.js
// RESPONSABILIDAD: Recibir requests HTTP de barberos y
// horarios, invocar el servicio y retornar respuestas.
// ============================================================

const barberService = require('../services/barberService');
const { successResponse } = require('../utils/responseHelper');

/**
 * GET /api/v1/barberos
 * Obtener todos los barberos activos
 */
const getAll = async (req, res, next) => {
  try {
    const barberos = await barberService.obtenerTodos();
    return successResponse(res, barberos, 'Barberos obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/barberos/:id
 * Obtener un barbero por ID
 */
const getById = async (req, res, next) => {
  try {
    const barbero = await barberService.obtenerPorId(req.params.id);
    return successResponse(res, barbero, 'Barbero obtenido');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/barberos
 * Crear perfil de barbero (solo administrador)
 */
const create = async (req, res, next) => {
  try {
    const barbero = await barberService.crear(req.body);
    return successResponse(res, barbero, 'Barbero creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/barberos/:id
 * Actualizar perfil de barbero (solo administrador)
 */
const update = async (req, res, next) => {
  try {
    const barbero = await barberService.actualizar(req.params.id, req.body);
    return successResponse(res, barbero, 'Barbero actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/barberos/:id
 * Eliminar (desactivar) barbero (solo administrador)
 */
const remove = async (req, res, next) => {
  try {
    await barberService.eliminar(req.params.id);
    return successResponse(res, null, 'Barbero eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GESTION DE HORARIOS
// ============================================================

/**
 * GET /api/v1/barberos/:id/horarios
 * Obtener horarios de un barbero
 */
const getHorarios = async (req, res, next) => {
  try {
    const horarios = await barberService.obtenerHorarios(req.params.id);
    return successResponse(res, horarios, 'Horarios obtenidos');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/barberos/:id/horarios
 * Configurar horarios de un barbero (solo administrador)
 */
const configurarHorarios = async (req, res, next) => {
  try {
    const horarios = await barberService.configurarHorarios(req.params.id, req.body.horarios);
    return successResponse(res, horarios, 'Horarios configurados exitosamente');
  } catch (error) {
    next(error);
  }
};

const getDisponibilidad = async (req, res, next) => {
  try {
    const { fecha, servicio_id } = req.query;
    if (!fecha || !servicio_id) {
      return res.status(400).json({ success: false, message: 'Se requieren fecha y servicio_id' });
    }
    const data = await barberService.obtenerDisponibilidad(req.params.id, fecha, parseInt(servicio_id));
    return successResponse(res, data, 'Disponibilidad obtenida');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove, getHorarios, configurarHorarios, getDisponibilidad };
