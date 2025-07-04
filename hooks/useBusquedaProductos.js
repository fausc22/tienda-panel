// hooks/useBusquedaProductos.js - Hook para búsqueda de productos
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../utils/apiClient';

export const useProductoSearch = () => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función para buscar productos
  const buscarProducto = useCallback(async (terminoBusqueda = null) => {
    const termino = terminoBusqueda || busqueda;
    
    if (!termino || typeof termino !== 'string' || termino.trim().length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    setLoading(true);
    
    try {
      console.log(`🔍 Buscando productos con término: "${termino}"`);
      
      const response = await axiosAuth.get(`/admin/productos?search=${encodeURIComponent(termino.trim())}`);
      
      if (response.data && Array.isArray(response.data)) {
        setResultados(response.data);
        console.log(`✅ ${response.data.length} productos encontrados`);
        
        if (response.data.length === 0) {
          toast.info('No se encontraron productos con ese término');
        }
      } else {
        console.warn('⚠️ Respuesta inesperada de búsqueda:', response.data);
        setResultados([]);
        toast.warning('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('❌ Error en búsqueda de productos:', error);
      setResultados([]);
      
      if (error.response?.status === 400) {
        toast.error('Término de búsqueda demasiado corto');
      } else if (error.response?.status === 404) {
        toast.info('No se encontraron productos');
      } else {
        toast.error('Error al buscar productos');
      }
    } finally {
      setLoading(false);
    }
  }, [busqueda]);

  // Función para seleccionar un producto de los resultados
  const seleccionarProducto = useCallback((producto) => {
    if (!producto) {
      console.warn('⚠️ Intento de seleccionar producto nulo');
      return;
    }

    console.log('✅ Producto seleccionado:', producto.nombre || producto.codigo_barra);
    setProductoSeleccionado(producto);
  }, []);

  // Función para limpiar la selección
  const limpiarSeleccion = useCallback(() => {
    console.log('🧹 Limpiando selección de producto');
    setProductoSeleccionado(null);
    setResultados([]);
    setBusqueda('');
  }, []);

  // Función para limpiar solo los resultados
  const limpiarResultados = useCallback(() => {
    console.log('🧹 Limpiando resultados de búsqueda');
    setResultados([]);
  }, []);

  // Función para buscar por código específico
  const buscarPorCodigo = useCallback(async (codigoBarra) => {
    if (!codigoBarra) {
      toast.error('Código de barra requerido');
      return null;
    }

    setLoading(true);
    
    try {
      console.log(`🔍 Buscando producto por código: ${codigoBarra}`);
      
      const response = await axiosAuth.get(`/admin/productos?search=${encodeURIComponent(codigoBarra)}`);
      
      if (response.data && Array.isArray(response.data)) {
        const productoExacto = response.data.find(p => p.codigo_barra === codigoBarra);
        
        if (productoExacto) {
          console.log(`✅ Producto encontrado por código: ${productoExacto.nombre}`);
          return productoExacto;
        } else {
          console.log(`⚠️ No se encontró producto exacto con código: ${codigoBarra}`);
          return response.data[0] || null; // Retornar el primer resultado si existe
        }
      } else {
        console.warn('⚠️ No se encontraron productos con ese código');
        return null;
      }
    } catch (error) {
      console.error(`❌ Error buscando producto por código ${codigoBarra}:`, error);
      toast.error('Error al buscar producto por código');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener detalles completos de un producto
  const obtenerDetallesProducto = useCallback(async (codigoBarra) => {
    if (!codigoBarra) return null;

    try {
      console.log(`📋 Obteniendo detalles del producto: ${codigoBarra}`);
      
      const producto = await buscarPorCodigo(codigoBarra);
      
      if (producto) {
        // Agregar información adicional si es necesario
        const productoCompleto = {
          ...producto,
          id: producto.codigo_barra, // Para compatibilidad
          stock_actual: producto.stock || 0,
          precio_unitario: producto.precio || 0
        };
        
        console.log(`✅ Detalles obtenidos para: ${productoCompleto.nombre}`);
        return productoCompleto;
      } else {
        console.warn(`⚠️ No se pudieron obtener detalles para: ${codigoBarra}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error obteniendo detalles del producto ${codigoBarra}:`, error);
      return null;
    }
  }, [buscarPorCodigo]);

  // Función para validar disponibilidad de stock
  const validarStock = useCallback((producto, cantidadSolicitada) => {
    if (!producto) return false;
    
    const stockDisponible = producto.stock_actual || producto.stock || 0;
    const cantidad = parseInt(cantidadSolicitada) || 0;
    
    const disponible = cantidad <= stockDisponible && cantidad > 0;
    
    console.log(`📦 Validación de stock para ${producto.nombre}:`, {
      solicitado: cantidad,
      disponible: stockDisponible,
      válido: disponible
    });
    
    return disponible;
  }, []);

  return {
    // Estados
    busqueda,
    resultados,
    productoSeleccionado,
    loading,
    
    // Funciones de control
    setBusqueda,
    buscarProducto,
    seleccionarProducto,
    limpiarSeleccion,
    limpiarResultados,
    
    // Funciones especializadas
    buscarPorCodigo,
    obtenerDetallesProducto,
    validarStock
  };
};