// ============================================================
// ARCHIVO: ThemeToggle.jsx
// RESPONSABILIDAD: Componente boton para alternar entre
// modo oscuro y claro. Muestra icono de sol/luna con
// animacion de rotacion al cambiar.
// ============================================================

import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 -full flex items-center justify-center
                 bg-barber-surface dark:bg-light-surface
                 hover:bg-neon-cyan/20 dark:hover:bg-neon-cyan/10
                 transition-all duration-300 group"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Cambiar tema"
    >
      {/* Icono de Sol (visible en modo oscuro) */}
      <svg
        className={`w-5 h-5 text-neon-orange transition-all duration-300
                   ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 scale-50'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Icono de Luna (visible en modo claro) */}
      <svg
        className={`w-5 h-5 text-neon-cyan absolute transition-all duration-300
                   ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Halo glow en hover */}
      <div className="absolute inset-0 -full opacity-0 group-hover:opacity-100
                      transition-opacity duration-300
                      shadow-neon-cyan dark:shadow-neon-cyan" />
    </button>
  );
};

export default ThemeToggle;
