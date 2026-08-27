// ============================================================
// ARCHIVO: Modal.jsx
// RESPONSABILIDAD: Componente modal reutilizable para
// confirmaciones, formularios y contenido dinamico.
// Incluye overlay, animacion de entrada/salida y boton
// de cerrar. Se cierra con Escape o click fuera.
// ============================================================

import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef(null);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Bloquear scroll del body
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tamaños del modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay oscuro con animacion */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Contenido del modal */}
      <div
        ref={modalRef}
        className={`relative ${sizeClasses[size]} w-full bg-barber-surface dark:bg-white
                   shadow-2xl border border-barber-muted dark:border-light-muted
                   animate-slide-up`}
      >
        {/* Header con titulo y boton cerrar */}
        <div className="flex items-center justify-between px-6 py-4 border-b
                      border-barber-muted dark:border-light-muted">
          <h3 className="text-lg font-semibold text-white dark:text-gray-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white
                     hover:bg-barber-muted dark:hover:bg-light-muted transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body del modal */}
        <div className="px-6 py-4 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
