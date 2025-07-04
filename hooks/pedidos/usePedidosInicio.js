// hooks/pedidos/usePedidosInicio.js - Hook para gestión de pedidos en página de inicio
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const usePedidosInicio = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);

  const cargarPedidosPendientes = useCallback(async () => {
    try {
      console.log('🔄 Cargando pedidos pendientes...');
      const response = await axiosAuth.get('/admin/pedidos-pendientes');
      
      if (response.data && Array.isArray(response.data)) {
        setPedidosPendientes(response.data);
        console.log(`✅ ${response.data.length} pedidos pendientes cargados`);
        return response.data;
      } else {
        console.warn('⚠️ Respuesta inesperada para pedidos pendientes:', response.data);
        setPedidosPendientes([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando pedidos pendientes:', error);
      toast.error('Error al cargar pedidos pendientes');
      setPedidosPendientes([]);
      return [];
    }
  }, []);

  const cargarPedidosEntregados = useCallback(async () => {
    try {
      console.log('🔄 Cargando pedidos entregados...');
      const response = await axiosAuth.get('/admin/pedidos-entregados');
      
      if (response.data && Array.isArray(response.data)) {
        setPedidosEntregados(response.data);
        console.log(`✅ ${response.data.length} pedidos entregados cargados`);
        return response.data;
      } else {
        console.warn('⚠️ Respuesta inesperada para pedidos entregados:', response.data);
        setPedidosEntregados([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando pedidos entregados:', error);
      toast.error('Error al cargar pedidos entregados');
      setPedidosEntregados([]);
      return [];
    }
  }, []);

  const calcularEstadisticas = useCallback((pendientes, entregados) => {
    const totalVentas = [...pendientes, ...entregados].reduce((total, pedido) => {
      return total + (Number(pedido.monto_total) || 0);
    }, 0);

    const stats = {
      pendientes: pendientes.length,
      entregados: entregados.length,
      total: pendientes.length + entregados.length,
      totalVentas: totalVentas
    };

    setEstadisticas(stats);
    console.log('📊 Estadísticas calculadas:', stats);
    return stats;
  }, []);

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Iniciando carga completa de pedidos...');
      
      // Cargar ambos tipos de pedidos en paralelo
      const [pendientes, entregados] = await Promise.all([
        cargarPedidosPendientes(),
        cargarPedidosEntregados()
      ]);

      // Calcular estadísticas
      calcularEstadisticas(pendientes, entregados);
      
      console.log('✅ Carga completa de pedidos finalizada');
      
    } catch (error) {
      console.error('❌ Error en carga completa de pedidos:', error);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, [cargarPedidosPendientes, cargarPedidosEntregados, calcularEstadisticas]);

  // Función para actualizar un pedido específico en el estado
  const actualizarPedidoEnEstado = useCallback((pedidoActualizado) => {
    const pedidoId = pedidoActualizado.id_pedido || pedidoActualizado.id;
    
    // Actualizar en pendientes
    setPedidosPendientes(prev => 
      prev.map(pedido => 
        (pedido.id_pedido || pedido.id) === pedidoId 
          ? { ...pedido, ...pedidoActualizado }
          : pedido
      )
    );
    
    // Actualizar en entregados
    setPedidosEntregados(prev => 
      prev.map(pedido => 
        (pedido.id_pedido || pedido.id) === pedidoId 
          ? { ...pedido, ...pedidoActualizado }
          : pedido
      )
    );
    
    console.log(`🔄 Pedido ${pedidoId} actualizado en estado local`);
  }, []);

  // Función para cambiar estado de un pedido
  const cambiarEstadoPedido = useCallback(async (pedidoId, nuevoEstado) => {
    try {
      console.log(`🔄 Cambiando estado del pedido ${pedidoId} a: ${nuevoEstado}`);
      
      const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
        estado: nuevoEstado
      });

      if (response.data.success) {
        console.log(`✅ Estado del pedido ${pedidoId} actualizado a ${nuevoEstado}`);
        
        // Recargar pedidos para reflejar los cambios
        await cargarPedidos();
        
        toast.success(`Pedido #${pedidoId} marcado como ${nuevoEstado}`);
        return true;
      } else {
        throw new Error(response.data.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error(`❌ Error cambiando estado del pedido ${pedidoId}:`, error);
      toast.error('Error al cambiar estado del pedido');
      return false;
    }
  }, [cargarPedidos]);

  // Función para eliminar un pedido
  const eliminarPedido = useCallback(async (pedidoId) => {
    try {
      console.log(`🗑️ Eliminando pedido ${pedidoId}...`);
      
      const response = await axiosAuth.delete(`/admin/eliminarPedido/${pedidoId}`);

      if (response.data.success) {
        console.log(`✅ Pedido ${pedidoId} eliminado exitosamente`);
        
        // Remover del estado local
        setPedidosPendientes(prev => 
          prev.filter(pedido => (pedido.id_pedido || pedido.id) !== pedidoId)
        );
        setPedidosEntregados(prev => 
          prev.filter(pedido => (pedido.id_pedido || pedido.id) !== pedidoId)
        );
        
        // Recalcular estadísticas
        const nuevasPendientes = pedidosPendientes.filter(p => (p.id_pedido || p.id) !== pedidoId);
        const nuevasEntregadas = pedidosEntregados.filter(p => (p.id_pedido || p.id) !== pedidoId);
        calcularEstadisticas(nuevasPendientes, nuevasEntregadas);
        
        toast.success(`Pedido #${pedidoId} eliminado correctamente`);
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar pedido');
      }
    } catch (error) {
      console.error(`❌ Error eliminando pedido ${pedidoId}:`, error);
      toast.error('Error al eliminar el pedido');
      return false;
    }
  }, [pedidosPendientes, pedidosEntregados, calcularEstadisticas]);

  return {
    // Estados
    pedidosPendientes,
    pedidosEntregados,
    loading,
    estadisticas,
    
    // Funciones
    cargarPedidos,
    cargarPedidosPendientes,
    cargarPedidosEntregados,
    actualizarPedidoEnEstado,
    cambiarEstadoPedido,
    eliminarPedido,
    calcularEstadisticas
  };
};