// components/estadisticas/TarjetasMetricas.jsx - Tarjetas de métricas principales
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export default function TarjetasMetricas({ 
  estadisticas, 
  loading, 
  mostrarComparacion = false,
  comparacion = null 
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!estadisticas || !estadisticas.resumen) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hay datos disponibles para mostrar</p>
        </div>
      </div>
    );
  }

  const { resumen } = estadisticas;

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const formatearNumero = (valor) => {
    return new Intl.NumberFormat('es-AR').format(valor || 0);
  };

  const obtenerCambio = (metrica) => {
    if (!mostrarComparacion || !comparacion || !comparacion.cambios) return null;
    return comparacion.cambios[metrica];
  };

  const TarjetaCambio = ({ cambio }) => {
    if (!cambio && cambio !== 0) return null;
    
    const esPositivo = cambio > 0;
    const esNeutro = cambio === 0;
    
    if (esNeutro) {
      return (
        <div className="text-xs font-medium text-gray-600 flex items-center mt-1">
          <span className="mr-1">→</span>
          <span>Sin cambios</span>
        </div>
      );
    }
    
    return (
      <div className={`text-xs font-medium flex items-center mt-1 ${
        esPositivo ? 'text-green-600' : 'text-red-600'
      }`}>
        {esPositivo ? (
          <ArrowUpIcon className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDownIcon className="h-3 w-3 mr-1" />
        )}
        <span>{Math.abs(cambio).toFixed(1)}%</span>
      </div>
    );
  };

  const metricas = [
    {
      titulo: 'Ingresos Totales',
      valor: formatearMoneda(resumen.ingresos_totales),
      icono: CurrencyDollarIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      cambio: obtenerCambio('ingresos')
    },
    {
      titulo: 'Ganancias Totales',
      valor: formatearMoneda(resumen.ganancias_totales),
      icono: ChartBarIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      cambio: obtenerCambio('ganancias_totales')
    },
    {
      titulo: 'Pedidos Totales',
      valor: formatearNumero(resumen.pedidos_totales),
      icono: ShoppingCartIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      cambio: obtenerCambio('pedidos')
    },
    {
      titulo: 'Ticket Promedio',
      valor: formatearMoneda(resumen.ticket_promedio),
      icono: ChartBarIcon,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      cambio: obtenerCambio('ticket_promedio')
    }
  ];

  // Métricas adicionales si hay datos suficientes
  const metricasAdicionales = [];
  
  if (resumen.productos_vendidos > 0) {
    metricasAdicionales.push({
      titulo: 'Productos Vendidos',
      valor: formatearNumero(resumen.productos_vendidos),
      icono: ShoppingCartIcon,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      cambio: obtenerCambio('productos_vendidos')
    });
  }

  if (resumen.margen_ganancia_promedio > 0) {
    metricasAdicionales.push({
      titulo: 'Margen Promedio',
      valor: `${resumen.margen_ganancia_promedio}%`,
      icono: ChartBarIcon,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    });
  }

  if (resumen.productos_por_pedido > 0) {
    metricasAdicionales.push({
      titulo: 'Productos por Pedido',
      valor: resumen.productos_por_pedido,
      icono: ChartBarIcon,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    });
  }

  return (
    <div className="mb-8">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metricas.map((metrica, index) => {
          const IconComponent = metrica.icono;
          
          return (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-lg border-l-4 ${metrica.borderColor} hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg ${metrica.bgColor} mr-3`}>
                        <IconComponent className={`h-5 w-5 ${metrica.textColor}`} />
                      </div>
                      <h3 className="text-sm font-medium text-gray-600">{metrica.titulo}</h3>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <p className={`text-2xl font-bold ${metrica.textColor}`}>
                        {metrica.valor}
                      </p>
                    </div>
                    
                    <TarjetaCambio cambio={metrica.cambio} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Métricas adicionales si las hay */}
      {metricasAdicionales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {metricasAdicionales.map((metrica, index) => {
            const IconComponent = metrica.icono;
            
            return (
              <div 
                key={index} 
                className={`bg-white rounded-lg shadow-lg border-l-4 ${metrica.borderColor} hover:shadow-xl transition-all duration-200`}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${metrica.bgColor} mr-3`}>
                      <IconComponent className={`h-5 w-5 ${metrica.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-600">{metrica.titulo}</h3>
                      <p className={`text-xl font-bold ${metrica.textColor}`}>
                        {metrica.valor}
                      </p>
                      <TarjetaCambio cambio={metrica.cambio} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Información del período */}
      {estadisticas.periodo && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              <span>
                Período analizado: {' '}
                <span className="font-medium">
                  {new Date(estadisticas.periodo.fecha_inicio).toLocaleDateString('es-ES')} 
                  {' - '}
                  {new Date(estadisticas.periodo.fecha_fin).toLocaleDateString('es-ES')}
                </span>
              </span>
            </div>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {estadisticas.periodo.dias_analizados} días
            </span>
          </div>
        </div>
      )}

      {/* Información de comparación */}
      {mostrarComparacion && comparacion && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Comparación con período anterior
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded p-3 border border-blue-100">
              <span className="text-blue-600 font-medium">Período 1 (Actual):</span>
              <div className="font-medium text-gray-800">
                {new Date(comparacion.periodo1.fechaInicio).toLocaleDateString('es-ES')} - {' '}
                {new Date(comparacion.periodo1.fechaFin).toLocaleDateString('es-ES')}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {comparacion.periodo1.diasAnalizados} días
              </div>
            </div>
            <div className="bg-white rounded p-3 border border-blue-100">
              <span className="text-blue-600 font-medium">Período 2 (Anterior):</span>
              <div className="font-medium text-gray-800">
                {new Date(comparacion.periodo2.fechaInicio).toLocaleDateString('es-ES')} - {' '}
                {new Date(comparacion.periodo2.fechaFin).toLocaleDateString('es-ES')}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {comparacion.periodo2.diasAnalizados} días
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}