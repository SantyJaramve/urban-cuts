// ============================================================
// ARCHIVO: Footer.jsx
// RESPONSABILIDAD: Pie de pagina de la aplicacion Barberia.
// Estructura BarberCrop: logo, contactos, newsletter y
// copyright. Estilo elegante oscuro con acentos dorados.
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCut, FaPhone, FaMapMarkerAlt, FaEnvelope, FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  /* Estado para el campo de email del newsletter */
  const [email, setEmail] = useState('');

  /* Maneja el envio del formulario de newsletter */
  const handleSubscribe = (e) => {
    e.preventDefault();
    /* TODO: Implementar logica de suscripcion al newsletter */
    console.log('Newsletter suscrito:', email);
    setEmail('');
  };

  return (
    <footer className="bg-barber-carbon border-t border-barber-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:flex-wrap justify-between gap-8">

          {/* ========== LOGO ========== */}
          <div className="lg:w-auto">
            <Link to="/" className="flex items-center gap-3">
              <span className="font-display text-xl text-gold tracking-wide">
                URBAN CUTS
              </span>
            </Link>
          </div>

          {/* ========== WRAPPER: CONTACTOS + NEWSLETTER ========== */}
          <div className="flex-1 flex flex-col md:flex-row justify-between gap-8">

            {/* Contactos */}
            <div className="xl:w-1/3 space-y-4">
              <a
                href="tel:+5741234567"
                className="flex items-center gap-3 text-cream/50 text-sm hover:text-gold transition-colors duration-300"
              >
                <FaPhone className="text-gold" />
                +57 (4) 123-4567
              </a>
              <div className="flex items-start gap-3 text-cream/50 text-sm">
                <FaMapMarkerAlt className="text-gold mt-0.5 shrink-0" />
                <span>Cra 45 #67-12, Medellin, Colombia</span>
              </div>
              <a
                href="mailto:info@urbancuts.com"
                className="flex items-center gap-3 text-cream/50 text-sm hover:text-gold transition-colors duration-300"
              >
                <FaEnvelope className="text-gold" />
                info@urbancuts.com
              </a>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-barber-border w-8 h-8 flex items-center justify-center text-cream/40 hover:border-gold/50 hover:text-gold transition-all duration-300"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="text-xs" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-barber-border w-8 h-8 flex items-center justify-center text-cream/40 hover:border-gold/50 hover:text-gold transition-all duration-300"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-xs" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-barber-border w-8 h-8 flex items-center justify-center text-cream/40 hover:border-gold/50 hover:text-gold transition-all duration-300"
                  aria-label="Twitter"
                >
                  <FaTwitter className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ========== COPYRIGHT ========== */}
        <div className="border-t border-barber-border pt-6 mt-8">
          <p className="text-cream/30 text-xs">
            Urban Cuts Barberia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
