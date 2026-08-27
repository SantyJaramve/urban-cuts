// ============================================================
// ARCHIVO: api.js
// RESPONSABILIDAD: Configurar la instancia de Axios para
// comunicacion con el backend API. Centraliza la URL base,
// headers y manejo de errores globales.
// ============================================================

import axios from 'axios';

// Crear instancia de Axios con URL base del backend
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuestas: manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró, limpiar sesion
    if (error.response?.status === 401) {
      localStorage.removeItem('barber-token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
