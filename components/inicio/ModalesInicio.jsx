// components/inicio/ModalesInicio.jsx - Modales para gestión de pedidos en página de inicio
import { useState, useEffect } from 'react';
import { MdDeleteForever, MdExpandMore, MdExpandLess, MdSearch } from "react-icons/md";
import { toast } from 'react-hot-toast';
import { useProductoSearch } from '../../hooks/useBusquedaProductos';

// Función helper para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Modal principal de detalle del pedido
export function ModalDetallePedidoInicio({ 
  pedido,
  productos,
  loading,
  onClose,
  onAgregarProducto,
  onEditarProducto,
  onEliminarProducto
}) {
  const [clienteExpandido, setClienteExpandido] = useState(false);

  if (!pedido) return null;

  const toggleClienteExpansion = () => {
    setClienteExpandido(!clienteExpandido);
  };

  const handleConfirmarPedido = () => {
    // TODO: Implementar lógica para confirmar pedido
    toast.info('Función "Confirmar Pedido" - Por implementar');
    console.log('🔄 Confirmando pedido:', pedido.id_pedido);
  };

  const handleAnularPedido = () => {
    // TODO: Implementar lógica para anular pedido
    toast.info('Función "Anular Pedido" - Por implementar');
    console.log('🔄 Anulando pedido:', pedido.id_pedido);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
              Pedido #{pedido.id_pedido}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
            >
              ✕
            </button>
          </div>

          {/* Información del pedido */}
          <div className="mb-4">
            <h4 className="text-sm sm:text-lg font-semibold text-gray-700">
              <strong>Fecha:</strong> {formatearFecha(pedido.fecha)}
            </h4>
          </div>

          {/* Información del cliente expandible */}
          <InformacionClienteInicio 
            pedido={pedido} 
            expandido={clienteExpandido}
            onToggleExpansion={toggleClienteExpansion}
          />

          {/* Información adicional del pedido */}
          <InformacionAdicionalInicio pedido={pedido} />

          {/* Productos del pedido */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Productos del Pedido</h3>
            
            <button
              onClick={onAgregarProducto}
              className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
            >
              ➕ AGREGAR PRODUCTO
            </button>

            <TablaProductosInicio
              productos={productos}
              onEditarProducto={onEditarProducto}
              onEliminarProducto={onEliminarProducto}
              loading={loading}
            />
            
            <ResumenTotalesInicio productos={productos} />
          </div>

          {/* Botones de acción del modal */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleConfirmarPedido}
              className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full sm:w-1/3"
            >
              ✅ CONFIRMAR PEDIDO
            </button>
            
            <button 
              onClick={handleAnularPedido}
              className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full sm:w-1/3"
            >
              ❌ ANULAR PEDIDO
            </button>
            
            <button 
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full sm:w-1/3"
            >
              🚪 CERRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de información del cliente
function InformacionClienteInicio({ pedido, expandido, onToggleExpansion }) {
  return (
    <div className="bg-blue-50 rounded-lg overflow-hidden mb-4">
      <div 
        className="p-3 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
        onClick={onToggleExpansion}
      >
        <div>
          <h3 className="font-bold text-lg text-blue-800">Cliente: {pedido.cliente}</h3>
          <p className="text-blue-600 text-sm">
            {pedido.direccion_cliente || 'Dirección no especificada'}
          </p>
        </div>
        <div className="text-blue-600">
          {expandido ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
        </div>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out ${
        expandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-3 pb-3 border-t border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
            <div>
              <span className="font-medium text-blue-700">Teléfono:</span>
              <p className="text-gray-700">{pedido.telefono_cliente || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Email:</span>
              <p className="text-gray-700">{pedido.email_cliente || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Medio de pago:</span>
              <p className="text-gray-700">{pedido.medio_pago || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Costo envío:</span>
              <p className="text-gray-700">${Number(pedido.costo_envio || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de información adicional
function InformacionAdicionalInicio({ pedido }) {
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'pendiente':
      case 'En proceso':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Anulado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado */}
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Estado</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getEstadoStyle(pedido.estado)}`}>
            {pedido.estado || 'Sin estado'}
          </span>
        </div>

        {/* Notas */}
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Notas</h3>
          <p className="text-lg text-gray-700 bg-white p-3 rounded border min-h-[2.5rem] break-words">
            {pedido.notas_local && pedido.notas_local !== 'sin observaciones' 
              ? pedido.notas_local 
              : (
                <span className="text-gray-400 italic">
                  Sin notas especiales
                </span>
              )
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// Tabla de productos
function TablaProductosInicio({ productos, onEditarProducto, onEliminarProducto, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-2">📦</div>
        <div className="font-medium">No hay productos en este pedido</div>
      </div>
    );
  }

  return (
    <>
      {/* Tabla para escritorio */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-center">Cant.</th>
              <th className="p-2 text-right">Precio Unit.</th>
              <th className="p-2 text-right">Subtotal</th>
              <th className="p-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => {
              const precio = Number(producto.precio) || 0;
              const cantidad = Number(producto.cantidad) || 0;
              const subtotal = Number(producto.subtotal) || (cantidad * precio);
              
              return (
                <tr key={producto.id}
                    className="hover:bg-gray-100 cursor-pointer border-b"
                    onDoubleClick={() => onEditarProducto(producto)}> 
                  <td className="p-2 font-mono text-xs">{producto.codigo_barra}</td>
                  <td className="p-2 font-medium">{producto.nombre_producto}</td>
                  <td className="p-2 text-center font-semibold">{cantidad}</td>
                  <td className="p-2 text-right">${precio.toFixed(2)}</td>
                  <td className="p-2 text-right font-semibold text-green-600">${subtotal.toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEliminarProducto(producto);
                      }}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                      title="Eliminar producto"
                    >
                      <MdDeleteForever size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para móvil */}
      <div className="lg:hidden space-y-3">
        {productos.map((producto) => {
          const precio = Number(producto.precio) || 0;
          const cantidad = Number(producto.cantidad) || 0;
          const subtotal = Number(producto.subtotal) || (cantidad * precio);
          
          return (
            <div key={producto.id} className="bg-white p-3 rounded shadow border">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{producto.nombre_producto}</h4>
                  <p className="text-xs text-gray-500">Código: {producto.codigo_barra}</p>
                </div>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded ml-2 transition-colors text-xs"
                  onClick={() => onEliminarProducto(producto)}
                  title="Eliminar producto"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600 block">Cantidad:</span>
                  <span className="font-semibold text-blue-600">{cantidad}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Precio:</span>
                  <span className="font-medium">${precio.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs">Subtotal:</span>
                  <span className="font-semibold text-green-600">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={() => onEditarProducto(producto)}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors"
              >
                Editar
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Resumen de totales
function ResumenTotalesInicio({ productos }) {
  const subtotalTotal = productos.reduce((acc, prod) => {
    return acc + (Number(prod.subtotal) || 0);
  }, 0);

  const cantidadTotal = productos.reduce((acc, prod) => {
    return acc + (Number(prod.cantidad) || 0);
  }, 0);

  if (productos.length === 0) return null;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between items-center py-1 border-b border-gray-300 text-sm">
          <span className="text-gray-700 font-medium">CANTIDAD TOTAL:</span>
          <span className="font-semibold text-blue-600">{cantidadTotal} items</span>
        </div>
        
        <div className="flex justify-between items-center py-2 bg-yellow-300 rounded-lg px-3 border-2 border-yellow-400">
          <span className="text-black font-bold">TOTAL:</span>
          <span className="text-black text-lg font-bold">${subtotalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// Modal para agregar producto
export function ModalAgregarProductoPedido({ 
  mostrar, 
  onClose, 
  onAgregarProducto,
  productosActuales = []
}) {
  const [productQuantity, setProductQuantity] = useState(1);
  const {
    busqueda,
    setBusqueda,
    resultados,
    productoSeleccionado,
    loading,
    buscarProducto,
    seleccionarProducto,
    limpiarSeleccion
  } = useProductoSearch();

  // Validar si el producto ya existe en el pedido
  const productoYaExiste = (codigoBarra) => {
    return productosActuales.some(prod => prod.codigo_barra === codigoBarra);
  };

  // Verificar stock disponible
  const stockDisponible = productoSeleccionado?.stock || 0;
  const stockSuficiente = productQuantity <= stockDisponible;
  const productoEsDuplicado = productoSeleccionado ? productoYaExiste(productoSeleccionado.codigo_barra) : false;

  const handleAgregarProducto = async () => {
    if (!productoSeleccionado || productQuantity < 1) {
      toast.error('Seleccione un producto y una cantidad válida');
      return;
    }

    // Validar duplicado
    if (productoEsDuplicado) {
      toast.error(`El producto "${productoSeleccionado.nombre}" ya está en el pedido. Use la opción editar para modificar la cantidad.`);
      return;
    }

    // Validar stock
    if (!stockSuficiente) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${productQuantity}`);
      return;
    }

    const exito = await onAgregarProducto(productoSeleccionado, productQuantity);
    if (exito) {
      setProductQuantity(1);
      limpiarSeleccion();
      onClose();
    }
  };

  const handleClose = () => {
    setProductQuantity(1);
    limpiarSeleccion();
    onClose();
  };

  if (!mostrar) return null;

  const precio = Number(productoSeleccionado?.precio) || 0;
  const subtotal = precio * productQuantity;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Buscar Producto</h2>
          
          <div className="flex items-center gap-2 mb-6">
            <input 
              type="text"
              className="border p-2 flex-grow rounded"
              placeholder="Buscar Producto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button 
              onClick={buscarProducto}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 transition-colors"
            >
              <MdSearch size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-4 h-64 md:h-80 overflow-y-auto">
              <h3 className="font-bold mb-2">Productos Encontrados</h3>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : resultados.length > 0 ? (
                resultados.map((product, index) => {
                  const yaExiste = productoYaExiste(product.codigo_barra);
                  return (
                    <div 
                      key={index}
                      className={`p-2 border-b cursor-pointer transition-colors ${
                        productoSeleccionado?.codigo_barra === product.codigo_barra ? 'bg-blue-100' : 
                        yaExiste ? 'bg-red-50 opacity-50' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => !yaExiste && seleccionarProducto(product)}
                    >
                      <div className="font-medium text-sm">
                        {product.nombre}
                        {yaExiste && <span className="text-red-600 ml-2">(Ya en pedido)</span>}
                      </div>
                      <div className="text-xs text-gray-600">
                        Código: {product.codigo_barra} | Stock: {product.stock}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No hay productos para mostrar</p>
              )}
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-bold mb-4">Detalles del Producto</h3>
              {productoSeleccionado ? (
                <div className="space-y-3 text-sm">
                  <p><strong>Código:</strong> {productoSeleccionado.codigo_barra}</p>
                  <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                  <p><strong>Precio:</strong> ${precio.toFixed(2)}</p>
                  <p><strong>Stock Disponible:</strong> 
                    <span className={stockDisponible > 0 ? 'text-green-600' : 'text-red-600'}>
                      {stockDisponible}
                    </span>
                  </p>
                  
                  {/* Alertas de validación */}
                  {productoEsDuplicado && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
                      ⚠️ Este producto ya está en el pedido
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <label className="block mb-1 font-medium">Cantidad:</label>
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                        onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        className={`border p-2 w-16 rounded text-sm text-center ${
                          !stockSuficiente ? 'border-red-500 bg-red-50' : ''
                        }`}
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value)))}
                        min="1"
                        max={stockDisponible}
                      />
                      <button 
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                        onClick={() => setProductQuantity(Math.min(stockDisponible, productQuantity + 1))}
                      >
                        +
                      </button>
                    </div>
                    
                    {!stockSuficiente && (
                      <p className="text-red-600 text-xs mt-1">
                        ❌ Stock insuficiente (máximo: {stockDisponible})
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="font-semibold">Subtotal: ${subtotal.toFixed(2)}</p>
                  </div>
                  
                  <button 
                    onClick={handleAgregarProducto}
                    disabled={productoEsDuplicado || !stockSuficiente}
                    className={`mt-4 px-4 py-2 rounded w-full transition-colors ${
                      productoEsDuplicado || !stockSuficiente
                        ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {productoEsDuplicado 
                      ? 'Producto ya agregado' 
                      : !stockSuficiente 
                        ? 'Stock insuficiente'
                        : 'Agregar Producto'
                    }
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Seleccione un producto de la lista</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para editar producto
export function ModalEditarProductoPedido({ 
  producto, 
  onClose, 
  onGuardar,
  onChange
}) {
  if (!producto) return null;

  // Obtener stock desde la información del producto
  const stockDisponible = Number(producto.stock_actual) || 0;
  const cantidadActual = Number(producto.cantidad) || 1;
  const excedeLimite = cantidadActual > stockDisponible;

  const handleCantidadChange = (e) => {
    const nuevaCantidad = Math.max(1, parseInt(e.target.value) || 1);
    
    const precio = Number(producto.precio) || 0;
    const nuevoSubtotal = (nuevaCantidad * precio).toFixed(2);
    
    onChange({
      ...producto,
      cantidad: nuevaCantidad,
      subtotal: nuevoSubtotal
    });
  };

  const handlePrecioChange = (e) => {
    const nuevoPrecio = Math.max(0, parseFloat(e.target.value) || 0);
    const cantidad = Number(producto.cantidad) || 1;
    const nuevoSubtotal = (cantidad * nuevoPrecio).toFixed(2);
    
    onChange({
      ...producto,
      precio: nuevoPrecio,
      subtotal: nuevoSubtotal
    });
  };

  const precio = Number(producto.precio) || 0;
  const cantidad = Number(producto.cantidad) || 1;
  const subtotal = cantidad * precio;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Editar Producto</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Código:</label>
              <input 
                type="text"
                className="border p-2 w-full rounded bg-gray-100 text-sm"
                value={producto.codigo_barra || ''}
                disabled
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">Nombre:</label>
              <input 
                type="text"
                className="border p-2 w-full rounded bg-gray-100 text-sm"
                value={producto.nombre_producto || ''}
                disabled
              />
            </div>

            {/* Mostrar stock disponible como información */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stock Informativo:</span>
                <span className={`font-bold ${stockDisponible > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                  {stockDisponible}
                </span>
              </div>
              {excedeLimite && (
                <div className="mt-1 text-xs text-orange-600">
                  ⚠️ La cantidad supera el stock disponible
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Precio ($):</label>
              <div className="flex items-center">
                <span className="mr-1">$</span>
                <input 
                  type="number"
                  className="border p-2 w-full rounded text-sm"
                  value={precio}
                  onChange={handlePrecioChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Cantidad:</label>
              <div className="flex items-center space-x-2">
                <button 
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                  onClick={() => handleCantidadChange({ target: { value: cantidad - 1 } })}
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <input 
                  type="number"
                  className="border p-2 w-16 rounded text-sm text-center"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  min="1"
                />
                <button 
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                  onClick={() => handleCantidadChange({ target: { value: cantidad + 1 } })}
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Subtotal:</label>
              <div className="flex items-center">
                <span className="mr-1">$</span>
                <input 
                  type="text"
                  className="border p-2 w-full rounded bg-gray-100 text-sm"
                  value={subtotal.toFixed(2)}
                  disabled
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2">
            <button 
              onClick={onGuardar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Guardar Cambios
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para eliminar producto
export function ModalEliminarProductoPedido({ 
  producto, 
  onClose, 
  onConfirmar 
}) {
  if (!producto) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Confirmar Eliminación</h2>
          
          <p className="text-center my-4">
            ¿Estás seguro de que deseas eliminar <strong>{producto.cantidad}</strong> unidades de <strong>{producto.nombre_producto}</strong>?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button 
              onClick={onConfirmar}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Sí, eliminar
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              No, cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}