// hooks/pagina/useOfertas.js - Hook para gestión de productos en oferta
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useOfertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actualizandoPrecio, setActualizandoPrecio] = useState(false);

  // Función helper para calcular descuento porcentual
  const calcularDescuentoPorcentual = useCallback((precioOriginal, precioOferta) => {
    if (precioOriginal <= 0 || precioOferta <= 0) return 0;
    if (precioOferta >= precioOriginal) return 0;
    
    return Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100);
  }, []);

  // Función para cargar productos en oferta
  const cargarOfertas = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Cargando productos en oferta...');
      
      const response = await axiosAuth.get('/admin/productosOferta');
      
      if (response.data && Array.isArray(response.data)) {
        // Formatear datos para consistencia
        const ofertasFormateadas = response.data.map(oferta => ({
          codigo_barra: oferta.CODIGO_BARRA,
          nombre: oferta.nombre,
          precio: parseFloat(oferta.PRECIO) || 0,
          precio_oferta: parseFloat(oferta.PRECIO_DESC) || parseFloat(oferta.PRECIO) || 0,
          descuento_porcentual: calcularDescuentoPorcentual(
            parseFloat(oferta.PRECIO) || 0, 
            parseFloat(oferta.PRECIO_DESC) || parseFloat(oferta.PRECIO) || 0
          )
        }));
        
        setOfertas(ofertasFormateadas);
        console.log(`✅ ${ofertasFormateadas.length} productos en oferta cargados`);
      } else {
        console.warn('⚠️ Respuesta inesperada de ofertas:', response.data);
        setOfertas([]);
      }
    } catch (error) {
      console.error('❌ Error cargando ofertas:', error);
      toast.error('Error al cargar productos en oferta');
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  }, [calcularDescuentoPorcentual]);

  // Función para agregar producto a ofertas
  const agregarOferta = useCallback(async (producto) => {
    if (!producto || !producto.codigo_barra) {
      toast.error('Producto inválido para agregar a oferta');
      return false;
    }

    try {
      console.log(`🔄 Agregando producto a ofertas: ${producto.codigo_barra}`);
      
      const datosOferta = {
        CODIGO_BARRA: producto.codigo_barra,
        nombre: producto.nombre,
        PRECIO: parseFloat(producto.precio) || 0
      };

      const response = await axiosAuth.post('/admin/agregarArticuloOferta', datosOferta);

      if (response.data.success) {
        console.log(`✅ Producto ${producto.codigo_barra} agregado a ofertas exitosamente`);
        
        // Agregar al estado local
        const nuevaOferta = {
          codigo_barra: producto.codigo_barra,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio) || 0,
          precio_oferta: parseFloat(producto.precio) || 0,
          descuento_porcentual: 0
        };
        
        setOfertas(prev => [...prev, nuevaOferta]);
        
        toast.success('Producto agregado a ofertas');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al agregar producto a ofertas');
      }
    } catch (error) {
      console.error(`❌ Error agregando producto a ofertas ${producto.codigo_barra}:`, error);
      
      if (error.response?.status === 409) {
        toast.error('El producto ya está en ofertas');
      } else if (error.response?.status === 404) {
        toast.error('Producto no encontrado en el inventario');
      } else {
        toast.error('Error al agregar producto a ofertas');
      }
      return false;
    }
  }, []);

  // Función para actualizar precio de oferta
  const actualizarPrecioOferta = useCallback(async (codigoBarra, nuevoPrecioOferta) => {
    if (!codigoBarra || nuevoPrecioOferta === undefined) {
      toast.error('Código de barra y precio son requeridos');
      return false;
    }

    const precio = parseFloat(nuevoPrecioOferta);
    if (isNaN(precio) || precio < 0) {
      toast.error('Precio de oferta debe ser un número válido');
      return false;
    }

    setActualizandoPrecio(true);

    try {
      console.log(`🔄 Actualizando precio de oferta para: ${codigoBarra}`);
      
      const datosActualizacion = {
        CODIGO_BARRA: codigoBarra,
        PRECIO_DESC: precio
      };

      const response = await axiosAuth.put('/admin/actualizarPrecioOferta', datosActualizacion);

      if (response.data.success) {
        console.log(`✅ Precio de oferta actualizado para ${codigoBarra}`);
        
        // Actualizar en el estado local
        setOfertas(prev => 
          prev.map(oferta => {
            if (oferta.codigo_barra === codigoBarra) {
              const nuevoDescuento = calcularDescuentoPorcentual(oferta.precio, precio);
              return {
                ...oferta,
                precio_oferta: precio,
                descuento_porcentual: nuevoDescuento
              };
            }
            return oferta;
          })
        );
        
        toast.success('Precio de oferta actualizado');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al actualizar precio');
      }
    } catch (error) {
      console.error(`❌ Error actualizando precio de oferta ${codigoBarra}:`, error);
      toast.error('Error al actualizar precio de oferta');
      return false;
    } finally {
      setActualizandoPrecio(false);
    }
  }, [calcularDescuentoPorcentual]);

  // Función para eliminar producto de ofertas
  const eliminarOferta = useCallback(async (codigoBarra) => {
    if (!codigoBarra) {
      toast.error('Código de barra requerido');
      return false;
    }

    if (!confirm('¿Está seguro de que desea eliminar este producto de las ofertas?')) {
      return false;
    }

    try {
      console.log(`🗑️ Eliminando producto de ofertas: ${codigoBarra}`);
      
      const response = await axiosAuth.delete(`/admin/eliminarArticuloOferta/${codigoBarra}`);

      if (response.data.success) {
        console.log(`✅ Producto ${codigoBarra} eliminado de ofertas exitosamente`);
        
        // Remover del estado local
        setOfertas(prev => 
          prev.filter(oferta => oferta.codigo_barra !== codigoBarra)
        );
        
        toast.success('Producto eliminado de ofertas');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar producto de ofertas');
      }
    } catch (error) {
      console.error(`❌ Error eliminando producto de ofertas ${codigoBarra}:`, error);
      toast.error('Error al eliminar producto de ofertas');
      return false;
    }
  }, []);

  // Función para validar si un producto ya está en ofertas
  const productoEnOfertas = useCallback((codigoBarra) => {
    return ofertas.some(oferta => oferta.codigo_barra === codigoBarra);
  }, [ofertas]);

  // Función para obtener estadísticas de ofertas
  const obtenerEstadisticas = useCallback(() => {
    const stats = {
      total: ofertas.length,
      conDescuento: ofertas.filter(o => o.descuento_porcentual > 0).length,
      sinDescuento: ofertas.filter(o => o.descuento_porcentual === 0).length,
      descuentoPromedio: ofertas.length > 0 
        ? ofertas.reduce((acc, o) => acc + o.descuento_porcentual, 0) / ofertas.length
        : 0,
      mayorDescuento: ofertas.length > 0 
        ? Math.max(...ofertas.map(o => o.descuento_porcentual))
        : 0
    };
    
    console.log('📊 Estadísticas de ofertas:', stats);
    return stats;
  }, [ofertas]);

  // Función para aplicar descuento porcentual
  const aplicarDescuentoPorcentual = useCallback(async (codigoBarra, porcentajeDescuento) => {
    const oferta = ofertas.find(o => o.codigo_barra === codigoBarra);
    if (!oferta) {
      toast.error('Producto no encontrado en ofertas');
      return false;
    }

    const porcentaje = parseFloat(porcentajeDescuento);
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      toast.error('Porcentaje de descuento debe ser entre 0 y 100');
      return false;
    }

    const nuevoPrecioOferta = oferta.precio * (1 - porcentaje / 100);
    return await actualizarPrecioOferta(codigoBarra, nuevoPrecioOferta);
  }, [ofertas, actualizarPrecioOferta]);

  return {
    // Estados
    ofertas,
    loading,
    actualizandoPrecio,
    
    // Funciones principales
    cargarOfertas,
    agregarOferta,
    actualizarPrecioOferta,
    eliminarOferta,
    
    // Utilidades
    productoEnOfertas,
    obtenerEstadisticas,
    aplicarDescuentoPorcentual,
    calcularDescuentoPorcentual
  };
};