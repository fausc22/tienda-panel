// hooks/pedidos/useEditarPedidoSimplificado.js - Hook CONSOLIDADO y DEPURADO
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useEditarPedidoSimplificado = () => {
  // ==============================================
  // ESTADOS PRINCIPALES
  // ==============================================
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operacionEnProgreso, setOperacionEnProgreso] = useState(false);

  // ==============================================
  // FUNCIONES DE CARGA Y SELECCIÓN
  // ==============================================

  const seleccionarPedido = useCallback(async (pedido) => {
    if (!pedido) {
      console.warn('⚠️ No se proporcionó pedido para seleccionar');
      return;
    }

    setLoading(true);
    const pedidoId = pedido.id_pedido || pedido.id;
    
    try {
      console.log(`🔄 Seleccionando pedido: ${pedidoId}`);
      
      // Establecer pedido inmediatamente
      setSelectedPedido({ ...pedido, productos: [] });
      
      // Cargar productos del pedido
      const productos = await cargarProductosPedido(pedidoId);
      
      // Actualizar pedido con productos cargados
      setSelectedPedido({
        ...pedido,
        productos: productos || []
      });
      
      console.log(`✅ Pedido ${pedidoId} seleccionado con ${productos.length} productos`);
      
    } catch (error) {
      console.error('❌ Error seleccionando pedido:', error);
      toast.error('Error al cargar el pedido');
      setSelectedPedido(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarProductosPedido = useCallback(async (pedidoId) => {
    try {
      console.log(`🔄 Cargando productos del pedido ${pedidoId}...`);
      
      const response = await axiosAuth.get(`/admin/pedidos-productos/${pedidoId}`);
      
      // Manejar ambos formatos de respuesta del backend
      let productos = [];
      
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          productos = response.data.data;
        } else if (Array.isArray(response.data)) {
          productos = response.data;
        }
      }
      
      console.log(`✅ ${productos.length} productos cargados para pedido ${pedidoId}`);
      setProductos(productos);
      return productos;
      
    } catch (error) {
      console.error(`❌ Error cargando productos del pedido ${pedidoId}:`, error);
      toast.error('Error al cargar productos del pedido');
      setProductos([]);
      return [];
    }
  }, []);

  // ==============================================
  // FUNCIONES DE GESTIÓN DE PRODUCTOS
  // ==============================================

  const agregarProducto = useCallback(async (producto, cantidad) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
    setOperacionEnProgreso(true);
    
    try {
      console.log(`🔄 Agregando producto "${producto.nombre}" al pedido ${pedidoId}`);
      
      // Validar datos antes de enviar
      if (!producto.codigo_barra || !cantidad || cantidad < 1) {
        toast.error('Datos del producto inválidos');
        return false;
      }

      // Verificar que el producto no esté duplicado
      const yaExiste = productos.some(p => p.codigo_barra === producto.codigo_barra);
      if (yaExiste) {
        toast.error('Este producto ya está en el pedido. Use la opción editar para modificar la cantidad.');
        return false;
      }

      // Validar stock disponible
      const stockDisponible = producto.stock || 0;
      if (cantidad > stockDisponible) {
        toast.error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${cantidad}`);
        return false;
      }

      const precio = parseFloat(producto.precio) || 0;
      const cantidadNum = parseInt(cantidad);
      const subtotal = precio * cantidadNum;

      // Preparar datos para el backend
      const datosProducto = {
        id_pedido: pedidoId,
        codigo_barra: producto.codigo_barra,
        nombre_producto: producto.nombre || producto.art_desc_vta || 'Producto sin nombre',
        cantidad: cantidadNum,
        precio: precio,
        subtotal: subtotal
      };

      console.log('🔍 DEBUG: Datos que se envían al backend:', datosProducto);

      // Enviar al backend
      const response = await axiosAuth.post('/admin/agregar-producto', datosProducto);

      if (response.data.success) {
        console.log(`✅ Producto agregado exitosamente al pedido ${pedidoId}`);
        
        // Recargar productos para obtener el estado actualizado
        const productosActualizados = await cargarProductosPedido(pedidoId);
        
        // Actualizar totales del pedido seleccionado
        const nuevosTotales = calcularTotales(productosActualizados);
        setSelectedPedido(prev => ({
          ...prev,
          productos: productosActualizados,
          cantidad_productos: nuevosTotales.cantidadProductos,
          monto_total: nuevosTotales.total
        }));
        
        toast.success('Producto agregado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al agregar producto');
      }

    } catch (error) {
      console.error('❌ Error agregando producto:', error);
      toast.error('Error al agregar producto: ' + error.message);
      return false;
    } finally {
      setOperacionEnProgreso(false);
    }
  }, [selectedPedido, productos]);

  const actualizarProducto = useCallback(async (productoActualizado) => {
    if (!selectedPedido || !productoActualizado) {
      toast.error('Datos insuficientes para actualizar producto');
      return false;
    }

    const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
    const productoId = productoActualizado.id;
    setOperacionEnProgreso(true);
    
    try {
      console.log(`🔄 Actualizando producto "${productoActualizado.nombre_producto}" (ID: ${productoId}) en pedido ${pedidoId}`);
      
      // Validar datos
      const cantidad = parseInt(productoActualizado.cantidad) || 1;
      const precio = parseFloat(productoActualizado.precio) || 0;
      
      if (cantidad <= 0) {
        toast.error('La cantidad debe ser mayor a 0');
        return false;
      }
      
      if (precio < 0) {
        toast.error('El precio no puede ser negativo');
        return false;
      }

      // Preparar cambios (SIN subtotal)
      const cambios = {
        nombre_producto: String(productoActualizado.nombre_producto || ''),
        cantidad: cantidad,
        precio: precio
        // NO enviar subtotal - se calcula automáticamente en la BD
      };

      // Enviar al backend
      const response = await axiosAuth.put(`/admin/actualizar-producto/${productoId}`, cambios);

      if (response.data.success) {
        console.log(`✅ Producto "${cambios.nombre_producto}" (ID: ${productoId}) actualizado exitosamente`);
        
        // Recargar productos para obtener el estado actualizado
        const productosActualizados = await cargarProductosPedido(pedidoId);
        
        // Actualizar totales del pedido seleccionado
        const nuevosTotales = calcularTotales(productosActualizados);
        setSelectedPedido(prev => ({
          ...prev,
          productos: productosActualizados,
          cantidad_productos: nuevosTotales.cantidadProductos,
          monto_total: nuevosTotales.total
        }));
        
        toast.success('Producto actualizado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al actualizar producto');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      toast.error('Error al actualizar producto: ' + error.message);
      return false;
    } finally {
      setOperacionEnProgreso(false);
    }
  }, [selectedPedido]);

  const eliminarProducto = useCallback(async (producto) => {
    if (!selectedPedido || !producto) {
      toast.error('Datos insuficientes para eliminar producto');
      return false;
    }

    const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
    const productoId = producto.id;
    const nombreProducto = producto.nombre_producto || 'Producto sin nombre';
    setOperacionEnProgreso(true);
    
    try {
      console.log(`🔄 Eliminando producto "${nombreProducto}" (ID: ${productoId}) del pedido ${pedidoId}`);
      
      // Enviar al backend
      const response = await axiosAuth.delete(`/admin/eliminar-producto/${productoId}`);

      if (response.data.success) {
        console.log(`✅ Producto "${nombreProducto}" (ID: ${productoId}) eliminado exitosamente`);
        
        // Recargar productos para obtener el estado actualizado
        const productosActualizados = await cargarProductosPedido(pedidoId);
        
        // Actualizar totales del pedido seleccionado
        const nuevosTotales = calcularTotales(productosActualizados);
        setSelectedPedido(prev => ({
          ...prev,
          productos: productosActualizados,
          cantidad_productos: nuevosTotales.cantidadProductos,
          monto_total: nuevosTotales.total
        }));
        
        toast.success('Producto eliminado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar producto');
      }
      
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      toast.error('Error al eliminar producto: ' + error.message);
      return false;
    } finally {
      setOperacionEnProgreso(false);
    }
  }, [selectedPedido]);

  // ==============================================
  // FUNCIONES DE GESTIÓN DE ESTADOS DEL PEDIDO
  // ==============================================
  
  const confirmarPedido = useCallback(async () => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
    const clienteNombre = selectedPedido.cliente || 'Cliente sin nombre';
    setOperacionEnProgreso(true);
    
    try {
      console.log(`🔄 Confirmando pedido ${pedidoId} del cliente "${clienteNombre}"`);
      
      const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
        estado: 'confirmado'
      });

      if (response.data.success) {
        setSelectedPedido(prev => ({
          ...prev,
          estado: 'confirmado'
        }));
        
        console.log(`✅ Pedido ${pedidoId} del cliente "${clienteNombre}" confirmado exitosamente`);
        toast.success('Pedido confirmado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al confirmar pedido');
      }
      
    } catch (error) {
      console.error('❌ Error confirmando pedido:', error);
      toast.error('Error al confirmar pedido: ' + error.message);
      return false;
    } finally {
      setOperacionEnProgreso(false);
    }
  }, [selectedPedido]);

const enviarPedido = useCallback(async (horarioDesde, horarioHasta) => {
  if (!selectedPedido) {
    toast.error('No hay pedido seleccionado');
    return false;
  }

  const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
  const clienteNombre = selectedPedido.cliente || 'Cliente sin nombre';
  
  // Verificar si es retiro en local
  const esRetiroEnLocal = selectedPedido.direccion_cliente === "Retiro en local";
  
  // Validar horarios SOLO para delivery
  if (!esRetiroEnLocal) {
    if (!horarioDesde || !horarioHasta) {
      toast.error('Debe especificar horarios de entrega');
      return false;
    }
    
    if (horarioDesde >= horarioHasta) {
      toast.error('El horario de inicio debe ser menor al horario de fin');
      return false;
    }
  }
  
  setOperacionEnProgreso(true);
  
  try {
    const tipoOperacion = esRetiroEnLocal ? 'marcando listo para retirar' : 'enviando';
    const horarioInfo = esRetiroEnLocal ? '' : ` con horario ${horarioDesde} - ${horarioHasta}`;
    
    console.log(`🔄 ${tipoOperacion} pedido ${pedidoId} del cliente "${clienteNombre}"${horarioInfo}`);
    
    const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
      estado: 'entregado'
    });

    if (response.data.success) {
      const mensajeExito = esRetiroEnLocal 
        ? `✅ Pedido ${pedidoId} marcado como listo para retirar`
        : `✅ Pedido ${pedidoId} enviado exitosamente y marcado como entregado`;
      
      console.log(mensajeExito);
      
      
      
      const toastMensaje = esRetiroEnLocal 
        ? 'Pedido marcado como listo para retirar'
        : 'Pedido enviado exitosamente';
      
      toast.success(toastMensaje);
      return true;
    } else {
      throw new Error(response.data.message || 'Error al procesar pedido');
    }
    
  } catch (error) {
    const tipoError = esRetiroEnLocal ? 'marcando listo para retirar' : 'enviando';
    console.error(`❌ Error ${tipoError} pedido:`, error);
    toast.error(`Error al procesar pedido: ${error.message}`);
    return false;
  } finally {
    setOperacionEnProgreso(false);
  }
}, [selectedPedido]);

  const anularPedido = useCallback(async () => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    const pedidoId = selectedPedido.id_pedido || selectedPedido.id;
    const clienteNombre = selectedPedido.cliente || 'Cliente sin nombre';
    setOperacionEnProgreso(true);
    
    try {
      console.log(`🔄 Anulando pedido ${pedidoId} del cliente "${clienteNombre}"`);
      
      const response = await axiosAuth.put(`/admin/actualizar-pedido-procesado/${pedidoId}`, {
        estado: 'Anulado'
      });

      if (response.data.success) {
        setSelectedPedido(prev => ({
          ...prev,
          estado: 'Anulado'
        }));
        
        console.log(`✅ Pedido ${pedidoId} del cliente "${clienteNombre}" anulado exitosamente`);
        toast.success('Pedido anulado exitosamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al anular pedido');
      }
      
    } catch (error) {
      console.error('❌ Error anulando pedido:', error);
      toast.error('Error al anular pedido: ' + error.message);
      return false;
    } finally {
      setOperacionEnProgreso(false);
    }
  }, [selectedPedido]);

  // ==============================================
  // FUNCIONES DE EMAIL
  // ==============================================
  
  const enviarEmailConfirmado = useCallback(async () => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }
    
    if (!productos || productos.length === 0) {
      toast.error('El pedido no tiene productos');
      return false;
    }
    
    if (!selectedPedido.email_cliente) {
      toast.error('El pedido no tiene email del cliente');
      return false;
    }

    try {
      console.log(`📧 Enviando email de confirmación para pedido ${selectedPedido.id_pedido}`);
      
      // Calcular totales actualizados
      const subtotal = productos.reduce((total, producto) => {
        return total + (parseFloat(producto.subtotal) || 0);
      }, 0);
      
      const costoEnvio = parseFloat(selectedPedido.costo_envio) || 0;
      const total = subtotal + costoEnvio;
      
      const emailData = {
        storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'PuntoSur',
        name: selectedPedido.cliente || 'Cliente',
        clientMail: selectedPedido.email_cliente,
        items: productos.map(producto => ({
          name: producto.nombre_producto || 'Producto sin nombre',
          quantity: parseInt(producto.cantidad) || 1,
          price: parseFloat(producto.precio) || 0
        })),
        subtotal: subtotal,
        shippingCost: costoEnvio,
        total: total,
        storeMail: process.env.NEXT_PUBLIC_STORE_EMAIL || 'info@puntosur.com',
        storePhone: process.env.NEXT_PUBLIC_STORE_PHONE || '123456789'
      };

      const response = await axiosAuth.post('/admin/mailPedidoConfirmado', emailData);

      if (response.data && response.data.success) {
        console.log('✅ Email de confirmación enviado exitosamente');
        toast.success('Email de confirmación enviado al cliente');
        return true;
      } else {
        throw new Error(response.data?.message || 'Error al enviar email');
      }
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      toast.error('Error al enviar email: ' + (error.response?.data?.message || error.message));
      return false;
    }
  }, [selectedPedido, productos]);

const enviarEmailEnCamino = useCallback(async (horarioDesde, horarioHasta) => {
  if (!selectedPedido) {
    toast.error('No hay pedido seleccionado');
    return false;
  }
  
  if (!productos || productos.length === 0) {
    toast.error('El pedido no tiene productos');
    return false;
  }
  
  if (!selectedPedido.email_cliente) {
    toast.error('El pedido no tiene email del cliente');
    return false;
  }

  try {
    // Determinar si es retiro en local o delivery
    const esRetiroEnLocal = selectedPedido.direccion_cliente === "Retiro en local";
    
    // Validar horarios SOLO para delivery
    if (!esRetiroEnLocal && (!horarioDesde || !horarioHasta)) {
      toast.error('Debe especificar horarios de entrega');
      return false;
    }
    
    const endpoint = esRetiroEnLocal ? '/admin/mailPedidoRetiro' : '/admin/mailPedidoEnCamino';
    const tipoEmail = esRetiroEnLocal ? 'pedido listo para retirar' : 'pedido en camino';
    
    console.log(`📧 Enviando email de ${tipoEmail} para pedido ${selectedPedido.id_pedido}`);
    
    // Calcular totales actualizados
    const subtotal = productos.reduce((total, producto) => {
      return total + (parseFloat(producto.subtotal) || 0);
    }, 0);
    
    const costoEnvio = parseFloat(selectedPedido.costo_envio) || 0;
    const total = subtotal + costoEnvio;
    
    const emailData = {
      storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'PuntoSur',
      name: selectedPedido.cliente || 'Cliente',
      clientMail: selectedPedido.email_cliente,
      items: productos.map(producto => ({
        name: producto.nombre_producto || 'Producto sin nombre',
        quantity: parseInt(producto.cantidad) || 1,
        price: parseFloat(producto.precio) || 0
      })),
      subtotal: subtotal,
      shippingCost: costoEnvio,
      total: total,
      storeMail: process.env.NEXT_PUBLIC_STORE_EMAIL || 'info@puntosur.com',
      storePhone: process.env.NEXT_PUBLIC_STORE_PHONE || '123456789',
      // Para retiro en local, no enviar horarios
      ...(esRetiroEnLocal ? {} : { desde: horarioDesde, hasta: horarioHasta }),
      // Datos adicionales
      esRetiroEnLocal: esRetiroEnLocal,
      direccion_cliente: selectedPedido.direccion_cliente,
      storeAddress: process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Dirección del local'
    };

    const response = await axiosAuth.post(endpoint, emailData);

    if (response.data && response.data.success) {
      console.log(`✅ Email de ${tipoEmail} enviado exitosamente`);
      toast.success(`Email de ${tipoEmail} enviado al cliente`);
      return true;
    } else {
      throw new Error(response.data?.message || 'Error al enviar email');
    }
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    toast.error('Error al enviar email: ' + (error.response?.data?.message || error.message));
    return false;
  }
}, [selectedPedido, productos]);

  // ==============================================
  // FUNCIONES DE UTILIDADES
  // ==============================================
  
  const verificarStock = useCallback(async (codigoBarra) => {
    if (!codigoBarra || typeof codigoBarra !== 'string') {
      console.warn('⚠️ Código de barra inválido para verificar stock:', codigoBarra);
      return 0;
    }
    
    try {
      console.log(`🔍 Verificando stock para código: ${codigoBarra}`);
      
      const response = await axiosAuth.get(`/admin/productos/${encodeURIComponent(codigoBarra)}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const producto = response.data.find(p => p.codigo_barra === codigoBarra);
        const stock = parseInt(producto?.stock) || 0;
        
        console.log(`📦 Stock encontrado para ${codigoBarra}: ${stock}`);
        return stock;
      } else if (response.data && typeof response.data === 'object' && 'stock' in response.data) {
        const stock = parseInt(response.data.stock) || 0;
        console.log(`📦 Stock encontrado para ${codigoBarra}: ${stock}`);
        return stock;
      } else {
        console.warn(`⚠️ No se encontró stock para código: ${codigoBarra}`);
        return 0;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`⚠️ Producto no encontrado: ${codigoBarra}`);
        return 0;
      }
      
      console.error(`❌ Error verificando stock para ${codigoBarra}:`, error);
      return 0;
    }
  }, []);

  const calcularTotales = useCallback((productosParam = null) => {
    const productosACalcular = productosParam || productos;
    
    if (!productosACalcular || productosACalcular.length === 0) {
      return {
        subtotal: 0,
        total: 0,
        cantidadProductos: 0
      };
    }

    const subtotal = productosACalcular.reduce((total, producto) => {
      return total + (parseFloat(producto.subtotal) || 0);
    }, 0);

    const cantidadProductos = productosACalcular.reduce((total, producto) => {
      return total + (parseInt(producto.cantidad) || 0);
    }, 0);

    const costoEnvio = parseFloat(selectedPedido?.costo_envio) || 0;
    const total = subtotal + costoEnvio;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
      cantidadProductos: cantidadProductos,
      costoEnvio: costoEnvio
    };
  }, [productos, selectedPedido]);

  const cerrarEdicion = useCallback(() => {
    console.log('🔄 Cerrando edición de pedido');
    setSelectedPedido(null);
    setProductos([]);
    setLoading(false);
    setOperacionEnProgreso(false);
  }, []);

  // ==============================================
  // FUNCIONES DE VALIDACIÓN DE ESTADO
  // ==============================================

  const esPedidoModificable = useCallback(() => {
    if (!selectedPedido) return false;
    
    const estado = selectedPedido.estado?.toLowerCase?.() || '';
    const estadosModificables = ['pendiente', 'confirmado', 'en proceso'];
    
    return estadosModificables.includes(estado);
  }, [selectedPedido]);

  const esPedidoConfirmado = useCallback(() => {
    if (!selectedPedido) return false;
    
    const estado = selectedPedido.estado?.toLowerCase?.() || '';
    return estado === 'confirmado';
  }, [selectedPedido]);

  const esPedidoEntregado = useCallback(() => {
    if (!selectedPedido) return false;
    
    const estado = selectedPedido.estado?.toLowerCase?.() || '';
    return estado === 'entregado';
  }, [selectedPedido]);

  const esPedidoAnulado = useCallback(() => {
    if (!selectedPedido) return false;
    
    const estado = selectedPedido.estado?.toLowerCase?.() || '';
    return estado === 'anulado';
  }, [selectedPedido]);

  const puedeConfirmarPedido = useCallback(() => {
    const modificable = esPedidoModificable();
    const confirmado = esPedidoConfirmado();
    const tieneProductos = productos?.length > 0;
    
    return modificable && !confirmado && tieneProductos;
  }, [esPedidoModificable, esPedidoConfirmado, productos]);

  const puedeEnviarPedido = useCallback(() => {
    const confirmado = esPedidoConfirmado();
    const entregado = esPedidoEntregado();
    
    return confirmado && !entregado;
  }, [esPedidoConfirmado, esPedidoEntregado]);

  const puedeAnularPedido = useCallback(() => {
    const entregado = esPedidoEntregado();
    const anulado = esPedidoAnulado();
    
    return !entregado && !anulado;
  }, [esPedidoEntregado, esPedidoAnulado]);

  // ==============================================
  // RETURN DEL HOOK
  // ==============================================

  return {
    // Estados principales
    selectedPedido,
    productos,
    loading,
    operacionEnProgreso,
    
    // Funciones de selección y carga
    seleccionarPedido,
    cargarProductosPedido,
    cerrarEdicion,
    
    // Gestión de productos
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
    verificarStock,
    calcularTotales,
    
    // Funciones de validación de estado
    esPedidoModificable,
    esPedidoConfirmado,
    esPedidoEntregado,
    esPedidoAnulado,
    puedeConfirmarPedido,
    puedeEnviarPedido,
    puedeAnularPedido
  };
};