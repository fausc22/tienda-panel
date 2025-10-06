// components/pagina/GestionOfertas.jsx - Componente de gestión de ofertas
import { useState } from 'react';
import { 
  TagIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

export default function GestionOfertas({
  ofertas,
  loading,
  actualizandoPrecio,
  cargarOfertas,
  actualizarPrecioOferta,
  eliminarOferta,
  aplicarDescuentoPorcentual,
  obtenerEstadisticas,
  onAgregarProducto
}) {
  const [editandoPrecio, setEditandoPrecio] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [modalDescuento, setModalDescuento] = useState({ mostrar: false, producto: null });
  const [porcentajeDescuento, setPorcentajeDescuento] = useState('');

  // Obtener estadísticas
  const estadisticas = obtenerEstadisticas();

  // Manejar inicio de edición de precio
  const handleIniciarEdicion = (producto) => {
    setEditandoPrecio(producto.codigo_barra);
    setNuevoPrecio(producto.precio_oferta.toString());
  };

  // Manejar cancelación de edición
  const handleCancelarEdicion = () => {
    setEditandoPrecio(null);
    setNuevoPrecio('');
  };

  // Manejar guardado de precio
  const handleGuardarPrecio = async (codigoBarra) => {
    const precio = parseFloat(nuevoPrecio);
    if (isNaN(precio) || precio < 0) {
      toast.error('Ingrese un precio válido');
      return;
    }

    const exito = await actualizarPrecioOferta(codigoBarra, precio);
    if (exito) {
      setEditandoPrecio(null);
      setNuevoPrecio('');
    }
  };

  // Manejar apertura de modal de descuento
  const handleAbrirModalDescuento = (producto) => {
    setModalDescuento({ mostrar: true, producto });
    setPorcentajeDescuento('');
  };

  // Manejar aplicación de descuento porcentual
  const handleAplicarDescuento = async () => {
    if (!modalDescuento.producto) return;

    const porcentaje = parseFloat(porcentajeDescuento);
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      toast.error('Ingrese un porcentaje válido entre 0 y 100');
      return;
    }

    const exito = await aplicarDescuentoPorcentual(modalDescuento.producto.codigo_barra, porcentaje);
    if (exito) {
      setModalDescuento({ mostrar: false, producto: null });
      setPorcentajeDescuento('');
    }
  };

  // Calcular precio con descuento
  const calcularPrecioConDescuento = (precioOriginal, porcentaje) => {
    const descuento = parseFloat(porcentaje) || 0;
    if (descuento < 0 || descuento > 100) return precioOriginal;
    return precioOriginal * (1 - descuento / 100);
  };

  return (
    <div>
      {/* Header de la sección */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Productos en Oferta</h2>
            <p className="text-gray-600">
              Gestione los productos con precios especiales y descuentos
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <TagIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
                <p className="text-sm text-blue-800">Total en Oferta</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CalculatorIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-600">{estadisticas.conDescuento}</p>
                <p className="text-sm text-green-800">Con Descuento</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <TagIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.sinDescuento}</p>
                <p className="text-sm text-yellow-800">Sin Descuento</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <CalculatorIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{Math.round(estadisticas.descuentoPromedio)}%</p>
                <p className="text-sm text-purple-800">Desc. Promedio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de ofertas */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando ofertas...</span>
        </div>
      ) : ofertas && ofertas.length > 0 ? (
        <>
          {/* Tabla para escritorio */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Precio Original
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Precio Oferta
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Descuento
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ofertas.map((oferta) => (
                  <tr key={oferta.codigo_barra} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {oferta.codigo_barra}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {oferta.nombre}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      ${oferta.precio.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editandoPrecio === oferta.codigo_barra ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={nuevoPrecio}
                            onChange={(e) => setNuevoPrecio(e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleGuardarPrecio(oferta.codigo_barra);
                              } else if (e.key === 'Escape') {
                                handleCancelarEdicion();
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleGuardarPrecio(oferta.codigo_barra)}
                            disabled={actualizandoPrecio}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelarEdicion}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-green-600">
                            ${oferta.precio_oferta.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleIniciarEdicion(oferta)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar precio"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {oferta.descuento_porcentual > 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          -{oferta.descuento_porcentual}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin descuento</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        oferta.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {oferta.stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAbrirModalDescuento(oferta)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Aplicar descuento porcentual"
                        >
                          <CalculatorIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => eliminarOferta(oferta.codigo_barra)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar de ofertas"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas para móvil */}
          <div className="md:hidden space-y-4">
            {ofertas.map((oferta) => (
              <div key={oferta.codigo_barra} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{oferta.nombre}</h3>
                    <p className="text-xs text-gray-500 font-mono">{oferta.codigo_barra}</p>
                  </div>
                  {oferta.descuento_porcentual > 0 && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      -{oferta.descuento_porcentual}%
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Precio Original</p>
                    <p className="font-medium">${oferta.precio.toFixed(2)}</p>
                    <p className="font-medium">STOCK: {oferta.stock || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Precio Oferta</p>
                    {editandoPrecio === oferta.codigo_barra ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={nuevoPrecio}
                          onChange={(e) => setNuevoPrecio(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => handleGuardarPrecio(oferta.codigo_barra)}
                          className="text-green-600"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelarEdicion}
                          className="text-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-green-600">${oferta.precio_oferta.toFixed(2)}</p>
                        <button
                          onClick={() => handleIniciarEdicion(oferta)}
                          className="text-blue-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => handleAbrirModalDescuento(oferta)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <CalculatorIcon className="h-4 w-4" />
                    Descuento %
                  </button>
                  <button
                    onClick={() => eliminarOferta(oferta.codigo_barra)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <TagIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos en oferta</h3>
          <p className="text-gray-600 mb-4">
            Agregue productos con precios especiales para atraer más clientes
          </p>
          <button
            onClick={onAgregarProducto}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Primer Producto
          </button>
        </div>
      )}

      {/* Modal de descuento porcentual */}
      {modalDescuento.mostrar && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Aplicar Descuento Porcentual
              </h3>
              
              {modalDescuento.producto && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{modalDescuento.producto.nombre}</p>
                  <p className="text-sm text-gray-600">
                    Precio actual: ${modalDescuento.producto.precio_oferta.toFixed(2)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Descuento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={porcentajeDescuento}
                  onChange={(e) => setPorcentajeDescuento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 15"
                />
              </div>

              {/* Preview del precio con descuento */}
              {porcentajeDescuento && modalDescuento.producto && (
                <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Nuevo precio con {porcentajeDescuento}% de descuento:</strong>
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    ${calcularPrecioConDescuento(modalDescuento.producto.precio, porcentajeDescuento).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setModalDescuento({ mostrar: false, producto: null })}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAplicarDescuento}
                  disabled={!porcentajeDescuento}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar Descuento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}