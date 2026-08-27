// ============================================================
// ARCHIVO: dashboardService.js
// RESPONSABILIDAD: Logica de negocio para el dashboard
// administrativo. Calcula metricas como citas del dia,
// ingresos estimados, servicios mas demandados y
// resumen semanal.
// ============================================================

const { pool } = require('../config/database');

/**
 * Obtener metricas del dashboard administrativo.
 * @returns {object} Metricas aggregadas
 */
const obtenerMetricas = async () => {
  const hoy = new Date().toISOString().split('T')[0];

  // 1. Total de citas del dia
  const citasHoyQuery = `
    SELECT COUNT(*) AS total_citas_hoy
    FROM citas WHERE fecha_cita = $1 AND estado != 'cancelada'
  `;
  const citasHoy = await pool.query(citasHoyQuery, [hoy]);

  // 2. Citas pendientes del dia
  const pendientesQuery = `
    SELECT COUNT(*) AS pendientes
    FROM citas WHERE fecha_cita = $1 AND estado = 'pendiente'
  `;
  const pendientes = await pool.query(pendientesQuery, [hoy]);

  // 3. Citas completadas del dia
  const completadasQuery = `
    SELECT COUNT(*) AS completadas
    FROM citas WHERE fecha_cita = $1 AND estado = 'completada'
  `;
  const completadas = await pool.query(completadasQuery, [hoy]);

  // 4. Ingresos estimados del dia (servicios completados)
  const ingresosQuery = `
    SELECT COALESCE(SUM(s.precio), 0) AS ingresos_estimados
    FROM citas c
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE c.fecha_cita = $1 AND c.estado = 'completada'
  `;
  const ingresos = await pool.query(ingresosQuery, [hoy]);

  // 5. Servicios mas demandados (top 5)
  const serviciosQuery = `
    SELECT s.nombre, COUNT(c.id_cita) AS total_reservas, s.precio
    FROM citas c
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE c.estado != 'cancelada'
    GROUP BY s.id_servicio, s.nombre, s.precio
    ORDER BY total_reservas DESC
    LIMIT 5
  `;
  const servicios = await pool.query(serviciosQuery);

  // 6. Total de barberos activos
  const barberosQuery = `
    SELECT COUNT(*) AS total_barberos
    FROM barberos WHERE activo = TRUE
  `;
  const barberos = await pool.query(barberosQuery);

  // 7. Total de servicios activos
  const totalServiciosQuery = `
    SELECT COUNT(*) AS total_servicios
    FROM servicios WHERE activo = TRUE
  `;
  const totalServicios = await pool.query(totalServiciosQuery);

  return {
    citas_hoy:         parseInt(citasHoy.rows[0].total_citas_hoy),
    citas_pendientes:  parseInt(pendientes.rows[0].pendientes),
    citas_completadas: parseInt(completadas.rows[0].completadas),
    ingresos_estimados: parseFloat(ingresos.rows[0].ingresos_estimados),
    servicios_demandados: servicios.rows,
    total_barberos:    parseInt(barberos.rows[0].total_barberos),
    total_servicios:   parseInt(totalServicios.rows[0].total_servicios),
  };
};

module.exports = { obtenerMetricas };
