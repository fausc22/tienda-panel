// components/estadisticas/TablasEstadisticas.jsx - Tablas de rankings y datos detallados
import { useState } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  TrophyIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function TablasEstadisticas({ estadisticas, loading }) {
  const [seccionExpandida, setSeccionExpandida] = useState('productos');

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!estadisticas || !estadisticas.rankings) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <p>No hay datos de rankings disponibles</p>
        </div>
      </div>
    );
  }

  const { rankings, inventario } = estadisticas;

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

  const toggleSeccion = (seccion) => {
    setSeccionExpandida(seccionExpandida === seccion ? null : seccion);
  };

  const TablaExpandible = ({ 
    id, 
    titulo, 
    icono: IconComponent, 
    color, 
    datos, 
    columnas,
    expandida,
    onToggle 
  }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div 
        className={`${color} p-4 cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            <IconComponent className="h-6 w-6 mr-3" />
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <span className="ml-2 text-sm opacity-75">({datos.length} elementos)</span>
          </div>
          {expandida ? (
            <ChevronUpIcon className="h-5 w-5 text-white" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
      
      {expandida && (
        <div className="p-6">
          {datos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">#</th>
                    {columnas.map((columna, index) => (
                      <th key={index} className={`py-2 px-3 font-medium text-gray-600 ${columna.align || 'text-left'}`}>
                        {columna.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-500 font-medium">
                        {index < 3 ? (
                          <div className="flex items-center">
                            <TrophyIcon className={`h-4 w-4 mr-1 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-400'
                            }`} />
                            {index + 1}
                          </div>
                        ) : (
                          index + 1
                        )}
                      </td>
                      {columnas.map((columna, colIndex) => (
                        <td key={colIndex} className={`py-3 px-3 ${columna.align || 'text-left'}`}>
                          {columna.render ? columna.render(item) : item[columna.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No hay datos disponibles para mostrar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Productos más vendidos */}
      <TablaExpandible
        id="productos"
        titulo="Productos Más Vendidos"
        icono={ShoppingBagIcon}
        color="bg-blue-600"
        datos={rankings.productos_mas_vendidos || []}
        expandida={seccionExpandida === 'productos'}
        onToggle={toggleSeccion}
        columnas={[
          {
            key: 'nombre_producto',
            label: 'Producto',
            render: (item) => (
              <div className="max-w-xs">
                <div className="font-medium text-gray-900 truncate" title={item.nombre_producto}>
                  {item.nombre_producto}
                </div>
              </div>
            )
          },
          {
            key: 'total_vendido',
            label: 'Cantidad',
            align: 'text-center',
            render: (item) => (
              <span className="font-semibold text-blue-600">
                {formatearNumero(item.total_vendido)}
              </span>
            )
          },
          {
            key: 'ingresos_producto',
            label: 'Ingresos',
            align: 'text-right',
            render: (item) => (
              <span className="font-semibold text-green-600">
                {formatearMoneda(item.ingresos_producto)}
              </span>
            )
          },
          {
            key: 'pedidos_con_producto',
            label: 'Pedidos',
            align: 'text-center',
            render: (item) => formatearNumero(item.pedidos_con_producto || 0)
          }
        ]}
      />

      {/* Categorías más vendidas */}
      <TablaExpandible
        id="categorias"
        titulo="Categorías Más Vendidas"
        icono={TagIcon}
        color="bg-green-600"
        datos={rankings.categorias_mas_vendidas || []}
        expandida={seccionExpandida === 'categorias'}
        onToggle={toggleSeccion}
        columnas={[
          {
            key: 'categoria',
            label: 'Categoría',
            render: (item) => (
              <div className="font-medium text-gray-900">
                {item.categoria || 'Sin categoría'}
              </div>
            )
          },
          {
            key: 'total_vendido',
            label: 'Cantidad',
            align: 'text-center',
            render: (item) => (
              <span className="font-semibold text-green-600">
                {formatearNumero(item.total_vendido)}
              </span>
            )
          },
          {
            key: 'ingresos_categoria',
            label: 'Ingresos',
            align: 'text-right',
            render: (item) => (
              <span className="font-semibold text-green-600">
                {formatearMoneda(item.ingresos_categoria)}
              </span>
            )
          },
          {
            key: 'productos_distintos',
            label: 'Productos Únicos',
            align: 'text-center',
            render: (item) => formatearNumero(item.productos_distintos || 0)
          }
        ]}
      />

      {/* Top clientes */}
      {rankings.clientes_top && rankings.clientes_top.length > 0 && (
        <TablaExpandible
          id="clientes"
          titulo="Mejores Clientes"
          icono={UsersIcon}
          color="bg-purple-600"
          datos={rankings.clientes_top}
          expandida={seccionExpandida === 'clientes'}
          onToggle={toggleSeccion}
          columnas={[
            {
              key: 'cliente',
              label: 'Cliente',
              render: (item) => (
                <div>
                  <div className="font-medium text-gray-900">{item.cliente}</div>
                  <div className="text-xs text-gray-500">{item.email_cliente}</div>
                </div>
              )
            },
            {
              key: 'total_pedidos',
              label: 'Pedidos',
              align: 'text-center',
              render: (item) => (
                <span className="font-semibold text-purple-600">
                  {formatearNumero(item.total_pedidos)}
                </span>
              )
            },
            {
              key: 'total_gastado',
              label: 'Total Gastado',
              align: 'text-right',
              render: (item) => (
                <span className="font-semibold text-green-600">
                  {formatearMoneda(item.total_gastado)}
                </span>
              )
            },
            {
              key: 'ticket_promedio_cliente',
              label: 'Ticket Promedio',
              align: 'text-right',
              render: (item) => formatearMoneda(item.ticket_promedio_cliente)
            },
            {
              key: 'ultima_compra',
              label: 'Última Compra',
              align: 'text-center',
              render: (item) => {
                const fecha = new Date(item.ultima_compra);
                return fecha.toLocaleDateString('es-ES');
              }
            }
          ]}
        />
      )}

      {/* Productos con stock bajo */}
      {inventario && inventario.productos_stock_bajo && inventario.productos_stock_bajo.length > 0 && (
        <TablaExpandible
          id="stock"
          titulo="Productos con Stock Bajo"
          icono={ShoppingBagIcon}
          color="bg-orange-600"
          datos={inventario.productos_stock_bajo}
          expandida={seccionExpandida === 'stock'}
          onToggle={toggleSeccion}
          columnas={[
            {
              key: 'nombre_producto',
              label: 'Producto',
              render: (item) => (
                <div className="max-w-xs">
                  <div className="font-medium text-gray-900 truncate" title={item.nombre_producto}>
                    {item.nombre_producto}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{item.codigo_barra}</div>
                </div>
              )
            },
            {
              key: 'stock_actual',
              label: 'Stock Actual',
              align: 'text-center',
              render: (item) => (
                <span className={`font-semibold ${
                  item.stock_actual === 0 ? 'text-red-600' :
                  item.stock_actual <= 5 ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  {item.stock_actual}
                </span>
              )
            },
            {
              key: 'stock_minimo',
              label: 'Stock Mínimo',
              align: 'text-center',
              render: (item) => item.stock_minimo || 0
            },
            {
              key: 'vendido_en_periodo',
              label: 'Vendido en Período',
              align: 'text-center',
              render: (item) => (
                <span className="font-medium text-blue-600">
                  {item.vendido_en_periodo || 0}
                </span>
              )
            }
          ]}
        />
      )}
    </div>
  );
}