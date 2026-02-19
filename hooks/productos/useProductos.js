// hooks/productos/useProductos.js - Hook para gestión completa de productos
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProductos, setTotalProductos] = useState(0);

  // Función para cargar productos con búsqueda
  const cargarProductos = useCallback(async (searchTerm = '') => {
  if (searchTerm && searchTerm.length < 2) {
    toast.error('Ingrese al menos 2 caracteres para buscar');
    return;
  }

  setLoading(true);
  
  try {
    console.log(`🔍 Cargando productos. Búsqueda: "${searchTerm}"`);
    
    // CAMBIO PRINCIPAL: usar path parameter en lugar de query parameter
    const url = searchTerm 
      ? `/admin/productos/${encodeURIComponent(searchTerm.trim())}`
      : '/admin/productos-todos';

      const response = await axiosAuth.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        setProductos(response.data);
        setTotalProductos(response.data.length);
        console.log(`✅ ${response.data.length} productos cargados`);
        
        if (response.data.length === 0 && searchTerm) {
          toast('No se encontraron productos con ese término', { icon: 'ℹ️' });
        }
      } else {
        console.warn('⚠️ Respuesta inesperada:', response.data);
        setProductos([]);
        setTotalProductos(0);
        toast('Respuesta inesperada del servidor', { icon: '⚠️' });
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      setProductos([]);
      setTotalProductos(0);
      
      if (error.response?.status === 400) {
        toast.error('Término de búsqueda demasiado corto');
      } else if (error.response?.status === 404) {
        toast('No se encontraron productos', { icon: 'ℹ️' });
      } else if (error.response?.status === 500) {
        console.error('Error del servidor:', error.response?.data);
        toast.error('Error interno del servidor');
      } else {
        toast.error('Error al cargar productos');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para crear un nuevo producto
  const crearProducto = useCallback(async (nuevoProducto) => {
    try {
      console.log('🔄 Creando nuevo producto:', nuevoProducto.nombre || nuevoProducto.art_desc_vta);
      
      // Preparar todos los campos del JSON
      const productoParaEnvio = {
        codigo_barra: nuevoProducto.codigo_barra,
        nombre: nuevoProducto.nombre || nuevoProducto.art_desc_vta,
        art_desc_vta: nuevoProducto.art_desc_vta || nuevoProducto.nombre,
        cod_interno: nuevoProducto.cod_interno || 0,
        marca: nuevoProducto.marca || null,
        costo: nuevoProducto.costo || 0,
        precio: nuevoProducto.precio || 0,
        precio_sin_iva: nuevoProducto.precio_sin_iva || 0,
        precio_sin_iva_1: nuevoProducto.precio_sin_iva_1 || 0,
        precio_sin_iva_2: nuevoProducto.precio_sin_iva_2 || 0,
        precio_sin_iva_3: nuevoProducto.precio_sin_iva_3 || 0,
        precio_sin_iva_4: nuevoProducto.precio_sin_iva_4 || 0,
        categoria: nuevoProducto.categoria,
        cod_dpto: nuevoProducto.cod_dpto || nuevoProducto.categoria,
        cod_rubro: nuevoProducto.cod_rubro || null,
        cod_subrubro: nuevoProducto.cod_subrubro || null,
        stock: nuevoProducto.stock || 0,
        pesable: nuevoProducto.pesable || 0,
        cod_iva: nuevoProducto.cod_iva || 0,
        porc_impint: nuevoProducto.porc_impint || 0,
        impuesto_interno: nuevoProducto.impuesto_interno || 0,
        descripcion: nuevoProducto.descripcion || '',
        habilitado: nuevoProducto.habilitado || 'S'
      };
      
      const response = await axiosAuth.post('/admin/productos', productoParaEnvio);
      
      if (response.data.success) {
        console.log('✅ Producto creado exitosamente');
        
        // Agregar el nuevo producto al estado local
        const productoCreado = {
          ...nuevoProducto,
          cod_interno: response.data.id || Date.now() // Usar ID del servidor o timestamp temporal
        };
        
        setProductos(prev => [productoCreado, ...prev]);
        setTotalProductos(prev => prev + 1);
        
        toast.success('Producto creado correctamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al crear producto');
      }
    } catch (error) {
      console.error('❌ Error creando producto:', error);
      
      if (error.response?.status === 409) {
        toast.error('Ya existe un producto con ese código de barra');
      } else if (error.response?.status === 400) {
        toast.error('Datos del producto inválidos');
      } else {
        toast.error('Error al crear el producto');
      }
      return false;
    }
  }, []);

  // Función para actualizar un producto
  const actualizarProducto = useCallback(async (productoActualizado) => {
    try {
      const codigoBarra = productoActualizado.codigo_barra;
      console.log(`🔄 Actualizando producto: ${codigoBarra}`);
      
      // Enviar todos los campos del JSON
      const response = await axiosAuth.put(`/admin/actualizarInfoProducto/${codigoBarra}`, {
        nombre: productoActualizado.nombre || productoActualizado.art_desc_vta,
        art_desc_vta: productoActualizado.art_desc_vta || productoActualizado.nombre,
        costo: productoActualizado.costo,
        precio: productoActualizado.precio,
        precio_sin_iva: productoActualizado.precio_sin_iva,
        precio_sin_iva_1: productoActualizado.precio_sin_iva_1,
        precio_sin_iva_2: productoActualizado.precio_sin_iva_2,
        precio_sin_iva_3: productoActualizado.precio_sin_iva_3,
        precio_sin_iva_4: productoActualizado.precio_sin_iva_4,
        categoria: productoActualizado.categoria,
        cod_dpto: productoActualizado.cod_dpto || productoActualizado.categoria,
        cod_rubro: productoActualizado.cod_rubro,
        cod_subrubro: productoActualizado.cod_subrubro,
        cod_interno: productoActualizado.cod_interno,
        marca: productoActualizado.marca,
        stock: productoActualizado.stock,
        pesable: productoActualizado.pesable,
        cod_iva: productoActualizado.cod_iva,
        porc_impint: productoActualizado.porc_impint,
        impuesto_interno: productoActualizado.impuesto_interno,
        habilitado: productoActualizado.habilitado
      });
      
      if (response.data.success) {
        console.log(`✅ Producto ${codigoBarra} actualizado exitosamente`);
        
        // Actualizar el producto en el estado local
        setProductos(prev => 
          prev.map(producto => 
            producto.codigo_barra === codigoBarra 
              ? { ...producto, ...productoActualizado }
              : producto
          )
        );
        
        toast.success('Producto actualizado correctamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al actualizar producto');
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      toast.error('Error al actualizar el producto');
      return false;
    }
  }, []);

  // Función para eliminar un producto
  const eliminarProducto = useCallback(async (codigoBarra) => {
    try {
      console.log(`🗑️ Eliminando producto: ${codigoBarra}`);
      
      const response = await axiosAuth.delete(`/admin/productos/${codigoBarra}`);
      
      if (response.data.success) {
        console.log(`✅ Producto ${codigoBarra} eliminado exitosamente`);
        
        // Remover el producto del estado local (o marcarlo como deshabilitado)
        setProductos(prev => 
          prev.map(producto => 
            producto.codigo_barra === codigoBarra 
              ? { ...producto, habilitado: 'N' }
              : producto
          )
        );
        
        toast.success('Producto eliminado correctamente');
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      toast.error('Error al eliminar el producto');
      return false;
    }
  }, []);

  // Función para obtener un producto por código de barra
  const obtenerProductoPorCodigo = useCallback(async (codigoBarra) => {
    try {
      console.log(`🔍 Buscando producto por código: ${codigoBarra}`);
      
      // Usar la búsqueda existente
      const response = await axiosAuth.get(`/admin/productos?search=${codigoBarra}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const producto = response.data.find(p => p.codigo_barra === codigoBarra);
        if (producto) {
          console.log(`✅ Producto encontrado: ${producto.nombre}`);
          return producto;
        } else {
          console.warn(`⚠️ No se encontró producto exacto con código: ${codigoBarra}`);
          return response.data[0] || null; // Retornar el primer resultado si existe
        }
      } else {
        console.warn(`⚠️ No se encontró producto con código: ${codigoBarra}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error obteniendo producto ${codigoBarra}:`, error);
      return null;
    }
  }, []);

  // Función para validar datos del producto
  const validarProducto = useCallback((producto) => {
    const errores = [];
    
    if (!producto.codigo_barra || producto.codigo_barra.trim().length === 0) {
      errores.push('Código de barra es requerido');
    }
    
    if (!producto.nombre || producto.nombre.trim().length === 0) {
      errores.push('Nombre es requerido');
    }
    
    if (producto.precio && isNaN(parseFloat(producto.precio))) {
      errores.push('Precio debe ser un número válido');
    }
    
    if (producto.costo && isNaN(parseFloat(producto.costo))) {
      errores.push('Costo debe ser un número válido');
    }
    
    if (producto.stock && isNaN(parseInt(producto.stock))) {
      errores.push('Stock debe ser un número entero válido');
    }
    
    return {
      esValido: errores.length === 0,
      errores
    };
  }, []);

  // Función para limpiar filtros y recargar todos los productos
  const limpiarFiltros = useCallback(async () => {
    console.log('🧹 Limpiando filtros y recargando productos');
    await cargarProductos('');
  }, [cargarProductos]);

  // Función para obtener estadísticas de productos
  const obtenerEstadisticas = useCallback(() => {
    const stats = {
      total: productos.length,
      conStock: productos.filter(p => (p.stock || 0) > 0).length,
      sinStock: productos.filter(p => (p.stock || 0) === 0).length,
      stockBajo: productos.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length,
      precioPromedio: productos.length > 0 
        ? productos.reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0) / productos.length
        : 0
    };
    
    console.log('📊 Estadísticas de productos:', stats);
    return stats;
  }, [productos]);

  return {
    // Estados
    productos,
    loading,
    totalProductos,
    
    // Funciones principales
    cargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductoPorCodigo,
    
    // Utilidades
    validarProducto,
    limpiarFiltros,
    obtenerEstadisticas
  };
};