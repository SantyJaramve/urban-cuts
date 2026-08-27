// ============================================================
// ARCHIVO: Login.jsx
// RESPONSABILIDAD: Pagina de inicio de sesion. Formulario
// con validacion de correo y contrasena. Redirige segun
// el rol del usuario al iniciar sesion exitosamente.
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCut, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.correo) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo invalido';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contrasena es obligatoria';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'Minimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const usuario = await login(formData.correo, formData.contrasena);
      toast.success(`Bienvenido, ${usuario.nombre}!`);

      if (usuario.nombre_rol === 'administrador') {
        navigate('/admin');
      } else if (usuario.nombre_rol === 'barbero') {
        navigate('/barbero');
      } else {
        navigate('/reservar');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-barber-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-barber-surface border border-barber-border p-8">

          <div className="text-center mb-8">
            <FaCut className="text-gold text-4xl mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-white text-center">
              Iniciar Sesion
            </h1>
            <p className="text-cream/40 text-sm text-center mb-8 mt-2">
              Accede a tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-cream/60 text-sm mb-1.5">
                Correo Electronico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-cream/30">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  className={`w-full pl-10 pr-4 py-3 bg-barber-carbon
                            border text-white text-sm placeholder-cream/30
                            focus:outline-none focus:ring-2 focus:ring-gold/50
                            focus:border-gold transition-colors
                            ${errors.correo
                              ? 'border-red-500'
                              : 'border-barber-muted'}`}
                />
              </div>
              {errors.correo && (
                <p className="text-red-400 text-xs mt-1">{errors.correo}</p>
              )}
            </div>

            <div>
              <label className="block text-cream/60 text-sm mb-1.5">
                Contrasena
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-cream/30">
                  <FaLock />
                </span>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="Minimo 6 caracteres"
                  className={`w-full pl-10 pr-4 py-3 bg-barber-carbon
                            border text-white text-sm placeholder-cream/30
                            focus:outline-none focus:ring-2 focus:ring-gold/50
                            focus:border-gold transition-colors
                            ${errors.contrasena
                              ? 'border-red-500'
                              : 'border-barber-muted'}`}
                />
              </div>
              {errors.contrasena && (
                <p className="text-red-400 text-xs mt-1">{errors.contrasena}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold text-sm uppercase tracking-wider
                       bg-gold text-barber-dark
                       hover:bg-gold-hover
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors mt-6"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesion'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-cream/40 text-sm">
          No tienes cuenta?{' '}
          <Link to="/register"
            className="text-gold hover:text-gold-hover font-medium transition-colors">
            Registrate aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
