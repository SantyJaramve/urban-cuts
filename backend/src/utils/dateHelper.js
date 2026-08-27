// ============================================================
// ARCHIVO: dateHelper.js
// RESPONSABILIDAD: Funciones helper para calculos de tiempo
// en las citas. Calcula hora de fin basada en duracion del
// servicio y maneja conversion de fechas/horas.
// ============================================================

/**
 * Calcular hora de fin sumando la duracion del servicio
 * a la hora de inicio.
 * @param {string} horaInicio - Hora en formato "HH:MM"
 * @param {number} duracionMin - Duracion en minutos
 * @returns {string} Hora de fin en formato "HH:MM"
 */
const calcularHoraFin = (horaInicio, duracionMin) => {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + duracionMin;
  const finHoras   = Math.floor(totalMinutos / 60) % 24;
  const finMinutos = totalMinutos % 60;
  return `${String(finHoras).padStart(2, '0')}:${String(finMinutos).padStart(2, '0')}`;
};

/**
 * Verificar si dos rangos de tiempo se solapan.
 * @param {string} inicio1 - Hora inicio del primer rango
 * @param {string} fin1    - Hora fin del primer rango
 * @param {string} inicio2 - Hora inicio del segundo rango
 * @param {string} fin2    - Hora fin del segundo rango
 * @returns {boolean} true si se solapan
 */
const haySolapamiento = (inicio1, fin1, inicio2, fin2) => {
  return inicio1 < fin2 && inicio2 < fin1;
};

/**
 * Obtener el dia de la semana como numero (0-6) a partir
 * de una fecha en formato YYYY-MM-DD.
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD"
 * @returns {number} 0=Domingo, 1=Lunes ... 6=Sabado
 */
const obtenerDiaSemana = (fecha) => {
  const date = new Date(fecha + 'T00:00:00');
  return date.getDay();
};

/**
 * Verificar que una fecha no sea en el pasado.
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD"
 * @returns {boolean} true si la fecha es hoy o en el futuro
 */
const esFechaValida = (fecha) => {
  const hoy    = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaCita = new Date(fecha + 'T00:00:00');
  return fechaCita >= hoy;
};

module.exports = {
  calcularHoraFin,
  haySolapamiento,
  obtenerDiaSemana,
  esFechaValida,
};
