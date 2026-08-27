// ============================================================
// ARCHIVO: serviceRoutes.js
// RESPONSABILIDAD: Definir las rutas HTTP del catalogo de
// servicios. CRUD completo con proteccion por roles.
// ============================================================

const router = require('express').Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateService } = require('../middlewares/validationMiddleware');

// GET /api/v1/servicios - Listar servicios (publico)
router.get('/', serviceController.getAll);

// GET /api/v1/servicios/:id - Obtener servicio por ID (publico)
router.get('/:id', serviceController.getById);

// POST /api/v1/servicios - Crear servicio (solo administrador)
router.post('/', authenticate, authorize('administrador'), validateService, serviceController.create);

// PUT /api/v1/servicios/:id - Actualizar servicio (solo administrador)
router.put('/:id', authenticate, authorize('administrador'), validateService, serviceController.update);

// DELETE /api/v1/servicios/:id - Eliminar servicio (solo administrador)
router.delete('/:id', authenticate, authorize('administrador'), serviceController.remove);

module.exports = router;
