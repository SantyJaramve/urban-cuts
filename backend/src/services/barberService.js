// ============================================================
// ARCHIVO: barberService.js
// RESPONSABILIDAD: Logica de negocio para el CRUD de
// barberos y sus horarios. Maneja crear, consultar,
// actualizar perfiles de barbero y configurar horarios
// de atencion.
// ============================================================

const { pool } = require('../config/database');
const { createError } = require('../middlewares/errorHandler');

/**
 * Obtener todos los barberos activos con datos del usuario.
 * @returns {Array} Lista de barberos con info del usuario
 */
const obtenerTodos = async () => {
  const query = `
    SELECT b.id_barbero, b.especialidad, b.descripcion, b.foto_url,
           b.anos_experiencia, b.activo, b.capacidad_diaria,
           u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono
    FROM barberos b
    JOIN usuarios u ON b.id_usuario = u.id_usuario
    WHERE b.activo = TRUE AND u.activo = TRUE
    ORDER BY u.nombre ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Obtener un barbero por su ID.
 * @param {number} id
 * @returns {object} Barbero encontrado
 */
const obtenerPorId = async (id) => {
  const query = `
    SELECT b.id_barbero, b.especialidad, b.descripcion, b.foto_url,
           b.anos_experiencia, b.activo, b.capacidad_diaria,
           u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono
    FROM barberos b
    JOIN usuarios u ON b.id_usuario = u.id_usuario
    WHERE b.id_barbero = $1
  `;
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    throw createError(404, 'Barbero no encontrado');
  }

  return result.rows[0];
};

/**
 * Crear barbero. Si viene id_usuario, lo asocia a un usuario existente.
 * Si viene nombre/correo/contrasena, crea el usuario automaticamente.
 * @param {object} datos
 * @returns {object} Barbero creado
 */
const crear = async (datos) => {
  const { id_usuario, nombre, apellido, correo, contrasena, telefono,
          especialidad, descripcion, anos_experiencia, foto_url, capacidad_diaria } = datos;

  let usuarioId = id_usuario;

  // Si no viene id_usuario pero si datos del usuario, crear el usuario primero
  if (!usuarioId && nombre && correo && contrasena) {
    const bcrypt = require('bcryptjs');

    // Verificar que el correo no este registrado
    const existeCorreo = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = $1', [correo]);
    if (existeCorreo.rows.length > 0) {
      throw createError(409, 'El correo electronico ya esta registrado');
    }

    // Obtener id del rol barbero
    const rolResult = await pool.query("SELECT id_rol FROM roles WHERE nombre_rol = 'barbero'");
    const idRolBarbero = rolResult.rows[0].id_rol;

    // Hash de contrasena
    const hash = await bcrypt.hash(contrasena, 12);

    // Crear usuario
    const userQuery = `
      INSERT INTO usuarios (id_rol, nombre, apellido, correo, telefono, contrasena)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_usuario
    `;
    const userResult = await pool.query(userQuery, [idRolBarbero, nombre, apellido, correo, telefono, hash]);
    usuarioId = userResult.rows[0].id_usuario;
  }

  if (!usuarioId) {
    throw createError(400, 'Debe proporcionar id_usuario o los datos del usuario (nombre, correo, contrasena)');
  }

  // Verificar que el usuario exista y no tenga ya perfil de barbero
  const existeQuery  = 'SELECT id_barbero FROM barberos WHERE id_usuario = $1';
  const existeResult = await pool.query(existeQuery, [usuarioId]);

  if (existeResult.rows.length > 0) {
    throw createError(409, 'Este usuario ya tiene un perfil de barbero asociado');
  }

  // Verificar que el usuario exista
  const usuarioQuery  = 'SELECT id_usuario FROM usuarios WHERE id_usuario = $1';
  const usuarioResult = await pool.query(usuarioQuery, [usuarioId]);

  if (usuarioResult.rows.length === 0) {
    throw createError(404, 'Usuario no encontrado');
  }

  // Actualizar el rol del usuario a barbero (si no ya lo es)
  await pool.query(
    'UPDATE usuarios SET id_rol = (SELECT id_rol FROM roles WHERE nombre_rol = $2) WHERE id_usuario = $1',
    [usuarioId, 'barbero']
  );

  // Insertar perfil de barbero
  const query = `
    INSERT INTO barberos (id_usuario, especialidad, descripcion, anos_experiencia, foto_url, capacidad_diaria)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await pool.query(query, [
    usuarioId, especialidad, descripcion, anos_experiencia, foto_url, capacidad_diaria || 10,
  ]);

  const nuevoBarbero = result.rows[0];

  // Asignar horarios por defecto (Lun-Sab) si no trae horarios
  for (let dia = 1; dia <= 6; dia++) {
    const horaFin = dia === 6 ? '16:00' : '18:00';
    await pool.query(
      'INSERT INTO horarios (id_barbero, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)',
      [nuevoBarbero.id_barbero, dia, '09:00', horaFin]
    );
  }

  return nuevoBarbero;
};

