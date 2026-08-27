// ============================================================
// ARCHIVO: MyBookings.jsx
// RESPONSABILIDAD: Pagina que muestra todas las citas del
// cliente autenticado. Permite buscar por codigo de reserva
// y cancelar citas pendientes/confirmadas.
// Estilo visual: plantilla BarberCrop (dorado + carbon).
// ============================================================

import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { FaCalendarAlt, FaSearch, FaTimes, FaCut } from 'react-icons/fa';

const MyBookings = () => {
  const [citas, setCitas]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [busqueda, setBusqueda]       = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [showModal, setShowModal]     = useState(false);

  // Cargar citas del cliente
  const cargarCitas = async () => {
    try {
      const response = await api.get('/citas/cliente');
      setCitas(response.data.data);
    } catch (error) {
      toast.error('Error al cargar tus citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  // Buscar cita por codigo
  const buscarPorCodigo = async () => {
    if (!busqueda.trim()) {
      cargarCitas();
      return;
    }

    try {
      const response = await api.get(`/citas/codigo/${busqueda.trim()}`);
      setCitas([response.data.data]);
    } catch (error) {
      toast.error('Cita no encontrada con ese codigo');
    }
  };

  // Cancelar cita
  const cancelarCita = async () => {
    if (!citaSeleccionada) return;

    try {
      await api.patch(`/citas/${citaSeleccionada.id_cita}/cancelar`);
      toast.success('Cita cancelada exitosamente');
      setShowModal(false);
      setCitaSeleccionada(null);
      cargarCitas(); // Recargar lista
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar la cita');
    }
  };

  // Colores de estado
  const estadoColor = (estado) => {
    const colores = {
      pendiente:  'bg-gold/10 text-gold border-gold/20',
      confirmada: 'bg-green-500/10 text-green-400 border-green-500/20',
      completada: 'bg-green-500/10 text-green-400 border-green-500/20',
      cancelada:  'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colores[estado] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="skeleton w-48 h-8 "></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-gold text-sm font-medium mb-1">Mis Citas</p>
        <h1 className="font-display text-3xl font-bold text-cream">
          Mis <span className="text-gold">Citas</span>
        </h1>
      </div>

      {/* Barra de busqueda por codigo */}
      <div className="bg-barber-surface border border-barber-border p-4 flex gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarPorCodigo()}
          placeholder="Buscar por codigo de reserva (BAR-XXXXX)"
          className="flex-1 px-4 py-2.5 bg-barber-carbon
                   border border-barber-muted
                   text-white text-sm placeholder-cream/30
                   focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
        <button onClick={buscarPorCodigo}
          className="px-6 py-2.5 bg-gold text-barber-dark text-sm font-semibold
                   hover:bg-gold-hover transition-colors">
          Buscar
        </button>
        {busqueda && (
          <button onClick={() => { setBusqueda(''); cargarCitas(); }}
            className="px-4 py-2.5 border border-barber-border
                     text-cream/40 hover:text-white transition-colors">
            Limpiar
          </button>
        )}
      </div>

      {/* Lista de citas */}
      {citas.length === 0 ? (
        <div className="text-center py-16 bg-barber-surface border border-barber-border">
          <FaCalendarAlt className="text-cream/30 text-5xl mx-auto mb-4" />
          <p className="text-cream/30">
            No tienes citas reservadas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {citas.map((cita) => (
            <div
              key={cita.id_cita}
              className="bg-barber-surface border border-barber-border p-5
                       hover:border-gold/30 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Info de la cita */}
                <div className="space-y-1">
                  <p className="text-gold font-medium">
                    {cita.fecha_cita} / {cita.hora_inicio} - {cita.hora_fin}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {cita.servicio_nombre}
                  </h3>
                  <p className="text-cream/40 text-sm">
                    Barbero: {cita.barbero_nombre} {cita.barbero_apellido}
                  </p>
                  <span className={`inline-block px-3 py-1 -full text-xs font-medium border ${estadoColor(cita.estado)}`}>
                    {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                  </span>
                  <p className="text-gold/60 text-xs font-mono">
                    Codigo: {cita.codigo_reserva}
                  </p>
                </div>

                {/* Precio y acciones */}
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gold">
                    ${cita.precio?.toLocaleString('es-CO')}
                  </span>

                  {['pendiente', 'confirmada'].includes(cita.estado) && (
                    <button
                      onClick={() => { setCitaSeleccionada(cita); setShowModal(true); }}
                      className="text-red-400 hover:bg-red-500/10 px-3 py-1 text-xs font-medium
                               transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmacion para cancelar */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title="Cancelar Cita">
        <div className="space-y-4">
          <p className="text-cream/60">
            ¿Estas seguro que deseas cancelar esta cita?
          </p>
          {citaSeleccionada && (
            <div className="bg-barber-carbon border border-barber-muted p-3 text-sm">
              <p className="text-white">
                {citaSeleccionada.servicio_nombre} - {citaSeleccionada.fecha_cita}
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gold text-gold text-sm
                       hover:bg-gold-muted transition-colors">
              No, mantener
            </button>
            <button onClick={cancelarCita}
              className="px-6 py-2 bg-red-500 text-white text-sm font-semibold
                       hover:bg-red-600 transition-colors">
              Si, cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
