// pages/pagina.jsx - Página de configuración de la tienda
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedPage } from '../hooks/useAuthRedirect';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  CogIcon,
  PhotoIcon,
  TagIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Hooks personalizados
import { useConfiguracion } from '../hooks/pagina/useConfiguracion';
import { useImagenes } from '../hooks/pagina/useImagenes';
import { useOfertas } from '../hooks/pagina/useOfertas';
import { useDestacados } from '../hooks/pagina/useDestacados';

// Componentes
import ConfiguracionGeneral from '../components/pagina/ConfiguracionGeneral';
import GestionImagenes from '../components/pagina/GestionImagenes';
import GestionOfertas from '../components/pagina/GestionOfertas';
import GestionDestacados from '../components/pagina/GestionDestacados';
import EstadisticasPagina from '../components/pagina/EstadisticasPagina';
import ModalProductoSelector from '../components/pagina/ModalProductoSelector';

function PaginaContent() {
  // Hook de autenticación y protección
  const { isLoading: authLoading } = useProtectedPage();
  const { user } = useAuth();

  // Estados para controlar qué sección mostrar
  const [seccionActiva, setSeccionActiva] = useState('configuracion');
  const [modalProducto, setModalProducto] = useState({ mostrar: false, tipo: null });

  // Hooks personalizados
  const configuracion = useConfiguracion();
  const imagenes = useImagenes();
  const ofertas = useOfertas();
  const destacados = useDestacados();

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, cargando configuración:', {
        usuario: user.nombre || user.username,
        rol: user.rol
      });
      
      configuracion.cargarConfiguracion();
      imagenes.cargarImagenes();
      ofertas.cargarOfertas();
      destacados.cargarDestacados();
    }
  }, [user, authLoading]);

  // Mostrar loading mientras se autentica
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

  // Función para obtener el saludo dinámico
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Configuración de las secciones
  const secciones = [
    {
      id: 'configuracion',
      nombre: 'Configuración General',
      icono: CogIcon,
      descripcion: 'Configuraciones básicas de la tienda'
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
    }
  ];

  // Handler para agregar productos
  const handleAgregarProducto = (tipo) => {
    setModalProducto({ mostrar: true, tipo });
  };

  // Handler para confirmar selección de producto
  const handleConfirmarProducto = async (producto, tipo) => {
    let exito = false;
    
    if (tipo === 'oferta') {
      exito = await ofertas.agregarOferta(producto);
    } else if (tipo === 'destacado') {
      exito = await destacados.agregarDestacado(producto);
    }
    
    if (exito) {
      setModalProducto({ mostrar: false, tipo: null });
      toast.success(`Producto agregado a ${tipo}s exitosamente`);
    }
  };

  // Renderizar contenido según la sección activa
  const renderizarContenido = () => {
    switch (seccionActiva) {
      case 'configuracion':
        return <ConfiguracionGeneral {...configuracion} />;
      
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

          {/* Estadísticas rápidas */}
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
          
          {/* Descripción de la sección activa */}
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
          modalProducto.tipo === 'oferta' 
            ? ofertas.ofertas || [] 
            : destacados.destacados || []
        }
      />
    </div>
  );
}

export default function PaginaPage() {
  return <PaginaContent />;
}