// hooks/pedidos/useEditarPedido.js - Hook para edición de pedidos con sincronización automática
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useEditarPedido = () => {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para cargar productos de un pedido - CON DEBUG
  const cargarProductosPedido = useCallback(async (pedido) => {
    if (!pedido) {
      console.warn('⚠️ No se proporcionó pedido para cargar productos');
      return;
    }

    setLoading(true);
    
    // Debug del pedido recibido
    console.log('🔍 Pedido recibido para cargar productos:', {
      id: pedido.id_pedido || pedido.id,
      estado: pedido.estado,
      cliente: pedido.cliente,
      pedidoCompleto: pedido
    });
    
    setSelectedPedido(pedido);
    
    try {
      const pedidoId = pedido.id_pedido || pedido.id;
      console.log('🔄 Cargando productos del pedido:', pedidoId);
      
      const response = await axiosAuth.get(`/admin/pedidos-productos/${pedidoId}`);
      
      if (response.data && Array.isArray(response.data)) {
        setProductos(response.data);
        console.log(`✅ ${response.data.length} productos cargados para pedido ${pedidoId}`);
      } else {
        console.warn('⚠️ Respuesta inesperada para productos del pedido:', response.data);
        setProductos([]);
      }
    } catch (error) {
      console.error('❌ Error cargando productos del pedido:', error);
      toast.error('Error al cargar productos del pedido');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para verificar stock de un producto
  const verificarStock = useCallback(async (codigoBarra) => {
    try {
      console.log(`🔍 Verificando stock para código: ${codigoBarra}`);
      
      const response = await axiosAuth.get(`/admin/productos?search=${codigoBarra}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const producto = response.data.find(p => p.codigo_barra === codigoBarra);
        const stock = producto?.stock || 0;
        
        console.log(`📦 Stock encontrado para ${codigoBarra}: ${stock}`);
        return stock;
      } else {
        console.warn(`⚠️ No se encontró stock para código: ${codigoBarra}`);
        return 0;
      }
    } catch (error) {
      console.error(`❌ Error verificando stock para ${codigoBarra}:`, error);
      return 0;
    }
  }, []);

  // Función para calcular totales del pedido
  const calcularTotales = useCallback(() => {
    if (!productos || productos.length === 0) {
      return {
        subtotal: 0,
        total: 0,
        cantidadProductos: 0
      };
    }

    const subtotal = productos.reduce((total, producto) => {
      return total + (parseFloat(producto.subtotal) || 0);
    }, 0);

    const cantidadProductos = productos.reduce((total, producto) => {
      return total + (parseInt(producto.cantidad) || 0);
    }, 0);

    return {
      subtotal: subtotal,
      total: subtotal, // En este caso el total es igual al subtotal
      cantidadProductos: cantidadProductos
    };
  }, [productos]);

  // Función para sincronizar totales en el backend
  const sincronizarTotales = useCallback(async (pedidoActualizado = null) => {
    const pedidoParaSincronizar = pedidoActualizado || selectedPedido;
    if (!pedidoParaSincronizar) return false;

    try {
      const totales = calcularTotales();
      const pedidoId = pedidoParaSincronizar.id_pedido || pedidoParaSincronizar.id;
      
      console.log(`🔄 Sincronizando totales del pedido ${pedidoId}:`, totales);

      const response = await axiosAuth.put(`/admin/actualizar-pedido/${pedidoId}`, {
        monto_total: totales.total,
        cantidad_productos: totales.cantidadProductos
      });

      if (response.data.success) {
        console.log(`✅ Totales sincronizados para pedido ${pedidoId}`);
        
        // Actualizar el pedido seleccionado con los nuevos totales
        setSelectedPedido(prev => ({
          ...prev,
          monto_total: totales.total,
          cantidad_productos: totales.cantidadProductos
        }));
        
        return true;
      } else {
        throw new Error(response.data.message || 'Error al sincronizar totales');
      }
    } catch (error) {
      console.error('❌ Error sincronizando totales:', error);
      toast.error('Error al actualizar totales del pedido');
      return false;
    }
  }, [selectedPedido, calcularTotales]);

  // Función para agregar un producto al pedido
  const agregarProducto = useCallback(async (producto, cantidad) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    try {
      const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
      console.log(`🔄 Agregando producto al pedido ${pedidoId}:`, {
        producto: producto.nombre,
        cantidad
      });

      const subtotal = (parseFloat(producto.precio) || 0) * parseInt(cantidad);

      const datosProducto = {
        id_pedido: pedidoId,
        codigo_barra: producto.codigo_barra,
        nombre_producto: producto.nombre,
        cantidad: parseInt(cantidad),
        precio: parseFloat(producto.precio) || 0,
        subtotal: subtotal
      };

      const response = await axiosAuth.post('/admin/agregar-producto', datosProducto);

      if (response.data.success) {
        console.log(`✅ Producto agregado exitosamente al pedido ${pedidoId}`);
        
        // Recargar productos del pedido para reflejar cambios
        await cargarProductosPedido(selectedPedido);
        
        // Sincronizar totales automáticamente
        await sincronizarTotales();
        
        toast.success('Producto agregado al pedido');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al agregar producto');
      }
    } catch (error) {
      console.error('❌ Error agregando producto al pedido:', error);
      toast.error('Error al agregar producto al pedido');
      return false;
    }
  }, [selectedPedido, cargarProductosPedido, sincronizarTotales]);

  // Función para actualizar un producto en el pedido
  const actualizarProducto = useCallback(async (productoActualizado) => {
    if (!selectedPedido || !productoActualizado) {
      toast.error('Datos insuficientes para actualizar producto');
      return false;
    }

    try {
      const productoId = productoActualizado.id;
      console.log(`🔄 Actualizando producto ${productoId}:`, productoActualizado);

      const datosActualizacion = {
        nombre_producto: productoActualizado.nombre_producto,
        cantidad: parseInt(productoActualizado.cantidad),
        precio: parseFloat(productoActualizado.precio)
      };

      const response = await axiosAuth.put(`/admin/actualizar-producto/${productoId}`, datosActualizacion);

      if (response.data.success) {
        console.log(`✅ Producto ${productoId} actualizado exitosamente`);
        
        // Recargar productos del pedido para reflejar cambios
        await cargarProductosPedido(selectedPedido);
        
        // Sincronizar totales automáticamente
        await sincronizarTotales();
        
        toast.success('Producto actualizado correctamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al actualizar producto');
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      toast.error('Error al actualizar producto');
      return false;
    }
  }, [selectedPedido, cargarProductosPedido, sincronizarTotales]);

  // Función para eliminar un producto del pedido
  const eliminarProducto = useCallback(async (producto) => {
    if (!selectedPedido || !producto) {
      toast.error('Datos insuficientes para eliminar producto');
      return false;
    }

    try {
      const productoId = producto.id;
      const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
      
      console.log(`🗑️ Eliminando producto ${productoId} del pedido ${pedidoId}`);

      const response = await axiosAuth.delete(`/admin/eliminar-producto/${productoId}`);

      if (response.data.success) {
        console.log(`✅ Producto ${productoId} eliminado exitosamente`);
        
        // Recargar productos del pedido para reflejar cambios
        await cargarProductosPedido(selectedPedido);
        
        // Sincronizar totales automáticamente
        await sincronizarTotales();
        
        toast.success('Producto eliminado del pedido');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      toast.error('Error al eliminar producto');
      return false;
    }
  }, [selectedPedido, cargarProductosPedido, sincronizarTotales]);

  // Función para confirmar pedido
  const confirmarPedido = useCallback(async () => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    try {
      const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
      console.log(`🔄 Confirmando pedido ${pedidoId}`);

      const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
        estado: 'confirmado'
      });

      if (response.data.success) {
        console.log(`✅ Pedido ${pedidoId} confirmado exitosamente`);
        
        // Actualizar estado local
        setSelectedPedido(prev => ({
          ...prev,
          estado: 'confirmado'
        }));
        
        toast.success('Pedido confirmado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al confirmar pedido');
      }
    } catch (error) {
      console.error('❌ Error confirmando pedido:', error);
      toast.error('Error al confirmar pedido');
      return false;
    }
  }, [selectedPedido]);

  // Función para enviar pedido
  const enviarPedido = useCallback(async (horarioDesde, horarioHasta) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    try {
      const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
      console.log(`🔄 Enviando pedido ${pedidoId} con horario ${horarioDesde} - ${horarioHasta}`);

      const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
        estado: 'entregado'
      });

      if (response.data.success) {
        console.log(`✅ Pedido ${pedidoId} marcado como entregado`);
        
        // Actualizar estado local
        setSelectedPedido(prev => ({
          ...prev,
          estado: 'entregado'
        }));
        
        toast.success('Pedido enviado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al enviar pedido');
      }
    } catch (error) {
      console.error('❌ Error enviando pedido:', error);
      toast.error('Error al enviar pedido');
      return false;
    }
  }, [selectedPedido]);

  // Función para anular pedido
  const anularPedido = useCallback(async () => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    try {
      const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
      console.log(`🔄 Anulando pedido ${pedidoId}`);

      const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
        estado: 'Anulado'
      });

      if (response.data.success) {
        console.log(`✅ Pedido ${pedidoId} anulado exitosamente`);
        
        // Actualizar estado local
        setSelectedPedido(prev => ({
          ...prev,
          estado: 'Anulado'
        }));
        
        toast.success('Pedido anulado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al anular pedido');
      }
    } catch (error) {
      console.error('❌ Error anulando pedido:', error);
      toast.error('Error al anular pedido');
      return false;
    }
  }, [selectedPedido]);

  // Función para enviar email de pedido confirmado
  const enviarEmailConfirmado = useCallback(async () => {
    if (!selectedPedido) return false;

    try {
      const emailData = {
        storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'PuntoSur',
        name: selectedPedido.cliente,
        clientMail: selectedPedido.email_cliente,
        items: productos.map(producto => ({
          name: producto.nombre_producto,
          quantity: producto.cantidad,
          price: producto.precio
        })),
        subtotal: productos.reduce((total, producto) => total + parseFloat(producto.subtotal), 0),
        shippingCost: selectedPedido.costo_envio || 0,
        total: productos.reduce((total, producto) => total + parseFloat(producto.subtotal), 0) + (parseFloat(selectedPedido.costo_envio) || 0),
        storeMail: process.env.NEXT_PUBLIC_STORE_EMAIL,
        storePhone: process.env.NEXT_PUBLIC_STORE_PHONE
      };

      const response = await axiosAuth.post('/admin/mailPedidoConfirmado', emailData);

      if (response.data.success) {
        console.log('✅ Email de confirmación enviado');
        return true;
      } else {
        throw new Error('Error al enviar email');
      }
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      toast.error('Error al enviar email de confirmación');
      return false;
    }
  }, [selectedPedido, productos]);

  // Función para enviar email de pedido en camino
  const enviarEmailEnCamino = useCallback(async (horarioDesde, horarioHasta) => {
    if (!selectedPedido) return false;

    try {
      const emailData = {
        storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'PuntoSur',
        name: selectedPedido.cliente,
        clientMail: selectedPedido.email_cliente,
        items: productos.map(producto => ({
          name: producto.nombre_producto,
          quantity: producto.cantidad,
          price: producto.precio
        })),
        subtotal: productos.reduce((total, producto) => total + parseFloat(producto.subtotal), 0),
        shippingCost: selectedPedido.costo_envio || 0,
        total: productos.reduce((total, producto) => total + parseFloat(producto.subtotal), 0) + (parseFloat(selectedPedido.costo_envio) || 0),
        storeMail: process.env.NEXT_PUBLIC_STORE_EMAIL,
        storePhone: process.env.NEXT_PUBLIC_STORE_PHONE,
        desde: horarioDesde,
        hasta: horarioHasta
      };

      const response = await axiosAuth.post('/admin/mailPedidoEnCamino', emailData);

      if (response.data.success) {
        console.log('✅ Email de pedido en camino enviado');
        return true;
      } else {
        throw new Error('Error al enviar email');
      }
    } catch (error) {
      console.error('❌ Error enviando email de pedido en camino:', error);
      toast.error('Error al enviar email de pedido en camino');
      return false;
    }
  }, [selectedPedido, productos]);

  // Función para actualizar observaciones del pedido
  const actualizarObservaciones = useCallback(async (nuevasObservaciones) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    try {
      const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
      console.log(`📝 Actualizando observaciones del pedido ${pedidoId}`);

      // Nota: Esta función podría necesitar un endpoint específico en el backend
      // Por ahora simulo la actualización local
      
      setSelectedPedido(prev => ({
        ...prev,
        notas_local: nuevasObservaciones
      }));

      console.log(`✅ Observaciones actualizadas para pedido ${pedidoId}`);
      toast.success('Observaciones actualizadas');
      return true;
    } catch (error) {
      console.error('❌ Error actualizando observaciones:', error);
      toast.error('Error al actualizar observaciones');
      return false;
    }
  }, [selectedPedido]);

  // Función para cerrar la edición y limpiar estados
  const cerrarEdicion = useCallback(() => {
    console.log('🔄 Cerrando edición de pedido');
    setSelectedPedido(null);
    setProductos([]);
    setLoading(false);
  }, []);

  return {
    // Estados
    selectedPedido,
    productos,
    loading,
    
    // Funciones principales
    cargarProductosPedido,
    cerrarEdicion,
    
    // Gestión de productos
    verificarStock,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    
    // Gestión de estados del pedido
    confirmarPedido,
    enviarPedido,
    anularPedido,
    
    // Sistema de emails
    enviarEmailConfirmado,
    enviarEmailEnCamino,
    
    // Utilidades
    actualizarObservaciones,
    calcularTotales,
    sincronizarTotales
  };
};