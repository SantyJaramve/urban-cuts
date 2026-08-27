// ============================================================
// ARCHIVO: dashboardRoutes.js
// RESPONSABILIDAD: Definir las rutas HTTP del dashboard
// administrativo. Solo accesible por administradores.
// ============================================================

const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// GET /api/v1/dashboard - Metricas del dashboard (solo administrador)
router.get('/', authenticate, authorize('administrador'), dashboardController.getMetricas);

module.exports = router;
