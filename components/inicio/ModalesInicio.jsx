// components/inicio/ModalesInicio.jsx - Modales corregidos con nuevas funcionalidades
import { useState, useEffect } from 'react';
import { MdDeleteForever, MdExpandMore, MdExpandLess, MdSearch, MdEdit } from "react-icons/md";
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

// Modal principal de detalle del pedido - ACTUALIZADO CON NUEVAS FUNCIONES
export function ModalDetallePedidoInicio({ 
  pedido,
  productos,
  loading,
  onClose,
  onAgregarProducto,
  onEditarProducto,
  onEliminarProducto,
  onConfirmarPedido,
  onEnviarPedido,
  onAnularPedido,
  onImprimirTicket
}) {
  const [clienteExpandido, setClienteExpandido] = useState(false);

  if (!pedido) return null;

  const toggleClienteExpansion = () => {
    setClienteExpandido(!clienteExpandido);
  };

  // Verificar si el pedido permite modificaciones - CORREGIDO
  const puedeModificar = pedido.estado === 'pendiente' || 
                      pedido.estado === 'Pendiente' || 
                      pedido.estado === 'En proceso';
const estaConfirmado = pedido.estado === 'confirmado' || 
                      pedido.estado === 'Confirmado';
const estaEntregado = pedido.estado === 'entregado' || 
                     pedido.estado === 'Entregado';
const estaAnulado = pedido.estado === 'Anulado' || 
                   pedido.estado === 'anulado';

  // Debug para ver el estado actual
  console.log('Estado del pedido:', pedido.estado, {
    puedeModificar,
    estaConfirmado,
    estaEntregado,
    estaAnulado
  });

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

          {/* Productos del pedido - HEADER ACTUALIZADO */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Productos del Pedido</h3>
              
              {/* Botón AGREGAR PRODUCTO - NUEVO */}
              {puedeModificar && (
                <button
                  onClick={onAgregarProducto}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                >
                  ➕ AGREGAR PRODUCTO
                </button>
              )}
            </div>

            <TablaProductosInicio
              productos={productos}
              onEditarProducto={puedeModificar ? onEditarProducto : null}
              onEliminarProducto={puedeModificar ? onEliminarProducto : null}
              loading={loading}
              soloLectura={!puedeModificar}
            />
            
            <ResumenTotalesInicio productos={productos} />
          </div>

          {/* Botones de acción del modal - ACTUALIZADOS */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">

              {estaConfirmado && (
              <button 
                onClick={onImprimirTicket}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">🖨️</span>
                <span>IMPRIMIR TICKET</span>
              </button>
            )}


            {/* Botón CONFIRMAR PEDIDO - Solo si está pendiente o en proceso - NUEVO */}
            {puedeModificar && (
              <button 
                onClick={onConfirmarPedido}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex-1"
              >
                ✅ CONFIRMAR PEDIDO
              </button>
            )}
            
            {/* Botón ENVIAR PEDIDO - Solo si está confirmado */}
            {estaConfirmado && (
              <button 
                onClick={onEnviarPedido}
                className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex-1"
              >
                🚚 ENVIAR PEDIDO
              </button>
            )}
            
            {/* Botón ANULAR PEDIDO - Solo si NO está entregado */}
            {!estaEntregado && !estaAnulado && (
              <button 
                onClick={onAnularPedido}
                className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex-1"
              >
                ❌ ANULAR PEDIDO
              </button>
            )}
            
            {/* Botón CERRAR - Siempre disponible */}
            <button 
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex-1"
            >
              🚪 CERRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para confirmar pedido - NUEVO
export function ModalConfirmarPedido({ 
  pedido, 
  productos, 
  onClose, 
  onConfirmar 
}) {
  if (!pedido) return null;

  const totalProductos = productos.reduce((total, producto) => {
    return total + (parseInt(producto.cantidad) || 0);
  }, 0);

  const totalMonto = productos.reduce((total, producto) => {
    return total + (parseFloat(producto.subtotal) || 0);
  }, 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
            Confirmar Pedido
          </h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-center text-gray-700 mb-4">
              ¿Desea confirmar el pedido para <strong>{pedido.cliente}</strong> con una cantidad de <strong>{totalProductos}</strong> artículos y un valor total de <strong>${totalMonto.toFixed(2)}</strong>?
            </p>
            <p className="text-center text-red-600 font-semibold text-sm">
              ⚠️ ESTA ACCIÓN NO SE PUEDE REVERTIR
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onConfirmar}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              ✅ SÍ, CONFIRMAR
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              ❌ CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para enviar pedido con horario - NUEVO
export function ModalEnviarPedido({ 
  pedido, 
  onClose, 
  onEnviar 
}) {
  const [horarioDesde, setHorarioDesde] = useState('');
  const [horarioHasta, setHorarioHasta] = useState('');

  if (!pedido) return null;

  // Verificar si es retiro en local - DEBE SER EXACTAMENTE IGUAL AL STRING EN LA BD
  const esRetiroEnLocal = pedido.direccion_cliente === "Retiro en local";
  
  console.log('🔍 DEBUG Modal:', {
    direccion_cliente: pedido.direccion_cliente,
    esRetiroEnLocal: esRetiroEnLocal
  });

  const handleEnviar = () => {
    // Para retiro en local no validar horarios
    if (!esRetiroEnLocal) {
      if (!horarioDesde || !horarioHasta) {
        toast.error('Por favor complete ambos horarios');
        return;
      }

      if (horarioDesde >= horarioHasta) {
        toast.error('El horario desde debe ser menor al horario hasta');
        return;
      }
    }

    // Enviar horarios solo si NO es retiro en local
    onEnviar(
      esRetiroEnLocal ? '' : horarioDesde, 
      esRetiroEnLocal ? '' : horarioHasta
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
            {esRetiroEnLocal ? 'Pedido Listo para Retirar' : 'Seleccionar Horario de Entrega'}
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-center text-gray-700 mb-4">
              Pedido para: <strong>{pedido.cliente}</strong>
            </p>
            
            {esRetiroEnLocal ? (
              // MOSTRAR SOLO PARA RETIRO EN LOCAL
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏪</div>
                  <p className="text-yellow-800 font-medium text-lg">
                    El pedido va a ser retirado en el local
                  </p>
                  <p className="text-yellow-700 text-sm mt-2">
                    El cliente será notificado que puede retirar su pedido
                  </p>
                </div>
              </div>
            ) : (
              // MOSTRAR SOLO PARA DELIVERY CON HORARIOS
              <>
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
                  <p className="text-center text-green-800 font-medium text-sm">
                    🚚 Pedido para delivery a:
                  </p>
                  <p className="text-center text-green-700 font-bold">
                    {pedido.direccion_cliente}
                  </p>
                  <p className="text-center text-green-600 text-xs mt-1">
                    Seleccione el horario estimado de entrega
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horario desde:
                    </label>
                    <input
                      type="time"
                      value={horarioDesde}
                      onChange={(e) => setHorarioDesde(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horario hasta:
                    </label>
                    <input
                      type="time"
                      value={horarioHasta}
                      onChange={(e) => setHorarioHasta(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleEnviar}
              className={`px-6 py-3 rounded-lg transition-colors font-semibold text-white ${
                esRetiroEnLocal 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {esRetiroEnLocal ? '✅ MARCAR LISTO PARA RETIRAR' : '🚚 ENVIAR PEDIDO'}
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              ❌ CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para anular pedido - NUEVO
export function ModalAnularPedido({ 
  pedido, 
  onClose, 
  onConfirmar 
}) {
  if (!pedido) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-center text-red-600">
            Anular Pedido
          </h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-center text-gray-700 mb-4">
              ¿Está seguro que desea anular el pedido #{pedido.id_pedido} de <strong>{pedido.cliente}</strong>?
            </p>
            <p className="text-center text-red-600 font-semibold text-sm">
              ⚠️ Esta acción cambiará el estado del pedido a ANULADO
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onConfirmar}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              ✅ SÍ, ANULAR
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              ❌ CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de información del cliente
function InformacionClienteInicio({ pedido }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      {/* Header con nombre del cliente */}
      <div className="mb-3">
        <h3 className="font-bold text-lg text-blue-800 mb-1">
          👤 {pedido.cliente}
        </h3>
        <p className="text-blue-600 text-sm flex items-center">
          📍 {pedido.direccion_cliente || 'Dirección no especificada'}
        </p>
      </div>
      
      {/* Grid con información del cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {/* Teléfono */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📞</span>
            <div>
              <span className="font-medium text-gray-600 block text-xs">Teléfono:</span>
              <span className="text-gray-800 font-medium">
                {pedido.telefono_cliente || 'No especificado'}
              </span>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">✉️</span>
            <div>
              <span className="font-medium text-gray-600 block text-xs">Email:</span>
              <span className="text-gray-800 font-medium text-xs break-all">
                {pedido.email_cliente || 'No especificado'}
              </span>
            </div>
          </div>
        </div>

        {/* Medio de pago */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">💳</span>
            <div>
              <span className="font-medium text-gray-600 block text-xs">Medio de pago:</span>
              <span className="text-gray-800 font-medium">
                {pedido.medio_pago || 'No especificado'}
              </span>
            </div>
          </div>
        </div>

        {/* Costo envío */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">🚚</span>
            <div>
              <span className="font-medium text-gray-600 block text-xs">Costo envío:</span>
              <span className="text-green-600 font-bold">
                ${Number(pedido.costo_envio || 0).toFixed(2)}
              </span>
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
      case 'confirmado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
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

// Tabla de productos - ACTUALIZADA CON NUEVAS FUNCIONES
function TablaProductosInicio({ productos, onEditarProducto, onEliminarProducto, loading, soloLectura }) {
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
      {/* Tabla para escritorio - ACTUALIZADA CON NUEVA COLUMNA */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Cod. Barra</th>
              <th className="p-2 text-left">Cod. Interno</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-center">Cant.</th>
              <th className="p-2 text-right">Precio Unit.</th>
              <th className="p-2 text-right">Subtotal</th>
              {!soloLectura && <th className="p-2 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => {
              const precio = Number(producto.precio) || 0;
              const cantidad = Number(producto.cantidad) || 0;
              const subtotal = Number(producto.subtotal) || (cantidad * precio);
              
              return (
                <tr key={producto.id}
                    className={`border-b ${!soloLectura ? 'hover:bg-gray-100' : ''}`}> 
                  <td className="p-2 font-mono text-xs">{producto.codigo_barra}</td>
                  <td className="p-2 text-center font-mono text-xs text-blue-600">
                    {producto.cod_interno || '-'}
                  </td>
                  <td className="p-2 font-medium">{producto.nombre_producto}</td>
                  <td className="p-2 text-center font-semibold">{cantidad}</td>
                  <td className="p-2 text-right">${precio.toFixed(2)}</td>
                  <td className="p-2 text-right font-semibold text-green-600">${subtotal.toFixed(2)}</td>
                  {!soloLectura && (
                    <td className="p-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onEditarProducto(producto)}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors"
                          title="Editar producto"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => onEliminarProducto(producto)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                          title="Eliminar producto"
                        >
                          <MdDeleteForever size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tabla para tablet - NUEVA VERSIÓN INTERMEDIA */}
      <div className="hidden md:block lg:hidden overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Códigos</th>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-center">Cant.</th>
              <th className="p-2 text-right">Precio</th>
              <th className="p-2 text-right">Subtotal</th>
              {!soloLectura && <th className="p-2 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => {
              const precio = Number(producto.precio) || 0;
              const cantidad = Number(producto.cantidad) || 0;
              const subtotal = Number(producto.subtotal) || (cantidad * precio);
              
              return (
                <tr key={producto.id}
                    className={`border-b ${!soloLectura ? 'hover:bg-gray-100' : ''}`}> 
                  <td className="p-2">
                    <div className="text-xs font-mono">
                      <div>Barra: {producto.codigo_barra}</div>
                      <div className="text-blue-600">
                        Interno: {producto.cod_interno || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 font-medium">{producto.nombre_producto}</td>
                  <td className="p-2 text-center font-semibold">{cantidad}</td>
                  <td className="p-2 text-right">${precio.toFixed(2)}</td>
                  <td className="p-2 text-right font-semibold text-green-600">${subtotal.toFixed(2)}</td>
                  {!soloLectura && (
                    <td className="p-2 text-center">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => onEditarProducto(producto)}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors"
                          title="Editar"
                        >
                          <MdEdit size={14} />
                        </button>
                        <button
                          onClick={() => onEliminarProducto(producto)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <MdDeleteForever size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para móvil - ACTUALIZADAS CON CÓDIGO INTERNO */}
      <div className="md:hidden space-y-3">
        {productos.map((producto) => {
          const precio = Number(producto.precio) || 0;
          const cantidad = Number(producto.cantidad) || 0;
          const subtotal = Number(producto.subtotal) || (cantidad * precio);
          
          return (
            <div key={producto.id} className="bg-white p-3 rounded shadow border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">
                    {producto.nombre_producto}
                  </h4>
                  {/* Códigos en móvil */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      <span className="font-medium">Cod. Barra:</span> {producto.codigo_barra}
                    </div>
                    <div>
                      <span className="font-medium">Cod. Interno:</span> 
                      <span className="text-blue-600 ml-1">
                        {producto.cod_interno || 'No asignado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* BOTONES EN MOBILE */}
                {!soloLectura && (
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors"
                      onClick={() => onEditarProducto(producto)}
                      title="Editar producto"
                    >
                      <MdEdit size={14} />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                      onClick={() => onEliminarProducto(producto)}
                      title="Eliminar producto"
                    >
                      <MdDeleteForever size={14} />
                    </button>
                  </div>
                )}
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

// Modal para agregar producto - CORREGIDO
export function ModalAgregarProductoPedido({ 
  mostrar, 
  onClose, 
  onAgregarProducto,
  productosActuales = []
}) {
  const [productQuantity, setProductQuantity] = useState(1);
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const {
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

  const handleBuscar = async () => {
    const termino = busquedaLocal.trim();
    
    if (!termino) {
      toast.error('Ingrese un término de búsqueda');
      return;
    }

    if (termino.length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    try {
      await buscarProducto(termino);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error('Error al buscar productos');
    }
  };

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
      setBusquedaLocal('');
      limpiarSeleccion();
      onClose();
    }
  };

  const handleClose = () => {
    setProductQuantity(1);
    setBusquedaLocal('');
    limpiarSeleccion();
    onClose();
  };

  // Limpiar al cerrar
  useEffect(() => {
    if (!mostrar) {
      setBusquedaLocal('');
      limpiarSeleccion();
    }
  }, [mostrar, limpiarSeleccion]);

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
              className="border p-2 flex-grow rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar Producto por nombre o código"
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleBuscar();
                }
              }}
            />
            <button 
              onClick={handleBuscar}
              disabled={loading || !busquedaLocal.trim()}
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
              ) : busquedaLocal ? (
                <p className="text-gray-500 text-sm">No se encontraron productos</p>
              ) : (
                <p className="text-gray-500 text-sm">Ingrese un término de búsqueda</p>
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

// Modal para editar producto - CORREGIDO con recálculo automático
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