// hooks/useEstadisticas.js - Hook para gestión de estadísticas
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../utils/apiClient';

export const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [comparacion, setComparacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para cargar estadísticas completas
  const cargarEstadisticasCompletas = useCallback(async (fechaInicio = null, fechaFin = null) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Cargando estadísticas completas...', { fechaInicio, fechaFin });
      
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      const url = `/estadisticas/completas${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axiosAuth.get(url);
      
      if (response.data) {
        setEstadisticas(response.data);
        console.log('✅ Estadísticas cargadas:', response.data);
        return response.data;
      } else {
        throw new Error('Respuesta vacía del servidor');
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      setError(error.message);
      
      if (error.response?.status === 500) {
        toast.error('Error del servidor al cargar estadísticas');
      } else {
        toast.error('Error al cargar estadísticas');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar métricas rápidas
  const cargarMetricasRapidas = useCallback(async () => {
    try {
      console.log('⚡ Cargando métricas rápidas...');
      
      const response = await axiosAuth.get('/estadisticas/rapidas');
      
      if (response.data) {
        setMetricas(response.data);
        console.log('✅ Métricas rápidas cargadas:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error cargando métricas rápidas:', error);
      toast.error('Error al cargar métricas rápidas');
      return null;
    }
  }, []);

  // Función para comparar períodos
  const compararPeriodos = useCallback(async (fechaInicio1, fechaFin1, fechaInicio2, fechaFin2) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📈 Comparando períodos...', {
        periodo1: { fechaInicio1, fechaFin1 },
        periodo2: { fechaInicio2, fechaFin2 }
      });
      
      const params = new URLSearchParams({
        fechaInicio1,
        fechaFin1,
        fechaInicio2,
        fechaFin2
      });
      
      const response = await axiosAuth.get(`/estadisticas/comparar?${params.toString()}`);
      
      if (response.data) {
        setComparacion(response.data);
        console.log('✅ Comparación completada:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error comparando períodos:', error);
      setError(error.message);
      toast.error('Error al comparar períodos');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener estadísticas de un producto específico
  const obtenerEstadisticasProducto = useCallback(async (codigoBarra, fechaInicio = null, fechaFin = null) => {
    setLoading(true);
    
    try {
      console.log(`📦 Obteniendo estadísticas del producto: ${codigoBarra}`);
      
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      const url = `/estadisticas/producto/${codigoBarra}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axiosAuth.get(url);
      
      if (response.data) {
        console.log('✅ Estadísticas del producto obtenidas:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error(`❌ Error obteniendo estadísticas del producto ${codigoBarra}:`, error);
      
      if (error.response?.status === 404) {
        toast.error('Producto no encontrado');
      } else {
        toast.error('Error al obtener estadísticas del producto');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para limpiar datos
  const limpiarDatos = useCallback(() => {
    setEstadisticas(null);
    setMetricas(null);
    setComparacion(null);
    setError(null);
  }, []);

  // Función para calcular métricas derivadas
  const calcularMetricasDerivadas = useCallback((datos) => {
    if (!datos || !datos.resumen) return null;
    
    const { resumen } = datos;
    
    return {
      crecimiento_ingresos: resumen.ingresos_totales > 0 ? 
        ((resumen.ganancias_totales / resumen.ingresos_totales) * 100).toFixed(2) : 0,
      productos_por_pedido: resumen.pedidos_totales > 0 ? 
        (resumen.productos_vendidos / resumen.pedidos_totales).toFixed(2) : 0,
      margen_promedio: resumen.ingresos_totales > 0 ? 
        ((resumen.ganancias_totales / resumen.ingresos_totales) * 100).toFixed(2) : 0
    };
  }, []);

  // Función para formatear datos para gráficos
  const formatearParaGraficos = useCallback((datos) => {
    if (!datos) return null;
    
    return {
      ventasPorHora: datos.temporal?.ventas_por_hora?.map(item => ({
        hora: `${item.hora}:00`,
        pedidos: item.pedidos,
        ingresos: parseFloat(item.ingresos) || 0
      })) || [],
      
      ventasPorDia: datos.temporal?.ventas_por_dia_semana?.map(item => ({
        dia: item.nombre_dia,
        pedidos: item.pedidos,
        ingresos: parseFloat(item.ingresos) || 0
      })) || [],
      
      tendenciaMensual: datos.temporal?.tendencia_mensual?.map(item => ({
        mes: item.mes,
        pedidos: item.pedidos,
        ingresos: parseFloat(item.ingresos) || 0,
        productos: item.productos_vendidos
      })) || []
    };
  }, []);

  // Función para obtener el rango de fechas por defecto
  const obtenerRangoDefecto = useCallback(() => {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    return {
      fechaInicio: hace30Dias.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    };
  }, []);

  return {
    // Estados
    estadisticas,
    metricas,
    comparacion,
    loading,
    error,
    
    // Funciones principales
    cargarEstadisticasCompletas,
    cargarMetricasRapidas,
    compararPeriodos,
    obtenerEstadisticasProducto,
    
    // Utilidades
    limpiarDatos,
    calcularMetricasDerivadas,
    formatearParaGraficos,
    obtenerRangoDefecto
  };
};