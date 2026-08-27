// ============================================================
// ARCHIVO: AuthContext.js
// RESPONSABILIDAD: Context global para gestionar la
// autenticacion del usuario. Almacena el token JWT,
// datos del usuario y funciones de login/logout.
// Persiste la sesion en localStorage.
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('barber-token'));
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar la app
  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/profile');
        setUser(response.data.data);
      } catch (error) {
        // Token invalido o expirado
        localStorage.removeItem('barber-token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    verificarToken();
  }, []);

  // Funcion de login
  const login = async (correo, contrasena) => {
    const response = await api.post('/auth/login', { correo, contrasena });
    const { usuario, token: newToken } = response.data.data;

    localStorage.setItem('barber-token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    setToken(newToken);
    setUser(usuario);

    return usuario;
  };

  // Funcion de registro
  const register = async (datos) => {
    const response = await api.post('/auth/register', datos);
    return response.data.data;
  };

  // Funcion de logout
  const logout = () => {
    localStorage.removeItem('barber-token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar auth en cualquier componente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
