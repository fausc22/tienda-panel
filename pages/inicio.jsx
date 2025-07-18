// pages/inicio.jsx - Página principal con gestión completa de pedidos ACTUALIZADA
import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useProtectedPage } from '../hooks/useAuthRedirect';

// Hooks personalizados
import { usePedidosInicio } from '../hooks/pedidos/usePedidosInicio';
import { useEditarPedido } from '../hooks/pedidos/useEditarPedido';

// Componentes
import TablaPedidosInicio from '../components/inicio/TablaPedidosInicio';
import { Paginacion } from '../components/Paginacion';
import { 
  ModalDetallePedidoInicio, 
  ModalEditarProductoPedido, 
  ModalEliminarProductoPedido, 
  ModalAgregarProductoPedido,
  ModalConfirmarPedido,
  ModalEnviarPedido,
  ModalAnularPedido
} from '../components/inicio/ModalesInicio';

function InicioContent() {
  // Hook de autenticación y protección
  const { isLoading: authLoading } = useProtectedPage();
  const { user } = useAuth();

  // Estados para modales - ACTUALIZADOS
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalAgregarProducto, setMostrarModalAgregarProducto] = useState(false);
  const [mostrarModalEditarProducto, setMostrarModalEditarProducto] = useState(false);
  const [mostrarModalEliminarProducto, setMostrarModalEliminarProducto] = useState(false);
  const [mostrarModalConfirmarPedido, setMostrarModalConfirmarPedido] = useState(false);
  const [mostrarModalEnviarPedido, setMostrarModalEnviarPedido] = useState(false);
  const [mostrarModalAnularPedido, setMostrarModalAnularPedido] = useState(false);
  
  // Estados para productos en edición
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoEliminando, setProductoEliminando] = useState(null);

  // Estados para paginación manual
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [registrosPorPaginaPendientes, setRegistrosPorPaginaPendientes] = useState(10);
  const [paginaEntregados, setPaginaEntregados] = useState(1);
  const [registrosPorPaginaEntregados, setRegistrosPorPaginaEntregados] = useState(10);

  // Hook para gestión de pedidos
  const { 
    pedidosPendientes,
    pedidosEntregados,
    loading, 
    cargarPedidos,
    estadisticas
  } = usePedidosInicio();

  // Hook para edición de pedidos
  const {
    selectedPedido,
    productos,
    loading: loadingProductos,
    cargarProductosPedido,
    agregarProducto,
    eliminarProducto,
    actualizarProducto,
    verificarStock,
    confirmarPedido,
    enviarPedido,
    anularPedido,
    enviarEmailConfirmado,
    enviarEmailEnCamino,
    cerrarEdicion
  } = useEditarPedido();

  // Cálculos de paginación para pedidos pendientes
  const totalPaginasPendientes = useMemo(() => {
    return Math.ceil((pedidosPendientes?.length || 0) / registrosPorPaginaPendientes);
  }, [pedidosPendientes, registrosPorPaginaPendientes]);

  const indexOfPrimeroPendientes = (paginaPendientes - 1) * registrosPorPaginaPendientes;
  const indexOfUltimoPendientes = paginaPendientes * registrosPorPaginaPendientes;

  const pedidosPendientesActuales = useMemo(() => {
    if (!pedidosPendientes || pedidosPendientes.length === 0) return [];
    return pedidosPendientes.slice(indexOfPrimeroPendientes, indexOfUltimoPendientes);
  }, [pedidosPendientes, indexOfPrimeroPendientes, indexOfUltimoPendientes]);

  // Cálculos de paginación para pedidos entregados
  const totalPaginasEntregados = useMemo(() => {
    return Math.ceil((pedidosEntregados?.length || 0) / registrosPorPaginaEntregados);
  }, [pedidosEntregados, registrosPorPaginaEntregados]);

  const indexOfPrimeroEntregados = (paginaEntregados - 1) * registrosPorPaginaEntregados;
  const indexOfUltimoEntregados = paginaEntregados * registrosPorPaginaEntregados;

  const pedidosEntregadosActuales = useMemo(() => {
    if (!pedidosEntregados || pedidosEntregados.length === 0) return [];
    return pedidosEntregados.slice(indexOfPrimeroEntregados, indexOfUltimoEntregados);
  }, [pedidosEntregados, indexOfPrimeroEntregados, indexOfUltimoEntregados]);

  // Funciones de paginación
  const cambiarPaginaPendientes = (nuevaPagina) => {
    setPaginaPendientes(nuevaPagina);
  };

  const cambiarRegistrosPorPaginaPendientes = (nuevosRegistros) => {
    setRegistrosPorPaginaPendientes(nuevosRegistros);
    setPaginaPendientes(1);
  };

  const cambiarPaginaEntregados = (nuevaPagina) => {
    setPaginaEntregados(nuevaPagina);
  };

  const cambiarRegistrosPorPaginaEntregados = (nuevosRegistros) => {
    setRegistrosPorPaginaEntregados(nuevosRegistros);
    setPaginaEntregados(1);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, cargando pedidos de inicio:', {
        usuario: user.nombre || user.username,
        rol: user.rol
      });
      cargarPedidos();
    }
  }, [user, authLoading, cargarPedidos]);

  // Función para cerrar TODOS los modales
  const cerrarTodosLosModales = useCallback(() => {
    setMostrarModalDetalle(false);
    setMostrarModalAgregarProducto(false);
    setMostrarModalEditarProducto(false);
    setMostrarModalEliminarProducto(false);
    setMostrarModalConfirmarPedido(false);
    setMostrarModalEnviarPedido(false);
    setMostrarModalAnularPedido(false);
    setProductoEditando(null);
    setProductoEliminando(null);
  }, []);

  // HANDLERS para eventos de la tabla
  const handleRowDoubleClick = async (pedido) => {
    try {
      // Primero cerrar todos los modales
      cerrarTodosLosModales();
      
      // Luego cargar datos y abrir modal
      await cargarProductosPedido(pedido);
      
      // Usar setTimeout para asegurar que los estados se actualicen
      setTimeout(() => {
        setMostrarModalDetalle(true);
      }, 100);
    } catch (error) {
      toast.error('Error al cargar detalles del pedido');
    }
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  // HANDLERS para productos - NUEVOS Y ACTUALIZADOS
  const handleAgregarProducto = () => {
    setMostrarModalDetalle(false);
    setMostrarModalAgregarProducto(true);
  };

  const handleEditarProducto = async (producto) => {
    try {
      console.log('🔍 Consultando stock para producto:', producto.codigo_barra);
      const stockActual = await verificarStock(producto.codigo_barra);
      console.log('📦 Stock obtenido:', stockActual);
      
      const productoConStock = {
        ...producto,
        stock_actual: stockActual
      };
      
      setProductoEditando(productoConStock);
      setMostrarModalDetalle(false);
      setMostrarModalEditarProducto(true);
    } catch (error) {
      console.error('❌ Error al obtener stock:', error);
      toast.error('Error al consultar stock del producto');
      // Continuar con stock 0 para no bloquear la edición
      setProductoEditando({ ...producto, stock_actual: 0 });
      setMostrarModalDetalle(false);
      setMostrarModalEditarProducto(true);
    }
  };

  const handleEliminarProducto = (producto) => {
    setProductoEliminando(producto);
    setMostrarModalDetalle(false);
    setMostrarModalEliminarProducto(true);
  };

  // HANDLERS para modales de productos
  const handleCloseModalAgregarProducto = () => {
    setMostrarModalAgregarProducto(false);
    setMostrarModalDetalle(true);
  };

  const handleCloseModalEditarProducto = () => {
    setMostrarModalEditarProducto(false);
    setProductoEditando(null);
    setMostrarModalDetalle(true);
  };

  const handleCloseModalEliminarProducto = () => {
    setMostrarModalEliminarProducto(false);
    setProductoEliminando(null);
    setMostrarModalDetalle(true);
  };

  // HANDLERS para confirmación de acciones de productos - ACTUALIZADOS
  const handleConfirmarAgregarProducto = async (producto, cantidad) => {
    try {
      console.log('🔄 Agregando producto...');
      
      const exito = await agregarProducto(producto, cantidad);
      if (exito) {
        console.log('✅ Producto agregado exitosamente');
        handleCloseModalAgregarProducto();
        
        // Recargar pedidos para actualizar las tablas
        console.log('🔄 Recargando pedidos...');
        await cargarPedidos();
        console.log('✅ Pedidos actualizados');
        
        toast.success('Producto agregado correctamente');
      }
      return exito;
    } catch (error) {
      console.error('❌ Error en handleConfirmarAgregarProducto:', error);
      toast.error('Error al agregar producto');
      return false;
    }
  };

  const handleConfirmarEditarProducto = async () => {
    if (!productoEditando) return;
    
    try {
      console.log('🔄 Editando producto...');
      
      const exito = await actualizarProducto(productoEditando);
      if (exito) {
        console.log('✅ Producto editado exitosamente');
        handleCloseModalEditarProducto();
        
        // Recargar pedidos para actualizar las tablas
        console.log('🔄 Recargando pedidos...');
        await cargarPedidos();
        console.log('✅ Pedidos actualizados');
        
        toast.success('Producto editado correctamente');
      }
    } catch (error) {
      console.error('❌ Error en handleConfirmarEditarProducto:', error);
      toast.error('Error al editar producto');
    }
  };

  const handleConfirmarEliminarProducto = async () => {
    if (!productoEliminando) return;
    
    try {
      console.log('🔄 Eliminando producto...');
      
      const exito = await eliminarProducto(productoEliminando);
      if (exito) {
        console.log('✅ Producto eliminado exitosamente');
        handleCloseModalEliminarProducto();
        
        // Recargar pedidos para actualizar las tablas
        console.log('🔄 Recargando pedidos...');
        await cargarPedidos();
        console.log('✅ Pedidos actualizados');
        
        toast.success('Producto eliminado correctamente');
      }
    } catch (error) {
      console.error('❌ Error en handleConfirmarEliminarProducto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  // HANDLERS para gestión de estados del pedido - NUEVOS
  const handleConfirmarPedido = () => {
    setMostrarModalDetalle(false);
    setMostrarModalConfirmarPedido(true);
  };

  const handleEnviarPedido = () => {
    setMostrarModalDetalle(false);
    setMostrarModalEnviarPedido(true);
  };

  const handleAnularPedido = () => {
    setMostrarModalDetalle(false);
    setMostrarModalAnularPedido(true);
  };

  // HANDLERS para confirmación de cambios de estado - NUEVOS
  const handleConfirmarConfirmarPedido = async () => {
    try {
      console.log('🔄 Confirmando pedido...');
      
      const exito = await confirmarPedido();
      if (exito) {
        // Enviar email de confirmación
        await enviarEmailConfirmado();
        
        setMostrarModalConfirmarPedido(false);
        setMostrarModalDetalle(true);
        
        // Recargar pedidos para actualizar las tablas
        await cargarPedidos();
        
        toast.success('Pedido confirmado y email enviado');
      }
    } catch (error) {
      console.error('❌ Error confirmando pedido:', error);
      toast.error('Error al confirmar pedido');
    }
  };

  const handleConfirmarEnviarPedido = async (horarioDesde, horarioHasta) => {
    try {
      console.log('🔄 Enviando pedido...');
      
      const exito = await enviarPedido(horarioDesde, horarioHasta);
      if (exito) {
        // Enviar email de pedido en camino
        await enviarEmailEnCamino(horarioDesde, horarioHasta);
        
        setMostrarModalEnviarPedido(false);
        handleCloseModalDetalle(); // Cerrar modal de detalle ya que el pedido pasó a entregados
        
        // Recargar pedidos para actualizar las tablas
        await cargarPedidos();
        
        toast.success('Pedido enviado y email de seguimiento enviado');
      }
    } catch (error) {
      console.error('❌ Error enviando pedido:', error);
      toast.error('Error al enviar pedido');
    }
  };

  const handleConfirmarAnularPedido = async () => {
    try {
      console.log('🔄 Anulando pedido...');
      
      const exito = await anularPedido();
      if (exito) {
        setMostrarModalAnularPedido(false);
        handleCloseModalDetalle(); // Cerrar modal de detalle
        
        // Recargar pedidos para actualizar las tablas
        await cargarPedidos();
        
        toast.success('Pedido anulado correctamente');
      }
    } catch (error) {
      console.error('❌ Error anulando pedido:', error);
      toast.error('Error al anular pedido');
    }
  };

  // HANDLERS para cerrar modales de confirmación - NUEVOS
  const handleCloseModalConfirmarPedido = () => {
    setMostrarModalConfirmarPedido(false);
    setMostrarModalDetalle(true);
  };

  const handleCloseModalEnviarPedido = () => {
    setMostrarModalEnviarPedido(false);
    setMostrarModalDetalle(true);
  };

  const handleCloseModalAnularPedido = () => {
    setMostrarModalAnularPedido(false);
    setMostrarModalDetalle(true);
  };

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Función para obtener el saludo dinámico
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>PANEL ADMIN | INICIO - PUNTOSUR</title>
        <meta name="description" content="Panel de administración - Gestión de pedidos PuntoSur" />
      </Head>
      
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {getSaludo()}, {user?.nombre || user?.username || 'Usuario'}
              </h1>
              <p className="text-gray-600 mt-1">
                Panel de administración - PuntoSur
              </p>
            </div>
          </div>
        </div>

        {/* TABLAS DE PEDIDOS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* PEDIDOS PENDIENTES */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-orange-600 flex items-center">
                📋 PEDIDOS PENDIENTES
                {loading && (
                  <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                )}
              </h2>
              <p className="text-gray-600 text-sm">
                {pedidosPendientes?.length || 0} pedidos pendientes de procesar
              </p>
            </div>
            
            <div className="p-4">
              <TablaPedidosInicio
                pedidos={pedidosPendientesActuales}
                onRowDoubleClick={handleRowDoubleClick}
                loading={loading}
                tipo="pendientes"
              />
              
              <Paginacion
                datosOriginales={pedidosPendientes || []}
                paginaActual={paginaPendientes}
                registrosPorPagina={registrosPorPaginaPendientes}
                totalPaginas={totalPaginasPendientes}
                indexOfPrimero={indexOfPrimeroPendientes}
                indexOfUltimo={indexOfUltimoPendientes}
                onCambiarPagina={cambiarPaginaPendientes}
                onCambiarRegistrosPorPagina={cambiarRegistrosPorPaginaPendientes}
              />
            </div>
          </div>

          {/* PEDIDOS ENTREGADOS */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-600 flex items-center">
                ✅ PEDIDOS ENTREGADOS
                {loading && (
                  <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                )}
              </h2>
              <p className="text-gray-600 text-sm">
                {pedidosEntregados?.length || 0} pedidos completados
              </p>
            </div>
            
            <div className="p-4">
              <TablaPedidosInicio
                pedidos={pedidosEntregadosActuales}
                onRowDoubleClick={handleRowDoubleClick}
                loading={loading}
                tipo="entregados"
              />
              
              <Paginacion
                datosOriginales={pedidosEntregados || []}
                paginaActual={paginaEntregados}
                registrosPorPagina={registrosPorPaginaEntregados}
                totalPaginas={totalPaginasEntregados}
                indexOfPrimero={indexOfPrimeroEntregados}
                indexOfUltimo={indexOfUltimoEntregados}
                onCambiarPagina={cambiarPaginaEntregados}
                onCambiarRegistrosPorPagina={cambiarRegistrosPorPaginaEntregados}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* MODALES - SISTEMA MEJORADO CON NUEVOS MODALES */}
      
      {/* Modal principal de detalle */}
      {mostrarModalDetalle && !mostrarModalAgregarProducto && !mostrarModalEditarProducto && 
       !mostrarModalEliminarProducto && !mostrarModalConfirmarPedido && !mostrarModalEnviarPedido && 
       !mostrarModalAnularPedido && (
        <ModalDetallePedidoInicio
          pedido={selectedPedido}
          productos={productos}
          loading={loadingProductos}
          onClose={handleCloseModalDetalle}
          onAgregarProducto={handleAgregarProducto}
          onEditarProducto={handleEditarProducto}
          onEliminarProducto={handleEliminarProducto}
          onConfirmarPedido={handleConfirmarPedido}
          onEnviarPedido={handleEnviarPedido}
          onAnularPedido={handleAnularPedido}
        />
      )}

      {/* Modal agregar producto */}
      {mostrarModalAgregarProducto && (
        <ModalAgregarProductoPedido
          mostrar={mostrarModalAgregarProducto}
          onClose={handleCloseModalAgregarProducto}
          onAgregarProducto={handleConfirmarAgregarProducto}
          productosActuales={productos}
        />
      )}

      {/* Modal editar producto */}
      {mostrarModalEditarProducto && productoEditando && (
        <ModalEditarProductoPedido
          producto={productoEditando}
          onClose={handleCloseModalEditarProducto}
          onGuardar={handleConfirmarEditarProducto}
          onChange={setProductoEditando}
        />
      )}

      {/* Modal eliminar producto */}
      {mostrarModalEliminarProducto && productoEliminando && (
        <ModalEliminarProductoPedido
          producto={productoEliminando}
          onClose={handleCloseModalEliminarProducto}
          onConfirmar={handleConfirmarEliminarProducto}
        />
      )}

      {/* NUEVOS MODALES PARA GESTIÓN DE ESTADOS */}
      
      {/* Modal confirmar pedido */}
      {mostrarModalConfirmarPedido && selectedPedido && (
        <ModalConfirmarPedido
          pedido={selectedPedido}
          productos={productos}
          onClose={handleCloseModalConfirmarPedido}
          onConfirmar={handleConfirmarConfirmarPedido}
        />
      )}

      {/* Modal enviar pedido */}
      {mostrarModalEnviarPedido && selectedPedido && (
        <ModalEnviarPedido
          pedido={selectedPedido}
          onClose={handleCloseModalEnviarPedido}
          onEnviar={handleConfirmarEnviarPedido}
        />
      )}

      {/* Modal anular pedido */}
      {mostrarModalAnularPedido && selectedPedido && (
        <ModalAnularPedido
          pedido={selectedPedido}
          onClose={handleCloseModalAnularPedido}
          onConfirmar={handleConfirmarAnularPedido}
        />
      )}
    </div>
  );
}

export default function Inicio() {
  return <InicioContent />;
}