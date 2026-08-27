// ============================================================
// ARCHIVO: ThemeContext.js
// RESPONSABILIDAD: Context global para gestionar el tema
// Oscuro/Claro de toda la aplicacion. Permite conmutar
// entre modos y persistir la preferencia del usuario
// en localStorage.
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto del tema
const ThemeContext = createContext();

// Proveedor del tema - Envuelve toda la app
export const ThemeProvider = ({ children }) => {
  // Estado del tema: 'dark' o 'light'
  // Recuperar preferencia guardada o usar oscuro por defecto
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('barber-theme');
    return saved || 'dark';
  });

  // Efecto para aplicar la clase 'dark' en el elemento <html>
  // y persistir la preferencia en localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('bg-light-bg');
      root.classList.add('bg-barber-dark');
    } else {
      root.classList.remove('dark');
      root.classList.remove('bg-barber-dark');
      root.classList.add('bg-light-bg');
    }

    localStorage.setItem('barber-theme', theme);
  }, [theme]);

  // Funcion para alternar entre temas
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el tema en cualquier componente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};
