// ============================================================
// ARCHIVO: AdminDashboard.jsx
// RESPONSABILIDAD: Panel de administracion completo.
// Dashboard de metricas, CRUD de servicios, CRUD de
// barberos y configuracion de horarios. Vista por tabs.
// Estilo visual: plantilla BarberCrop (dorado + carbon).
// ============================================================

import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import {
  FaChartBar, FaCut, FaUsers, FaEdit, FaTrash,
  FaClock, FaCalendarAlt, FaPlus, FaList, FaSearch,
} from 'react-icons/fa';

const AdminDashboard = () => {
  // Tab activo: metricas, servicios, barberos, horarios
  const [tab, setTab]                 = useState('metricas');
  const [metricas, setMetricas]       = useState(null);
  const [servicios, setServicios]     = useState([]);
  const [barberos, setBarberos]       = useState([]);
  const [citas, setCitas]             = useState([]);
  const [busquedaBarbero, setBusquedaBarbero] = useState('');
  const [busquedaCita, setBusquedaCita]       = useState('');
  const [loading, setLoading]         = useState(true);

  // Estado para modales de CRUD
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBarberModal, setBarberModal]       = useState(false);
  const [showScheduleModal, setScheduleModal]   = useState(false);
  const [editingService, setEditingService]     = useState(null);
  const [editingBarber, setEditingBarber]       = useState(null);
  const [selectedBarber, setSelectedBarber]     = useState(null);

  // Formularios
  const [serviceForm, setServiceForm] = useState({
    nombre: '', descripcion: '', precio: '', duracion_min: '',
  });
  const [barberForm, setBarberForm] = useState({
    nombre: '', apellido: '', correo: '', contrasena: '', telefono: '',
    especialidad: '', descripcion: '', anos_experiencia: '', capacidad_diaria: '10',
  });

  // Dias de la semana para horarios
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  // Horarios por defecto (Lun-Sab 9:00-18:00)
  const [horariosForm, setHorariosForm] = useState(
    [1,2,3,4,5,6].map(dia => ({
      dia_semana: dia,
      hora_inicio: '09:00',
      hora_fin: '18:00',
      activo: true,
    }))
  );

  // ==================== CARGAR DATOS ====================
  const cargarMetricas = async () => {
    try {
      const response = await api.get('/dashboard');
      setMetricas(response.data.data);
    } catch (error) {
      console.error('Error al cargar metricas:', error);
    }
  };

  const cargarServicios = async () => {
    try {
      const response = await api.get('/servicios');
      setServicios(response.data.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const cargarBarberos = async () => {
    try {
      const response = await api.get('/barberos');
      setBarberos(response.data.data);
    } catch (error) {
      console.error('Error al cargar barberos:', error);
    }
  };

  const cargarCitas = async () => {
    try {
      const response = await api.get('/citas/todas');
      setCitas(response.data.data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([cargarMetricas(), cargarServicios(), cargarBarberos(), cargarCitas()]);
      setLoading(false);
    };
    init();
  }, []);

  // ==================== CRUD SERVICIOS ====================
  const abrirModalServicio = (servicio = null) => {
    if (servicio) {
      setEditingService(servicio);
      setServiceForm({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || '',
        precio: servicio.precio,
        duracion_min: servicio.duracion_min,
      });
    } else {
      setEditingService(null);
      setServiceForm({ nombre: '', descripcion: '', precio: '', duracion_min: '' });
    }
    setShowServiceModal(true);
  };

  const guardarServicio = async () => {
    try {
      if (editingService) {
        await api.put(`/servicios/${editingService.id_servicio}`, serviceForm);
        toast.success('Servicio actualizado');
      } else {
        await api.post('/servicios', serviceForm);
        toast.success('Servicio creado');
      }
      setShowServiceModal(false);
      cargarServicios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar servicio');
    }
  };

  const eliminarServicio = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      await api.delete(`/servicios/${id}`);
      toast.success('Servicio eliminado');
      cargarServicios();
    } catch (error) {
      toast.error('Error al eliminar servicio');
    }
  };

  // ==================== CRUD BARBEROS ====================
  const abrirModalBarbero = (barbero = null) => {
    if (barbero) {
      setEditingBarber(barbero);
      setBarberForm({
        nombre: barbero.nombre || '',
        apellido: barbero.apellido || '',
        correo: barbero.correo || '',
        contrasena: '',
        telefono: barbero.telefono || '',
        especialidad: barbero.especialidad || '',
        descripcion: barbero.descripcion || '',
        anos_experiencia: barbero.anos_experiencia || '',
        capacidad_diaria: barbero.capacidad_diaria || 10,
      });
    } else {
      setEditingBarber(null);
      setBarberForm({ nombre: '', apellido: '', correo: '', contrasena: '', telefono: '',
        especialidad: '', descripcion: '', anos_experiencia: '', capacidad_diaria: '10' });
    }
    setBarberModal(true);
  };

  const guardarBarbero = async () => {
    try {
      if (editingBarber) {
        const payload = {
          especialidad: barberForm.especialidad,
          descripcion: barberForm.descripcion,
          anos_experiencia: barberForm.anos_experiencia,
          capacidad_diaria: barberForm.capacidad_diaria ? parseInt(barberForm.capacidad_diaria, 10) : undefined,
        };
        await api.put(`/barberos/${editingBarber.id_barbero}`, payload);
        toast.success('Barbero actualizado');
      } else {
        if (!barberForm.nombre || !barberForm.correo || !barberForm.contrasena) {
          toast.error('Nombre, correo y contrasena son obligatorios');
          return;
        }
        const payload = {};
        Object.entries(barberForm).forEach(([key, val]) => {
          if (val !== '' && val !== null && val !== undefined) payload[key] = val;
        });
        if (payload.anos_experiencia) payload.anos_experiencia = parseInt(payload.anos_experiencia, 10);
        if (payload.capacidad_diaria) payload.capacidad_diaria = parseInt(payload.capacidad_diaria, 10);
        await api.post('/barberos', payload);
        toast.success('Barbero creado');
      }
      setBarberModal(false);
      cargarBarberos();
    } catch (error) {
      console.error('Error guardar barbero:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message || 'Error al guardar barbero');
    }
  };

  const eliminarBarbero = async (id) => {
    if (!confirm('¿Eliminar este barbero?')) return;
    try {
      await api.delete(`/barberos/${id}`);
      toast.success('Barbero eliminado');
      cargarBarberos();
    } catch (error) {
      toast.error('Error al eliminar barbero');
    }
  };

  // ==================== HORARIOS ====================
  const abrirModalHorarios = async (barbero) => {
    setSelectedBarber(barbero);
    try {
      const response = await api.get(`/barberos/${barbero.id_barbero}/horarios`);
      if (response.data.data.length > 0) {
        setHorariosForm(response.data.data.map(h => ({
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio.substring(0, 5),
          hora_fin: h.hora_fin.substring(0, 5),
          activo: h.activo,
        })));
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
    setScheduleModal(true);
  };

  const guardarHorarios = async () => {
    try {
      await api.put(`/barberos/${selectedBarber.id_barbero}/horarios`, {
        horarios: horariosForm,
      });
      toast.success('Horarios configurados exitosamente');
      setScheduleModal(false);
    } catch (error) {
      toast.error('Error al guardar horarios');
    }
  };

  const toggleHorario = (idx) => {
    setHorariosForm(prev => prev.map((h, i) =>
      i === idx ? { ...h, activo: !h.activo } : h
    ));
  };

  // ==================== TABS ====================
  const tabs = [
    { id: 'metricas', label: 'Dashboard', Icon: FaChartBar },
    { id: 'citas', label: 'Citas', Icon: FaCalendarAlt },
    { id: 'servicios', label: 'Servicios', Icon: FaCut },
    { id: 'barberos', label: 'Barberos', Icon: FaUsers },
  ];

  // ==================== CLASES REUTILIZABLES ====================
  const inputClass =
    'w-full px-4 py-2.5 bg-barber-carbon border border-barber-muted ' +
    'text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold ' +
    'placeholder:text-cream/30';

  const labelClass = 'block text-sm text-cream/60 mb-1.5';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="skeleton w-48 h-8 "></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ==================== HEADER ==================== */}
      <div>
        <p className="text-gold text-sm font-medium mb-1">Panel de Control</p>
        <h1 className="font-display text-3xl font-bold text-cream">
          Panel <span className="text-gold">Admin</span>
        </h1>
      </div>

      {/* ==================== TABS DE NAVEGACION ==================== */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium
              whitespace-nowrap transition-all
              ${tab === t.id
                ? 'bg-gold text-barber-dark'
                : 'bg-barber-surface text-cream/50 border border-barber-border hover:text-gold hover:border-gold/30'}`}
          >
            {t.Icon && <t.Icon />} {t.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB: METRICAS ==================== */}
      {tab === 'metricas' && metricas && (
        <div className="space-y-6 animate-fade-in">
          {/* Tarjetas de metricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Citas Hoy',      value: metricas.citas_hoy,          icon: FaCalendarAlt },
              { label: 'Pendientes',     value: metricas.citas_pendientes,   icon: FaClock },
              { label: 'Completadas',    value: metricas.citas_completadas,  icon: FaChartBar },
              { label: 'Ingresos',       value: `$${metricas.ingresos_estimados.toLocaleString('es-CO')}`, icon: FaCut },
            ].map((m, idx) => (
              <div key={idx}
                className="bg-barber-surface border border-barber-border p-5">
                <m.icon className="text-gold/40 text-lg mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-gold">{m.value}</p>
                <p className="text-sm text-cream/40 mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Servicios mas demandados */}
          <div className="bg-barber-surface border border-barber-border p-6">
            <h3 className="text-lg font-semibold text-cream mb-4">
              Servicios mas demandados
            </h3>
            {metricas.servicios_demandados.length === 0 ? (
              <p className="text-cream/30 text-sm">
                No hay datos disponibles aun
              </p>
            ) : (
              <div className="space-y-3">
                {metricas.servicios_demandados.map((s, idx) => (
                  <div key={idx}
                    className="flex items-center justify-between p-3
                             bg-barber-carbon">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 -full bg-gold/15
                                     flex items-center justify-center text-sm font-bold text-gold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-cream">
                        {s.nombre}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gold">
                        {s.total_reservas} reservas
                      </span>
                      <p className="text-xs text-cream/40">
                        ${s.precio.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen barberos y servicios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-barber-surface border border-barber-border p-4 text-center">
              <p className="text-3xl font-bold text-gold">{metricas.total_barberos}</p>
              <p className="text-sm text-cream/40 mt-1">Barberos Activos</p>
            </div>
            <div className="bg-barber-surface border border-barber-border p-4 text-center">
              <p className="text-3xl font-bold text-gold">{metricas.total_servicios}</p>
              <p className="text-sm text-cream/40 mt-1">Servicios Activos</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: CITAS ==================== */}
      {tab === 'citas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-cream">
              Historial de Citas
            </h2>
            <span className="text-sm text-cream/40">
              {citas.filter(c => {
                if (!busquedaCita.trim()) return true;
                const b = busquedaCita.toLowerCase();
                return (c.cliente_nombre?.toLowerCase().includes(b) ||
                        c.cliente_apellido?.toLowerCase().includes(b) ||
                        c.barbero_nombre?.toLowerCase().includes(b) ||
                        c.barbero_apellido?.toLowerCase().includes(b) ||
                        c.codigo_reserva?.toLowerCase().includes(b) ||
                        c.servicio_nombre?.toLowerCase().includes(b));
              }).length} de {citas.length} citas
            </span>
          </div>

          {/* Barra de busqueda */}
          <div className="bg-barber-surface border border-barber-border p-4 flex gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-cream/30">
                <FaSearch />
              </span>
              <input
                type="text"
                value={busquedaCita}
                onChange={(e) => setBusquedaCita(e.target.value)}
                placeholder="Buscar por nombre, barbero, servicio o codigo..."
                className="w-full pl-10 pr-4 py-2.5 bg-barber-carbon
                         border border-barber-muted
                         text-white text-sm placeholder-cream/30
                         focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              />
            </div>
            {busquedaCita && (
              <button onClick={() => setBusquedaCita('')}
                className="px-4 py-2.5 border border-barber-border
                         text-cream/40 hover:text-white transition-colors text-sm">
                Limpiar
              </button>
            )}
          </div>

          <div className="bg-barber-surface border border-barber-border overflow-hidden">
            {/* Encabezado de tabla */}
            <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-barber-carbon
                          text-xs uppercase tracking-wider text-cream/40">
              <div>Codigo</div>
              <div>Fecha</div>
              <div>Hora</div>
              <div>Cliente</div>
              <div>Barbero</div>
              <div>Servicio</div>
              <div>Estado</div>
            </div>

            {/* Filas */}
            {citas.filter(c => {
              if (!busquedaCita.trim()) return true;
              const b = busquedaCita.toLowerCase();
              return (c.cliente_nombre?.toLowerCase().includes(b) ||
                      c.cliente_apellido?.toLowerCase().includes(b) ||
                      c.barbero_nombre?.toLowerCase().includes(b) ||
                      c.barbero_apellido?.toLowerCase().includes(b) ||
                      c.codigo_reserva?.toLowerCase().includes(b) ||
                      c.servicio_nombre?.toLowerCase().includes(b));
            }).length === 0 ? (
              <div className="p-8 text-center text-cream/30">
                {busquedaCita ? 'No se encontraron citas con ese criterio' : 'No hay citas registradas'}
              </div>
            ) : (
              citas.filter(c => {
                if (!busquedaCita.trim()) return true;
                const b = busquedaCita.toLowerCase();
                return (c.cliente_nombre?.toLowerCase().includes(b) ||
                        c.cliente_apellido?.toLowerCase().includes(b) ||
                        c.barbero_nombre?.toLowerCase().includes(b) ||
                        c.barbero_apellido?.toLowerCase().includes(b) ||
                        c.codigo_reserva?.toLowerCase().includes(b) ||
                        c.servicio_nombre?.toLowerCase().includes(b));
              }).map((cita) => (
                <div key={cita.id_cita}
                  className="grid grid-cols-7 gap-4 px-6 py-4 border-t
                           border-barber-border items-center hover:bg-barber-carbon/50 transition-colors text-sm">
                  <div className="text-gold/70 font-mono text-xs">
                    {cita.codigo_reserva}
                  </div>
                  <div className="text-cream">
                    {cita.fecha_cita?.split('T')[0]}
                  </div>
                  <div className="text-cream/60">
                    {cita.hora_inicio?.substring(0, 5)}
                  </div>
                  <div className="text-cream">
                    {cita.cliente_nombre} {cita.cliente_apellido}
                  </div>
                  <div className="text-cream">
                    {cita.barbero_nombre} {cita.barbero_apellido}
                  </div>
                  <div className="text-cream/60">
                    {cita.servicio_nombre}
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 -full text-xs font-medium
                      ${cita.estado === 'completada' ? 'bg-green-500/20 text-green-400'
                        : cita.estado === 'cancelada' ? 'bg-red-500/20 text-red-400'
                        : cita.estado === 'confirmada' ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gold/20 text-gold'}`}>
                      {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: SERVICIOS ==================== */}
      {tab === 'servicios' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-cream">
              Catalogo de Servicios
            </h2>
            <button onClick={() => abrirModalServicio()}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-barber-dark
                       font-medium hover:bg-gold-hover transition-colors text-sm">
              <FaPlus /> Nuevo Servicio
            </button>
          </div>

          <div className="bg-barber-surface border border-barber-border overflow-hidden">
            {/* Encabezado de tabla */}
            <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-barber-carbon
                          text-xs uppercase tracking-wider text-cream/40">
              <div className="col-span-2">Nombre</div>
              <div>Precio</div>
              <div>Duracion</div>
              <div>Estado</div>
              <div className="text-right">Acciones</div>
            </div>

            {/* Filas */}
            {servicios.length === 0 ? (
              <div className="p-8 text-center text-cream/30">
                No hay servicios registrados
              </div>
            ) : (
              servicios.map((servicio) => (
                <div key={servicio.id_servicio}
                  className="grid grid-cols-6 gap-4 px-6 py-4 border-t
                           border-barber-border
                           items-center hover:bg-barber-carbon/50
                           transition-colors">
                  <div className="col-span-2">
                    <p className="font-medium text-cream">
                      {servicio.nombre}
                    </p>
                    <p className="text-xs text-cream/40 truncate">
                      {servicio.descripcion || 'Sin descripcion'}
                    </p>
                  </div>
                  <div className="text-gold font-medium">
                    ${servicio.precio.toLocaleString('es-CO')}
                  </div>
                  <div className="text-cream/50 text-sm">
                    {servicio.duracion_min} min
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 -full text-xs font-medium
                      ${servicio.activo
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'}`}>
                      {servicio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => abrirModalServicio(servicio)}
                      className="p-2 text-cream/40 hover:text-gold
                               hover:bg-gold-muted transition-colors"
                      title="Editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => eliminarServicio(servicio.id_servicio)}
                      className="p-2 text-cream/40 hover:text-red-400
                               hover:bg-red-500/10 transition-colors"
                      title="Eliminar">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: BARBEROS ==================== */}
      {tab === 'barberos' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-cream">
              Gestion de Barberos
            </h2>
            <button onClick={() => abrirModalBarbero()}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-barber-dark
                       font-medium hover:bg-gold-hover transition-colors text-sm">
              <FaPlus /> Nuevo Barbero
            </button>
          </div>

          {/* Barra de busqueda */}
          <div className="bg-barber-surface border border-barber-border p-4 flex gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-cream/30">
                <FaSearch />
              </span>
              <input
                type="text"
                value={busquedaBarbero}
                onChange={(e) => setBusquedaBarbero(e.target.value)}
                placeholder="Buscar barbero por nombre..."
                className="w-full pl-10 pr-4 py-2.5 bg-barber-carbon
                         border border-barber-muted
                         text-white text-sm placeholder-cream/30
                         focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              />
            </div>
            {busquedaBarbero && (
              <button onClick={() => setBusquedaBarbero('')}
                className="px-4 py-2.5 border border-barber-border
                         text-cream/40 hover:text-white transition-colors text-sm">
                Limpiar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barberos.filter(b => {
              if (!busquedaBarbero.trim()) return true;
              const busqueda = busquedaBarbero.toLowerCase();
              return (b.nombre?.toLowerCase().includes(busqueda) ||
                      b.apellido?.toLowerCase().includes(busqueda));
            }).length === 0 ? (
              <div className="col-span-2 bg-barber-surface p-8
                            border border-barber-border
                            text-center text-cream/30">
                {busquedaBarbero ? 'No se encontraron barberos con ese nombre' : 'No hay barberos registrados'}
              </div>
            ) : (
              barberos.filter(b => {
                if (!busquedaBarbero.trim()) return true;
                const busqueda = busquedaBarbero.toLowerCase();
                return (b.nombre?.toLowerCase().includes(busqueda) ||
                        b.apellido?.toLowerCase().includes(busqueda));
              }).map((barbero) => (
                <div key={barbero.id_barbero}
                  className="bg-barber-surface border border-barber-border p-5
                           hover:border-gold/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 -full bg-gold/10
                                    flex items-center justify-center">
                        <span className="text-lg font-display font-bold text-gold">
                          {barbero.nombre[0]}{barbero.apellido[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">
                          {barbero.nombre} {barbero.apellido}
                        </h3>
                        <p className="text-cream/40 text-sm">
                          {barbero.especialidad || 'Sin especialidad'}
                        </p>
                        <p className="text-cream/40 text-sm">
                          {barbero.anos_experiencia || 0} anos de experiencia
                        </p>
                        <p className="text-gold/60 text-xs">
                          Capacidad: {barbero.capacidad_diaria || 10} citas/dia
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button onClick={() => abrirModalHorarios(barbero)}
                        className="p-1.5 text-cream/40 hover:text-gold
                                 hover:bg-gold-muted transition-colors"
                        title="Configurar horarios">
                        <FaClock />
                      </button>
                      <button onClick={() => abrirModalBarbero(barbero)}
                        className="p-1.5 text-cream/40 hover:text-gold
                                 hover:bg-gold-muted transition-colors"
                        title="Editar">
                        <FaEdit />
                      </button>
                      <button onClick={() => eliminarBarbero(barbero.id_barbero)}
                        className="p-1.5 text-cream/40 hover:text-red-400
                                 hover:bg-red-500/10 transition-colors"
                        title="Eliminar">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL: SERVICIO ==================== */}
      <Modal isOpen={showServiceModal} onClose={() => setShowServiceModal(false)}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              Nombre
            </label>
            <input type="text" value={serviceForm.nombre}
              onChange={(e) => setServiceForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Fade Classico"
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>
              Descripcion
            </label>
            <textarea value={serviceForm.descripcion}
              onChange={(e) => setServiceForm(p => ({ ...p, descripcion: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Precio ($)
              </label>
              <input type="number" value={serviceForm.precio}
                onChange={(e) => setServiceForm(p => ({ ...p, precio: e.target.value }))}
                placeholder="25000"
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                Duracion (min)
              </label>
              <input type="number" value={serviceForm.duracion_min}
                onChange={(e) => setServiceForm(p => ({ ...p, duracion_min: e.target.value }))}
                placeholder="30"
                className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowServiceModal(false)}
              className="px-4 py-2 border border-gold text-gold
                       text-sm hover:bg-gold-muted transition-colors">
              Cancelar
            </button>
            <button onClick={guardarServicio}
              className="px-6 py-2 bg-gold text-barber-dark text-sm font-semibold
                       hover:bg-gold-hover transition-colors">
              {editingService ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ==================== MODAL: BARBERO ==================== */}
      <Modal isOpen={showBarberModal} onClose={() => setBarberModal(false)}
        title={editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}>
        <div className="space-y-4">
          {!editingBarber && (
            <>
              <div>
                <label className={labelClass}>
                  Nombre *
                </label>
                <input type="text" value={barberForm.nombre}
                  onChange={(e) => setBarberForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Pedro"
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  Apellido
                </label>
                <input type="text" value={barberForm.apellido}
                  onChange={(e) => setBarberForm(p => ({ ...p, apellido: e.target.value }))}
                  placeholder="Ej: Ramirez"
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  Correo electronico *
                </label>
                <input type="email" value={barberForm.correo}
                  onChange={(e) => setBarberForm(p => ({ ...p, correo: e.target.value }))}
                  placeholder="pedro@email.com"
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  Contrasena *
                </label>
                <input type="password" value={barberForm.contrasena}
                  onChange={(e) => setBarberForm(p => ({ ...p, contrasena: e.target.value }))}
                  placeholder="Minimo 6 caracteres"
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  Telefono
                </label>
                <input type="text" value={barberForm.telefono}
                  onChange={(e) => setBarberForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="3001234567"
                  className={inputClass} />
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>
              Especialidad
            </label>
            <input type="text" value={barberForm.especialidad}
              onChange={(e) => setBarberForm(p => ({ ...p, especialidad: e.target.value }))}
              placeholder="Ej: Fade, Barba, Diseno"
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>
              Descripcion
            </label>
            <textarea value={barberForm.descripcion}
              onChange={(e) => setBarberForm(p => ({ ...p, descripcion: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>
              Anos de experiencia
            </label>
            <input type="number" value={barberForm.anos_experiencia}
              onChange={(e) => setBarberForm(p => ({ ...p, anos_experiencia: e.target.value }))}
              placeholder="5"
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>
              Capacidad diaria de citas
            </label>
            <input type="number" value={barberForm.capacidad_diaria}
              onChange={(e) => setBarberForm(p => ({ ...p, capacidad_diaria: e.target.value }))}
              placeholder="10"
              min="1"
              className={inputClass} />
            <p className="text-xs text-cream/30 mt-1">Maximo de citas que puede atender por dia</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setBarberModal(false)}
              className="px-4 py-2 border border-gold text-gold
                       text-sm hover:bg-gold-muted transition-colors">
              Cancelar
            </button>
            <button onClick={guardarBarbero}
              className="px-6 py-2 bg-gold text-barber-dark text-sm font-semibold
                       hover:bg-gold-hover transition-colors">
              {editingBarber ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ==================== MODAL: HORARIOS ==================== */}
      <Modal isOpen={showScheduleModal} onClose={() => setScheduleModal(false)}
        title={`Horarios - ${selectedBarber?.nombre || ''}`} size="lg">
        <div className="space-y-3">
          <p className="text-sm text-cream/40">
            Configura los horarios de atencion de este barbero
          </p>

          {horariosForm.map((horario, idx) => (
            <div key={horario.dia_semana}
              className={`flex items-center gap-4 p-3 border
                ${horario.activo
                  ? 'border-gold/30 bg-gold-muted'
                  : 'border-barber-border opacity-50'}`}>
              <label className="flex items-center gap-2 min-w-[120px]">
                <input type="checkbox" checked={horario.activo}
                  onChange={() => toggleHorario(idx)}
                  className="w-4 h-4  text-gold focus:ring-gold accent-[#DC143C]" />
                <span className="text-sm font-medium text-cream">
                  {diasSemana[horario.dia_semana]}
                </span>
              </label>

              <input type="time" value={horario.hora_inicio}
                onChange={(e) => setHorariosForm(prev => prev.map((h, i) =>
                  i === idx ? { ...h, hora_inicio: e.target.value } : h
                ))}
                disabled={!horario.activo}
                className="px-3 py-1.5 bg-barber-carbon
                         border border-barber-muted
                         text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
                         disabled:opacity-50" />

              <span className="text-cream/40">a</span>

              <input type="time" value={horario.hora_fin}
                onChange={(e) => setHorariosForm(prev => prev.map((h, i) =>
                  i === idx ? { ...h, hora_fin: e.target.value } : h
                ))}
                disabled={!horario.activo}
                className="px-3 py-1.5 bg-barber-carbon
                         border border-barber-muted
                         text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
                         disabled:opacity-50" />
            </div>
          ))}

          <div className="flex gap-3 justify-end pt-4">
            <button onClick={() => setScheduleModal(false)}
              className="px-4 py-2 border border-gold text-gold
                       text-sm hover:bg-gold-muted transition-colors">
              Cancelar
            </button>
            <button onClick={guardarHorarios}
              className="px-6 py-2 bg-gold text-barber-dark text-sm font-semibold
                       hover:bg-gold-hover transition-colors">
              Guardar Horarios
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
