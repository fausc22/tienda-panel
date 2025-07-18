// components/pagina/GestionDestacados.jsx - Componente de gestión de productos destacados
import { useState } from 'react';
import { 
  StarIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function GestionDestacados({
  destacados,
  loading,
  cargarDestacados,
  eliminarDestacado,
  reordenarDestacados,
  filtrarPorCategoria,
  buscarEnDestacados,
  obtenerCategorias,
  obtenerEstadisticas,
  onAgregarProducto
}) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [vistaActiva, setVistaActiva] = useState('grid'); // 'grid' o 'list'

  // Obtener estadísticas y datos filtrados
  const estadisticas = obtenerEstadisticas();
  const categorias = obtenerCategorias();
  
  // Aplicar filtros
  let destacadosFiltrados = destacados;
  
  if (busqueda.trim()) {
    destacadosFiltrados = buscarEnDestacados(busqueda);
  }
  
  if (categoriaFiltro !== 'todas') {
    destacadosFiltrados = filtrarPorCategoria(categoriaFiltro);
  }

  // Manejar búsqueda
  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaFiltro('todas');
  };

  return (
    <div>
      {/* Header de la sección */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Productos Destacados</h2>
            <p className="text-gray-600">
              Gestione los productos que aparecerán destacados en su tienda
            </p>
          </div>
          <button
            onClick={onAgregarProducto}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Producto
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.total}</p>
                <p className="text-sm text-yellow-800">Total Destacados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{estadisticas.conStock}</p>
                <p className="text-sm text-green-800">Con Stock</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">✕</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{estadisticas.sinStock}</p>
                <p className="text-sm text-red-800">Sin Stock</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FunnelIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.categorias}</p>
                <p className="text-sm text-blue-800">Categorías</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos destacados..."
                value={busqueda}
                onChange={handleBusqueda}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por categoría */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Categoría:</label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button
              onClick={limpiarFiltros}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Limpiar filtros
            </button>
            
            <div className="border-l pl-2 ml-2">
              <button
                onClick={() => setVistaActiva('grid')}
                className={`p-2 rounded ${vistaActiva === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista en grilla"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setVistaActiva('list')}
                className={`p-2 rounded ${vistaActiva === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista en lista"
              >
                <Bars3Icon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Información de filtros activos */}
        {(busqueda || categoriaFiltro !== 'todas') && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {destacadosFiltrados.length} de {destacados.length} productos
              {busqueda && <span className="ml-1">• Búsqueda: {busqueda}</span>}
              {categoriaFiltro !== 'todas' && <span className="ml-1">• Categoría: {categoriaFiltro}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando productos destacados...</span>
        </div>
      ) : destacadosFiltrados && destacadosFiltrados.length > 0 ? (
        <>
          {/* Vista en grilla */}
          {vistaActiva === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destacadosFiltrados.map((destacado, index) => (
                <div key={destacado.codigo_barra} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
                  {/* Badge de posición */}
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <StarIcon className="h-3 w-3 mr-1" />
                        #{index + 1}
                      </span>
                    </div>
                    
                    {/* Imagen del producto (placeholder) */}
                    <div className="h-40 bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <StarIcon className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Imagen del producto</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información del producto */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {destacado.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mb-2">
                      {destacado.codigo_barra}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-600">
                        ${destacado.precio.toFixed(2)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        destacado.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Stock: {destacado.stock}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {destacado.categoria}
                      </span>
                      <button
                        onClick={() => eliminarDestacado(destacado.codigo_barra)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Eliminar de destacados"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vista en lista */}
          {vistaActiva === 'list' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Posición
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {destacadosFiltrados.map((destacado, index) => (
                    <tr key={destacado.codigo_barra} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="font-medium text-yellow-600">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {destacado.codigo_barra}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {destacado.nombre}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {destacado.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        ${destacado.precio.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          destacado.stock > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {destacado.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => eliminarDestacado(destacado.codigo_barra)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar de destacados"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <StarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {(busqueda || categoriaFiltro !== 'todas') ? 'No se encontraron productos' : 'No hay productos destacados'}
          </h3>
          <p className="text-gray-600 mb-4">
            {(busqueda || categoriaFiltro !== 'todas') 
              ? 'Intente ajustar los filtros de búsqueda'
              : 'Agregue productos destacados para que aparezcan prominentemente en su tienda'
            }
          </p>
          {!(busqueda || categoriaFiltro !== 'todas') && (
            <button
              onClick={onAgregarProducto}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar Primer Producto
            </button>
          )}
        </div>
      )}

      {/* Información adicional */}
      {destacados.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <StarIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Información sobre Productos Destacados</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Los productos destacados aparecen en la página principal de su tienda</li>
                  <li>El orden mostrado aquí es el mismo orden en que aparecerán en la tienda</li>
                  <li>Productos sin stock aparecerán marcados pero seguirán siendo visibles</li>
                  <li>Recomendamos mantener entre 4-8 productos destacados para mejor impacto visual</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}