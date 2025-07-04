// hooks/useCategorias.js - Hook para gestión de categorías
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../utils/apiClient';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para cargar categorías desde el endpoint de admin
  const cargarCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando categorías...');
      
      // Usar el endpoint de admin en lugar del de store
      const response = await axiosAuth.get('/admin/categorias');
      
      if (response.data && Array.isArray(response.data)) {
        setCategorias(response.data);
        console.log(`✅ ${response.data.length} categorías cargadas`);
        return response.data;
      } else {
        console.warn('⚠️ Respuesta inesperada de categorías:', response.data);
        setCategorias([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      setError(error.message);
      setCategorias([]);
      
      if (error.response?.status === 500) {
        toast.error('Error del servidor al cargar categorías');
      } else {
        toast.error('Error al cargar categorías');
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener una categoría por ID
  const obtenerCategoriaPorId = useCallback((idCategoria) => {
    return categorias.find(categoria => 
      categoria.id_clasif === idCategoria || 
      categoria.id_clasif === parseInt(idCategoria)
    );
  }, [categorias]);

  // Función para obtener una categoría por nombre
  const obtenerCategoriaPorNombre = useCallback((nombreCategoria) => {
    return categorias.find(categoria => 
      categoria.NOM_CLASIF?.toLowerCase() === nombreCategoria?.toLowerCase()
    );
  }, [categorias]);

  // Función para formatear categorías para selects
  const categoriasParaSelect = useCallback(() => {
    return categorias.map(categoria => ({
      value: categoria.id_clasif,
      label: categoria.NOM_CLASIF,
      count: categoria.cantidad_productos || 0
    }));
  }, [categorias]);

  // Cargar categorías automáticamente al montar el hook
  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  return {
    // Estados
    categorias,
    loading,
    error,
    
    // Funciones
    cargarCategorias,
    obtenerCategoriaPorId,
    obtenerCategoriaPorNombre,
    categoriasParaSelect,
    
    // Datos calculados
    totalCategorias: categorias.length
  };
};