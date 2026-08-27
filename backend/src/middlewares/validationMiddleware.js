// ============================================================
// ARCHIVO: validationMiddleware.js
// RESPONSABILIDAD: Middleware de validaciones de entrada
// usando express-validator. Valida campos en los bodies
// de las peticiones antes de llegar al controller.
// ============================================================

const { body, param, validationResult } = require('express-validator');

// Middleware que verifica si hubo errores de validacion
// y retorna respuesta estandarizada si los hay
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validacion',
      errors: errors.array().map(e => ({
        campo: e.path,
        mensaje: e.msg,
      })),
    });
  }
  next();
};

// Validaciones para registro de usuario
const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Formato de correo invalido'),
  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Formato de telefono invalido'),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es obligatoria')
    .isLength({ min: 6 }).withMessage('La contrasena debe tener minimo 6 caracteres'),
  handleValidation,
];

// Validaciones para login
const validateLogin = [
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Formato de correo invalido'),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es obligatoria'),
  handleValidation,
];

// Validaciones para crear/actualizar servicio
const validateService = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del servicio es obligatorio')
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un numero positivo'),
  body('duracion_min')
    .notEmpty().withMessage('La duracion es obligatoria')
    .isInt({ min: 1 }).withMessage('La duracion debe ser un entero positivo en minutos'),
  body('descripcion')
    .optional()
    .trim(),
  handleValidation,
];

// Validaciones para crear/actualizar barbero
const validateBarber = [
  body('id_usuario')
    .optional()
    .isInt().withMessage('Debe ser un entero valido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('correo')
    .optional()
    .isEmail().withMessage('Debe ser un correo electronico valido'),
  body('contrasena')
    .optional()
    .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),
  body('telefono')
    .optional()
    .trim(),
  body('especialidad')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La especialidad no puede exceder 200 caracteres'),
  body('descripcion')
    .optional()
    .trim(),
  body('anos_experiencia')
    .optional()
    .isInt({ min: 0 }).withMessage('Los anos de experiencia deben ser positivos'),
  handleValidation,
];

// Validaciones para crear cita
const validateAppointment = [
  body('id_barbero')
    .notEmpty().withMessage('Debe seleccionar un barbero')
    .isInt().withMessage('Debe ser un entero valido'),
  body('id_servicio')
    .notEmpty().withMessage('Debe seleccionar un servicio')
    .isInt().withMessage('Debe ser un entero valido'),
  body('fecha_cita')
    .notEmpty().withMessage('La fecha de la cita es obligatoria')
    .isISO8601().withMessage('Formato de fecha invalido (YYYY-MM-DD)'),
  body('hora_inicio')
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de hora invalido (HH:MM)'),
  body('notas')
    .optional()
    .trim(),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateRegister,
  validateLogin,
  validateService,
  validateBarber,
  validateAppointment,
};
