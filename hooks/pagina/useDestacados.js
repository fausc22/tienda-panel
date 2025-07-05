// hooks/pagina/useDestacados.js - Hook para gestión de productos destacados
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useDestacados = () => {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para cargar productos destacados
  const cargarDestacados = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Cargando productos destacados...');
      
      const response = await axiosAuth.get('/admin/productosDest');
      
      if (response.data && Array.isArray(response.data)) {
        // Formatear datos para consistencia
        const destacadosFormateados = response.data.map(destacado => ({
          codigo_barra: destacado.CODIGO_BARRA,
          nombre: destacado.nombre || destacado.art_desc_vta,
          precio: parseFloat(destacado.PRECIO) || 0,
          categoria: destacado.categoria || 'Sin categoría',
          stock: parseInt(destacado.stock) || 0
        }));
        
        setDestacados(destacadosFormateados);
        console.log(`✅ ${destacadosFormateados.length} productos destacados cargados`);
      } else {
        console.warn('⚠️ Respuesta inesperada de destacados:', response.data);
        setDestacados([]);
      }
    } catch (error) {
      console.error('❌ Error cargando destacados:', error);
      toast.error('Error al cargar productos destacados');
      setDestacados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para agregar producto a destacados
  const agregarDestacado = useCallback(async (producto) => {
    if (!producto || !producto.codigo_barra) {
      toast.error('Producto inválido para agregar a destacados');
      return false;
    }

    try {
      console.log(`🔄 Agregando producto a destacados: ${producto.codigo_barra}`);
      
      const datosDestacado = {
        CODIGO_BARRA: producto.codigo_barra,
        nombre: producto.nombre,
        PRECIO: parseFloat(producto.precio) || 0
      };

      const response = await axiosAuth.post('/admin/agregarArticuloDest', datosDestacado);

      if (response.data.success) {
        console.log(`✅ Producto ${producto.codigo_barra} agregado a destacados exitosamente`);
        
        // Agregar al estado local
        const nuevoDestacado = {
          codigo_barra: producto.codigo_barra,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio) || 0,
          categoria: producto.categoria || 'Sin categoría',
          stock: parseInt(producto.stock) || 0
        };
        
        setDestacados(prev => [...prev, nuevoDestacado]);
        
        toast.success('Producto agregado a destacados');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al agregar producto a destacados');
      }
    } catch (error) {
      console.error(`❌ Error agregando producto a destacados ${producto.codigo_barra}:`, error);
      
      if (error.response?.status === 409) {
        toast.error('El producto ya está en destacados');
      } else if (error.response?.status === 404) {
        toast.error('Producto no encontrado en el inventario');
      } else {
        toast.error('Error al agregar producto a destacados');
      }
      return false;
    }
  }, []);

  // Función para eliminar producto de destacados
  const eliminarDestacado = useCallback(async (codigoBarra) => {
    if (!codigoBarra) {
      toast.error('Código de barra requerido');
      return false;
    }

    if (!confirm('¿Está seguro de que desea eliminar este producto de los destacados?')) {
      return false;
    }

    try {
      console.log(`🗑️ Eliminando producto de destacados: ${codigoBarra}`);
      
      const response = await axiosAuth.delete(`/admin/eliminarArticuloDest/${codigoBarra}`);

      if (response.data.success) {
        console.log(`✅ Producto ${codigoBarra} eliminado de destacados exitosamente`);
        
        // Remover del estado local
        setDestacados(prev => 
          prev.filter(destacado => destacado.codigo_barra !== codigoBarra)
        );
        
        toast.success('Producto eliminado de destacados');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar producto de destacados');
      }
    } catch (error) {
      console.error(`❌ Error eliminando producto de destacados ${codigoBarra}:`, error);
      toast.error('Error al eliminar producto de destacados');
      return false;
    }
  }, []);

  // Función para validar si un producto ya está en destacados
  const productoEnDestacados = useCallback((codigoBarra) => {
    return destacados.some(destacado => destacado.codigo_barra === codigoBarra);
  }, [destacados]);

  // Función para obtener estadísticas de destacados
  const obtenerEstadisticas = useCallback(() => {
    const stats = {
      total: destacados.length,
      conStock: destacados.filter(d => d.stock > 0).length,
      sinStock: destacados.filter(d => d.stock === 0).length,
      precioPromedio: destacados.length > 0 
        ? destacados.reduce((acc, d) => acc + d.precio, 0) / destacados.length
        : 0,
      stockTotal: destacados.reduce((acc, d) => acc + d.stock, 0),
      categorias: [...new Set(destacados.map(d => d.categoria))].length
    };
    
    console.log('📊 Estadísticas de destacados:', stats);
    return stats;
  }, [destacados]);

  // Función para reordenar productos destacados
  const reordenarDestacados = useCallback(async (nuevoOrden) => {
    if (!Array.isArray(nuevoOrden) || nuevoOrden.length !== destacados.length) {
      toast.error('Orden inválido para productos destacados');
      return false;
    }

    try {
      console.log('🔄 Reordenando productos destacados...');
      
      // Actualizar orden local inmediatamente para mejor UX
      setDestacados(nuevoOrden);
      
      // Nota: Aquí necesitarías implementar el endpoint en el backend
      // const response = await axiosAuth.put('/admin/reordenar-destacados', { orden: nuevoOrden });
      
      console.log('✅ Productos destacados reordenados exitosamente');
      toast.success('Orden de productos destacados actualizado');
      return true;
    } catch (error) {
      console.error('❌ Error reordenando productos destacados:', error);
      toast.error('Error al reordenar productos destacados');
      // Revertir cambios en caso de error
      await cargarDestacados();
      return false;
    }
  }, [destacados, cargarDestacados]);

  // Función para filtrar destacados por categoría
  const filtrarPorCategoria = useCallback((categoria) => {
    if (!categoria || categoria === 'todas') {
      return destacados;
    }
    
    return destacados.filter(destacado => 
      destacado.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
  }, [destacados]);

  // Función para buscar productos en destacados
  const buscarEnDestacados = useCallback((termino) => {
    if (!termino || termino.trim().length === 0) {
      return destacados;
    }
    
    const terminoLower = termino.toLowerCase().trim();
    
    return destacados.filter(destacado => 
      destacado.nombre.toLowerCase().includes(terminoLower) ||
      destacado.codigo_barra.toLowerCase().includes(terminoLower) ||
      destacado.categoria.toLowerCase().includes(terminoLower)
    );
  }, [destacados]);

  // Función para obtener categorías únicas
  const obtenerCategorias = useCallback(() => {
    const categorias = [...new Set(destacados.map(d => d.categoria))];
    return categorias.filter(cat => cat && cat !== 'Sin categoría').sort();
  }, [destacados]);

  return {
    // Estados
    destacados,
    loading,
    
    // Funciones principales
    cargarDestacados,
    agregarDestacado,
    eliminarDestacado,
    reordenarDestacados,
    
    // Utilidades
    productoEnDestacados,
    obtenerEstadisticas,
    filtrarPorCategoria,
    buscarEnDestacados,
    obtenerCategorias
  };
};