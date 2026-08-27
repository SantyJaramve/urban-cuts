// ============================================================
// ARCHIVO: barberRoutes.js
// RESPONSABILIDAD: Definir las rutas HTTP de barberos y
// horarios. CRUD con proteccion por roles.
// ============================================================

const router = require('express').Router();
const barberController = require('../controllers/barberController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateBarber } = require('../middlewares/validationMiddleware');

// GET /api/v1/barberos - Listar barberos (publico)
router.get('/', barberController.getAll);

// GET /api/v1/barberos/:id/disponibilidad - Horas disponibles para una fecha (publico)
router.get('/:id/disponibilidad', barberController.getDisponibilidad);

// GET /api/v1/barberos/:id - Obtener barbero por ID (publico)
router.get('/:id', barberController.getById);

// POST /api/v1/barberos - Crear barbero (solo administrador)
router.post('/', authenticate, authorize('administrador'), validateBarber, barberController.create);

// PUT /api/v1/barberos/:id - Actualizar barbero (solo administrador)
router.put('/:id', authenticate, authorize('administrador'), barberController.update);

// DELETE /api/v1/barberos/:id - Eliminar barbero (solo administrador)
router.delete('/:id', authenticate, authorize('administrador'), barberController.remove);

// GET /api/v1/barberos/:id/horarios - Ver horarios de un barbero
router.get('/:id/horarios', barberController.getHorarios);

// PUT /api/v1/barberos/:id/horarios - Configurar horarios (solo administrador)
router.put('/:id/horarios', authenticate, authorize('administrador'), barberController.configurarHorarios);

module.exports = router;
