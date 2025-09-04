// context/PedidosContext.jsx - Context global para gestión de pedidos
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../utils/apiClient';

// ==============================================
// TIPOS DE ACCIONES
// ==============================================
const PEDIDOS_ACTIONS = {
  // Acciones de carga
  SET_LOADING: 'SET_LOADING',
  SET_PEDIDOS_PENDIENTES: 'SET_PEDIDOS_PENDIENTES',
  SET_PEDIDOS_ENTREGADOS: 'SET_PEDIDOS_ENTREGADOS',
  SET_ESTADISTICAS: 'SET_ESTADISTICAS',
  
  // Acciones optimistas
  OPTIMISTIC_UPDATE_PEDIDO: 'OPTIMISTIC_UPDATE_PEDIDO',
  OPTIMISTIC_ADD_PRODUCTO: 'OPTIMISTIC_ADD_PRODUCTO',
  OPTIMISTIC_UPDATE_PRODUCTO: 'OPTIMISTIC_UPDATE_PRODUCTO',
  OPTIMISTIC_REMOVE_PRODUCTO: 'OPTIMISTIC_REMOVE_PRODUCTO',
  OPTIMISTIC_CHANGE_ESTADO: 'OPTIMISTIC_CHANGE_ESTADO',
  
  // Acciones de confirmación/rollback
  CONFIRM_CHANGES: 'CONFIRM_CHANGES',
  ROLLBACK_CHANGES: 'ROLLBACK_CHANGES',
  
  // Acciones de error
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// ==============================================
// ESTADO INICIAL
// ==============================================
const initialState = {
  pedidosPendientes: [],
  pedidosEntregados: [],
  estadisticas: null,
  loading: false,
  error: null,
  
  // Estado para operaciones optimistas
  pendingOperations: new Map(), // pedidoId -> { type, originalData, changes }
  operationInProgress: false,
};

// ==============================================
// FUNCIONES HELPER
// ==============================================

// Calcular totales de un pedido basado en sus productos
const calcularTotalesPedido = (productos) => {
  const cantidadTotal = productos.reduce((total, producto) => {
    return total + (parseInt(producto.cantidad) || 0);
  }, 0);
  
  const montoTotal = productos.reduce((total, producto) => {
    return total + (parseFloat(producto.subtotal) || 0);
  }, 0);
  
  return { cantidadTotal, montoTotal };
};

// Encontrar pedido en cualquier lista
const findPedidoInState = (state, pedidoId) => {
  let pedido = state.pedidosPendientes.find(p => (p.id_pedido || p.id) === pedidoId);
  let lista = 'pendientes';
  
  if (!pedido) {
    pedido = state.pedidosEntregados.find(p => (p.id_pedido || p.id) === pedidoId);
    lista = 'entregados';
  }
  
  return { pedido, lista };
};

// ==============================================
// REDUCER
// ==============================================
const pedidosReducer = (state, action) => {
  switch (action.type) {
    case PEDIDOS_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };

    case PEDIDOS_ACTIONS.SET_PEDIDOS_PENDIENTES:
      return {
        ...state,
        pedidosPendientes: action.payload,
        loading: false,
        error: null
      };

    case PEDIDOS_ACTIONS.SET_PEDIDOS_ENTREGADOS:
      return {
        ...state,
        pedidosEntregados: action.payload,
        loading: false,
        error: null
      };

    case PEDIDOS_ACTIONS.SET_ESTADISTICAS:
      return {
        ...state,
        estadisticas: action.payload
      };

    // OPTIMISTIC UPDATE - Actualizar pedido completo
    case PEDIDOS_ACTIONS.OPTIMISTIC_UPDATE_PEDIDO: {
      const { pedidoId, changes, operationType } = action.payload;
      const { pedido, lista } = findPedidoInState(state, pedidoId);
      
      if (!pedido) return state;

      // Guardar estado original para posible rollback
      const newPendingOps = new Map(state.pendingOperations);
      if (!newPendingOps.has(pedidoId)) {
        newPendingOps.set(pedidoId, {
          type: operationType,
          originalData: { ...pedido },
          changes: []
        });
      }

      // Aplicar cambios
      const updatedPedido = { ...pedido, ...changes };
      
      const targetList = lista === 'pendientes' ? 'pedidosPendientes' : 'pedidosEntregados';
      
      return {
        ...state,
        [targetList]: state[targetList].map(p => 
          (p.id_pedido || p.id) === pedidoId ? updatedPedido : p
        ),
        pendingOperations: newPendingOps,
        operationInProgress: true
      };
    }

    // OPTIMISTIC ADD PRODUCTO
    case PEDIDOS_ACTIONS.OPTIMISTIC_ADD_PRODUCTO: {
      const { pedidoId, producto, operationType } = action.payload;
      const { pedido, lista } = findPedidoInState(state, pedidoId);
      
      if (!pedido) return state;

      // Crear producto temporal con ID negativo
      const tempProducto = {
        ...producto,
        id: -Date.now(), // ID temporal negativo
        cantidad: producto.cantidad,
        precio: producto.precio,
        subtotal: producto.cantidad * producto.precio
      };

      // Simular productos actualizados
      const productosActualizados = [...(pedido.productos || []), tempProducto];
      const { cantidadTotal, montoTotal } = calcularTotalesPedido(productosActualizados);

      // Guardar para rollback
      const newPendingOps = new Map(state.pendingOperations);
      if (!newPendingOps.has(pedidoId)) {
        newPendingOps.set(pedidoId, {
          type: operationType,
          originalData: { ...pedido },
          changes: []
        });
      }

      const updatedPedido = {
        ...pedido,
        productos: productosActualizados,
        cantidad_productos: cantidadTotal,
        monto_total: montoTotal
      };

      const targetList = lista === 'pendientes' ? 'pedidosPendientes' : 'pedidosEntregados';
      
      return {
        ...state,
        [targetList]: state[targetList].map(p => 
          (p.id_pedido || p.id) === pedidoId ? updatedPedido : p
        ),
        pendingOperations: newPendingOps,
        operationInProgress: true
      };
    }

    // OPTIMISTIC UPDATE PRODUCTO
    case PEDIDOS_ACTIONS.OPTIMISTIC_UPDATE_PRODUCTO: {
      const { pedidoId, productoId, changes, operationType } = action.payload;
      const { pedido, lista } = findPedidoInState(state, pedidoId);
      
      if (!pedido || !pedido.productos) return state;

      // Guardar para rollback
      const newPendingOps = new Map(state.pendingOperations);
      if (!newPendingOps.has(pedidoId)) {
        newPendingOps.set(pedidoId, {
          type: operationType,
          originalData: { ...pedido },
          changes: []
        });
      }

      // Actualizar producto específico
      const productosActualizados = pedido.productos.map(producto => {
        if (producto.id === productoId) {
          const productoActualizado = { ...producto, ...changes };
          productoActualizado.subtotal = productoActualizado.cantidad * productoActualizado.precio;
          return productoActualizado;
        }
        return producto;
      });

      const { cantidadTotal, montoTotal } = calcularTotalesPedido(productosActualizados);

      const updatedPedido = {
        ...pedido,
        productos: productosActualizados,
        cantidad_productos: cantidadTotal,
        monto_total: montoTotal
      };

      const targetList = lista === 'pendientes' ? 'pedidosPendientes' : 'pedidosEntregados';
      
      return {
        ...state,
        [targetList]: state[targetList].map(p => 
          (p.id_pedido || p.id) === pedidoId ? updatedPedido : p
        ),
        pendingOperations: newPendingOps,
        operationInProgress: true
      };
    }

    // OPTIMISTIC REMOVE PRODUCTO
    case PEDIDOS_ACTIONS.OPTIMISTIC_REMOVE_PRODUCTO: {
      const { pedidoId, productoId, operationType } = action.payload;
      const { pedido, lista } = findPedidoInState(state, pedidoId);
      
      if (!pedido || !pedido.productos) return state;

      // Guardar para rollback
      const newPendingOps = new Map(state.pendingOperations);
      if (!newPendingOps.has(pedidoId)) {
        newPendingOps.set(pedidoId, {
          type: operationType,
          originalData: { ...pedido },
          changes: []
        });
      }

      // Remover producto
      const productosActualizados = pedido.productos.filter(producto => producto.id !== productoId);
      const { cantidadTotal, montoTotal } = calcularTotalesPedido(productosActualizados);

      const updatedPedido = {
        ...pedido,
        productos: productosActualizados,
        cantidad_productos: cantidadTotal,
        monto_total: montoTotal
      };

      const targetList = lista === 'pendientes' ? 'pedidosPendientes' : 'pedidosEntregados';
      
      return {
        ...state,
        [targetList]: state[targetList].map(p => 
          (p.id_pedido || p.id) === pedidoId ? updatedPedido : p
        ),
        pendingOperations: newPendingOps,
        operationInProgress: true
      };
    }

    // OPTIMISTIC CHANGE ESTADO
    case PEDIDOS_ACTIONS.OPTIMISTIC_CHANGE_ESTADO: {
      const { pedidoId, nuevoEstado, operationType } = action.payload;
      const { pedido, lista } = findPedidoInState(state, pedidoId);
      
      if (!pedido) return state;

      // Guardar para rollback
      const newPendingOps = new Map(state.pendingOperations);
      if (!newPendingOps.has(pedidoId)) {
        newPendingOps.set(pedidoId, {
          type: operationType,
          originalData: { ...pedido },
          originalList: lista,
          changes: []
        });
      }

      const updatedPedido = { ...pedido, estado: nuevoEstado };

      // Determinar si el pedido debe cambiar de lista
      const shouldMoveToPendientes = ['pendiente', 'confirmado'].includes(nuevoEstado.toLowerCase());
      const shouldMoveToEntregados = ['entregado'].includes(nuevoEstado.toLowerCase());
      
      let newPendientes = [...state.pedidosPendientes];
      let newEntregados = [...state.pedidosEntregados];

      if (lista === 'pendientes' && shouldMoveToEntregados) {
        // Mover de pendientes a entregados
        newPendientes = newPendientes.filter(p => (p.id_pedido || p.id) !== pedidoId);
        newEntregados = [...newEntregados, updatedPedido];
      } else if (lista === 'entregados' && shouldMoveToPendientes) {
        // Mover de entregados a pendientes
        newEntregados = newEntregados.filter(p => (p.id_pedido || p.id) !== pedidoId);
        newPendientes = [...newPendientes, updatedPedido];
      } else {
        // Actualizar en la misma lista
        const targetList = lista === 'pendientes' ? newPendientes : newEntregados;
        const updatedList = targetList.map(p => 
          (p.id_pedido || p.id) === pedidoId ? updatedPedido : p
        );
        
        if (lista === 'pendientes') {
          newPendientes = updatedList;
        } else {
          newEntregados = updatedList;
        }
      }

      return {
        ...state,
        pedidosPendientes: newPendientes,
        pedidosEntregados: newEntregados,
        pendingOperations: newPendingOps,
        operationInProgress: true
      };
    }

    // CONFIRMAR CAMBIOS
    case PEDIDOS_ACTIONS.CONFIRM_CHANGES: {
      const { pedidoId } = action.payload;
      const newPendingOps = new Map(state.pendingOperations);
      newPendingOps.delete(pedidoId);

      return {
        ...state,
        pendingOperations: newPendingOps,
        operationInProgress: newPendingOps.size > 0
      };
    }

    // ROLLBACK CAMBIOS
    case PEDIDOS_ACTIONS.ROLLBACK_CHANGES: {
      const { pedidoId } = action.payload;
      const operation = state.pendingOperations.get(pedidoId);
      
      if (!operation) return state;

      const { originalData, originalList } = operation;
      const newPendingOps = new Map(state.pendingOperations);
      newPendingOps.delete(pedidoId);

      // Restaurar pedido original
      let newPendientes = [...state.pedidosPendientes];
      let newEntregados = [...state.pedidosEntregados];

      // Remover de ambas listas primero
      newPendientes = newPendientes.filter(p => (p.id_pedido || p.id) !== pedidoId);
      newEntregados = newEntregados.filter(p => (p.id_pedido || p.id) !== pedidoId);

      // Agregar a la lista original
      if (originalList === 'pendientes') {
        newPendientes.push(originalData);
      } else {
        newEntregados.push(originalData);
      }

      return {
        ...state,
        pedidosPendientes: newPendientes,
        pedidosEntregados: newEntregados,
        pendingOperations: newPendingOps,
        operationInProgress: newPendingOps.size > 0
      };
    }

    case PEDIDOS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        operationInProgress: false
      };

    case PEDIDOS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// ==============================================
// CONTEXT
// ==============================================
const PedidosContext = createContext();

export const usePedidos = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos debe ser usado dentro de PedidosProvider');
  }
  return context;
};

