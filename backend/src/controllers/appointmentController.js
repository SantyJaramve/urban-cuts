// ============================================================
// ARCHIVO: appointmentController.js
// RESPONSABILIDAD: Recibir requests HTTP de citas, invocar
// el servicio y retornar respuestas. Maneja reserva,
// consulta, cambio de estado y cancelacion.
// ============================================================

const appointmentService = require('../services/appointmentService');
const { successResponse } = require('../utils/responseHelper');

/**
 * POST /api/v1/citas
 * Reservar una nueva cita
 */
const reservar = async (req, res, next) => {
  try {
    // El id del cliente viene del token JWT
    const id_cliente = req.user.id;
    const cita = await appointmentService.reservar({ ...req.body, id_cliente });
    return successResponse(res, cita, 'Cita reservada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/citas/barbero/:fecha
 * Obtener citas de un barbero en una fecha (agenda diaria)
 */
const getCitasBarbero = async (req, res, next) => {
  try {
    const { pool } = require('../config/database');
    // Buscar el id_barbero a partir del id_usuario del token
    const barberoQuery = 'SELECT id_barbero FROM barberos WHERE id_usuario = $1';
    const barberoResult = await pool.query(barberoQuery, [req.user.id]);
    if (barberoResult.rows.length === 0) {
      return next(require('../middlewares/errorHandler').createError(404, 'No se encontro perfil de barbero para este usuario'));
    }
    const id_barbero = barberoResult.rows[0].id_barbero;
    const { fecha } = req.params;
    const citas = await appointmentService.obtenerCitasBarbero(id_barbero, fecha);
    return successResponse(res, citas, 'Citas del barbero obtenidas');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/citas/cliente
 * Obtener todas las citas del cliente autenticado
 */
const getCitasCliente = async (req, res, next) => {
  try {
    const id_cliente = req.user.id;
    const citas = await appointmentService.obtenerCitasCliente(id_cliente);
    return successResponse(res, citas, 'Citas del cliente obtenidas');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/citas/codigo/:codigo
 * Buscar una cita por su codigo de reserva
 */
const getByCodigo = async (req, res, next) => {
  try {
    const cita = await appointmentService.obtenerPorCodigo(req.params.codigo);
    return successResponse(res, cita, 'Cita encontrada');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/citas/:id/estado
 * Cambiar el estado de una cita (barbero o admin)
 */
const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const cita = await appointmentService.cambiarEstado(req.params.id, estado);
    return successResponse(res, cita, 'Estado de la cita actualizado');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/citas/:id/cancelar
 * Cancelar una cita (cliente)
 */
const cancelarCita = async (req, res, next) => {
  try {
    const id_cliente = req.user.id;
    const cita = await appointmentService.cancelarCita(req.params.id, id_cliente);
    return successResponse(res, cita, 'Cita cancelada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/citas/barbero
 * Obtener todas las proximas citas del barbero (hoy en adelante)
 */
const getProximasCitasBarbero = async (req, res, next) => {
  try {
    const { pool } = require('../config/database');
    const barberoQuery = 'SELECT id_barbero FROM barberos WHERE id_usuario = $1';
    const barberoResult = await pool.query(barberoQuery, [req.user.id]);
    if (barberoResult.rows.length === 0) {
      return next(require('../middlewares/errorHandler').createError(404, 'No se encontro perfil de barbero para este usuario'));
    }
    const id_barbero = barberoResult.rows[0].id_barbero;
    const citas = await appointmentService.obtenerProximasCitasBarbero(id_barbero);
    return successResponse(res, citas, 'Proximas citas del barbero obtenidas');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/citas/barbero/historial
 * Obtener historial de citas completadas/canceladas del barbero
 */
const getHistorialBarbero = async (req, res, next) => {
  try {
    const { pool } = require('../config/database');
    const barberoQuery = 'SELECT id_barbero FROM barberos WHERE id_usuario = $1';
    const barberoResult = await pool.query(barberoQuery, [req.user.id]);
    if (barberoResult.rows.length === 0) {
      return next(require('../middlewares/errorHandler').createError(404, 'No se encontro perfil de barbero para este usuario'));
    }
    const id_barbero = barberoResult.rows[0].id_barbero;
    const citas = await appointmentService.obtenerHistorialBarbero(id_barbero);
    return successResponse(res, citas, 'Historial de citas del barbero obtenido');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/citas/todas
 * Obtener todas las citas del sistema (solo admin)
 */
const getTodasCitas = async (req, res, next) => {
  try {
    const citas = await appointmentService.obtenerTodasCitas();
    return successResponse(res, citas, 'Todas las citas obtenidas');
  } catch (error) {
    next(error);
  }
};

module.exports = { reservar, getCitasBarbero, getProximasCitasBarbero, getHistorialBarbero, getTodasCitas, getCitasCliente, getByCodigo, cambiarEstado, cancelarCita };
