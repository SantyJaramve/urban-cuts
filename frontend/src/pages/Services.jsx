// ============================================================
// ARCHIVO: Services.jsx
// RESPONSABILIDAD: Pagina de catalogo completo de servicios.
// Lista todos los servicios activos de la barberia con
// precio, duracion y descripcion. Estructura BarberCrop:
// hero section con header, grid de tarjetas y estados de
// carga y vacio.
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ServiceCardSkeleton } from '../components/SkeletonLoader';
import { FaArrowRight, FaClock } from 'react-icons/fa';

const IMAGENES_SERVICIOS = {
  'Fade Classico': '/imgs/fade-classico.jpg',
  'Taper Fade': '/imgs/taper-fade.jpg',
  'Mullet Moderno': '/imgs/mullet-moderno.jpg',
  'Perfilado de Barba': '/imgs/perfilado-de-barba.jpg',
  'Corte + Barba': '/imgs/corte-barba.jpg',
  'Diseno de Cejas': '/imgs/diseno-de-cejas.jpg',
  'Afeitado Clasico': '/imgs/afeitado-clasico.jpg',
  'Tratamiento Capilar': '/imgs/tratamiento-capilar.jpg',
};

const Services = () => {
  const { user } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading]     = useState(true);

  /* Cargar servicios desde la API al montar el componente */
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const response = await api.get('/servicios');
        setServicios(response.data.data);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarServicios();
  }, []);

  return (
    <div className="space-y-12">

      {/* ==================== HERO SECTION ==================== */}
      <section className="bg-barber-carbon py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl space-y-4">
            <span className="text-gold text-sm font-medium uppercase tracking-widest">
              Servicios
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-cream">
              Lo que ofrecemos
            </h2>
            <p className="text-cream/50 max-w-xl text-sm md:text-base">
              Cortes modernos, perfilado de barba y tratamientos premium.
              Elige tu servicio favorito y reserva tu cita.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== GRID DE SERVICIOS ==================== */}
      {loading ? (
        /* Estado de carga: esqueletos de tarjetas */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : servicios.length === 0 ? (
        /* Estado vacio: sin servicios disponibles */
        <div className="text-center py-16 space-y-4">
          <p className="text-cream/30 text-lg">
            No hay servicios disponibles
          </p>
          <p className="text-cream/20 text-sm">
            Vuelve pronto para conocer nuestros servicios.
          </p>
        </div>
      ) : (
        /* Grid de tarjetas de servicios */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {servicios.map((servicio) => {
            const imagen = IMAGENES_SERVICIOS[servicio.nombre];
            return (
              <div
                key={servicio.id_servicio}
                className="relative group overflow-hidden border border-barber-border
                         hover:border-gold/30 transition-all duration-300 h-72"
              >
                {/* Imagen de fondo */}
                {imagen && (
                  <img
                    src={imagen}
                    alt={servicio.nombre}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                )}

                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-500" />

                {/* Contenido */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {servicio.nombre}
                    </h3>
                    <p className="text-cream/50 text-sm leading-relaxed">
                      {servicio.descripcion || 'Servicio profesional de calidad'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gold text-lg font-bold">
                        ${Number(servicio.precio).toLocaleString('es-CO')}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-cream/40">
                        <FaClock />
                        {servicio.duracion_min} min
                      </div>
                    </div>
                    <Link
                      to="/reservar"
                      className="text-gold text-sm font-medium hover:text-gold-hover transition-colors duration-300 inline-flex items-center gap-2"
                    >
                      Reservar
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Services;
