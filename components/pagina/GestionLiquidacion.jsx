// components/pagina/GestionLiquidacion.jsx
import { useState } from 'react';
import { 
  BoltIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

export default function GestionLiquidacion({
  liquidacion = [],
  loading = false,
  actualizandoPrecio = false,
  cargarLiquidacion,
  actualizarPrecioLiquidacion,
  eliminarLiquidacion,
  aplicarDescuentoPorcentual,
  obtenerEstadisticas,
  onAgregarProducto
}) {
  const [editandoPrecio, setEditandoPrecio] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [modalDescuento, setModalDescuento] = useState({ mostrar: false, producto: null });
  const [porcentajeDescuento, setPorcentajeDescuento] = useState('');

  const estadisticas = obtenerEstadisticas ? obtenerEstadisticas() : {
    total: 0,
    conDescuento: 0,
    stockTotal: 0,
    descuentoPromedio: 0
  };

  const handleIniciarEdicion = (producto) => {
    setEditandoPrecio(producto.codigo_barra);
    setNuevoPrecio(producto.precio_oferta.toString());
  };

  const handleCancelarEdicion = () => {
    setEditandoPrecio(null);
    setNuevoPrecio('');
  };

  const handleGuardarPrecio = async (codigoBarra) => {
    const precio = parseFloat(nuevoPrecio);
    if (isNaN(precio) || precio < 0) {
      toast.error('Ingrese un precio válido');
      return;
    }

    const exito = await actualizarPrecioLiquidacion(codigoBarra, precio);
    if (exito) {
      setEditandoPrecio(null);
      setNuevoPrecio('');
    }
  };

  const handleAbrirModalDescuento = (producto) => {
    setModalDescuento({ mostrar: true, producto });
    setPorcentajeDescuento('');
  };

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

  const calcularPrecioConDescuento = (precioOriginal, porcentaje) => {
    const descuento = parseFloat(porcentaje) || 0;
    if (descuento < 0 || descuento > 100) return precioOriginal;
    return precioOriginal * (1 - descuento / 100);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Productos en Liquidación</h2>
            <p className="text-gray-600">
              Gestione los productos en liquidación con precios especiales
            </p>
          </div>
          <button
            onClick={onAgregarProducto}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mt-4 sm:mt-0"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Producto
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <BoltIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{estadisticas.total}</p>
                <p className="text-sm text-purple-800">Total Liquidación</p>
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
              <BoltIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.stockTotal}</p>
                <p className="text-sm text-yellow-800">Stock Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <CalculatorIcon className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{Math.round(estadisticas.descuentoPromedio)}%</p>
                <p className="text-sm text-orange-800">Desc. Promedio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Cargando productos en liquidación...</span>
        </div>
      ) : liquidacion && liquidacion.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Original</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Liquidación</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {liquidacion.map((item) => (
                <tr key={item.codigo_barra} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.codigo_barra}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.nombre}</td>
                  <td className="px-4 py-3 text-right text-gray-600">${item.precio?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    {editandoPrecio === item.codigo_barra ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={nuevoPrecio}
                          onChange={(e) => setNuevoPrecio(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleGuardarPrecio(item.codigo_barra);
                            } else if (e.key === 'Escape') {
                              handleCancelarEdicion();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleGuardarPrecio(item.codigo_barra)}
                          disabled={actualizandoPrecio}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button onClick={handleCancelarEdicion} className="text-red-600 hover:text-red-800">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-purple-600">${item.precio_oferta?.toFixed(2)}</span>
                        <button onClick={() => handleIniciarEdicion(item)} className="text-blue-600 hover:text-blue-800" title="Editar precio">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.descuento_porcentual > 0 ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        -{item.descuento_porcentual}%
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin descuento</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleAbrirModalDescuento(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Aplicar descuento porcentual"
                      >
                        <CalculatorIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => eliminarLiquidacion(item.codigo_barra)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar de liquidación"
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
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BoltIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos en liquidación</h3>
          <p className="text-gray-600 mb-4">
            Agregue productos con precios especiales de liquidación
          </p>
          <button
            onClick={onAgregarProducto}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Primer Producto
          </button>
        </div>
      )}

      {/* Modal de descuento */}
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
                    Precio actual: ${modalDescuento.producto.precio_oferta?.toFixed(2)}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: 15"
                />
              </div>

              {porcentajeDescuento && modalDescuento.producto && (
                <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                  <p className="text-sm text-purple-800">
                    <strong>Nuevo precio con {porcentajeDescuento}% de descuento:</strong>
                  </p>
                  <p className="text-lg font-bold text-purple-600">
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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