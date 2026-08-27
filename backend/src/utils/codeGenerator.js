// ============================================================
// ARCHIVO: codeGenerator.js
// RESPONSABILIDAD: Generar codigos unicos de reserva para
// las citas. Formato: BAR-XXXXX (5 caracteres alfanumericos).
// ============================================================

const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BAR-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = { generateBookingCode };
