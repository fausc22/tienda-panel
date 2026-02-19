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

  const getEstadoStyle = (stock) => {
    if (stock === 0) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (stock <= 10) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getEstadoTexto = (stock) => {
    if (stock === 0) return 'Sin Stock';
    if (stock <= 10) return 'Stock Bajo';
    return 'Con Stock';
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('cod_interno')}
              >
                <div className="flex items-center space-x-1">
                  <span>COD INTERNO</span>
                  {getSortIcon('cod_interno')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('nombre')}
              >
                <div className="flex items-center space-x-1">
                  <span>PRODUCTO</span>
                  {getSortIcon('nombre')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('categoria')}
              >
                <div className="flex items-center space-x-1">
                  <span>CATEGORIA</span>
                  {getSortIcon('categoria')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('precio')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>PRECIO</span>
                  {getSortIcon('precio')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('stock')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>STOCK</span>
                  {getSortIcon('stock')}
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((producto) => {
              const stock = parseInt(producto.stock) || 0;
              const precio = parseFloat(producto.precio) || 0;
              const estadoStyle = getEstadoStyle(stock);
              const estadoTexto = getEstadoTexto(stock);

              return (
                <tr 
                  key={producto.codigo_barra}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">
                    {producto.cod_interno || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 max-w-xs truncate">
                      {producto.nombre || producto.art_desc_vta}
                    </div>
                    {producto.marca && (
                      <div className="text-xs text-gray-500">
                        {producto.marca}
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
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-lg">
                      {stock}
                    </span>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${estadoStyle}`}>
                        {estadoTexto}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarProducto(producto);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                        title="Editar producto"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminarProducto(producto);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
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
      </div>

      {/* Vista Móvil */}
      <div className="lg:hidden space-y-4">
        {productos.map((producto) => {
          const stock = parseInt(producto.stock) || 0;
          const precio = parseFloat(producto.precio) || 0;
          const estadoStyle = getEstadoStyle(stock);
          const estadoTexto = getEstadoTexto(stock);
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
                    <p className="text-xs text-gray-500 font-mono">
                      COD: {producto.cod_interno || '-'}
                    </p>
                    {producto.categoria && (
                      <p className="text-xs text-gray-400 mt-1">
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