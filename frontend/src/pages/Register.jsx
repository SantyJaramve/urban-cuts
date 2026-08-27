// ============================================================
// ARCHIVO: Register.jsx
// RESPONSABILIDAD: Pagina de registro de nuevos usuarios.
// Formulario con validaciones en tiempo real para nombre,
// apellido, correo, telefono y contrasena.
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCut, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';

const InputField = ({ icon: Icon, label, type, name, placeholder, optional, value, errors, onChange }) => (
  <div>
    <label className="block text-cream/60 text-sm mb-1.5">
      {label} {optional && <span className="text-cream/40">(opcional)</span>}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-cream/30">
        <Icon />
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 bg-barber-carbon
                  border text-white text-sm placeholder-cream/30
                  focus:outline-none focus:ring-2 focus:ring-gold/50
                  focus:border-gold
                  ${errors[name]
                    ? 'border-red-500'
                    : 'border-barber-muted'}`}
      />
    </div>
    {errors[name] && (
      <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
    )}
  </div>
);

const Register = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'Minimo 2 caracteres';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = 'Minimo 2 caracteres';
    }

    if (!formData.correo) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo invalido';
    }

    if (formData.telefono && !/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de telefono invalido';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contrasena es obligatoria';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'Minimo 6 caracteres';
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contrasenas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        nombre:     formData.nombre.trim(),
        apellido:   formData.apellido.trim(),
        correo:     formData.correo.trim(),
        telefono:   formData.telefono.trim() || null,
        contrasena: formData.contrasena,
        id_rol:     3,
      });

      toast.success('Cuenta creada exitosamente');

      await login(formData.correo.trim(), formData.contrasena);
      navigate('/reservar');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la cuenta');
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
              Crear Cuenta
            </h1>
            <p className="text-cream/40 text-sm text-center mb-8 mt-2">
              Unete a nuestra barberia
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={FaUser}
                label="Nombre"
                type="text"
                name="nombre"
                placeholder="Juan"
                value={formData.nombre}
                errors={errors}
                onChange={handleChange}
              />
              <InputField
                icon={FaUser}
                label="Apellido"
                type="text"
                name="apellido"
                placeholder="Perez"
                value={formData.apellido}
                errors={errors}
                onChange={handleChange}
              />
            </div>

            <InputField
              icon={FaEnvelope}
              label="Correo Electronico"
              type="email"
              name="correo"
              placeholder="tu@correo.com"
              value={formData.correo}
              errors={errors}
              onChange={handleChange}
            />

            <InputField
              icon={FaPhone}
              label="Telefono"
              type="tel"
              name="telefono"
              placeholder="300 123 4567"
              optional
              value={formData.telefono}
              errors={errors}
              onChange={handleChange}
            />

            <InputField
              icon={FaLock}
              label="Contrasena"
              type="password"
              name="contrasena"
              placeholder="Minimo 6 caracteres"
              value={formData.contrasena}
              errors={errors}
              onChange={handleChange}
            />

            <InputField
              icon={FaLock}
              label="Confirmar Contrasena"
              type="password"
              name="confirmarContrasena"
              placeholder="Repite tu contrasena"
              value={formData.confirmarContrasena}
              errors={errors}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold text-sm uppercase tracking-wider
                       bg-gold text-barber-dark
                       hover:bg-gold-hover
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors mt-6"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-cream/40 text-sm">
          Ya tienes cuenta?{' '}
          <Link to="/login"
            className="text-gold hover:text-gold-hover font-medium transition-colors">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
