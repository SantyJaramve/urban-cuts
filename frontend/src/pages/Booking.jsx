// ============================================================
// ARCHIVO: Booking.jsx
// RESPONSABILIDAD: Pagina de reserva de citas. Formulario
// multi-paso que permite al cliente seleccionar servicio,
// barbero, fecha y hora. Valida disponibilidad en tiempo
// real y muestra horarios bloqueados. Estilo BarberCrop
// con paleta gold/dark elegante.
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FaCheck,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCut,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';

const Booking = () => {
  const navigate = useNavigate();

  const [step, setStep]                 = useState(1);
  const [servicios, setServicios]       = useState([]);
  const [barberos, setBarberos]         = useState([]);
  const [horarios, setHorarios]         = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [capacidadInfo, setCapacidadInfo] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [formData, setFormData]         = useState({
    servicio:    null,
    barbero:     null,
    fecha:       '',
    hora:        '',
    notas:       '',
  });

  const diasSemana = [
    'Domingo', 'Lunes', 'Martes', 'Miercoles',
    'Jueves', 'Viernes', 'Sabado',
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [servRes, barbRes] = await Promise.all([
          api.get('/servicios'),
          api.get('/barberos'),
        ]);
        setServicios(servRes.data.data);
        setBarberos(barbRes.data.data);
      } catch (error) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!formData.barbero) return;

    const cargarHorarios = async () => {
      try {
        const response = await api.get(
          `/barberos/${formData.barbero.id_barbero}/horarios`
        );
        setHorarios(response.data.data);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
      }
    };
    cargarHorarios();
  }, [formData.barbero]);

  useEffect(() => {
    if (!formData.barbero || !formData.fecha || !formData.servicio) {
      setHorasDisponibles([]);
      setCapacidadInfo(null);
      return;
    }

    const cargarDisponibilidad = async () => {
      try {
        const response = await api.get(
          `/barberos/${formData.barbero.id_barbero}/disponibilidad`,
          { params: { fecha: formData.fecha, servicio_id: formData.servicio.id_servicio } }
        );
        setHorasDisponibles(response.data.data.horas);
        setCapacidadInfo({
          capacidad: response.data.data.capacidad,
          ocupadas: response.data.data.ocupadas,
        });
      } catch (error) {
        console.error('Error al cargar disponibilidad:', error);
        setHorasDisponibles([]);
      }
    };
    cargarDisponibilidad();
  }, [formData.barbero, formData.fecha, formData.servicio]);

  const fechaMinima = new Date().toISOString().split('T')[0];

  const selectServicio = (servicio) => {
    setFormData((prev) => ({ ...prev, servicio }));
    setStep(2);
  };

  const selectBarbero = (barbero) => {
    setFormData((prev) => ({ ...prev, barbero, fecha: '', hora: '' }));
    setStep(3);
  };

  const selectFechaHora = () => {
    if (!formData.fecha || !formData.hora) {
      toast.error('Selecciona fecha y hora');
      return;
    }
    setStep(4);
  };

  const handleReservar = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/citas', {
        id_barbero:  formData.barbero.id_barbero,
        id_servicio: formData.servicio.id_servicio,
        fecha_cita:  formData.fecha,
        hora_inicio: formData.hora,
        notas:       formData.notas || null,
      });

      const codigo = response.data.data.codigo_reserva;
      toast.success(`Cita reservada! Codigo: ${codigo}`);
      navigate('/mis-citas');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error al reservar la cita'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-48 h-8  bg-barber-surface animate-pulse" />
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {['Servicio', 'Barbero', 'Fecha/Hora', 'Confirmar'].map(
        (label, idx) => (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 -full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${
                    step > idx + 1
                      ? 'bg-gold/20 text-gold border border-gold'
                      : step === idx + 1
                        ? 'bg-gold text-barber-dark'
                        : 'bg-barber-surface text-cream/30 border border-barber-border'
                  }`}
              >
                {step > idx + 1 ? (
                  <FaCheck className="text-xs" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-xs mt-2 hidden sm:inline transition-colors duration-300
                  ${
                    step === idx + 1
                      ? 'text-gold'
                      : step > idx + 1
                        ? 'text-cream/40'
                        : 'text-cream/40'
                  }`}
              >
                {label}
              </span>
            </div>

            {idx < 3 && (
              <div
                className={`h-px w-12 mx-2 mt-[-18px] sm:mt-0 transition-colors duration-300 hidden sm:block
                  ${step > idx + 1 ? 'bg-gold' : 'bg-barber-border'}`}
              />
            )}
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ENCABEZADO */}
      <div className="text-center mb-12">
        <p className="text-gold text-sm uppercase tracking-wider font-semibold mb-2">
          Reservar Cita
        </p>
        <h1 className="font-display text-3xl font-bold text-cream">
          Agenda tu proximo corte
        </h1>
      </div>

      <StepIndicator />

      {/* PASO 1: SELECCIONAR SERVICIO */}
      {step === 1 && (
        <div className="animate-fade-in space-y-4">
          <h2 className="text-lg font-display font-semibold text-cream flex items-center gap-2">
            <FaCut className="text-gold text-sm" />
            Selecciona tu servicio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicios.map((servicio) => (
              <button
                key={servicio.id_servicio}
                onClick={() => selectServicio(servicio)}
                className={`text-left p-4 border transition-all duration-300
                  ${
                    formData.servicio?.id_servicio === servicio.id_servicio
                      ? 'border-gold bg-gold/5'
                      : 'bg-barber-surface border border-barber-border hover:border-gold/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 -full border-2 flex-shrink-0 transition-colors
                      ${
                        formData.servicio?.id_servicio === servicio.id_servicio
                          ? 'border-gold bg-gold'
                          : 'border-barber-border'
                      }`}
                  />
                  <div className="space-y-1 flex-1">
                    <h3 className="font-display font-semibold text-cream">
                      {servicio.nombre}
                    </h3>
                    <p className="text-sm text-cream/40 flex items-center gap-1.5">
                      <FaClock className="text-xs" />
                      {servicio.duracion_min} min
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gold">
                    ${servicio.precio.toLocaleString('es-CO')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2: SELECCIONAR BARBERO */}
      {step === 2 && (
        <div className="animate-fade-in space-y-4">
          <h2 className="text-lg font-display font-semibold text-cream flex items-center gap-2">
            <FaUser className="text-gold text-sm" />
            Selecciona tu barbero
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barberos.map((barbero) => (
              <button
                key={barbero.id_barbero}
                onClick={() => selectBarbero(barbero)}
                className={`text-left p-4 border transition-all duration-300
                  ${
                    formData.barbero?.id_barbero === barbero.id_barbero
                      ? 'border-gold bg-gold/5'
                      : 'bg-barber-surface border border-barber-border hover:border-gold/30'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 -full bg-gold-muted border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-gold font-display">
                      {barbero.nombre[0]}
                      {barbero.apellido[0]}
                    </span>
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <h3 className="font-display font-semibold text-cream">
                      {barbero.nombre} {barbero.apellido}
                    </h3>
                    <p className="text-sm text-cream/40">
                      {barbero.especialidad || 'Barbero profesional'}
                    </p>
                    <p className="text-xs text-cream/30">
                      {barbero.anos_experiencia} anos de experiencia
                    </p>
                  </div>

                  <div
                    className={`w-4 h-4 -full border-2 flex-shrink-0 transition-colors
                      ${
                        formData.barbero?.id_barbero === barbero.id_barbero
                          ? 'border-gold bg-gold'
                          : 'border-barber-border'
                      }`}
                  />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 mt-4 bg-barber-surface border border-barber-border
                     text-cream/60 px-6 py-2.5 text-sm hover:border-gold/30 transition-all duration-300"
          >
            <FaArrowLeft /> Volver a servicios
          </button>
        </div>
      )}

      {/* PASO 3: SELECCIONAR FECHA Y HORA */}
      {step === 3 && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-lg font-display font-semibold text-cream flex items-center gap-2">
            <FaCalendarAlt className="text-gold text-sm" />
            Selecciona fecha y hora
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-cream/60">
              Fecha de la cita
            </label>
            <input
              type="date"
              min={fechaMinima}
              value={formData.fecha}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fecha: e.target.value,
                  hora: '',
                }))
              }
              className="w-full px-4 py-3 bg-barber-carbon border border-barber-muted
                       text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
                       transition-colors"
            />
          </div>

          {formData.fecha && (
            <p className="text-sm text-gold flex items-center gap-1.5">
              <FaCalendarAlt className="text-xs" />
              {diasSemana[new Date(formData.fecha + 'T00:00:00').getDay()]}
            </p>
          )}

          {formData.fecha && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-cream/60 flex items-center gap-1.5">
                <FaClock className="text-xs" />
                Hora disponible
              </label>

              {horasDisponibles.length === 0 ? (
                <div className="text-center py-4 bg-barber-surface border border-barber-border space-y-2">
                  <p className="text-gold/70 text-sm">
                    {capacidadInfo && capacidadInfo.ocupadas >= capacidadInfo.capacidad
                      ? 'El barbero ha alcanzado su capacidad maxima de citas para este dia.'
                      : 'El barbero no tiene horario disponible en esta fecha.'}
                  </p>
                  {capacidadInfo && (
                    <p className="text-cream/30 text-xs">
                      Capacidad: {capacidadInfo.ocupadas}/{capacidadInfo.capacidad} citas
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {horasDisponibles.map((hora) => (
                    <button
                      key={hora}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, hora }))
                      }
                      className={`py-2 px-3 text-sm text-center transition-all duration-300
                        ${
                          formData.hora === hora
                            ? 'border-gold bg-gold/10 text-gold border'
                            : 'bg-barber-surface border border-barber-border text-cream/60 hover:border-gold/30'
                        }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-cream/60">
              Notas <span className="text-cream/30">(opcional)</span>
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notas: e.target.value }))
              }
              placeholder="Ej: Quiero el fade alto con perfilado de barba..."
              rows={3}
              className="w-full px-4 py-3 bg-barber-carbon border border-barber-muted
                       text-white text-sm placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold/50
                       focus:border-gold resize-none transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-barber-surface border border-barber-border
                       text-cream/60 px-6 py-2.5 text-sm hover:border-gold/30 transition-all duration-300"
            >
              <FaArrowLeft /> Volver
            </button>
            <button
              onClick={selectFechaHora}
              disabled={!formData.fecha || !formData.hora}
              className="flex items-center gap-2 bg-gold text-barber-dark px-6 py-2.5 text-sm font-semibold
                       hover:bg-gold-hover disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
            >
              Siguiente <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: CONFIRMAR RESERVA */}
      {step === 4 && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-lg font-display font-semibold text-cream flex items-center gap-2">
            <FaCheck className="text-gold text-sm" />
            Confirma tu reserva
          </h2>

          <div className="bg-barber-surface border border-barber-border p-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-cream/40 flex items-center gap-2">
                <FaCut className="text-xs" /> Servicio
              </span>
              <span className="font-medium text-cream">
                {formData.servicio.nombre}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-cream/40 flex items-center gap-2">
                <FaUser className="text-xs" /> Barbero
              </span>
              <span className="font-medium text-cream">
                {formData.barbero.nombre} {formData.barbero.apellido}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-cream/40 flex items-center gap-2">
                <FaCalendarAlt className="text-xs" /> Fecha
              </span>
              <span className="font-medium text-cream">
                {formData.fecha} (
                {diasSemana[new Date(formData.fecha + 'T00:00:00').getDay()]})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-cream/40 flex items-center gap-2">
                <FaClock className="text-xs" /> Hora
              </span>
              <span className="font-medium text-cream">{formData.hora}</span>
            </div>

            {formData.notas && (
              <div className="flex justify-between items-center">
                <span className="text-cream/40">Notas</span>
                <span className="font-medium text-cream text-right max-w-[60%]">
                  {formData.notas}
                </span>
              </div>
            )}

            <div className="border-t border-barber-border pt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-display font-semibold text-cream">
                  Total
                </span>
                <span className="font-bold text-gold text-xl">
                  ${formData.servicio.precio.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-barber-surface border border-barber-border
                       text-cream/60 px-6 py-2.5 text-sm hover:border-gold/30 transition-all duration-300"
            >
              <FaArrowLeft /> Volver
            </button>
            <button
              onClick={handleReservar}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-gold text-barber-dark
                       px-8 py-3 font-semibold text-sm uppercase tracking-wider
                       hover:bg-gold-hover disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
            >
              <FaCheck /> {submitting ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
