// ============================================================
// ARCHIVO: responseHelper.js
// RESPONSABILIDAD: Funciones helper para construir respuestas
// JSON estandarizadas en toda la API. Garantiza consistencia
// en la estructura de respuestas exitosas y de error.
// ============================================================

// Respuesta exitosa
const successResponse = (res, data = null, message = 'Operacion exitosa', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

// Respuesta de error
const errorResponse = (res, message = 'Error en la operacion', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// Respuesta paginada
const paginatedResponse = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
