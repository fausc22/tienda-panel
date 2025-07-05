// components/pagina/EstadisticasPagina.jsx - Componente de estadísticas de la página
import { 
  TagIcon,
  StarIcon,
  PhotoIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function EstadisticasPagina({
  totalOfertas,
  totalDestacados,
  totalImagenes,
  estadoConfiguracion
}) {
  
  // Obtener color del estado de configuración
  const getEstadoColor = () => {
    switch (estadoConfiguracion) {
      case 'Configurado':
        return 'text-green-600 bg-green-100';
      case 'Pendiente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtener ícono del estado
  const getEstadoIcon = () => {
    switch (estadoConfiguracion) {
      case 'Configurado':
        return '✓';
      case 'Pendiente':
        return '⏳';
      default:
        return '?';
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
        Resumen del Estado
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Productos en Oferta */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <TagIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{totalOfertas}</p>
              <p className="text-xs text-red-800">Ofertas Activas</p>
            </div>
          </div>
        </div>

        {/* Productos Destacados */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <StarIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{totalDestacados}</p>
              <p className="text-xs text-yellow-800">Destacados</p>
            </div>
          </div>
        </div>

        {/* Imágenes de Publicidad */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <PhotoIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalImagenes}</p>
              <p className="text-xs text-blue-800">Imágenes</p>
            </div>
          </div>
        </div>

        {/* Estado de Configuración */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <CogIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor()}`}>
                <span className="mr-1">{getEstadoIcon()}</span>
                {estadoConfiguracion}
              </div>
              <p className="text-xs text-gray-600 mt-1">Configuración</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores adicionales */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Estado General de la Tienda</p>
            <p className="text-xs text-gray-600">
              {totalOfertas > 0 && totalDestacados > 0 && totalImagenes > 0 && estadoConfiguracion === 'Configurado'
                ? 'Su tienda está completamente configurada y lista para funcionar'
                : 'Complete la configuración para optimizar su tienda online'
              }
            </p>
          </div>
          <div className="text-right">
            {totalOfertas > 0 && totalDestacados > 0 && totalImagenes > 0 && estadoConfiguracion === 'Configurado' ? (
              <div className="flex items-center text-green-600">
                <span className="text-2xl mr-1">🎉</span>
                <span className="text-sm font-medium">¡Excelente!</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <span className="text-2xl mr-1">⚡</span>
                <span className="text-sm font-medium">En Progreso</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}