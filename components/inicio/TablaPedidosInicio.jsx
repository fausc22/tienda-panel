// components/inicio/TablaPedidosInicio.jsx - Tabla de pedidos para página de inicio
import { useState } from 'react';

// Función helper para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Componente para tabla en escritorio
function TablaEscritorio({ pedidos, onRowDoubleClick, tipo, sortField, sortDirection, onSort }) {
  const getEstadoStyle = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
    case 'en proceso':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'entregado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'confirmado':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'anulado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};


  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th 
              className="p-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => onSort('id_pedido')}
            >
              ID {getSortIcon('id_pedido')}
            </th>
            <th 
              className="p-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => onSort('fecha')}
            >
              FECHA {getSortIcon('fecha')}
            </th>
            <th 
              className="p-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => onSort('cliente')}
            >
              CLIENTE {getSortIcon('cliente')}
            </th>
            <th 
              className="p-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => onSort('monto_total')}
            >
              TOTAL {getSortIcon('monto_total')}
            </th>
            <th 
              className="p-2 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => onSort('estado')}
            >
              ESTADO {getSortIcon('estado')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pedidos.map((pedido) => (
            <tr
              key={pedido.id_pedido}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onDoubleClick={() => onRowDoubleClick(pedido)}
            >
              <td className="p-2 font-mono text-xs font-semibold text-blue-600">
                #{pedido.id_pedido}
              </td>
              <td className="p-2 text-xs text-gray-600">
                {formatearFecha(pedido.fecha)}
              </td>
              <td className="p-2">
                <div className="font-medium text-gray-900">
                  {pedido.cliente || 'Cliente no especificado'}
                </div>
                <div className="text-xs text-gray-500">
                  {pedido.email_cliente && pedido.email_cliente}
                </div>
              </td>
              <td className="p-2 text-right">
                <div className="font-semibold text-green-600">
                  ${Number(pedido.monto_total || 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {pedido.cantidad_productos || 0} items
                </div>
              </td>
              <td className="p-2 text-center">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getEstadoStyle(pedido.estado)}`}>
                  {pedido.estado || 'Sin estado'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente para tarjetas en móvil
function TarjetasMovil({ pedidos, onRowDoubleClick, tipo }) {
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

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
      case 'En proceso':
        return '⏳';
      case 'entregado':
        return '✅';
      case 'Anulado':
        return '❌';
      default:
        return '📋';
    }
  };

  const getTipoColor = (tipo) => {
    return tipo === 'pendientes' ? 'border-orange-200' : 'border-green-200';
  };

  return (
    <div className="md:hidden space-y-3">
      {pedidos.map((pedido) => (
        <div
          key={pedido.id_pedido}
          className={`bg-white rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${getTipoColor(tipo)}`}
          onClick={() => onRowDoubleClick(pedido)}
        >
          {/* Header de la tarjeta */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-blue-600">#{pedido.id_pedido}</h3>
              <p className="text-xs text-gray-500">
                {formatearFecha(pedido.fecha)}
              </p>
            </div>
            
            {/* Estado */}
            <div className="flex items-center gap-1">
              <span className="text-base">{getEstadoIcon(pedido.estado)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoStyle(pedido.estado)}`}>
                {pedido.estado || 'Sin estado'}
              </span>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="mb-3">
            <div className="font-semibold text-gray-800 text-sm">
              👤 {pedido.cliente || 'Cliente no especificado'}
            </div>
            {pedido.email_cliente && (
              <div className="text-xs text-gray-600">
                📧 {pedido.email_cliente}
              </div>
            )}
            {pedido.telefono_cliente && (
              <div className="text-xs text-gray-600">
                📞 {pedido.telefono_cliente}
              </div>
            )}
          </div>

          {/* Información financiera */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-sm font-bold text-green-600">
                ${Number(pedido.monto_total || 0).toFixed(2)}
              </div>
              <div className="text-xs text-green-800">Total</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-sm font-bold text-blue-600">
                {pedido.cantidad_productos || 0}
              </div>
              <div className="text-xs text-blue-800">Items</div>
            </div>
          </div>

          {/* Notas si existen */}
          {pedido.notas_local && (
            <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-3 border-yellow-400">
              💬 {pedido.notas_local.length > 40 
                ? `${pedido.notas_local.substring(0, 40)}...` 
                : pedido.notas_local}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              💡 Toca para ver detalles
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente principal
export default function TablaPedidosInicio({
  pedidos,
  onRowDoubleClick,
  loading,
  tipo = 'general'
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPedidos = [...pedidos].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Manejar campos numéricos
    if (sortField === 'id_pedido' || sortField === 'monto_total') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    // Manejar fechas
    if (sortField === 'fecha') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Manejar texto
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Cargando pedidos...</span>
      </div>
    );
  }

  if (!pedidos || pedidos.length === 0) {
    const mensaje = tipo === 'pendientes' 
      ? 'No hay pedidos pendientes' 
      : tipo === 'entregados'
        ? 'No hay pedidos entregados'
        : 'No hay pedidos registrados';

    const icono = tipo === 'pendientes' 
      ? '⏳' 
      : tipo === 'entregados'
        ? '✅'
        : '📋';

    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">{icono}</div>
        <div className="text-sm font-medium mb-1">{mensaje}</div>
        <div className="text-xs">Los pedidos aparecerán aquí cuando se registren</div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabla para escritorio */}
      <TablaEscritorio
        pedidos={sortedPedidos}
        onRowDoubleClick={onRowDoubleClick}
        tipo={tipo}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Tarjetas para móvil */}
      <TarjetasMovil
        pedidos={sortedPedidos}
        onRowDoubleClick={onRowDoubleClick}
        tipo={tipo}
      />
    </div>
  );
}