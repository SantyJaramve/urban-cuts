// ============================================================
// ARCHIVO: dashboardController.js
// RESPONSABILIDAD: Recibir requests HTTP del dashboard
// administrativo, invocar el servicio y retornar metricas.
// ============================================================

const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/responseHelper');

/**
 * GET /api/v1/dashboard
 * Obtener metricas del dashboard administrativo
 */
const getMetricas = async (req, res, next) => {
  try {
    const metricas = await dashboardService.obtenerMetricas();
    return successResponse(res, metricas, 'Metricas del dashboard obtenidas');
  } catch (error) {
    next(error);
  }
};

module.exports = { getMetricas };
