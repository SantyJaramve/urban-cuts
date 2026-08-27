// ============================================================
// ARCHIVO: Navbar.jsx
// RESPONSABILIDAD: Barra de navegacion principal de la aplicacion.
// Muestra logo con icono de tijera, links de navegacion segun
// el rol del usuario, toggle de tema y botones de autenticacion.
// Estilo elegante oscuro con acentos dorados (BarberCrop).
// Responsive: menu hamburguesa en dispositivos moviles.
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCut, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  // Obtiene el usuario autenticado y la funcion de logout
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Estado para controlar la apertura del menu movil
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra sesion y redirige al inicio
  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Navega a la ruta indicada y cierra el menu movil
  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  // Define los links de navegacion disponibles segun el rol del usuario
  const navLinks = [
    { to: '/servicios', label: 'Servicios', show: true },
    { to: '/reservar', label: 'Reservar', show: !!user },
    { to: '/mis-citas', label: 'Mis Citas', show: !!user },
    { to: '/barbero', label: 'Mi Agenda', show: user && (user.nombre_rol === 'barbero' || user.nombre_rol === 'administrador') },
    { to: '/admin', label: 'Admin', show: user && user.nombre_rol === 'administrador' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-barber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo: imagen logo.png */}
          <Link to="/" className="flex items-center group">
            <img src="/imgs/logo.png" alt="Urban Cuts" className="h-14 md:h-16" />
          </Link>

          {/* Links de navegacion - Visible solo en desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.filter(link => link.show).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-light text-cream/70 hover:text-gold transition-colors duration-300 tracking-widest uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Seccion derecha: botones de autenticacion */}
          <div className="flex items-center gap-4">
            {/* Cuando el usuario esta autenticado */}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-light text-cream/60">
                  Hola, {user.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-light 
                           text-gold border border-gold/30
                           hover:bg-gold-muted hover:border-gold/50 transition-all duration-300"
                >
                  <FaSignOutAlt /> Salir
                </button>
              </div>
            ) : (
              /* Cuando el usuario no esta autenticado */
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-light text-gold hover:text-gold-light transition-colors duration-300"
                >
                  Iniciar Sesion
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-5 py-2 text-sm font-medium  bg-gold text-barber-dark
                           hover:bg-gold-hover transition-colors duration-300"
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Boton hamburguesa para abrir/cerrar menu movil */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2  text-cream/70 hover:text-gold hover:bg-barber-surface transition-colors duration-300"
              aria-label="Menu de navegacion"
            >
              {menuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Panel del menu movil desplegable */}
        {menuOpen && (
          <div className="md:hidden pb-6 border-t border-barber-border animate-fade-in">
            {/* Links de navegacion movil */}
            <div className="pt-4 space-y-1">
              {navLinks.filter(link => link.show).map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNav(link.to)}
                  className="block w-full text-left px-4 py-3 text-sm font-light text-cream/70
                           hover:text-gold hover:bg-barber-surface  transition-colors duration-300 tracking-widest uppercase"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Separador visual */}
            <hr className="my-4 border-barber-border" />

            {/* Seccion de autenticacion movil */}
            {user ? (
              <div className="space-y-2 px-4">
                <p className="text-sm font-light text-cream/50">
                  Sesion: {user.nombre}
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm font-light
                           text-gold hover:bg-gold-muted  transition-colors duration-300"
                >
                  <FaSignOutAlt /> Cerrar Sesion
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <button
                  onClick={() => handleNav('/login')}
                  className="block w-full text-left px-4 py-3 text-sm font-light
                           text-cream/70 hover:text-gold hover:bg-barber-surface  transition-colors duration-300"
                >
                  Iniciar Sesion
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="block w-full px-4 py-3 text-sm font-medium 
                           bg-gold text-barber-dark hover:bg-gold-hover transition-colors duration-300"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
