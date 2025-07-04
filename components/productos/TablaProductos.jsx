// components/productos/TablaProductos.jsx - Tabla de productos con responsividad
import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export default function TablaProductos({
  productos,
  onEditarProducto,
  onEliminarProducto,
  loading,
  sortField,
  sortDirection,
  onSort
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const getEstadoStyle = (stock, habilitado) => {
    if (habilitado === 'N') {
      return 'bg-gray-100 text-gray-800 border-gray-300';
    }
    if (stock === 0) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (stock <= 10) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getEstadoTexto = (stock, habilitado) => {
    if (habilitado === 'N') return 'Deshabilitado';
    if (stock === 0) return 'Sin Stock';
    if (stock <= 10) return 'Stock Bajo';
    return 'En Stock';
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 text-blue-600" />
      : <ArrowDownIcon className="h-4 w-4 text-blue-600" />;
  };

  const formatearPrecio = (precio) => {
    const num = parseFloat(precio);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay productos registrados
        </h3>
        <p className="text-gray-500">
          Comienza agregando productos a tu inventario
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Vista Desktop */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('codigo_barra')}
              >
                <div className="flex items-center space-x-1">
                  <span>Código</span>
                  {getSortIcon('codigo_barra')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('nombre')}
              >
                <div className="flex items-center space-x-1">
                  <span>Producto</span>
                  {getSortIcon('nombre')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('categoria')}
              >
                <div className="flex items-center space-x-1">
                  <span>Categoría</span>
                  {getSortIcon('categoria')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('precio')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Precio</span>
                  {getSortIcon('precio')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('stock')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Stock</span>
                  {getSortIcon('stock')}
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((producto) => {
              const stock = parseInt(producto.stock) || 0;
              const precio = parseFloat(producto.precio) || 0;
              const estadoStyle = getEstadoStyle(stock, producto.habilitado);
              const estadoTexto = getEstadoTexto(stock, producto.habilitado);

              return (
                <tr 
                  key={producto.codigo_barra}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-blue-600">
                    {producto.codigo_barra}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 max-w-xs truncate">
                      {producto.nombre || producto.art_desc_vta}
                    </div>
                    {producto.descripcion && (
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {producto.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {producto.categoria || 'Sin categoría'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-semibold text-green-600">
                      {formatearPrecio(precio)}
                    </div>
                    {producto.costo && (
                      <div className="text-xs text-gray-500">
                        Costo: {formatearPrecio(producto.costo)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-lg">
                      {stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${estadoStyle}`}>
                      {estadoTexto}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarProducto(producto);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                        title="Editar producto"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminarProducto(producto);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                        title="Eliminar producto"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil */}
      <div className="lg:hidden space-y-4">
        {productos.map((producto) => {
          const stock = parseInt(producto.stock) || 0;
          const precio = parseFloat(producto.precio) || 0;
          const estadoStyle = getEstadoStyle(stock, producto.habilitado);
          const estadoTexto = getEstadoTexto(stock, producto.habilitado);
          const isExpanded = expandedRow === producto.codigo_barra;

          return (
            <div 
              key={producto.codigo_barra} 
              className="bg-white rounded-lg border shadow-sm"
            >
              {/* Header de la tarjeta */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedRow(isExpanded ? null : producto.codigo_barra)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {producto.nombre || producto.art_desc_vta}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {producto.codigo_barra}
                    </p>
                    {producto.categoria && (
                      <p className="text-xs text-gray-400">
                        {producto.categoria}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatearPrecio(precio)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Stock: {stock}
                      </div>
                    </div>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${estadoStyle}`}>
                      {estadoTexto}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    {producto.costo && (
                      <div>
                        <span className="text-gray-500">Costo:</span>
                        <div className="font-medium">{formatearPrecio(producto.costo)}</div>
                      </div>
                    )}
                    
                    {producto.precio_sin_iva && (
                      <div>
                        <span className="text-gray-500">Precio s/IVA:</span>
                        <div className="font-medium">{formatearPrecio(producto.precio_sin_iva)}</div>
                      </div>
                    )}
                    
                    {producto.descripcion && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Descripción:</span>
                        <div className="text-gray-700 mt-1">{producto.descripcion}</div>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditarProducto(producto);
                      }}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEliminarProducto(producto);
                      }}
                      className="flex items-center px-3 py-1 text-sm text-red-600 bg-red-100 rounded hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}