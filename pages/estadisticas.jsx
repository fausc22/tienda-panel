// pages/estadisticas.jsx - Página principal de estadísticas
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedPage } from '../hooks/useAuthRedirect';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  ChartBarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useEstadisticas } from '../hooks/useEstadisticas';

// Componentes
import FiltrosEstadisticas from '../components/estadisticas/FiltrosEstadisticas';
import TarjetasMetricas from '../components/estadisticas/TarjetasMetricas';
import GraficosEstadisticas from '../components/estadisticas/GraficosEstadisticas';
import TablasEstadisticas from '../components/estadisticas/TablasEstadisticas';
import EstadisticasProductosEspeciales from '../components/estadisticas/EstadisticasEspeciales';
function EstadisticasContent() {
  // Hooks de autenticación - Solo admin puede acceder
  const { isLoading: authLoading } = useProtectedPage(['admin']);
  const { user } = useAuth();

  // Estados locales
  const [vistaActiva, setVistaActiva] = useState('completa');
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);

  // Hook principal de estadísticas
  const {
    estadisticas,
    metricas,
    loading,
    error,
    cargarEstadisticasCompletas,
    cargarMetricasRapidas,
    limpiarDatos,
    obtenerRangoDefecto
  } = useEstadisticas();

  // Cargar datos iniciales
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, cargando estadísticas iniciales');
      const rango = obtenerRangoDefecto();
      cargarEstadisticasCompletas(rango.fechaInicio, rango.fechaFin);
      cargarMetricasRapidas();
    }
  }, [user, authLoading, cargarEstadisticasCompletas, cargarMetricasRapidas, obtenerRangoDefecto]);

  // Mostrar loading de autenticación
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

  // Función para obtener saludo dinámico
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Handler para aplicar filtros
  const handleAplicarFiltros = async (filtros) => {
    console.log('📊 Aplicando filtros:', filtros);
    setFiltrosAplicados(filtros);
    
    try {
      await cargarEstadisticasCompletas(filtros.fechaInicio, filtros.fechaFin);
      toast.success('Estadísticas actualizadas');
    } catch (error) {
      console.error('❌ Error aplicando filtros:', error);
      toast.error('Error al aplicar filtros');
    }
  };

  // Handler para limpiar filtros
  const handleLimpiarFiltros = () => {
    console.log('🧹 Limpiando filtros');
    setFiltrosAplicados(null);
    limpiarDatos();
    
    // Cargar datos con rango por defecto
    const rango = obtenerRangoDefecto();
    cargarEstadisticasCompletas(rango.fechaInicio, rango.fechaFin);
  };

  // Handler para actualizar datos
  const handleActualizar = async () => {
    console.log('🔄 Actualizando estadísticas...');
    
    if (filtrosAplicados) {
      await cargarEstadisticasCompletas(filtrosAplicados.fechaInicio, filtrosAplicados.fechaFin);
    } else {
      const rango = obtenerRangoDefecto();
      await cargarEstadisticasCompletas(rango.fechaInicio, rango.fechaFin);
    }
    
    await cargarMetricasRapidas();
    toast.success('Datos actualizados');
  };

  // Handler para exportar datos (placeholder)
  const handleExportar = () => {
    if (!estadisticas) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    // Crear contenido CSV básico
    const csvContent = [
      'Métrica,Valor',
      `Ingresos Totales,${estadisticas.resumen.ingresos_totales}`,
      `Ganancias Totales,${estadisticas.resumen.ganancias_totales}`,
      `Pedidos Totales,${estadisticas.resumen.pedidos_totales}`,
      `Ticket Promedio,${estadisticas.resumen.ticket_promedio}`,
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estadisticas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Datos exportados correctamente');
  };

  // Configuración de vistas
  const vistas = [
    { id: 'completa', nombre: 'Vista Completa', descripcion: 'Métricas, gráficos y tablas' },
    { id: 'metricas', nombre: 'Solo Métricas', descripcion: 'Tarjetas de métricas principales' },
    { id: 'graficos', nombre: 'Solo Gráficos', descripcion: 'Visualizaciones gráficas' },
    { id: 'tablas', nombre: 'Solo Tablas', descripcion: 'Rankings y datos detallados' }
  ];

  // Renderizar contenido según vista activa
  const renderizarContenido = () => {
    switch (vistaActiva) {
      case 'metricas':
        return <TarjetasMetricas estadisticas={estadisticas} loading={loading} />;
      case 'graficos':
        return <GraficosEstadisticas estadisticas={estadisticas} loading={loading} />;
      case 'tablas':
        return <TablasEstadisticas estadisticas={estadisticas} loading={loading} />;
      case 'completa':
      default:
        return (
          <>
            <TarjetasMetricas estadisticas={estadisticas} loading={loading} />
            <GraficosEstadisticas estadisticas={estadisticas} loading={loading} />
            <TablasEstadisticas estadisticas={estadisticas} loading={loading} />
            <EstadisticasProductosEspeciales estadisticas={estadisticas} loading={loading} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>ESTADÍSTICAS | PANEL ADMIN - PUNTOSUR</title>
        <meta name="description" content="Panel de estadísticas - Análisis de ventas PuntoSur" />
      </Head>
      
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center mb-4 lg:mb-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  Estadísticas del Negocio
                </h1>
                <p className="text-gray-600 mt-1">
                  {getSaludo()}, {user?.nombre || user?.username}. Analiza el rendimiento de tu tienda
                </p>
              </div>
            </div>
            
            {/* Controles del header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Botón actualizar */}
              <button
                onClick={handleActualizar}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              
              {/* Botón exportar */}
              <button
                onClick={handleExportar}
                disabled={loading || !estadisticas}
                className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Navegación por pestañas de vista */}
          <div className="mt-6 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {vistas.map((vista) => (
                <button
                  key={vista.id}
                  onClick={() => setVistaActiva(vista.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    vistaActiva === vista.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={vista.descripcion}
                >
                  {vista.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <FiltrosEstadisticas
          onAplicarFiltros={handleAplicarFiltros}
          onLimpiarFiltros={handleLimpiarFiltros}
          loading={loading}
          rangoDefecto={obtenerRangoDefecto()}
        />

        {/* CONTENIDO PRINCIPAL */}
        <div className="space-y-6">
          {/* Mostrar errores si los hay */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error al cargar estadísticas</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleActualizar}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido dinámico según la vista seleccionada */}
          {renderizarContenido()}

          {/* Información adicional */}
          {estadisticas && estadisticas.meta && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Análisis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <span className="text-gray-600">Última actualización:</span>
                    <div className="font-medium">
                      {new Date(estadisticas.meta.timestamp).toLocaleString('es-ES')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <span className="text-gray-600">Tiempo de consulta:</span>
                    <div className="font-medium">
                      {estadisticas.meta.tiempo_consulta_ms}ms
                    </div>
                  </div>
                </div>

                {filtrosAplicados && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <div>
                      <span className="text-gray-600">Filtros aplicados:</span>
                      <div className="font-medium">
                        {filtrosAplicados.fechaInicio} - {filtrosAplicados.fechaFin}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EstadisticasPage() {
  return <EstadisticasContent />;
}