// ============================================================
// ARCHIVO: Home.jsx
// RESPONSABILIDAD: Pagina principal / landing page de la
// barberia. Presenta hero section con imagen de fondo,
// seccion "Sobre Nosotros" con estadisticas, catalogo de
// servicios, horario de atencion y call-to-action para
// reservar cita. Estilo BarberCrop (elegante, minimalista,
// paleta oscura con acentos dorados).
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import fondoini from '../../imgs/fondoini.jpeg';
import fondo2 from '../../imgs/fondo2.jpeg';
import '../styles/carousel.css';
import {
  FaCut,
  FaMapMarkerAlt,
  FaPhone,
  FaArrowRight,
  FaClock,
  FaCalendarAlt,
} from 'react-icons/fa';

const SERVICIOS_DESTACADOS = [
  {
    id: 1,
    nombre: 'Fade Classico',
    descripcion: 'Corte degradado con acabado perfecto y lineas definidas.',
    precio: '$25.000',
    imagen: '/imgs/fade-classico.jpg',
  },
  {
    id: 2,
    nombre: 'Taper Fade',
    descripcion: 'Degradado sutil que combina elegancia con estilo moderno.',
    precio: '$30.000',
    imagen: '/imgs/taper-fade.jpg',
  },
  {
    id: 3,
    nombre: 'Mullet Moderno',
    descripcion: 'El corte retro reinventado para el hombre contemporaneo.',
    precio: '$35.000',
    imagen: '/imgs/mullet-moderno.jpg',
  },
  {
    id: 4,
    nombre: 'Perfilado de Barba',
    descripcion: 'Diseno y perfilado profesional para resaltar tu barba.',
    precio: '$20.000',
    imagen: '/imgs/perfilado-de-barba.jpg',
  },
  {
    id: 5,
    nombre: 'Corte + Barba',
    descripcion: 'El combo completo para un look impecable y bien cuidado.',
    precio: '$45.000',
    imagen: '/imgs/corte-barba.jpg',
  },
  {
    id: 6,
    nombre: 'Diseno de Cejas',
    descripcion: 'Perfiling y diseno de cejas para un acabado fino.',
    precio: '$15.000',
    imagen: '/imgs/diseno-de-cejas.jpg',
  },
  {
    id: 7,
    nombre: 'Afeitado Clasico',
    descripcion: 'Afeitado tradicional con navaja y toalla caliente.',
    precio: '$18.000',
    imagen: '/imgs/afeitado-clasico.jpg',
  },
  {
    id: 8,
    nombre: 'Tratamiento Capilar',
    descripcion: 'Hidratacion y tratamiento profundo para tu cabello.',
    precio: '$22.000',
    imagen: '/imgs/tratamiento-capilar.jpg',
  },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);

  const handleReservar = () => {
    navigate(user ? '/reservar' : '/register');
  };

  const totalCards = SERVICIOS_DESTACADOS.length;

  const nextCard = () => setActiveCard((prev) => (prev + 1) % totalCards);
  const prevCard = () => setActiveCard((prev) => (prev - 1 + totalCards) % totalCards);

  return (
    <div className="min-h-screen bg-barber-dark">

      {/* ====================================================
       * HERO SECTION
       * Seccion principal con imagen de fondo a pantalla
       * completa, titulo centrado, datos de contacto y
       * boton CTA. Fondo: fondoini.jpeg con overlay oscuro.
       * ==================================================== */}
      <section className="hero d-flex relative min-h-screen flex items-center overflow-hidden">

        {/* Fondo: imagen fija detras, video encima con fade-out al terminar */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale"
          style={{ backgroundImage: `url(${fondo2})` }}
        />
        <video
          autoPlay
          muted
          playsInline
          onEnded={() => setVideoEnded(true)}
          className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-1000 ${videoEnded ? 'opacity-0' : 'opacity-100'}`}
        >
          <source src="/imgs/fondoani.mp4" type="video/mp4" />
        </video>

        {/* Oscurecimiento de la imagen */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Contenido alineado a la izquierda del hero */}
        <div className="relative z-10 px-4 md:px-12 lg:px-20 max-w-3xl flex flex-col items-start justify-center min-h-screen">

          {/* Titulo principal */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            URBAN CUTS
          </h1>

          {/* Subtitulo con ubicacion */}
          <p className="text-gold text-xl md:text-2xl">
            Medellin
          </p>

          {/* Etiqueta de servicio */}
          <p className="text-cream/60 mt-4">
            Te mantemos con un look impecable
          </p>

          {/* Direccion */}
          <div className="flex items-center gap-2 mt-6 text-cream/50 text-sm">
            <FaMapMarkerAlt />
            <span>Medellin, Colombia</span>
          </div>

          {/* Telefono */}
          <div className="flex items-center gap-2 mt-2">
            <FaPhone className="text-gold" />
            <a
              href="tel:+573001234567"
              className="text-gold inline-flex items-center gap-2"
            >
              +57 300 123 4567
            </a>
          </div>

          {/* Boton CTA */}
          <button
            onClick={handleReservar}
            className="bg-gold text-barber-dark px-8 py-3  font-semibold text-sm uppercase tracking-wider hover:bg-gold-hover mt-8 transition-all duration-300"
          >
            Reservar Cita
          </button>
        </div>
      </section>

      {/* ====================================================
       * SECCION "SOBRE NOSOTROS"
       * Dos columnas en xl+: izquierda con titulo, derecha
       * con descripcion, estadisticas y enlace.
       * Fondo: barber-dark
       * ==================================================== */}
      <section className="about section--nopb bg-barber-dark py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="d-xl-flex justify-content-between flex flex-col xl:flex-row gap-12">

            {/* Columna izquierda: titulo con imagen de fondo */}
            <div className="xl:w-1/2 relative flex items-start justify-center pt-12 pb-8 overflow-hidden">
              <img
                src="/imgs/imglog.png"
                alt="Urban Cuts logo"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </div>

            {/* Columna derecha: descripcion, datos y boton */}
            <div className="xl:w-1/2">
              <p className="text-cream/50 text-base leading-relaxed mb-8">
                Somos un equipo de barberos apasionados por el arte del corte masculino.
                Con anos de experiencia y dedicacion, transformamos tu estilo con
                tecnicas de vanguardia y un ambiente que te hace sentir en casa.
                Cada visita es una experiencia unica pensada para resaltar tu personalidad.
              </p>

              {/* Estadisticas lado a lado */}
              <div className="d-sm-flex flex flex-col sm:flex-row gap-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-gold">
                    Desde 2020
                  </h3>
                  <p className="text-cream/40 text-sm mt-2">
                    Anos de experiencia brindando el mejor servicio
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-gold">
                    1000+ Clientes
                  </h3>
                  <p className="text-cream/40 text-sm mt-2">
                    Clientes satisfechos nos respaldan
                  </p>
                </div>
              </div>

              {/* Boton CTA */}
              <button
                onClick={() => navigate('/servicios')}
                className="bg-gold text-barber-dark px-6 py-2.5  text-xs uppercase tracking-widest font-semibold hover:bg-gold-hover mt-8 transition-all duration-300"
              >
                Conocer Mas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
       * SECCION "SERVICIOS"
       * Dos columnas: izquierda con carrusel 3D de tarjetas,
       * derecha con texto descriptivo y boton CTA.
       * Carousel controlado por React state, todas las tarjetas
       * siempre al derecho (sin rotateX).
       * Fondo: barber-carbon
       * ==================================================== */}
      <section className="services section bg-barber-carbon py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* IZQUIERDA: Carrusel 3D */}
            <div className="flex-shrink-0">
              <div className="carousel-3d">
                {SERVICIOS_DESTACADOS.map((servicio, index) => {
                  let className = 'carousel-3d-card';
                  const diff = index - activeCard;
                  const wrapped = ((diff % totalCards) + totalCards) % totalCards;

                  if (wrapped === 0) {
                    className += ' active';
                  } else if (wrapped === 1) {
                    className += ' behind-1';
                  } else if (wrapped === 2) {
                    className += ' behind-2';
                  } else {
                    className += ' behind-3';
                  }

                  return (
                    <div key={servicio.id} className={className}>
                      <img src={servicio.imagen} alt={servicio.nombre} className="carousel-3d-img" />
                      <span className="carousel-3d-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="carousel-3d-price">{servicio.precio}</span>
                      <div className="carousel-3d-line" />
                      <h3 className="carousel-3d-title">{servicio.nombre}</h3>
                      <p className="carousel-3d-desc">{servicio.descripcion}</p>
                    </div>
                  );
                })}

                {/* Navegacion */}
                <div className="carousel-3d-nav">
                  <button onClick={prevCard} className="carousel-3d-btn" aria-label="Anterior">
                    &#8592;
                  </button>
                  <span className="carousel-3d-counter">
                    {String(activeCard + 1).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}
                  </span>
                  <button onClick={nextCard} className="carousel-3d-btn" aria-label="Siguiente">
                    &#8594;
                  </button>
                </div>
              </div>
            </div>

            {/* DERECHA: Texto descriptivo */}
            <div className="flex-1 text-center lg:text-left mt-8 lg:mt-0">
              <span className="text-gold text-xs uppercase tracking-widest font-medium mb-3 block">
                Nuestros Servicios
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Lo que ofrecemos
              </h2>
              <p className="text-cream/50 text-base max-w-lg mb-8 leading-relaxed">
                Explora nuestra gama de servicios disenados para brindarte
                el mejor look con calidad y estilo. Haz click en las tarjetas para ver mas detalles.
              </p>
              <Link
                to="/servicios"
                className="inline-flex items-center gap-2 bg-gold text-barber-dark px-6 py-3 font-medium text-sm uppercase tracking-wider hover:bg-gold-light transition-colors"
              >
                Ver todos los servicios <FaArrowRight />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================
       * SECCION "HORARIO"
       * Dos columnas en xl+: izquierda con texto descriptivo,
       * derecha con horario en subcolumnas. Overlay oscuro.
       * Fondo: barber-dark con capa barber-carbon/80
       * ==================================================== */}
      <section className="schedule section bg-barber-dark py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-barber-carbon/80" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="d-xl-flex justify-content-between flex flex-col xl:flex-row gap-12">

            {/* Columna izquierda: texto descriptivo */}
            <div className="xl:w-1/2">
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                Nuestro equipo te espera
              </h2>
              <p className="text-cream/50 text-base leading-relaxed">
                Ven a visitarnos y disfruta de una experiencia de barberia
                de primer nivel. Nuestro equipo de profesionales esta listo
                para transformar tu estilo con la mejor atencion y los mas
                altos estandares de calidad.
              </p>
            </div>

            {/* Columna derecha: horario */}
            <div className="xl:w-1/2">
              <h2 className="font-display text-2xl font-bold text-white mb-6">
                Horario Especial
              </h2>

              {/* Subcolumnas de horario en md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna 1: dias laborales */}
                <div className="space-y-4">
                  <div>
                    <span className="text-white font-semibold">Lunes a Viernes</span>
                    <p className="text-cream/50 text-sm mt-1">9:00 AM - 7:30 PM</p>
                  </div>
                </div>

                {/* Columna 2: fin de semana */}
                <div className="space-y-4">
                  <div>
                    <span className="text-white font-semibold">Sabado</span>
                    <p className="text-cream/50 text-sm mt-1">9:00 AM - 5:00 PM</p>
                  </div>
                  <div>
                    <span className="text-white font-semibold">Domingo</span>
                    <p className="text-cream/50 text-sm mt-1">Cerrado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boton CTA centrado */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleReservar}
              className="bg-gold text-barber-dark px-8 py-3  font-semibold text-sm uppercase tracking-wider hover:bg-gold-hover transition-all duration-300"
            >
              Reservar Cita
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================
       * SECCION CTA FINAL
       * Ultimo llamado a la accion antes del footer.
       * Estilo simple con fondo de superficie y borde.
       * ==================================================== */}
      <section className="py-16 px-4">
        <div className="bg-barber-surface border border-barber-border mx-4 max-w-4xl text-center py-12 px-8">

          {/* Titulo principal del CTA */}
          <h2 className="font-display text-2xl font-bold text-white">
            Listo para un cambio?
          </h2>

          {/* Subtitulo */}
          <p className="text-cream/40 mt-2">
            Reserva tu cita ahora
          </p>

          {/* Boton CTA */}
          <button
            onClick={handleReservar}
            className="bg-gold text-barber-dark px-8 py-3  font-semibold text-sm uppercase tracking-wider hover:bg-gold-hover mt-6 transition-all duration-300"
          >
            Reservar Ahora
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;
