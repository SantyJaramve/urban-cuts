// ============================================================
// ARCHIVO: authRoutes.js
// RESPONSABILIDAD: Definir las rutas HTTP relacionadas con
// autenticacion: registro, login y perfil.
// ============================================================

const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

// POST /api/v1/auth/register - Registrar nuevo usuario
router.post('/register', validateRegister, authController.register);

// POST /api/v1/auth/login - Iniciar sesion
router.post('/login', validateLogin, authController.login);

// GET /api/v1/auth/profile - Obtener perfil (requiere token)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