/**
 * Actualizar perfil de barbero.
 * @param {number} id
 * @param {object} datos - Campos a actualizar
 * @returns {object} Barbero actualizado
 */
const actualizar = async (id, datos) => {
  await obtenerPorId(id);

  const { especialidad, descripcion, anos_experiencia, foto_url, activo, capacidad_diaria } = datos;

  const query = `
    UPDATE barberos
    SET especialidad    = COALESCE($2, especialidad),
        descripcion     = COALESCE($3, descripcion),
        anos_experiencia = COALESCE($4, anos_experiencia),
        foto_url        = COALESCE($5, foto_url),
        activo          = COALESCE($6, activo),
        capacidad_diaria = COALESCE($7, capacidad_diaria)
    WHERE id_barbero = $1
    RETURNING *
  `;
  const result = await pool.query(query, [
    id, especialidad, descripcion, anos_experiencia, foto_url, activo, capacidad_diaria,
  ]);

  return result.rows[0];
};

/**
 * Eliminar (desactivar) un barbero.
 * @param {number} id
 */
const eliminar = async (id) => {
  await obtenerPorId(id);

  await pool.query('UPDATE barberos SET activo = FALSE WHERE id_barbero = $1', [id]);
};

// ============================================================
// GESTION DE HORARIOS DEL BARBERO
// ============================================================

/**
 * Obtener horarios de un barbero.
 * @param {number} idBarbero
 * @returns {Array} Lista de horarios
 */
const obtenerHorarios = async (idBarbero) => {
  const query = `
    SELECT * FROM horarios
    WHERE id_barbero = $1
    ORDER BY dia_semana ASC, hora_inicio ASC
  `;
  const result = await pool.query(query, [idBarbero]);
  return result.rows;
};

/**
 * Configurar horarios de atencion de un barbero.
 * Elimina los horarios existentes y crea los nuevos.
 * @param {number} idBarbero
 * @param {Array} horarios - [{ dia_semana, hora_inicio, hora_fin }]
 * @returns {Array} Horarios creados
 */