// ==============================================
// PROVIDER
// ==============================================
export const PedidosProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pedidosReducer, initialState);

  // ==============================================
  // FUNCIONES DE CARGA INICIAL
  // ==============================================
  
  const cargarPedidos = useCallback(async () => {
    dispatch({ type: PEDIDOS_ACTIONS.SET_LOADING, payload: true });
    
    try {
      console.log('🔄 Cargando pedidos desde API...');
      
      const [pendientesRes, entregadosRes] = await Promise.all([
        axiosAuth.get('/admin/pedidos-pendientes'),
        axiosAuth.get('/admin/pedidos-entregados')
      ]);

      const pendientes = pendientesRes.data || [];
      const entregados = entregadosRes.data || [];

      dispatch({ type: PEDIDOS_ACTIONS.SET_PEDIDOS_PENDIENTES, payload: pendientes });
      dispatch({ type: PEDIDOS_ACTIONS.SET_PEDIDOS_ENTREGADOS, payload: entregados });

      // Calcular estadísticas
      const totalVentas = [...pendientes, ...entregados].reduce((total, pedido) => {
        return total + (Number(pedido.monto_total) || 0);
      }, 0);

      const stats = {
        pendientes: pendientes.length,
        entregados: entregados.length,
        total: pendientes.length + entregados.length,
        totalVentas: totalVentas
      };

      dispatch({ type: PEDIDOS_ACTIONS.SET_ESTADISTICAS, payload: stats });
      
      console.log(`✅ Pedidos cargados: ${pendientes.length} pendientes, ${entregados.length} entregados`);
      
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      dispatch({ type: PEDIDOS_ACTIONS.SET_ERROR, payload: 'Error al cargar pedidos' });
      toast.error('Error al cargar pedidos');
    }
  }, []);

  // Cargar productos de un pedido específico
  const cargarProductosPedido = useCallback(async (pedidoId) => {
    try {
      console.log(`🔄 Cargando productos del pedido ${pedidoId}...`);
      
      const response = await axiosAuth.get(`/admin/pedidos-productos/${pedidoId}`);
      // DEBUG TEMPORAL - Ver toda la respuesta
    console.log('🔍 RESPONSE COMPLETA:', response);
    console.log('🔍 RESPONSE.DATA:', response.data);
      // CORRECCIÓN: Manejar tanto el formato nuevo como el antiguo
      let productos = [];
      
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          // Formato nuevo de las funciones mejoradas
          productos = response.data.data;
          console.log('✅ Formato nuevo detectado - productos en .data');
        } else if (Array.isArray(response.data)) {
          // Formato antiguo
          productos = response.data;
          console.log('✅ Formato antiguo detectado - productos directos');
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response.data);
          productos = [];
        }
      }
      
      console.log(`📦 Productos procesados:`, productos);
      
      // Actualizar el pedido con sus productos en el estado
      const { pedido, lista } = findPedidoInState(state, pedidoId);
      if (pedido) {
        const updatedPedido = { ...pedido, productos };
        
        dispatch({
          type: PEDIDOS_ACTIONS.OPTIMISTIC_UPDATE_PEDIDO,
          payload: {
            pedidoId,
            changes: { productos },
            operationType: 'LOAD_PRODUCTOS'
          }
        });
        
        // Confirmar inmediatamente ya que es solo carga
        setTimeout(() => {
          dispatch({
            type: PEDIDOS_ACTIONS.CONFIRM_CHANGES,
            payload: { pedidoId }
          });
        }, 0);
      }
      
      console.log(`✅ ${productos.length} productos cargados para pedido ${pedidoId}`);
      return productos;
      
    } catch (error) {
      console.error(`❌ Error cargando productos del pedido ${pedidoId}:`, error);
      console.error('Stack trace:', error.stack);
      toast.error('Error al cargar productos del pedido');
      return [];
    }
  }, [state]);

  // ==============================================
  // FUNCIONES OPTIMISTAS
  // ==============================================

  const agregarProductoOptimistic = useCallback(async (pedidoId, producto, cantidad) => {
    const operationType = 'ADD_PRODUCTO';
    
    try {
      // 1. Actualización optimista inmediata
      console.log(`🚀 OPTIMISTIC: Agregando producto al pedido ${pedidoId}`);
      
      dispatch({
        type: PEDIDOS_ACTIONS.OPTIMISTIC_ADD_PRODUCTO,
        payload: {
          pedidoId,
          producto: {
            ...producto,
            cantidad,
            precio: producto.precio || 0,
            nombre_producto: producto.nombre
          },
          operationType
        }
      });

      // 2. Confirmación con servidor
      const response = await axiosAuth.post('/admin/agregar-producto', {
        id_pedido: pedidoId,
        codigo_barra: producto.codigo_barra,
        nombre_producto: producto.nombre,
        cantidad,
        precio: producto.precio || 0,
        subtotal: (producto.precio || 0) * cantidad
      });

      if (response.data.success) {
        // 3. Confirmar cambios
        console.log(`✅ CONFIRMADO: Producto agregado al pedido ${pedidoId}`);
        dispatch({
          type: PEDIDOS_ACTIONS.CONFIRM_CHANGES,
          payload: { pedidoId }
        });
        
        toast.success('Producto agregado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al agregar producto');
      }

    } catch (error) {
      // 4. Rollback en caso de error
      console.error(`❌ ERROR: Rollback agregar producto en pedido ${pedidoId}:`, error);
      
      dispatch({
        type: PEDIDOS_ACTIONS.ROLLBACK_CHANGES,
        payload: { pedidoId }
      });
      
      toast.error('Error al agregar producto: ' + error.message);
      return false;
    }
  }, []);

  const actualizarProductoOptimistic = useCallback(async (pedidoId, productoId, cambios) => {
    const operationType = 'UPDATE_PRODUCTO';
    
    try {
      // 1. Actualización optimista
      console.log(`🚀 OPTIMISTIC: Actualizando producto ${productoId} en pedido ${pedidoId}`);
      
      dispatch({
        type: PEDIDOS_ACTIONS.OPTIMISTIC_UPDATE_PRODUCTO,
        payload: {
          pedidoId,
          productoId,
          changes: cambios,
          operationType
        }
      });

      // 2. Confirmación con servidor
      const response = await axiosAuth.put(`/admin/actualizar-producto/${productoId}`, cambios);

      if (response.data.success) {
        // 3. Confirmar cambios
        console.log(`✅ CONFIRMADO: Producto ${productoId} actualizado`);
        dispatch({
          type: PEDIDOS_ACTIONS.CONFIRM_CHANGES,
          payload: { pedidoId }
        });
        
        toast.success('Producto actualizado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al actualizar producto');
      }

    } catch (error) {
      // 4. Rollback en caso de error
      console.error(`❌ ERROR: Rollback actualizar producto ${productoId}:`, error);
      
      dispatch({
        type: PEDIDOS_ACTIONS.ROLLBACK_CHANGES,
        payload: { pedidoId }
      });
      
      toast.error('Error al actualizar producto: ' + error.message);
      return false;
    }
  }, []);

  const eliminarProductoOptimistic = useCallback(async (pedidoId, productoId) => {
    const operationType = 'REMOVE_PRODUCTO';
    
    try {
      // 1. Actualización optimista
      console.log(`🚀 OPTIMISTIC: Eliminando producto ${productoId} de pedido ${pedidoId}`);
      
      dispatch({
        type: PEDIDOS_ACTIONS.OPTIMISTIC_REMOVE_PRODUCTO,
        payload: {
          pedidoId,
          productoId,
          operationType
        }
      });

      // 2. Confirmación con servidor
      const response = await axiosAuth.delete(`/admin/eliminar-producto/${productoId}`);

      if (response.data.success) {
        // 3. Confirmar cambios
        console.log(`✅ CONFIRMADO: Producto ${productoId} eliminado`);
        dispatch({
          type: PEDIDOS_ACTIONS.CONFIRM_CHANGES,
          payload: { pedidoId }
        });
        
        toast.success('Producto eliminado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar producto');
      }

    } catch (error) {
      // 4. Rollback en caso de error
      console.error(`❌ ERROR: Rollback eliminar producto ${productoId}:`, error);
      
      dispatch({
        type: PEDIDOS_ACTIONS.ROLLBACK_CHANGES,
        payload: { pedidoId }
      });
      
      toast.error('Error al eliminar producto: ' + error.message);
      return false;
    }
  }, []);

  const cambiarEstadoPedidoOptimistic = useCallback(async (pedidoId, nuevoEstado) => {
    const operationType = 'CHANGE_ESTADO';
    
    try {
      // 1. Actualización optimista
      console.log(`🚀 OPTIMISTIC: Cambiando estado del pedido ${pedidoId} a ${nuevoEstado}`);
      
      dispatch({
        type: PEDIDOS_ACTIONS.OPTIMISTIC_CHANGE_ESTADO,
        payload: {
          pedidoId,
          nuevoEstado,
          operationType
        }
      });

      // 2. Confirmación con servidor
      const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
        estado: nuevoEstado
      });

      if (response.data.success) {
        // 3. Confirmar cambios
        console.log(`✅ CONFIRMADO: Estado del pedido ${pedidoId} cambiado a ${nuevoEstado}`);
        dispatch({
          type: PEDIDOS_ACTIONS.CONFIRM_CHANGES,
          payload: { pedidoId }
        });
        
        toast.success(`Pedido marcado como ${nuevoEstado}`);
        return true;
      } else {
        throw new Error(response.data.message || 'Error al cambiar estado');
      }

    } catch (error) {
      // 4. Rollback en caso de error
      console.error(`❌ ERROR: Rollback cambiar estado del pedido ${pedidoId}:`, error);
      
      dispatch({
        type: PEDIDOS_ACTIONS.ROLLBACK_CHANGES,
        payload: { pedidoId }
      });
      
      toast.error('Error al cambiar estado: ' + error.message);
      return false;
    }
  }, []);

  // ==============================================
  // FUNCIONES DE UTILIDAD
  // ==============================================

  const obtenerPedidoPorId = useCallback((pedidoId) => {
    const { pedido } = findPedidoInState(state, pedidoId);
    return pedido;
  }, [state]);

  const hayOperacionEnProgreso = useCallback((pedidoId) => {
    return pedidoId ? state.pendingOperations.has(pedidoId) : state.operationInProgress;
  }, [state.pendingOperations, state.operationInProgress]);

  // ==============================================
  // VALOR DEL CONTEXT
  // ==============================================
  const value = {
    // Estado
    ...state,
    
    // Funciones de carga
    cargarPedidos,
    cargarProductosPedido,
    
    // Funciones optimistas
    agregarProductoOptimistic,
    actualizarProductoOptimistic,
    eliminarProductoOptimistic,
    cambiarEstadoPedidoOptimistic,
    
    // Utilidades
    obtenerPedidoPorId,
    hayOperacionEnProgreso,
    
    // Control de errores
    clearError: () => dispatch({ type: PEDIDOS_ACTIONS.CLEAR_ERROR })
  };

  return (
    <PedidosContext.Provider value={value}>
      {children}
    </PedidosContext.Provider>
  );
};