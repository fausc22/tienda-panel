// pages/inicio.jsx - ACTUALIZADO para usar el hook consolidado
import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useProtectedPage } from '../hooks/useAuthRedirect';

// Hook del contexto global (solo para cargar listas de pedidos)
import { usePedidos } from '../context/PedidosContext';
// Hook consolidado para edición (maneja todo internamente)
import { useEditarPedidoSimplificado } from '../hooks/pedidos/useEditarPedidoSimplificado';

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

import { useNotificacionesPedidos } from '../hooks/pedidos/useNotificacionPedidos';
import { NotificacionNuevoPedido } from '../components/inicio/NotificacionNuevoPedido';

function InicioContent() {
  // ==============================================
  // HOOKS DE AUTENTICACIÓN
  // ==============================================
  const { isLoading: authLoading } = useProtectedPage();
  const { user } = useAuth();

  // ==============================================
  // ESTADOS PARA MODALES
  // ==============================================
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

  // ==============================================
  // ESTADOS PARA PAGINACIÓN
  // ==============================================
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [registrosPorPaginaPendientes, setRegistrosPorPaginaPendientes] = useState(10);
  const [paginaEntregados, setPaginaEntregados] = useState(1);
  const [registrosPorPaginaEntregados, setRegistrosPorPaginaEntregados] = useState(10);

  // ==============================================
  // HOOKS PRINCIPALES
  // ==============================================
  
  // Context global SOLO para listas de pedidos
  const { 
    pedidosPendientes,
    pedidosEntregados,
    loading: loadingListas, 
    cargarPedidos
  } = usePedidos();

  // Hook consolidado para edición de pedidos
  const {
    selectedPedido,
    productos,
    loading: loadingProductos,
    operacionEnProgreso,
    seleccionarPedido,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    verificarStock,
    confirmarPedido,
    enviarPedido,
    anularPedido,
    enviarEmailConfirmado,
    enviarEmailEnCamino,
    cerrarEdicion,
    calcularTotales,
    esPedidoModificable,
    esPedidoConfirmado,
    esPedidoEntregado,
    esPedidoAnulado,
    puedeConfirmarPedido,
    puedeEnviarPedido,
    puedeAnularPedido,
    generarTicketPedido
  } = useEditarPedidoSimplificado();

  // Hook de notificaciones
  const {
    ultimoCheckeo,
    nuevoPedido,
    mostrarNotificacion,
    sonidoHabilitado,
    audioListo,
    iniciarMonitoreo,
    detenerMonitoreo,
    cerrarNotificacion,
    detenerSonido,
    habilitarNotificaciones
  } = useNotificacionesPedidos();

  // ==============================================
  // CÁLCULOS DE PAGINACIÓN
  // ==============================================
  
  const totalPaginasPendientes = useMemo(() => {
    return Math.ceil((pedidosPendientes?.length || 0) / registrosPorPaginaPendientes);
  }, [pedidosPendientes, registrosPorPaginaPendientes]);

  const indexOfPrimeroPendientes = (paginaPendientes - 1) * registrosPorPaginaPendientes;
  const indexOfUltimoPendientes = paginaPendientes * registrosPorPaginaPendientes;

  const pedidosPendientesActuales = useMemo(() => {
    if (!pedidosPendientes || pedidosPendientes.length === 0) return [];
    return pedidosPendientes.slice(indexOfPrimeroPendientes, indexOfUltimoPendientes);
  }, [pedidosPendientes, indexOfPrimeroPendientes, indexOfUltimoPendientes]);

  const totalPaginasEntregados = useMemo(() => {
    return Math.ceil((pedidosEntregados?.length || 0) / registrosPorPaginaEntregados);
  }, [pedidosEntregados, registrosPorPaginaEntregados]);

  const indexOfPrimeroEntregados = (paginaEntregados - 1) * registrosPorPaginaEntregados;
  const indexOfUltimoEntregados = paginaEntregados * registrosPorPaginaEntregados;

  const pedidosEntregadosActuales = useMemo(() => {
    if (!pedidosEntregados || pedidosEntregados.length === 0) return [];
    return pedidosEntregados.slice(indexOfPrimeroEntregados, indexOfUltimoEntregados);
  }, [pedidosEntregados, indexOfPrimeroEntregados, indexOfUltimoEntregados]);

  // ==============================================
  // FUNCIONES DE PAGINACIÓN
  // ==============================================
  
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

  // ==============================================
  // EFECTOS DE CARGA INICIAL
  // ==============================================
  
  // Cargar datos al montar el componente
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, cargando pedidos de inicio');
      cargarPedidos();
    }
  }, [user, authLoading, cargarPedidos]);

  // Inicializar monitoreo de pedidos
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Iniciando monitoreo de nuevos pedidos');
      iniciarMonitoreo(60000);
      
      return () => {
        console.log('🧹 Limpiando monitoreo y deteniendo audio...');
        detenerMonitoreo();
      };
    }
  }, [user, authLoading, iniciarMonitoreo, detenerMonitoreo]);

  // ==============================================
  // FUNCIONES DE GESTIÓN DE MODALES
  // ==============================================
  
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

  // ==============================================
  // HANDLERS DE EVENTOS PRINCIPALES
  // ==============================================
  
  const handleRowDoubleClick = async (pedido) => {
    try {
      cerrarTodosLosModales();
      
      console.log('🔄 Cargando pedido para mostrar en modal...');
      
      // Usar el hook consolidado para cargar el pedido
      await seleccionarPedido(pedido);
      
      // Abrir modal
      setMostrarModalDetalle(true);
      
    } catch (error) {
      console.error('❌ Error al cargar detalles del pedido:', error);
      toast.error('Error al cargar detalles del pedido');
    }
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  const handleVerPedidoDesdeNotificacion = async (pedido) => {
    try {
      console.log('👁️ Abriendo pedido desde notificación:', pedido.id_pedido);
      // La función cerrarNotificacion() se encargará de recargar la página
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error al procesar pedido');
    }
  };

  // ==============================================
  // HANDLERS PARA PRODUCTOS
  // ==============================================
  
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

  // ==============================================
  // HANDLERS PARA MODALES DE PRODUCTOS
  // ==============================================
  
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

  // ==============================================
  // HANDLERS PARA CONFIRMACIÓN DE ACCIONES
  // ==============================================
  
  const handleConfirmarAgregarProducto = async (producto, cantidad) => {
    try {
      console.log('🔄 Agregando producto...');
      
      const exito = await agregarProducto(producto, cantidad);
      if (exito) {
        console.log('✅ Producto agregado exitosamente');
        handleCloseModalAgregarProducto();
        
        // Recargar la lista de pedidos para reflejar cambios
        await cargarPedidos();
        
        toast.success('Producto agregado y listas actualizadas');
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
      const exito = await actualizarProducto(productoEditando);
      if (exito) {
        handleCloseModalEditarProducto();
        
        // Recargar la lista de pedidos para reflejar cambios
        await cargarPedidos();
        
        toast.success('Producto editado y listas actualizadas');
      }
    } catch (error) {
      console.error('❌ Error editando producto:', error);
      toast.error('Error al editar producto');
    }
  };

  const handleConfirmarEliminarProducto = async () => {
    if (!productoEliminando) return;
    
    try {
      const exito = await eliminarProducto(productoEliminando);
      if (exito) {
        handleCloseModalEliminarProducto();
        
        // Recargar la lista de pedidos para reflejar cambios
        await cargarPedidos();
        
        toast.success('Producto eliminado y listas actualizadas');
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  // ==============================================
  // HANDLERS PARA GESTIÓN DE ESTADOS DEL PEDIDO
  // ==============================================
  
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

  const handleConfirmarConfirmarPedido = async () => {
    try {
      console.log('🔄 Confirmando pedido...');
      
      const exito = await confirmarPedido();
      if (exito) {
        await enviarEmailConfirmado();
        
        setMostrarModalConfirmarPedido(false);
        setMostrarModalDetalle(true);
        
        // Recargar la lista de pedidos para reflejar cambios
        await cargarPedidos();
        
        toast.success('Pedido confirmado y email enviado');
      }
    } catch (error) {
      console.error('❌ Error confirmando pedido:', error);
      toast.error('Error al confirmar pedido');
    }
  };

    const handleImprimirTicket = async () => {
    try {
      console.log('🖨️ Iniciando impresión de ticket...');
      
      const exito = await generarTicketPedido();
      if (exito) {
        console.log('✅ Ticket generado correctamente');
        // No cerrar el modal para que el usuario pueda seguir viendo el pedido
      }
    } catch (error) {
      console.error('❌ Error imprimiendo ticket:', error);
      toast.error('Error al generar el ticket');
    }
  };

  const handleConfirmarEnviarPedido = async (horarioDesde, horarioHasta) => {
    try {
      console.log('🔄 Enviando pedido...');
      
      const exito = await enviarPedido(horarioDesde, horarioHasta);
      if (exito) {
        await enviarEmailEnCamino(horarioDesde, horarioHasta);
        
        setMostrarModalEnviarPedido(false);
        handleCloseModalDetalle();
        
        // Recargar la lista de pedidos para reflejar cambios
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
        handleCloseModalDetalle();
        
        // Recargar la lista de pedidos para reflejar cambios
        await cargarPedidos();
        
        toast.success('Pedido anulado correctamente');
      }
    } catch (error) {
      console.error('❌ Error anulando pedido:', error);
      toast.error('Error al anular pedido');
    }
  };

  // ==============================================
  // HANDLERS PARA CERRAR MODALES DE CONFIRMACIÓN
  // ==============================================
  
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

  // ==============================================
  // RENDER CONDICIONAL DE LOADING
  // ==============================================
  
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

  // ==============================================
  // FUNCIÓN PARA SALUDO DINÁMICO
  // ==============================================
  
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // ==============================================
  // RENDER PRINCIPAL
  // ==============================================
  
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
            
            {/* CONTROLES DE AUDIO Y TIMESTAMP */}
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* Botón para habilitar audio */}
              {!sonidoHabilitado && (
                <button
                  onClick={async () => {
                    const exito = await habilitarNotificaciones();
                    if (exito) {
                      toast.success('🔊 Notificaciones de audio habilitadas');
                    } else {
                      toast.error('No se pudo habilitar el audio');
                    }
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>🔊</span>
                  <span>Habilitar Audio</span>
                </button>
              )}

              {/* Estado del audio */}
              {sonidoHabilitado && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm flex items-center space-x-2">
                  <span>✅</span>
                  <span>Audio Habilitado</span>
                </span>
              )}

              {/* Timestamp del último chequeo */}
              {ultimoCheckeo && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                  📡 {ultimoCheckeo.toLocaleTimeString()}
                </span>
              )}
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
                {loadingListas && (
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
                loading={loadingListas}
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
                {loadingListas && (
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
                loading={loadingListas}
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
      
      {/* ==============================================
          MODALES DEL SISTEMA
          ============================================== */}
      
      {/* Modal principal de detalle */}
      {mostrarModalDetalle && !mostrarModalAgregarProducto && !mostrarModalEditarProducto && 
       !mostrarModalEliminarProducto && !mostrarModalConfirmarPedido && !mostrarModalEnviarPedido && 
       !mostrarModalAnularPedido && (
        <ModalDetallePedidoInicio
          pedido={selectedPedido}
          productos={productos}
          loading={loadingProductos || operacionEnProgreso}
          onClose={handleCloseModalDetalle}
          onAgregarProducto={handleAgregarProducto}
          onEditarProducto={handleEditarProducto}
          onEliminarProducto={handleEliminarProducto}
          onConfirmarPedido={handleConfirmarPedido}
          onEnviarPedido={handleEnviarPedido}
          onAnularPedido={handleAnularPedido}
          onImprimirTicket={handleImprimirTicket}
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

      {/* MODALES PARA GESTIÓN DE ESTADOS */}
      
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

      {/* NOTIFICACIÓN DE NUEVO PEDIDO */}
      <NotificacionNuevoPedido
        mostrar={mostrarNotificacion}
        pedido={nuevoPedido}
        onCerrar={cerrarNotificacion}
        onVerPedido={handleVerPedidoDesdeNotificacion}
        detenerSonido={detenerSonido}
      />
    </div>
  );
}

export default function Inicio() {
  return <InicioContent />;
}