const configurarHorarios = async (idBarbero, horarios) => {
  await obtenerPorId(idBarbero);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Eliminar horarios anteriores del barbero
    await client.query('DELETE FROM horarios WHERE id_barbero = $1', [idBarbero]);

    // Insertar nuevos horarios
    const horariosCreados = [];
    for (const horario of horarios) {
      const query = `
        INSERT INTO horarios (id_barbero, dia_semana, hora_inicio, hora_fin)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await client.query(query, [
        idBarbero, horario.dia_semana, horario.hora_inicio, horario.hora_fin,
      ]);
      horariosCreados.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return horariosCreados;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Obtener horas disponibles de un barbero para una fecha y servicio.
 * Filtra horarios del dia, citas existentes y capacidad diaria.
 * @param {number} idBarbero
 * @param {string} fecha - YYYY-MM-DD
 * @param {number} servicioId
 * @returns {object} { horas: [...], capacidad_diaria, ocupadas, capacidad }
 */
const obtenerDisponibilidad = async (idBarbero, fecha, servicioId) => {
  const { obtenerDiaSemana, calcularHoraFin } = require('../utils/dateHelper');

  const diaSemana = obtenerDiaSemana(fecha);

  // 1. Obtener capacidad diaria del barbero
  const barberoRes = await pool.query(
    'SELECT capacidad_diaria FROM barberos WHERE id_barbero = $1 AND activo = TRUE',
    [idBarbero]
  );
  if (barberoRes.rows.length === 0) {
    throw createError(404, 'Barbero no encontrado');
  }
  const capacidad = barberoRes.rows[0].capacidad_diaria || 10;

  // 2. Obtener duracion del servicio
  const servicioRes = await pool.query(
    'SELECT duracion_min FROM servicios WHERE id_servicio = $1 AND activo = TRUE',
    [servicioId]
  );
  if (servicioRes.rows.length === 0) {
    throw createError(404, 'Servicio no encontrado');
  }
  const duracion = servicioRes.rows[0].duracion_min;

  // 3. Obtener horario del barbero para ese dia
  const horarioRes = await pool.query(
    'SELECT hora_inicio, hora_fin FROM horarios WHERE id_barbero = $1 AND dia_semana = $2 AND activo = TRUE',
    [idBarbero, diaSemana]
  );
  if (horarioRes.rows.length === 0) {
    return { horas: [], capacidad, ocupadas: 0 };
  }
  const { hora_inicio, hora_fin } = horarioRes.rows[0];

  // 4. Generar todos los slots posibles segun el horario y duracion del servicio
  const [iniH, iniM] = String(hora_inicio).split(':').map(Number);
  const [finH, finM] = String(hora_fin).split(':').map(Number);
  const horaInicioMin = iniH * 60 + iniM;
  const horaFinMin = finH * 60 + finM;

  const todosLosSlots = [];
  let actual = horaInicioMin;
  while (actual + duracion <= horaFinMin) {
    const h = String(Math.floor(actual / 60)).padStart(2, '0');
    const m = String(actual % 60).padStart(2, '0');
    todosLosSlots.push(`${h}:${m}`);
    actual += 30;
  }

  // 5. Obtener citas existentes del barbero en esa fecha (no canceladas)
  const citasRes = await pool.query(
    `SELECT hora_inicio, hora_fin, s.duracion_min
     FROM citas c JOIN servicios s ON c.id_servicio = s.id_servicio
     WHERE c.id_barbero = $1 AND c.fecha_cita = $2 AND c.estado != 'cancelada'`,
    [idBarbero, fecha]
  );
  const citasExistentes = citasRes.rows;

  // 6. Filtrar slots que se solapen con citas existentes
  const horasDisponibles = todosLosSlots.filter(slot => {
    const slotInicio = slot.split(':').map(Number);
    const slotInicioMin = slotInicio[0] * 60 + slotInicio[1];
    const slotFinMin = slotInicioMin + duracion;

    const solapada = citasExistentes.some(cita => {
      const [cH, cM] = String(cita.hora_inicio).split(':').map(Number);
      const citaInicioMin = cH * 60 + cM;
      const citaFinMin = citaInicioMin + (cita.duracion_min || 30);
      return slotInicioMin < citaFinMin && slotFinMin > citaInicioMin;
    });

    return !solapada;
  });

  // 7. Verificar capacidad diaria
  const totalCitasActivas = citasExistentes.length;
  const capacidadAlcanzada = totalCitasActivas >= capacidad;

  return {
    horas: capacidadAlcanzada ? [] : horasDisponibles,
    capacidad,
    ocupadas: totalCitasActivas,
  };
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerHorarios,
  configurarHorarios,
  obtenerDisponibilidad,
};
