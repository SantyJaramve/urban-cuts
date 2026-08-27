// ============================================================
// ARCHIVO: authService.js
// RESPONSABILIDAD: Logica de negocio para autenticacion.
// Maneja registro de usuarios, login (verificacion de
// credenciales con bcrypt) y generacion de tokens JWT.
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { pool } = require('../config/database');
const { createError } = require('../middlewares/errorHandler');

/**
 * Registrar un nuevo usuario en el sistema.
 * @param {object} datos - { nombre, apellido, correo, telefono, contrasena, id_rol }
 * @returns {object} Usuario creado (sin contrasena)
 */
const registrarUsuario = async (datos) => {
  const { nombre, apellido, correo, telefono, contrasena, id_rol = 3 } = datos;

  // Verificar si el correo ya esta registrado
  const existeQuery  = 'SELECT id_usuario FROM usuarios WHERE correo = $1';
  const existeResult = await pool.query(existeQuery, [correo]);

  if (existeResult.rows.length > 0) {
    throw createError(409, 'El correo electronico ya esta registrado');
  }

  // Encriptar contrasena con bcrypt (12 rondas de salt)
  const contrasenaHash = await bcrypt.hash(contrasena, 12);

  // Insertar nuevo usuario
  const insertQuery = `
    INSERT INTO usuarios (id_rol, nombre, apellido, correo, telefono, contrasena)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id_usuario, nombre, apellido, correo, telefono, id_rol, activo, created_at
  `;
  const result = await pool.query(insertQuery, [
    id_rol, nombre, apellido, correo, telefono, contrasenaHash,
  ]);

  return result.rows[0];
};

/**
 * Autenticar usuario con correo y contrasena.
 * @param {string} correo
 * @param {string} contrasena
 * @returns {object} { usuario, token }
 */
const login = async (correo, contrasena) => {
  // Buscar usuario por correo
  const query  = `
    SELECT u.*, r.nombre_rol
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.correo = $1 AND u.activo = TRUE
  `;
  const result = await pool.query(query, [correo]);

  if (result.rows.length === 0) {
    throw createError(401, 'Credenciales incorrectas');
  }

  const usuario = result.rows[0];

  // Verificar contrasena con bcrypt
  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!contrasenaValida) {
    throw createError(401, 'Credenciales incorrectas');
  }

  // Generar token JWT con datos del usuario
  const tokenPayload = {
    id:         usuario.id_usuario,
    nombre:     usuario.nombre,
    correo:     usuario.correo,
    nombre_rol: usuario.nombre_rol,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  // Retornar datos del usuario sin contrasena
  const { contrasena: _, ...usuarioSinPassword } = usuario;
  return { usuario: usuarioSinPassword, token };
};

module.exports = { registrarUsuario, login };
