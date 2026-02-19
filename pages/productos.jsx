// pages/productos.jsx - Página de gestión de productos refactorizada
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useProtectedPage } from '../hooks/useAuthRedirect';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  CubeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Hooks personalizados
import { useProductos } from '../hooks/productos/useProductos';
import { usePaginacion } from '../hooks/usePaginacion';

// Componentes
import FiltrosProductos from '../components/productos/FiltrosProductos';
import TablaProductos from '../components/productos/TablaProductos';
import { Paginacion } from '../components/Paginacion';
import { 
  ModalAgregarProducto, 
  ModalEditarProducto, 
  ModalEliminarProducto 
} from '../components/productos/ModalesProductos';

function ProductosContent() {
  // Hook de autenticación y protección - Solo admin puede acceder
  const { isLoading: authLoading } = useProtectedPage(['admin']);
  const { user } = useAuth();

  // ✅ ESTADO ÚNICO PARA MODALES - Solo uno puede estar activo a la vez
  const [modalState, setModalState] = useState({
    tipo: null, // 'agregar', 'editar', 'eliminar'
    producto: null,
    mostrar: false
  });

  // Estados para filtros y ordenamiento
  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState('total'); // Estado para etiqueta seleccionada

  // Hook para gestión de productos
  const {
    productos,
    loading,
    totalProductos,
    cargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    validarProducto,
    limpiarFiltros,
    obtenerEstadisticas
  } = useProductos();

  // Aplicar filtros y ordenamiento a los productos
  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    // Aplicar filtros avanzados
    if (filtrosActivos.categoria) {
      resultado = resultado.filter(p => 
        (p.categoria || '').toLowerCase().includes(filtrosActivos.categoria.toLowerCase())
      );
    }

    if (filtrosActivos.estado) {
      switch (filtrosActivos.estado) {
        case 'en_stock':
          resultado = resultado.filter(p => {
            const stock = parseInt(p.stock) || 0;
            return stock > 10;
          });
          break;
        case 'stock_bajo':
          resultado = resultado.filter(p => {
            const stock = parseInt(p.stock) || 0;
            return stock > 0 && stock <= 10;
          });
          break;
        case 'sin_stock':
          resultado = resultado.filter(p => (parseInt(p.stock) || 0) === 0);
          break;
      }
    }

    if (filtrosActivos.stockMinimo) {
      const minimo = parseInt(filtrosActivos.stockMinimo);
      resultado = resultado.filter(p => (parseInt(p.stock) || 0) >= minimo);
    }

    if (filtrosActivos.stockMaximo) {
      const maximo = parseInt(filtrosActivos.stockMaximo);
      resultado = resultado.filter(p => (parseInt(p.stock) || 0) <= maximo);
    }

    if (filtrosActivos.precioMinimo) {
      const minimo = parseFloat(filtrosActivos.precioMinimo);
      resultado = resultado.filter(p => (parseFloat(p.precio) || 0) >= minimo);
    }

    if (filtrosActivos.precioMaximo) {
      const maximo = parseFloat(filtrosActivos.precioMaximo);
      resultado = resultado.filter(p => (parseFloat(p.precio) || 0) <= maximo);
    }

    // Aplicar ordenamiento
    if (sortField) {
      resultado.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Manejar campos numéricos
        if (sortField === 'precio' || sortField === 'costo' || sortField === 'stock') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
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
    }

    return resultado;
  }, [productos, filtrosActivos, sortField, sortDirection]);

  // Hook de paginación
  const {
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    datosActuales: productosPaginados,
    cambiarPagina,
    cambiarRegistrosPorPagina,
    resetearPaginacion
  } = usePaginacion(productosFiltrados, 20);

  // Estadísticas FIJAS (calculadas una vez de TODOS los productos, no cambian con filtros)
  const estadisticasFijas = useMemo(() => {
    return {
      total: productos.length,
      conStock: productos.filter(p => {
        const stock = parseInt(p.stock) || 0;
        return stock > 10;
      }).length,
      sinStock: productos.filter(p => (parseInt(p.stock) || 0) === 0).length,
      stockBajo: productos.filter(p => {
        const stock = parseInt(p.stock) || 0;
        return stock > 0 && stock <= 10;
      }).length,
      precioPromedio: productos.length > 0 
        ? productos.reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0) / productos.length
        : 0
    };
  }, [productos]); // Solo se recalcula cuando cambian los productos, no los filtros

  // Cargar productos al montar el componente
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, cargando productos:', {
        usuario: user.nombre || user.username,
        rol: user.rol
      });
      handleCargarProductos('');
    }
  }, [user, authLoading]);

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    resetearPaginacion();
  }, [filtrosActivos, resetearPaginacion]);

  // HANDLERS para búsqueda y filtros
  const handleBuscar = async (filtrosEncoded) => {
    const parametros = JSON.parse(decodeURIComponent(filtrosEncoded));
    const { termino, estado, ...filtros } = parametros;
    
    // Si hay un estado en los parámetros, actualizar la etiqueta seleccionada
    if (estado) {
      setEtiquetaSeleccionada(estado);
    } else if (!estado && !filtrosActivos.estado) {
      setEtiquetaSeleccionada('total');
    }
    
    // Aplicar filtros locales
    setFiltrosActivos({ ...filtros, estado: estado || filtros.estado || '' });
    
    // Si hay término de búsqueda, hacer búsqueda en servidor
    if (termino && termino.trim().length >= 2) {
      await cargarProductos(termino);
    } else if (!termino) {
      // Si no hay término, cargar todos los productos
      await handleCargarProductos('');
    }
  };

  const handleCargarProductos = async (searchTerm = '') => {
    await cargarProductos(searchTerm);
  };

  const handleLimpiarFiltros = async () => {
    setFiltrosActivos({});
    setSortField(null);
    setSortDirection('asc');
    setEtiquetaSeleccionada('total'); // Resetear a "Total" al limpiar
    await limpiarFiltros();
  };

  // HANDLERS para ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ✅ HANDLERS PARA MODALES - Usando estado único
  const handleAgregarProducto = () => {
    
    setModalState({
      tipo: 'agregar',
      producto: null,
      mostrar: true
    });
  };

  const handleEditarProducto = (producto) => {
    
    setModalState({
      tipo: 'editar',
      producto: producto,
      mostrar: true
    });
  };

  const handleEliminarProducto = (producto) => {
    
    setModalState({
      tipo: 'eliminar',
      producto: producto,
      mostrar: true
    });
  };

  // ✅ FUNCIÓN PARA CERRAR CUALQUIER MODAL
  const cerrarModal = () => {
    
    setModalState({
      tipo: null,
      producto: null,
      mostrar: false
    });
  };

  // HANDLERS para confirmación de acciones
  const handleConfirmarAgregar = async (nuevoProducto) => {
    const exito = await crearProducto(nuevoProducto);
    if (exito) {
      cerrarModal();
      // Recargar productos para mostrar el nuevo
      await handleCargarProductos('');
    }
    return exito;
  };

  const handleConfirmarEditar = async (productoActualizado) => {
    const exito = await actualizarProducto(productoActualizado);
    if (exito) {
      cerrarModal();
    }
    return exito;
  };

  const handleConfirmarEliminar = async (codigoBarra) => {
    const exito = await eliminarProducto(codigoBarra);
    if (exito) {
      cerrarModal();
    }
    return exito;
  };

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
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
        <title>Productos - Panel Admin PuntoSur</title>
        <meta name="description" content="Gestión de productos - Panel de administración PuntoSur" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <CubeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Gestión de Productos
                </h1>
                <p className="text-gray-600 mt-1">
                  {getSaludo()}, {user?.nombre || user?.username}. Administra tu inventario y catálogo
                </p>
              </div>
            </div>

            <button
              onClick={handleAgregarProducto}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <FiltrosProductos
          onBuscar={handleBuscar}
          onLimpiarFiltros={handleLimpiarFiltros}
          onActualizar={() => handleCargarProductos('')}
          loading={loading}
          totalProductos={productosFiltrados.length}
          estadisticas={estadisticasFijas}
          etiquetaSeleccionada={etiquetaSeleccionada}
          onEtiquetaClick={(etiqueta) => {
            setEtiquetaSeleccionada(etiqueta);
            const nuevosFiltros = { ...filtrosActivos };
            if (etiqueta === 'total') {
              nuevosFiltros.estado = '';
            } else {
              nuevosFiltros.estado = etiqueta;
            }
            setFiltrosActivos(nuevosFiltros);
            resetearPaginacion();
          }}
        />

        {/* Tabla de productos */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <TablaProductos
            productos={productosPaginados}
            onEditarProducto={handleEditarProducto}
            onEliminarProducto={handleEliminarProducto}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          
          {/* Paginación */}
          <Paginacion
            datosOriginales={productosFiltrados}
            paginaActual={paginaActual}
            registrosPorPagina={registrosPorPagina}
            totalPaginas={totalPaginas}
            indexOfPrimero={indexOfPrimero}
            indexOfUltimo={indexOfUltimo}
            onCambiarPagina={cambiarPagina}
            onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
          />
        </div>
      </div>

      {/* ✅ MODALES - Solo uno se muestra a la vez */}
      {modalState.mostrar && modalState.tipo === 'agregar' && (
        <ModalAgregarProducto
          mostrar={true}
          onClose={cerrarModal}
          onAgregar={handleConfirmarAgregar}
          validarProducto={validarProducto}
        />
      )}

      {modalState.mostrar && modalState.tipo === 'editar' && modalState.producto && (
        <ModalEditarProducto
          producto={modalState.producto}
          onClose={cerrarModal}
          onGuardar={handleConfirmarEditar}
          validarProducto={validarProducto}
        />
      )}

      {modalState.mostrar && modalState.tipo === 'eliminar' && modalState.producto && (
        <ModalEliminarProducto
          producto={modalState.producto}
          onClose={cerrarModal}
          onConfirmar={handleConfirmarEliminar}
        />
      )}
    </div>
  );
}

export default function ProductosPage() {
  return <ProductosContent />;
}