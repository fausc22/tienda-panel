// pages/pagina.jsx - ACTUALIZACIÓN
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedPage } from '../hooks/useAuthRedirect';
import { useAuth } from '../context/AuthContext';
import { 
  CogIcon,
  PhotoIcon,
  TagIcon,
  BoltIcon,
  StarIcon,
  ClockIcon // 🆕 NUEVO
} from '@heroicons/react/24/outline';

// Hooks personalizados
import { useConfiguracion } from '../hooks/pagina/useConfiguracion';
import { useImagenes } from '../hooks/pagina/useImagenes';
import { useOfertas } from '../hooks/pagina/useOfertas';
import { useDestacados } from '../hooks/pagina/useDestacados';
import { useLiquidacion } from '../hooks/pagina/useLiquidacion';
import { useHorariosAvanzado } from '../hooks/pagina/useHorariosAvanzado'; // 🆕 NUEVO

// Componentes
import ConfiguracionGeneral from '../components/pagina/ConfiguracionGeneral';
import GestionImagenes from '../components/pagina/GestionImagenes';
import GestionOfertas from '../components/pagina/GestionOfertas';
import GestionDestacados from '../components/pagina/GestionDestacados';
import GestionLiquidacion from '../components/pagina/GestionLiquidacion';
import GestionHorarios from '../components/pagina/GestionHorarios'; // 🆕 NUEVO
import EstadisticasPagina from '../components/pagina/EstadisticasPagina';
import ModalProductoSelector from '../components/pagina/ModalProductoSelector';

function PaginaContent() {
  // Hook de autenticación y protección - Solo admin puede acceder
  const { isLoading: authLoading } = useProtectedPage(['admin']);
  const { user } = useAuth();

  const [seccionActiva, setSeccionActiva] = useState('configuracion');
  const [modalProducto, setModalProducto] = useState({ mostrar: false, tipo: null });

  // Hooks personalizados
  const configuracion = useConfiguracion();
  const imagenes = useImagenes();
  const ofertas = useOfertas();
  const destacados = useDestacados();
  const liquidacion = useLiquidacion();
  const horariosAvanzado = useHorariosAvanzado(); // 🆕 NUEVO

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, cargando configuración');
      
      configuracion.cargarConfiguracion();
      imagenes.cargarImagenes();
      ofertas.cargarOfertas();
      destacados.cargarDestacados();
      liquidacion.cargarLiquidacion();
      horariosAvanzado.cargarHorarios(); // 🆕 NUEVO
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Configuración de las secciones - 🆕 ACTUALIZADO
  const secciones = [
    {
      id: 'configuracion',
      nombre: 'Configuración General',
      icono: CogIcon,
      descripcion: 'Configuraciones básicas de la tienda'
    },
    {
      id: 'horarios', // 🆕 NUEVO
      nombre: 'Horarios de Atención',
      icono: ClockIcon,
      descripcion: 'Configure horarios por día y excepciones especiales'
    },
    {
      id: 'imagenes',
      nombre: 'Gestión de Imágenes',
      icono: PhotoIcon,
      descripcion: 'Subir y gestionar imágenes de productos y publicidad'
    },
    {
      id: 'ofertas',
      nombre: 'Productos en Oferta',
      icono: TagIcon,
      descripcion: 'Gestionar productos con precios especiales'
    },
    {
      id: 'destacados',
      nombre: 'Productos Destacados',
      icono: StarIcon,
      descripcion: 'Gestionar productos destacados de la tienda'
    },
    {
      id: 'liquidacion',
      nombre: 'Productos en Liquidación',
      icono: BoltIcon,
      descripcion: 'Gestionar productos en liquidación con precios finales'
    }
  ];

  const handleAgregarProducto = (tipo) => {
    setModalProducto({ mostrar: true, tipo });
  };

  const handleConfirmarProducto = async (producto, tipo) => {
    let exito = false;
    
    if (tipo === 'oferta') {
      exito = await ofertas.agregarOferta(producto);
    } else if (tipo === 'destacado') {
      exito = await destacados.agregarDestacado(producto);
    } else if (tipo === 'liquidacion') {
      exito = await liquidacion.agregarLiquidacion(producto);
    }
    
    if (exito) {
      setModalProducto({ mostrar: false, tipo: null });
    }
  };

  // Renderizar contenido según la sección activa - 🆕 ACTUALIZADO
  const renderizarContenido = () => {
    switch (seccionActiva) {
      case 'configuracion':
        return <ConfiguracionGeneral {...configuracion} />;
      
      case 'horarios': // 🆕 NUEVO
        return <GestionHorarios {...horariosAvanzado} />;
      
      case 'imagenes':
        return <GestionImagenes {...imagenes} />;
      
      case 'ofertas':
        return (
          <GestionOfertas 
            {...ofertas} 
            onAgregarProducto={() => handleAgregarProducto('oferta')}
          />
        );
      
      case 'destacados':
        return (
          <GestionDestacados 
            {...destacados} 
            onAgregarProducto={() => handleAgregarProducto('destacado')}
          />
        );
      
      case 'liquidacion':
        return (
          <GestionLiquidacion 
            {...liquidacion} 
            onAgregarProducto={() => handleAgregarProducto('liquidacion')}
          />
        );
      
      default:
        return <ConfiguracionGeneral {...configuracion} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>CONFIGURACIÓN PÁGINA | PANEL ADMIN - PUNTOSUR</title>
        <meta name="description" content="Panel de configuración - Gestión de página PuntoSur" />
      </Head>
      
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Configuración de Página
                </h1>
                <p className="text-gray-600 mt-1">
                  {getSaludo()}, {user?.nombre || user?.username}. Gestiona la configuración de tu tienda
                </p>
              </div>
            </div>
          </div>

          <EstadisticasPagina 
            totalOfertas={ofertas.ofertas?.length || 0}
            totalDestacados={destacados.destacados?.length || 0}
            totalImagenes={imagenes.imagenesPublicidad?.length || 0}
            estadoConfiguracion={configuracion.configuracion ? 'Configurado' : 'Pendiente'}
          />
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="bg-white shadow-lg rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {secciones.map((seccion) => {
                const IconComponent = seccion.icono;
                return (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                      seccionActiva === seccion.id
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">{seccion.nombre}</span>
                    <span className="sm:hidden">{seccion.nombre.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              {secciones.find(s => s.id === seccionActiva)?.descripcion}
            </p>
          </div>
        </div>

        {/* CONTENIDO DINÁMICO */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          {renderizarContenido()}
        </div>
      </div>

      {/* MODAL SELECTOR DE PRODUCTO */}
      <ModalProductoSelector
        mostrar={modalProducto.mostrar}
        tipo={modalProducto.tipo}
        onCerrar={() => setModalProducto({ mostrar: false, tipo: null })}
        onConfirmar={handleConfirmarProducto}
        productosExistentes={
          modalProducto.tipo === 'oferta' ? ofertas.ofertas || [] 
          : modalProducto.tipo === 'destacado' ? destacados.destacados || []
          : liquidacion.liquidacion || []
        }
      />
    </div>
  );
}

export default function PaginaPage() {
  return <PaginaContent />;
}