// components/productos/FiltrosProductos.jsx - Filtros y búsqueda de productos
import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useCategorias } from '../../hooks/useCategorias';

export default function FiltrosProductos({
  onBuscar,
  onLimpiarFiltros,
  onActualizar,
  loading,
  totalProductos,
  estadisticas,
  etiquetaSeleccionada = 'total',
  onEtiquetaClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    categoria: '',
    estado: '',
    stockMinimo: '',
    stockMaximo: '',
    precioMinimo: '',
    precioMaximo: ''
  });
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // Hook para cargar categorías
  const { 
    categorias, 
    loading: loadingCategorias, 
    categoriasParaSelect 
  } = useCategorias();

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length === 0 || searchTerm.length >= 2) {
        handleBuscar();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleBuscar = () => {
    const parametrosBusqueda = {
      termino: searchTerm.trim(),
      ...filtros
    };
    
    // Codificar parámetros como JSON
    const filtrosEncoded = encodeURIComponent(JSON.stringify(parametrosBusqueda));
    onBuscar(filtrosEncoded);
  };

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setFiltros({
      categoria: '',
      estado: '',
      stockMinimo: '',
      stockMaximo: '',
      precioMinimo: '',
      precioMaximo: ''
    });
    onLimpiarFiltros();
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (Object.values(filtros).some(valor => valor !== '')) {
      handleBuscar();
    }
  }, [filtros]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-6">
      {/* Búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos por nombre, código o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              mostrarFiltrosAvanzados 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtros
          </button>
          
          <button
            onClick={onActualizar}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Categoría - Cargada dinámicamente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
                {loadingCategorias && (
                  <span className="ml-2 text-xs text-gray-500">(Cargando...)</span>
                )}
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                disabled={loadingCategorias}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Todas las categorías</option>
                {categoriasParaSelect().map((categoria) => (
                  <option key={categoria.value} value={categoria.label}>
                    {categoria.label} ({categoria.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="en_stock">Con Stock ({'>'}10)</option>
                <option value="stock_bajo">Stock Bajo (≤10)</option>
                <option value="sin_stock">Sin Stock</option>
              </select>
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={filtros.stockMinimo}
                onChange={(e) => handleFiltroChange('stockMinimo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            {/* Stock Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Máximo
              </label>
              <input
                type="number"
                min="0"
                value={filtros.stockMaximo}
                onChange={(e) => handleFiltroChange('stockMaximo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="999999"
              />
            </div>

            {/* Precio Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Mínimo
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filtros.precioMinimo}
                onChange={(e) => handleFiltroChange('precioMinimo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Precio Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Máximo
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filtros.precioMaximo}
                onChange={(e) => handleFiltroChange('precioMaximo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="999999.99"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLimpiarFiltros}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </button>
            
            <button
              onClick={handleBuscar}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas - Botones clickeables */}
      {estadisticas && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (onEtiquetaClick) {
                  onEtiquetaClick('total');
                }
              }}
              className={`rounded-lg p-3 text-center transition-all cursor-pointer border-2 ${
                etiquetaSeleccionada === 'total'
                  ? 'bg-blue-100 border-blue-500 shadow-md scale-105'
                  : 'bg-blue-50 border-transparent hover:bg-blue-100 hover:border-blue-300'
              }`}
            >
              <div className={`text-2xl font-bold ${etiquetaSeleccionada === 'total' ? 'text-blue-700' : 'text-blue-600'}`}>
                {estadisticas.total}
              </div>
              <div className={`text-sm font-medium ${etiquetaSeleccionada === 'total' ? 'text-blue-900' : 'text-blue-800'}`}>
                Total
              </div>
            </button>
            
            <button
              onClick={() => {
                if (onEtiquetaClick) {
                  onEtiquetaClick('en_stock');
                }
              }}
              className={`rounded-lg p-3 text-center transition-all cursor-pointer border-2 ${
                etiquetaSeleccionada === 'en_stock'
                  ? 'bg-green-100 border-green-500 shadow-md scale-105'
                  : 'bg-green-50 border-transparent hover:bg-green-100 hover:border-green-300'
              }`}
            >
              <div className={`text-2xl font-bold ${etiquetaSeleccionada === 'en_stock' ? 'text-green-700' : 'text-green-600'}`}>
                {estadisticas.conStock}
              </div>
              <div className={`text-sm font-medium ${etiquetaSeleccionada === 'en_stock' ? 'text-green-900' : 'text-green-800'}`}>
                Con Stock ({'>'}10)
              </div>
            </button>
            
            <button
              onClick={() => {
                if (onEtiquetaClick) {
                  onEtiquetaClick('stock_bajo');
                }
              }}
              className={`rounded-lg p-3 text-center transition-all cursor-pointer border-2 ${
                etiquetaSeleccionada === 'stock_bajo'
                  ? 'bg-orange-100 border-orange-500 shadow-md scale-105'
                  : 'bg-orange-50 border-transparent hover:bg-orange-100 hover:border-orange-300'
              }`}
            >
              <div className={`text-2xl font-bold ${etiquetaSeleccionada === 'stock_bajo' ? 'text-orange-700' : 'text-orange-600'}`}>
                {estadisticas.stockBajo}
              </div>
              <div className={`text-sm font-medium ${etiquetaSeleccionada === 'stock_bajo' ? 'text-orange-900' : 'text-orange-800'}`}>
                Stock Bajo (≤10)
              </div>
            </button>
            
            <button
              onClick={() => {
                if (onEtiquetaClick) {
                  onEtiquetaClick('sin_stock');
                }
              }}
              className={`rounded-lg p-3 text-center transition-all cursor-pointer border-2 ${
                etiquetaSeleccionada === 'sin_stock'
                  ? 'bg-red-100 border-red-500 shadow-md scale-105'
                  : 'bg-red-50 border-transparent hover:bg-red-100 hover:border-red-300'
              }`}
            >
              <div className={`text-2xl font-bold ${etiquetaSeleccionada === 'sin_stock' ? 'text-red-700' : 'text-red-600'}`}>
                {estadisticas.sinStock}
              </div>
              <div className={`text-sm font-medium ${etiquetaSeleccionada === 'sin_stock' ? 'text-red-900' : 'text-red-800'}`}>
                Sin Stock
              </div>
            </button>
          </div>
          
          {estadisticas.precioPromedio > 0 && (
            <div className="mt-3 text-center text-sm text-gray-600">
              Precio promedio: <span className="font-semibold">${estadisticas.precioPromedio.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Información de resultados */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        {totalProductos > 0 ? (
          <>
            Mostrando <span className="font-semibold">{totalProductos}</span> producto{totalProductos !== 1 ? 's' : ''}
            {searchTerm && (
              <>
                {' '}para <span className="font-semibold">{searchTerm}</span>
              </>
            )}
          </>
        ) : (
          <>No se encontraron productos</>
        )}
        
        {/* Mostrar información de categorías cargadas */}
        {categorias.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {categorias.length} categorías disponibles
          </div>
        )}
      </div>
    </div>
  );
}