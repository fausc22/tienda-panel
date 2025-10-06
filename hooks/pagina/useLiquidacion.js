// hooks/pagina/useLiquidacion.js
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useLiquidacion = () => {
  const [liquidacion, setLiquidacion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actualizandoPrecio, setActualizandoPrecio] = useState(false);

  const calcularDescuentoPorcentual = useCallback((precioOriginal, precioOferta) => {
    if (precioOriginal <= 0 || precioOferta <= 0) return 0;
    if (precioOferta >= precioOriginal) return 0;
    
    return Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100);
  }, []);

  const cargarLiquidacion = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Cargando productos en liquidación...');
      
      const response = await axiosAuth.get('/admin/productosLiquidacion');
      
      if (response.data && Array.isArray(response.data)) {
        const liquidacionFormateada = response.data.map(item => ({
          codigo_barra: item.CODIGO_BARRA,
          cod_interno: item.COD_INTERNO || 0,
          nombre: item.nombre,
          precio: parseFloat(item.PRECIO) || 0,
          precio_oferta: parseFloat(item.PRECIO_DESC) || parseFloat(item.PRECIO) || 0,
          stock: parseInt(item.STOCK) || 0,
          descuento_porcentual: calcularDescuentoPorcentual(
            parseFloat(item.PRECIO) || 0, 
            parseFloat(item.PRECIO_DESC) || parseFloat(item.PRECIO) || 0
          )
        }));
        
        setLiquidacion(liquidacionFormateada);
        console.log(`✅ ${liquidacionFormateada.length} productos en liquidación cargados`);
      } else {
        console.warn('⚠️ Respuesta inesperada de liquidación:', response.data);
        setLiquidacion([]);
      }
    } catch (error) {
      console.error('❌ Error cargando liquidación:', error);
      toast.error('Error al cargar productos en liquidación');
      setLiquidacion([]);
    } finally {
      setLoading(false);
    }
  }, [calcularDescuentoPorcentual]);

  const agregarLiquidacion = useCallback(async (producto) => {
    if (!producto || !producto.codigo_barra) {
      toast.error('Producto inválido para agregar a liquidación');
      return false;
    }

    try {
      console.log(`🔄 Agregando producto a liquidación: ${producto.codigo_barra}`);
      
      const datosLiquidacion = {
        CODIGO_BARRA: producto.codigo_barra,
        nombre: producto.nombre,
        PRECIO: parseFloat(producto.precio) || 0
      };

      const response = await axiosAuth.post('/admin/agregarArticuloLiquidacion', datosLiquidacion);

      if (response.data.success) {
        console.log(`✅ Producto ${producto.codigo_barra} agregado a liquidación`);
        
        const nuevaLiquidacion = {
          codigo_barra: producto.codigo_barra,
          cod_interno: response.data.cod_interno || producto.cod_interno || 0,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio) || 0,
          precio_oferta: parseFloat(producto.precio) || 0,
          stock: parseInt(producto.stock) || 0,
          descuento_porcentual: 0
        };
        
        setLiquidacion(prev => [...prev, nuevaLiquidacion]);
        toast.success('Producto agregado a liquidación');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al agregar producto a liquidación');
      }
    } catch (error) {
      console.error(`❌ Error agregando producto a liquidación:`, error);
      
      if (error.response?.status === 409) {
        toast.error('El producto ya está en liquidación');
      } else if (error.response?.status === 404) {
        toast.error('Producto no encontrado en el inventario');
      } else {
        toast.error('Error al agregar producto a liquidación');
      }
      return false;
    }
  }, []);

  const actualizarPrecioLiquidacion = useCallback(async (codigoBarra, nuevoPrecioOferta) => {
    if (!codigoBarra || nuevoPrecioOferta === undefined) {
      toast.error('Código de barra y precio son requeridos');
      return false;
    }

    const precio = parseFloat(nuevoPrecioOferta);
    if (isNaN(precio) || precio < 0) {
      toast.error('Precio de liquidación debe ser un número válido');
      return false;
    }

    setActualizandoPrecio(true);

    try {
      console.log(`🔄 Actualizando precio de liquidación para: ${codigoBarra}`);
      
      const datosActualizacion = {
        CODIGO_BARRA: codigoBarra,
        PRECIO_DESC: precio
      };

      const response = await axiosAuth.put('/admin/actualizarPrecioLiquidacion', datosActualizacion);

      if (response.data.success) {
        console.log(`✅ Precio de liquidación actualizado para ${codigoBarra}`);
        
        setLiquidacion(prev => 
          prev.map(item => {
            if (item.codigo_barra === codigoBarra) {
              const nuevoDescuento = calcularDescuentoPorcentual(item.precio, precio);
              return {
                ...item,
                precio_oferta: precio,
                descuento_porcentual: nuevoDescuento
              };
            }
            return item;
          })
        );
        
        toast.success('Precio de liquidación actualizado');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al actualizar precio');
      }
    } catch (error) {
      console.error(`❌ Error actualizando precio de liquidación:`, error);
      toast.error('Error al actualizar precio de liquidación');
      return false;
    } finally {
      setActualizandoPrecio(false);
    }
  }, [calcularDescuentoPorcentual]);

  const eliminarLiquidacion = useCallback(async (codigoBarra) => {
    if (!codigoBarra) {
      toast.error('Código de barra requerido');
      return false;
    }

    if (!confirm('¿Está seguro de que desea eliminar este producto de liquidación?')) {
      return false;
    }

    try {
      console.log(`🗑️ Eliminando producto de liquidación: ${codigoBarra}`);
      
      const response = await axiosAuth.delete(`/admin/eliminarArticuloLiquidacion/${codigoBarra}`);

      if (response.data.success) {
        console.log(`✅ Producto ${codigoBarra} eliminado de liquidación`);
        
        setLiquidacion(prev => 
          prev.filter(item => item.codigo_barra !== codigoBarra)
        );
        
        toast.success('Producto eliminado de liquidación');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error(`❌ Error eliminando producto de liquidación:`, error);
      toast.error('Error al eliminar producto de liquidación');
      return false;
    }
  }, []);

  const productoEnLiquidacion = useCallback((codigoBarra) => {
    return liquidacion.some(item => item.codigo_barra === codigoBarra);
  }, [liquidacion]);

  const obtenerEstadisticas = useCallback(() => {
    const stats = {
      total: liquidacion.length,
      conDescuento: liquidacion.filter(l => l.descuento_porcentual > 0).length,
      sinDescuento: liquidacion.filter(l => l.descuento_porcentual === 0).length,
      descuentoPromedio: liquidacion.length > 0 
        ? liquidacion.reduce((acc, l) => acc + l.descuento_porcentual, 0) / liquidacion.length
        : 0,
      mayorDescuento: liquidacion.length > 0 
        ? Math.max(...liquidacion.map(l => l.descuento_porcentual))
        : 0,
      stockTotal: liquidacion.reduce((acc, l) => acc + l.stock, 0)
    };
    
    console.log('📊 Estadísticas de liquidación:', stats);
    return stats;
  }, [liquidacion]);

  const aplicarDescuentoPorcentual = useCallback(async (codigoBarra, porcentajeDescuento) => {
    const item = liquidacion.find(l => l.codigo_barra === codigoBarra);
    if (!item) {
      toast.error('Producto no encontrado en liquidación');
      return false;
    }

    const porcentaje = parseFloat(porcentajeDescuento);
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      toast.error('Porcentaje de descuento debe ser entre 0 y 100');
      return false;
    }

    const nuevoPrecioOferta = item.precio * (1 - porcentaje / 100);
    return await actualizarPrecioLiquidacion(codigoBarra, nuevoPrecioOferta);
  }, [liquidacion, actualizarPrecioLiquidacion]);

  return {
    liquidacion,
    loading,
    actualizandoPrecio,
    cargarLiquidacion,
    agregarLiquidacion,
    actualizarPrecioLiquidacion,
    eliminarLiquidacion,
    productoEnLiquidacion,
    obtenerEstadisticas,
    aplicarDescuentoPorcentual,
    calcularDescuentoPorcentual
  };
};