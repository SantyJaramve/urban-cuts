// ============================================================
// ARCHIVO: appointmentRoutes.js
// RESPONSABILIDAD: Definir las rutas HTTP de gestion de
// citas: reserva, consulta, cambio de estado, cancelacion.
// ============================================================

const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateAppointment } = require('../middlewares/validationMiddleware');

// POST /api/v1/citas - Reservar cita (cualquier usuario autenticado)
router.post('/', authenticate, validateAppointment, appointmentController.reservar);

// GET /api/v1/citas/cliente - Ver mis citas (cliente)
router.get('/cliente', authenticate, appointmentController.getCitasCliente);

// GET /api/v1/citas/todas - Todas las citas (solo admin)
router.get('/todas', authenticate, authorize('administrador'), appointmentController.getTodasCitas);

// GET /api/v1/citas/codigo/:codigo - Buscar por codigo (publico con token)
router.get('/codigo/:codigo', authenticate, appointmentController.getByCodigo);

// GET /api/v1/citas/barbero - Proximas citas del barbero (barbero/admin)
router.get('/barbero', authenticate, authorize('barbero', 'administrador'), appointmentController.getProximasCitasBarbero);

// GET /api/v1/citas/barbero/historial - Historial de citas del barbero
router.get('/barbero/historial', authenticate, authorize('barbero', 'administrador'), appointmentController.getHistorialBarbero);

// GET /api/v1/citas/barbero/:fecha - Agenda del barbero en fecha especifica (barbero/admin)
router.get('/barbero/:fecha', authenticate, authorize('barbero', 'administrador'), appointmentController.getCitasBarbero);

// PATCH /api/v1/citas/:id/estado - Cambiar estado (barbero/admin)
router.patch('/:id/estado', authenticate, authorize('barbero', 'administrador'), appointmentController.cambiarEstado);

// PATCH /api/v1/citas/:id/cancelar - Cancelar cita (cliente)
router.patch('/:id/cancelar', authenticate, appointmentController.cancelarCita);

module.exports = router;
