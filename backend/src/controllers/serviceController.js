// ============================================================
// ARCHIVO: serviceController.js
// RESPONSABILIDAD: Recibir requests HTTP del catalogo de
// servicios, invocar el servicio y retornar respuestas.
// ============================================================

const serviceService = require('../services/serviceService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/v1/servicios
 * Obtener todos los servicios activos
 */
const getAll = async (req, res, next) => {
  try {
    const servicios = await serviceService.obtenerTodos(true);
    return successResponse(res, servicios, 'Servicios obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/servicios/:id
 * Obtener un servicio por ID
 */
const getById = async (req, res, next) => {
  try {
    const servicio = await serviceService.obtenerPorId(req.params.id);
    return successResponse(res, servicio, 'Servicio obtenido');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/servicios
 * Crear un nuevo servicio (solo administrador)
 */
const create = async (req, res, next) => {
  try {
    const servicio = await serviceService.crear(req.body);
    return successResponse(res, servicio, 'Servicio creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/servicios/:id
 * Actualizar un servicio existente (solo administrador)
 */
const update = async (req, res, next) => {
  try {
    const servicio = await serviceService.actualizar(req.params.id, req.body);
    return successResponse(res, servicio, 'Servicio actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/servicios/:id
 * Eliminar (desactivar) un servicio (solo administrador)
 */
const remove = async (req, res, next) => {
  try {
    await serviceService.eliminar(req.params.id);
    return successResponse(res, null, 'Servicio eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
