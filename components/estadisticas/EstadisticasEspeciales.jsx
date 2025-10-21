import { useState } from 'react';
import {
  ShoppingBagIcon,
  TagIcon,
  FireIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function EstadisticasProductosEspeciales({ estadisticas, loading }) {
  const [vistaActiva, setVistaActiva] = useState('resumen');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!estadisticas?.productos_especiales) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hay datos de productos especiales disponibles</p>
        </div>
      </div>
    );
  }

  const { productos_especiales } = estadisticas;
  const { resumen, ofertas, destacados, liquidacion } = productos_especiales;

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

  const getColorPorcentaje = (porcentaje) => {
    if (porcentaje >= 30) return 'text-green-600';
    if (porcentaje >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const TarjetaCategoria = ({ categoria, datos, color, icono }) => {
    const porcentajeDelTotal = resumen.total_vendido > 0 
      ? ((datos.total_vendido / resumen.total_vendido) * 100).toFixed(1)
      : 0;

    return (
      <div className={`bg-white rounded-lg shadow-lg border-l-4 ${color} p-6 hover:shadow-xl transition-all duration-200`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('border', 'bg')}`}>
            {icono}
          </div>
          <div className={`text-2xl font-bold ${getColorPorcentaje(parseFloat(porcentajeDelTotal))}`}>
            {porcentajeDelTotal}%
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
          {categoria}
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Productos activos:</span>
            <span className="font-semibold text-gray-900">{datos.cantidad_productos}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Unidades vendidas:</span>
            <span className="font-semibold text-blue-600">{formatearNumero(datos.total_vendido)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ingresos generados:</span>
            <span className="font-semibold text-green-600">{formatearMoneda(datos.ingresos)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-gray-600">Ticket promedio:</span>
            <span className="font-semibold text-gray-900">{formatearMoneda(datos.ticket_promedio)}</span>
          </div>
        </div>

        {datos.total_vendido === 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              No se han registrado ventas. Considera revisar la estrategia.
            </p>
          </div>
        )}
      </div>
    );
  };

  const TablaProductos = ({ productos, titulo, colorHeader }) => {
    if (!productos || productos.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
          <div className="text-center text-gray-500 py-8">
            <p>No hay productos en esta categoría</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`${colorHeader} p-4`}>
          <h3 className="text-lg font-semibold text-white">{titulo}</h3>
          <p className="text-sm text-white opacity-75">{productos.length} productos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Vendido</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Conversión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.map((producto, index) => {
                const tasaConversion = producto.stock > 0 
                  ? ((producto.total_vendido / (producto.stock + producto.total_vendido)) * 100).toFixed(1)
                  : producto.total_vendido > 0 ? 100 : 0;

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate" title={producto.nombre}>
                          {producto.nombre}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{producto.codigo_barra}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        producto.stock === 0 ? 'bg-red-100 text-red-800' :
                        producto.stock <= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-blue-600">
                        {formatearNumero(producto.total_vendido)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-green-600">
                        {formatearMoneda(producto.ingresos)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className={`font-semibold ${getColorPorcentaje(parseFloat(tasaConversion))}`}>
                          {tasaConversion}%
                        </span>
                        {parseFloat(tasaConversion) > 50 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                        ) : parseFloat(tasaConversion) > 0 ? (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-yellow-500" />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Productos Especiales</h2>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setVistaActiva('resumen')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                vistaActiva === 'resumen'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setVistaActiva('detalle')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                vistaActiva === 'detalle'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Detalle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-purple-50 rounded-lg">
          <div>
            <span className="text-sm text-purple-600 font-medium">Total Productos</span>
            <div className="text-2xl font-bold text-purple-900">{resumen.total_productos}</div>
          </div>
          <div>
            <span className="text-sm text-purple-600 font-medium">Total Vendido</span>
            <div className="text-2xl font-bold text-purple-900">{formatearNumero(resumen.total_vendido)}</div>
          </div>
          <div>
            <span className="text-sm text-purple-600 font-medium">Ingresos Totales</span>
            <div className="text-2xl font-bold text-purple-900">{formatearMoneda(resumen.ingresos_totales)}</div>
          </div>
          <div>
            <span className="text-sm text-purple-600 font-medium">% del Total</span>
            <div className={`text-2xl font-bold ${getColorPorcentaje(resumen.porcentaje_del_total)}`}>
              {resumen.porcentaje_del_total}%
            </div>
          </div>
        </div>
      </div>

      {vistaActiva === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TarjetaCategoria
            categoria="ofertas"
            datos={ofertas}
            color="border-orange-500"
            icono={<TagIcon className="h-6 w-6 text-orange-600" />}
          />
          <TarjetaCategoria
            categoria="destacados"
            datos={destacados}
            color="border-blue-500"
            icono={<SparklesIcon className="h-6 w-6 text-blue-600" />}
          />
          <TarjetaCategoria
            categoria="liquidación"
            datos={liquidacion}
            color="border-red-500"
            icono={<FireIcon className="h-6 w-6 text-red-600" />}
          />
        </div>
      )}

      {vistaActiva === 'detalle' && (
        <div className="space-y-6">
          <TablaProductos
            productos={ofertas.productos}
            titulo="Productos en Oferta"
            colorHeader="bg-orange-600"
          />
          <TablaProductos
            productos={destacados.productos}
            titulo="Productos Destacados"
            colorHeader="bg-blue-600"
          />
          <TablaProductos
            productos={liquidacion.productos}
            titulo="Productos en Liquidación"
            colorHeader="bg-red-600"
          />
        </div>
      )}

      
    </div>
  );
}