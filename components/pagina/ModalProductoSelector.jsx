// components/pagina/ModalProductoSelector.jsx - Modal para seleccionar productos
import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useProductoSearch } from '../../hooks/useBusquedaProductos';

export default function ModalProductoSelector({
  mostrar,
  tipo, // 'oferta' o 'destacado'
  onCerrar,
  onConfirmar,
  productosExistentes = []
}) {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Hook de búsqueda de productos
  const {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    buscarProducto,
    limpiarSeleccion
  } = useProductoSearch();

  // Limpiar estados al cerrar el modal
  useEffect(() => {
    if (!mostrar) {
      setProductoSeleccionado(null);
      limpiarSeleccion();
    }
  }, [mostrar, limpiarSeleccion]);

  // Verificar si un producto ya existe en la lista
  const productoYaExiste = (codigoBarra) => {
    return productosExistentes.some(prod => prod.codigo_barra === codigoBarra);
  };

  // Manejar selección de producto
  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
  };

  // Manejar confirmación
  const handleConfirmar = () => {
    if (!productoSeleccionado) return;
    
    if (productoYaExiste(productoSeleccionado.codigo_barra)) {
      alert(`Este producto ya está en ${tipo}s`);
      return;
    }

    onConfirmar(productoSeleccionado, tipo);
  };

  // Manejar búsqueda con Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (busqueda.trim().length >= 2) {
        buscarProducto();
      } else {
        toast.error('Ingrese al menos 2 caracteres para buscar');
      }
    }
  };

  // Función para manejar búsqueda con validación
  const handleBuscar = () => {
    const terminoLimpio = busqueda.trim();
    if (terminoLimpio.length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }
    buscarProducto();
  };

  if (!mostrar) return null;

  const titulo = tipo === 'oferta' ? 'Agregar Producto a Ofertas' 
    : tipo === 'destacado' ? 'Agregar Producto a Destacados'
    : 'Agregar Producto a Liquidación';
  
  const colorTema = tipo === 'oferta' ? 'red' 
    : tipo === 'destacado' ? 'yellow' 
    : 'purple';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header con color dinámico */}
        <div className={`bg-${colorTema}-500 text-white p-4`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{titulo}</h2>
            <button onClick={onCerrar} className="text-white hover:text-gray-200 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm opacity-90 mt-1">
            Busque y seleccione un producto para agregar a {
              tipo === 'oferta' ? 'ofertas' 
              : tipo === 'destacado' ? 'destacados' 
              : 'liquidación'
            }
          </p>
        </div>
        
        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Barra de búsqueda */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código de barra..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <button
                onClick={handleBuscar}
                disabled={loading || busqueda.trim().length < 2}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                Buscar
              </button>
            </div>
            
            {busqueda.trim().length > 0 && busqueda.trim().length < 2 && (
              <p className="text-sm text-red-500 mt-2">
                ⚠️ Ingrese al menos 2 caracteres para buscar
              </p>
            )}
          </div>

          {/* Resultados de búsqueda */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resultados de Búsqueda ({resultados.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Buscando productos...</span>
              </div>
            ) : resultados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {resultados.map((producto, index) => {
                  const yaExiste = productoYaExiste(producto.codigo_barra);
                  const seleccionado = productoSeleccionado?.codigo_barra === producto.codigo_barra;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        seleccionado 
                          ? `border-${colorTema}-500 bg-${colorTema}-50` 
                          : yaExiste
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => !yaExiste && handleSeleccionarProducto(producto)}
                    >
                      {/* Indicador de selección */}
                      {seleccionado && (
                        <div className="flex justify-end mb-2">
                          <div className={`p-1 bg-${colorTema}-500 rounded-full`}>
                            <CheckIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Indicador de producto existente */}
                      {yaExiste && (
                        <div className="flex justify-end mb-2">
                          <div className="flex items-center text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Ya agregado
                          </div>
                        </div>
                      )}
                      
                      {/* Información del producto */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {producto.nombre}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono mb-2">
                          {producto.codigo_barra}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ${parseFloat(producto.precio || 0).toFixed(2)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            parseInt(producto.stock || 0) > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Stock: {producto.stock || 0}
                          </span>
                        </div>
                        
                        {producto.categoria && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {producto.categoria}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : busqueda && (
              <div className="text-center py-8 text-gray-500">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-1">No se encontraron productos</p>
                <p className="text-sm">Intente con otros términos de búsqueda</p>
              </div>
            )}
          </div>

          {/* Producto seleccionado */}
          {productoSeleccionado && (
            <div className={`bg-${colorTema}-50 border border-${colorTema}-200 rounded-lg p-4`}>
              <h4 className={`text-sm font-medium text-${colorTema}-800 mb-2`}>
                Producto Seleccionado:
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium text-${colorTema}-900`}>
                    {productoSeleccionado.nombre}
                  </p>
                  <p className={`text-xs text-${colorTema}-700`}>
                    Código: {productoSeleccionado.codigo_barra} | 
                    Precio: ${parseFloat(productoSeleccionado.precio || 0).toFixed(2)} | 
                    Stock: {productoSeleccionado.stock || 0}
                  </p>
                </div>
                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className={`text-${colorTema}-600 hover:text-${colorTema}-800`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between gap-4">
            <button
              onClick={onCerrar}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleConfirmar}
              disabled={!productoSeleccionado}
              className={`flex-1 px-6 py-3 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tipo === 'oferta' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {!productoSeleccionado 
                ? 'Seleccione un producto' 
                : `Agregar a ${
                    tipo === 'oferta' ? 'Ofertas' 
                    : tipo === 'destacado' ? 'Destacados'
                    : tipo === 'liquidacion' ? 'Liquidación'  // NUEVO
                    : 'Lista'
                  }`
              }
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="border-t border-gray-100 p-4 bg-blue-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-blue-400">
                ℹ️
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Consejos para {tipo === 'oferta' ? 'productos en oferta' : 'productos destacados'}:
              </h4>
              <div className="mt-1 text-sm text-blue-700">
                {tipo === 'oferta' ? (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Seleccione productos con buen margen de ganancia</li>
                    <li>Después podrá ajustar el precio de oferta</li>
                    <li>Los productos en oferta atraen más clientes</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Elija productos populares o nuevos</li>
                    <li>Los destacados aparecen en la página principal</li>
                    <li>Mantenga entre 4-8 productos destacados</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}