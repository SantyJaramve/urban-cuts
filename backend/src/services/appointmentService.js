// ============================================================
// ARCHIVO: appointmentService.js
// RESPONSABILIDAD: Logica de negocio para la gestion de
// citas. Maneja reserva, consulta, cambio de estado y
// cancelacion. Incluye validaciones de disponibilidad
// y prevencion de empalmes de horario.
// ============================================================

const { pool } = require('../config/database');
const { createError } = require('../middlewares/errorHandler');
const { generateBookingCode } = require('../utils/codeGenerator');
const {
  calcularHoraFin,
  haySolapamiento,
  obtenerDiaSemana,
  esFechaValida,
} = require('../utils/dateHelper');

/**
 * Reservar una nueva cita.
 * Valida disponibilidad del barbero y evita empalmes.
 * @param {object} datos - { id_cliente, id_barbero, id_servicio, fecha_cita, hora_inicio, notas }
 * @returns {object} Cita creada con codigo de reserva
 */
const reservar = async (datos) => {
  const { id_cliente, id_barbero, id_servicio, fecha_cita, hora_inicio, notas } = datos;

  // 1. Validar que la fecha no sea en el pasado
  if (!esFechaValida(fecha_cita)) {
    throw createError(400, 'No se pueden agendar citas en fechas pasadas');
  }

  // 2. Obtener duracion del servicio para calcular hora_fin
  const servicioQuery  = 'SELECT duracion_min FROM servicios WHERE id_servicio = $1 AND activo = TRUE';
  const servicioResult = await pool.query(servicioQuery, [id_servicio]);

  if (servicioResult.rows.length === 0) {
    throw createError(404, 'Servicio no encontrado o no disponible');
  }

  const duracionMin    = servicioResult.rows[0].duracion_min;
  const hora_fin       = calcularHoraFin(hora_inicio, duracionMin);

  // 3. Verificar que el barbero este activo
  const barberoQuery  = 'SELECT id_barbero FROM barberos WHERE id_barbero = $1 AND activo = TRUE';
  const barberoResult = await pool.query(barberoQuery, [id_barbero]);

  if (barberoResult.rows.length === 0) {
    throw createError(404, 'Barbero no encontrado o no disponible');
  }

  // 4. Verificar que el barbero tenga horario ese dia
  const diaSemana    = obtenerDiaSemana(fecha_cita);
  const horarioQuery = `
    SELECT * FROM horarios
    WHERE id_barbero = $1 AND dia_semana = $2 AND activo = TRUE
    AND hora_inicio <= $3 AND hora_fin >= $4
  `;
  const horarioResult = await pool.query(horarioQuery, [id_barbero, diaSemana, hora_inicio, hora_fin]);

  if (horarioResult.rows.length === 0) {
    throw createError(400, 'El barbero no tiene horario disponible en esa fecha y hora');
  }

  // 4.1 Verificar capacidad diaria del barbero
  const capacidadQuery = 'SELECT capacidad_diaria FROM barberos WHERE id_barbero = $1';
  const capacidadResult = await pool.query(capacidadQuery, [id_barbero]);
  const capacidadDiaria = capacidadResult.rows[0]?.capacidad_diaria || 10;

  const citasDelDiaQuery = `
    SELECT COUNT(*) as total FROM citas
    WHERE id_barbero = $1 AND fecha_cita = $2 AND estado != 'cancelada'
  `;
  const citasDelDia = await pool.query(citasDelDiaQuery, [id_barbero, fecha_cita]);
  const totalCitas = parseInt(citasDelDia.rows[0].total, 10);

  if (totalCitas >= capacidadDiaria) {
    throw createError(400, 'El barbero ha alcanzado su capacidad maxima de citas para este dia');
  }

  // 5. Verificar que no haya empalme con otras citas del mismo barbero
  const empalmeQuery = `
    SELECT id_cita FROM citas
    WHERE id_barbero = $1
      AND fecha_cita = $2
      AND estado NOT IN ('cancelada')
      AND hora_inicio < $4
      AND hora_fin > $3
  `;
  const empalmeResult = await pool.query(empalmeQuery, [id_barbero, fecha_cita, hora_inicio, hora_fin]);

  if (empalmeResult.rows.length > 0) {
    throw createError(409, 'El barbero ya tiene una cita en ese horario. Seleccione otra hora.');
  }

  // 6. Generar codigo unico de reserva
  let codigo_reserva;
  let codigoExiste = true;

  while (codigoExiste) {
    codigo_reserva = generateBookingCode();
    const checkQuery  = 'SELECT id_cita FROM citas WHERE codigo_reserva = $1';
    const checkResult = await pool.query(checkQuery, [codigo_reserva]);
    codigoExiste = checkResult.rows.length > 0;
  }

  // 7. Insertar la cita
  const insertQuery = `
    INSERT INTO citas (codigo_reserva, id_cliente, id_barbero, id_servicio, fecha_cita, hora_inicio, hora_fin, notas)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await pool.query(insertQuery, [
    codigo_reserva, id_cliente, id_barbero, id_servicio, fecha_cita, hora_inicio, hora_fin, notas,
  ]);

  return result.rows[0];
};

/**
 * Obtener citas de un barbero en una fecha especifica.
 * @param {number} idBarbero
 * @param {string} fecha - Formato YYYY-MM-DD
 * @returns {Array} Lista de citas con info del cliente y servicio
 */
const obtenerCitasBarbero = async (idBarbero, fecha) => {
  const query = `
    SELECT c.*, 
           u_cli.nombre AS cliente_nombre, u_cli.apellido AS cliente_apellido, u_cli.telefono AS cliente_telefono,
           s.nombre AS servicio_nombre, s.precio, s.duracion_min
    FROM citas c
    JOIN usuarios u_cli ON c.id_cliente = u_cli.id_usuario
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE c.id_barbero = $1
      AND c.fecha_cita = $2
    ORDER BY c.hora_inicio ASC
  `;
  const result = await pool.query(query, [idBarbero, fecha]);
  return result.rows;
};

/**
 * Obtener todas las proximas citas de un barbero (hoy en adelante).
 * @param {number} idBarbero
 * @returns {Array} Lista de citas futuras con info del cliente y servicio
 */
const obtenerProximasCitasBarbero = async (idBarbero) => {
  const query = `
    SELECT c.*, 
           u_cli.nombre AS cliente_nombre, u_cli.apellido AS cliente_apellido, u_cli.telefono AS cliente_telefono,
           s.nombre AS servicio_nombre, s.precio, s.duracion_min
    FROM citas c
    JOIN usuarios u_cli ON c.id_cliente = u_cli.id_usuario
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE c.id_barbero = $1
      AND c.fecha_cita >= CURRENT_DATE
      AND c.estado != 'cancelada'
    ORDER BY c.fecha_cita ASC, c.hora_inicio ASC
  `;
  const result = await pool.query(query, [idBarbero]);
  return result.rows;
};

/**
 * Obtener historial de citas completadas o canceladas de un barbero.
 * @param {number} idBarbero
 * @returns {Array} Lista de citas pasadas con info del cliente y servicio
 */
const obtenerHistorialBarbero = async (idBarbero) => {
  const query = `
    SELECT c.*,
           u_cli.nombre AS cliente_nombre, u_cli.apellido AS cliente_apellido, u_cli.telefono AS cliente_telefono,
           s.nombre AS servicio_nombre, s.precio, s.duracion_min
    FROM citas c
    JOIN usuarios u_cli ON c.id_cliente = u_cli.id_usuario
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE c.id_barbero = $1
      AND (c.fecha_cita < CURRENT_DATE OR c.estado IN ('completada', 'cancelada'))
    ORDER BY c.fecha_cita DESC, c.hora_inicio DESC
  `;
  const result = await pool.query(query, [idBarbero]);
  return result.rows;
};

/**
 * Obtener todas las citas del sistema (admin).
 * Incluye info del barbero, cliente y servicio.
 * @returns {Array} Lista de todas las citas
 */
const obtenerTodasCitas = async () => {
  const query = `
    SELECT c.*,
           u_cli.nombre AS cliente_nombre, u_cli.apellido AS cliente_apellido, u_cli.telefono AS cliente_telefono,
           u_bar.nombre AS barbero_nombre, u_bar.apellido AS barbero_apellido,
           s.nombre AS servicio_nombre, s.precio, s.duracion_min
    FROM citas c
    JOIN usuarios u_cli ON c.id_cliente = u_cli.id_usuario
    JOIN barberos b ON c.id_barbero = b.id_barbero
    JOIN usuarios u_bar ON b.id_usuario = u_bar.id_usuario
    JOIN servicios s ON c.id_servicio = s.id_servicio
    ORDER BY c.fecha_cita DESC, c.hora_inicio DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Obtener citas de un cliente.
 * @param {number} idCliente
 * @returns {Array} Lista de citas del cliente
 */
const obtenerCitasCliente = async (idCliente) => {
  const query = `
    SELECT c.*,
           u_bar.nombre AS barbero_nombre, u_bar.apellido AS barbero_apellido,
           s.nombre AS servicio_nombre, s.precio, s.duracion_min
    FROM citas c
    JOIN barberos b ON c.id_barbero = b.id_barbero
    JOIN usuarios u_bar ON b.id_usuario = u_bar.id_usuario
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE c.id_cliente = $1
    ORDER BY c.fecha_cita DESC, c.hora_inicio ASC
  `;
  const result = await pool.query(query, [idCliente]);
  return result.rows;
};

/**
 * Buscar una cita por su codigo de reserva.
 * @param {string} codigo
 * @returns {object} Cita encontrada
 */
const obtenerPorCodigo = async (codigo) => {
  const query = `
    SELECT c.*,
           u_cli.nombre AS cliente_nombre, u_cli.apellido AS cliente_apellido,
           u_bar.nombre AS barbero_nombre, u_bar.apellido AS barbero_apellido,
           s.nombre AS servicio_nombre, s.precio, s.duracion_min
    FROM citas c
    JOIN usuarios u_cli ON c.id_cliente = u_cli.id_usuario
    JOIN barberos b ON c.id_barbero = b.id_barbero
    JOIN usuarios u_bar ON b.id_usuario = u_bar.id_usuario
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE c.codigo_reserva = $1
  `;
  const result = await pool.query(query, [codigo]);

  if (result.rows.length === 0) {
    throw createError(404, 'Cita no encontrada con ese codigo de reserva');
  }

  return result.rows[0];
};

/**
 * Cambiar el estado de una cita.
 * @param {number} idCita
 * @param {string} nuevoEstado - pendiente|confirmada|completada|cancelada
 * @returns {object} Cita actualizada
 */
const cambiarEstado = async (idCita, nuevoEstado) => {
  const query  = 'UPDATE citas SET estado = $2 WHERE id_cita = $1 RETURNING *';
  const result = await pool.query(query, [idCita, nuevoEstado]);

  if (result.rows.length === 0) {
    throw createError(404, 'Cita no encontrada');
  }

  return result.rows[0];
};

/**
 * Cancelar una cita (solo si esta pendiente o confirmada).
 * @param {number} idCita
 * @param {number} idCliente - Para verificar ownership
 * @returns {object} Cita cancelada
 */
const cancelarCita = async (idCita, idCliente) => {
  // Verificar que la cita pertenece al cliente
  const citaQuery  = 'SELECT * FROM citas WHERE id_cita = $1';
  const citaResult = await pool.query(citaQuery, [idCita]);

  if (citaResult.rows.length === 0) {
    throw createError(404, 'Cita no encontrada');
  }

  const cita = citaResult.rows[0];

  if (cita.id_cliente !== idCliente) {
    throw createError(403, 'No tiene permiso para cancelar esta cita');
  }

  if (!['pendiente', 'confirmada'].includes(cita.estado)) {
    throw createError(400, 'Solo se pueden cancelar citas pendientes o confirmadas');
  }

  return cambiarEstado(idCita, 'cancelada');
};

module.exports = {
  reservar,
  obtenerCitasBarbero,
  obtenerProximasCitasBarbero,
  obtenerHistorialBarbero,
  obtenerTodasCitas,
  obtenerCitasCliente,
  obtenerPorCodigo,
  cambiarEstado,
  cancelarCita,
};
