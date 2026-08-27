// ============================================================
// ARCHIVO: BarberDashboard.jsx
// RESPONSABILIDAD: Panel del barbero. Muestra su agenda
// con todas las proximas citas (hoy en adelante) agrupadas
// por fecha. Tambien permite ver una vista diaria filtrando
// por fecha especifica con el selector.
// ============================================================

import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaUser, FaCheck, FaTimes, FaCut, FaList, FaHistory } from 'react-icons/fa';

const BarberDashboard = () => {
  const { user } = useAuth();

  const [citas, setCitas]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [capacidad, setCapacidad]         = useState({ total: 10, ocupadas: 0 });
  const [fechaSeleccionada, setFecha]     = useState(
    new Date().toISOString().split('T')[0]
  );
  const [modo, setModo] = useState('proximas'); // 'proximas' | 'diaria' | 'historial'

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  // Cargar proximas citas del barbero (hoy en adelante)
  const cargarProximasCitas = async () => {
    try {
      const response = await api.get('/citas/barbero');
      setCitas(response.data.data);
    } catch (error) {
      console.error('Error al cargar proximas citas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas de una fecha especifica
  const cargarCitasFecha = async () => {
    try {
      const response = await api.get(`/citas/barbero/${fechaSeleccionada}`);
      setCitas(response.data.data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCapacidad = async () => {
    try {
      const response = await api.get('/auth/profile');
      const userId = response.data.data.id_usuario;
      const barberosRes = await api.get('/barberos');
      const miBarbero = barberosRes.data.data.find(b => b.id_usuario === userId);
      if (miBarbero) {
        setCapacidad({ total: miBarbero.capacidad_diaria || 10, ocupadas: 0 });
      }
    } catch (error) {
      console.error('Error al cargar capacidad:', error);
    }
  };

  // Cargar historial de citas del barbero (completadas/canceladas)
  const cargarHistorial = async () => {
    try {
      const response = await api.get('/citas/barbero/historial');
      setCitas(response.data.data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (modo === 'proximas') {
      cargarProximasCitas();
    } else if (modo === 'historial') {
      cargarHistorial();
    } else {
      cargarCitasFecha();
    }
  }, [fechaSeleccionada, modo]);

  useEffect(() => {
    cargarCapacidad();
  }, []);

  // Cambiar estado de una cita
  const cambiarEstado = async (idCita, nuevoEstado) => {
    try {
      await api.patch(`/citas/${idCita}/estado`, { estado: nuevoEstado });
      toast.success(`Cita marcada como ${nuevoEstado}`);
      if (modo === 'proximas') {
        cargarProximasCitas();
      } else if (modo === 'historial') {
        cargarHistorial();
      } else {
        cargarCitasFecha();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  // Navegar entre fechas (solo modo diaria)
  const navegarFecha = (dias) => {
    const fecha = new Date(fechaSeleccionada + 'T00:00:00');
    fecha.setDate(fecha.getDate() + dias);
    setFecha(fecha.toISOString().split('T')[0]);
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

  // Estadisticas
  const stats = {
    total:       citas.filter(c => c.estado !== 'cancelada').length,
    pendientes:  citas.filter(c => c.estado === 'pendiente').length,
    completadas: citas.filter(c => c.estado === 'completada').length,
    canceladas:  citas.filter(c => c.estado === 'cancelada').length,
  };

  const capacidadRestante = capacidad.total - stats.total;

  // Agrupar citas por fecha (para modo proximas)
  const citasPorFecha = citas.reduce((acc, cita) => {
    const fecha = cita.fecha_cita.split('T')[0];
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(cita);
    return acc;
  }, {});

  // Formatear fecha para mostrar
  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="skeleton w-48 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-gold text-sm font-medium mb-1">Mi Agenda</p>
        <h1 className="font-display text-3xl font-bold text-cream">
          Mi Agenda
        </h1>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2">
        <button
          onClick={() => setModo('proximas')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors ${
            modo === 'proximas'
              ? 'bg-gold text-black border-gold'
              : 'border-barber-border text-cream/40 hover:text-gold hover:border-gold/30'
          }`}
        >
          <FaList /> Proximas Citas
        </button>
        <button
          onClick={() => setModo('diaria')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors ${
            modo === 'diaria'
              ? 'bg-gold text-black border-gold'
              : 'border-barber-border text-cream/40 hover:text-gold hover:border-gold/30'
          }`}
        >
          <FaCalendarAlt /> Vista Diaria
        </button>
        <button
          onClick={() => setModo('historial')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors ${
            modo === 'historial'
              ? 'bg-gold text-black border-gold'
              : 'border-barber-border text-cream/40 hover:text-gold hover:border-gold/30'
          }`}
        >
          <FaHistory /> Historial
        </button>
      </div>

      {/* Selector de fecha (solo en modo diaria) */}
      {modo === 'diaria' && (
        <div className="bg-barber-surface border border-barber-border p-4
                      flex items-center justify-between">
          <button onClick={() => navegarFecha(-1)}
            className="flex items-center gap-2 p-2 text-cream/40 hover:text-gold
                     transition-colors">
            <FaArrowLeft /> Anterior
          </button>

          <div className="text-center">
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-transparent text-white text-lg font-semibold
                       focus:outline-none cursor-pointer"
            />
            <p className="text-gold text-sm">
              {diasSemana[new Date(fechaSeleccionada + 'T00:00:00').getDay()]}
            </p>
          </div>

          <button onClick={() => navegarFecha(1)}
            className="flex items-center gap-2 p-2 text-cream/40 hover:text-gold
                     transition-colors">
            Siguiente <FaArrowRight />
          </button>
        </div>
      )}

      {/* Estadisticas rapidas */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Disponibles', value: capacidadRestante > 0 ? capacidadRestante : 0, color: 'text-green-400' },
          { label: 'Ocupadas',   value: stats.total,     color: 'text-gold' },
          { label: 'Pendientes', value: stats.pendientes, color: 'text-yellow-400' },
          { label: 'Completadas', value: stats.completadas, color: 'text-blue-400' },
          { label: 'Canceladas', value: stats.canceladas,  color: 'text-red-400' },
        ].map((stat, idx) => (
          <div key={idx}
            className="bg-barber-surface border border-barber-border p-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-cream/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de citas */}
      {citas.length === 0 ? (
        <div className="text-center py-16 bg-barber-surface border border-barber-border">
          <FaCalendarAlt className="text-cream/30 text-5xl mx-auto mb-4" />
          <p className="text-cream/30">
            {modo === 'proximas' ? 'No hay proximas citas programadas'
              : modo === 'historial' ? 'No hay citas en el historial'
              : 'No hay citas para esta fecha'}
          </p>
        </div>
      ) : modo === 'historial' ? (
        // Historial: agrupadas por fecha, sin acciones
        <div className="space-y-6">
          {Object.entries(citasPorFecha).map(([fecha, citasFecha]) => (
            <div key={fecha}>
              <h2 className="text-gold font-semibold text-lg mb-3 flex items-center gap-2">
                <FaCalendarAlt /> {formatFecha(fecha)}
                <span className="text-sm text-cream/30 font-normal">({citasFecha.length} cita{citasFecha.length > 1 ? 's' : ''})</span>
              </h2>
              <div className="space-y-3">
                {citasFecha.map((cita) => (
                  <div
                    key={cita.id_cita}
                    className="bg-barber-surface border border-barber-border p-4
                             hover:border-gold/30 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold text-gold">{cita.hora_inicio}</p>
                          <p className="text-xs text-cream/30">{cita.hora_fin}</p>
                        </div>
                        <div className="w-px h-10 bg-barber-border" />
                        <div>
                          <h3 className="font-semibold text-white">{cita.servicio_nombre}</h3>
                          <p className="text-sm text-cream/40">
                            {cita.cliente_nombre} {cita.cliente_apellido}
                            {cita.cliente_telefono && ` · ${cita.cliente_telefono}`}
                          </p>
                          {cita.notas && (
                            <p className="text-xs text-cream/30 mt-1 italic">
                              &ldquo;{cita.notas}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium border ${estadoColor(cita.estado)}`}>
                          {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : modo === 'proximas' ? (
        // Modo proximas: agrupadas por fecha
        <div className="space-y-6">
          {Object.entries(citasPorFecha).map(([fecha, citasFecha]) => (
            <div key={fecha}>
              <h2 className="text-gold font-semibold text-lg mb-3 flex items-center gap-2">
                <FaCalendarAlt /> {formatFecha(fecha)}
                <span className="text-sm text-cream/30 font-normal">({citasFecha.length} cita{citasFecha.length > 1 ? 's' : ''})</span>
              </h2>
              <div className="space-y-3">
                {citasFecha.map((cita) => (
                  <div
                    key={cita.id_cita}
                    className="bg-barber-surface border border-barber-border p-4
                             hover:border-gold/30 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold text-gold">{cita.hora_inicio}</p>
                          <p className="text-xs text-cream/30">{cita.hora_fin}</p>
                        </div>
                        <div className="w-px h-10 bg-barber-border" />
                        <div>
                          <h3 className="font-semibold text-white">{cita.servicio_nombre}</h3>
                          <p className="text-sm text-cream/40">
                            {cita.cliente_nombre} {cita.cliente_apellido}
                            {cita.cliente_telefono && ` · ${cita.cliente_telefono}`}
                          </p>
                          {cita.notas && (
                            <p className="text-xs text-cream/30 mt-1 italic">
                              &ldquo;{cita.notas}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium border ${estadoColor(cita.estado)}`}>
                          {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                        </span>
                        {cita.estado === 'pendiente' && (
                          <>
                            <button onClick={() => cambiarEstado(cita.id_cita, 'confirmada')}
                              className="px-3 py-1 text-xs font-medium
                                       border border-gold text-gold hover:bg-gold-muted transition-colors">
                              Confirmar
                            </button>
                            <button onClick={() => cambiarEstado(cita.id_cita, 'cancelada')}
                              className="px-3 py-1 text-xs font-medium
                                       text-red-400 hover:bg-red-500/10 transition-colors">
                              Cancelar
                            </button>
                          </>
                        )}
                        {cita.estado === 'confirmada' && (
                          <button onClick={() => cambiarEstado(cita.id_cita, 'completada')}
                            className="px-3 py-1 text-xs font-medium
                                     border border-green-500 text-green-400 hover:bg-green-500/10 transition-colors">
                            Completar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Modo diaria: lista plana
        <div className="space-y-3">
          {citas.map((cita) => (
            <div
              key={cita.id_cita}
              className="bg-barber-surface border border-barber-border p-4
                       hover:border-gold/30 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-gold">{cita.hora_inicio}</p>
                    <p className="text-xs text-cream/30">{cita.hora_fin}</p>
                  </div>
                  <div className="w-px h-10 bg-barber-border" />
                  <div>
                    <h3 className="font-semibold text-white">{cita.servicio_nombre}</h3>
                    <p className="text-sm text-cream/40">
                      {cita.cliente_nombre} {cita.cliente_apellido}
                      {cita.cliente_telefono && ` · ${cita.cliente_telefono}`}
                    </p>
                    {cita.notas && (
                      <p className="text-xs text-cream/30 mt-1 italic">
                        &ldquo;{cita.notas}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium border ${estadoColor(cita.estado)}`}>
                    {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                  </span>
                  {cita.estado === 'pendiente' && (
                    <>
                      <button onClick={() => cambiarEstado(cita.id_cita, 'confirmada')}
                        className="px-3 py-1 text-xs font-medium
                                 border border-gold text-gold hover:bg-gold-muted transition-colors">
                        Confirmar
                      </button>
                      <button onClick={() => cambiarEstado(cita.id_cita, 'cancelada')}
                        className="px-3 py-1 text-xs font-medium
                                 text-red-400 hover:bg-red-500/10 transition-colors">
                        Cancelar
                      </button>
                    </>
                  )}
                  {cita.estado === 'confirmada' && (
                    <button onClick={() => cambiarEstado(cita.id_cita, 'completada')}
                      className="px-3 py-1 text-xs font-medium
                               border border-green-500 text-green-400 hover:bg-green-500/10 transition-colors">
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarberDashboard;
