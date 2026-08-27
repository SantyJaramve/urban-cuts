import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import BarberDashboard from './pages/BarberDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-barber-dark">
      <div className="w-48 h-8  bg-barber-surface animate-pulse"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.nombre_rol)) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <div className="min-h-screen bg-barber-dark text-white flex flex-col">
      <Navbar />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1C1C1C',
            color: '#fff',
            border: '1px solid #333',
          },
          success: {
            iconTheme: { primary: '#DC143C', secondary: '#1C1C1C' },
          },
          error: {
            iconTheme: { primary: '#D44', secondary: '#1C1C1C' },
          },
        }}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/reservar" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/mis-citas" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/barbero" element={<ProtectedRoute roles={['barbero', 'administrador']}><BarberDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['administrador']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
