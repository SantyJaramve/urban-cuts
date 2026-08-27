// ============================================================
// ARCHIVO: serviceService.js
// RESPONSABILIDAD: Logica de negocio para el CRUD de
// servicios de la barberia. Maneja crear, consultar,
// actualizar y eliminar servicios del catalogo.
// ============================================================

const { pool } = require('../config/database');
const { createError } = require('../middlewares/errorHandler');

/**
 * Obtener todos los servicios (con opcion de filtrar solo activos).
 * @param {boolean} soloActivos - Si es true, retorna solo servicios activos
 * @returns {Array} Lista de servicios
 */
const obtenerTodos = async (soloActivos = true) => {
  let query = 'SELECT * FROM servicios';
  if (soloActivos) {
    query += ' WHERE activo = TRUE';
  }
  query += ' ORDER BY nombre ASC';

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Obtener un servicio por su ID.
 * @param {number} id
 * @returns {object} Servicio encontrado
 */
const obtenerPorId = async (id) => {
  const query  = 'SELECT * FROM servicios WHERE id_servicio = $1';
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    throw createError(404, 'Servicio no encontrado');
  }

  return result.rows[0];
};

/**
 * Crear un nuevo servicio en el catalogo.
 * @param {object} datos - { nombre, descripcion, precio, duracion_min, imagen_url }
 * @returns {object} Servicio creado
 */
const crear = async (datos) => {
  const { nombre, descripcion, precio, duracion_min, imagen_url } = datos;

  const query = `
    INSERT INTO servicios (nombre, descripcion, precio, duracion_min, imagen_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [
    nombre, descripcion, precio, duracion_min, imagen_url,
  ]);

  return result.rows[0];
};

/**
 * Actualizar un servicio existente.
 * @param {number} id
 * @param {object} datos - Campos a actualizar
 * @returns {object} Servicio actualizado
 */
const actualizar = async (id, datos) => {
  // Verificar que el servicio exista
  await obtenerPorId(id);

  const { nombre, descripcion, precio, duracion_min, imagen_url, activo } = datos;

  const query = `
    UPDATE servicios
    SET nombre        = COALESCE($2, nombre),
        descripcion   = COALESCE($3, descripcion),
        precio        = COALESCE($4, precio),
        duracion_min  = COALESCE($5, duracion_min),
        imagen_url    = COALESCE($6, imagen_url),
        activo        = COALESCE($7, activo)
    WHERE id_servicio = $1
    RETURNING *
  `;
  const result = await pool.query(query, [
    id, nombre, descripcion, precio, duracion_min, imagen_url, activo,
  ]);

  return result.rows[0];
};

/**
 * Eliminar (desactivar) un servicio.
 * No elimina fisicamente, solo marca activo = FALSE.
 * @param {number} id
 */
const eliminar = async (id) => {
  await obtenerPorId(id);

  const query  = 'UPDATE servicios SET activo = FALSE WHERE id_servicio = $1';
  await pool.query(query, [id]);
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
