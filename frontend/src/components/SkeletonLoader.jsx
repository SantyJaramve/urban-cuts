// ============================================================
// ARCHIVO: SkeletonLoader.jsx
// RESPONSABILIDAD: Componente de carga (skeleton) que muestra
// placeholders animados mientras se cargan datos.
// Mejora la experiencia visual durante estados de loading.
// ============================================================

// Skeleton para tarjetas de servicios
export const ServiceCardSkeleton = () => (
  <div className="bg-barber-surface dark:bg-white p-6 border
                border-barber-muted dark:border-light-muted">
    <div className="skeleton h-40 mb-4"></div>
    <div className="skeleton h-6 w-3/4  mb-2"></div>
    <div className="skeleton h-4 w-full  mb-4"></div>
    <div className="skeleton h-8 w-1/3 "></div>
  </div>
);

// Skeleton para tarjetas de barberos
export const BarberCardSkeleton = () => (
  <div className="bg-barber-surface dark:bg-white p-6 border
                border-barber-muted dark:border-light-muted">
    <div className="flex items-center gap-4">
      <div className="skeleton w-16 h-16 -full"></div>
      <div className="flex-1">
        <div className="skeleton h-5 w-1/2  mb-2"></div>
        <div className="skeleton h-4 w-3/4 "></div>
      </div>
    </div>
  </div>
);

// Skeleton para filas de tabla
export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex gap-4 p-4 border-b border-barber-muted dark:border-light-muted">
    {Array.from({ length: columns }).map((_, i) => (
      <div key={i} className="skeleton h-5 flex-1 "></div>
    ))}
  </div>
);

// Skeleton generico de pagina completa
export const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="skeleton h-8 w-1/3 "></div>
    <div className="skeleton h-4 w-2/3 "></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
    </div>
  </div>
);

export default { ServiceCardSkeleton, BarberCardSkeleton, TableRowSkeleton, PageSkeleton };
