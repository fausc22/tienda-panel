// hooks/pagina/useImagenes.js - Hook para gestión de imágenes
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useImagenes = () => {
  const [imagenesPublicidad, setImagenesPublicidad] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [verificandoImagen, setVerificandoImagen] = useState(false);

  // Función para cargar imágenes de publicidad
  const cargarImagenes = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Cargando imágenes de publicidad...');
      
      // Nota: Necesitarías crear este endpoint en el backend
      const response = await axiosAuth.get('/admin/imagenes-publicidad');
      
      if (response.data && Array.isArray(response.data)) {
        setImagenesPublicidad(response.data);
        console.log(`✅ ${response.data.length} imágenes de publicidad cargadas`);
      } else {
        console.warn('⚠️ Respuesta inesperada de imágenes:', response.data);
        setImagenesPublicidad([]);
      }
    } catch (error) {
      console.error('❌ Error cargando imágenes:', error);
      if (error.response?.status === 404) {
        console.log('ℹ️ No hay imágenes de publicidad');
        setImagenesPublicidad([]);
      } else {
        toast.error('Error al cargar imágenes de publicidad');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar archivo de imagen
  const validarImagen = useCallback((file) => {
    // Validar tamaño (5MB máximo para imágenes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('La imagen es demasiado grande. Máximo 5MB permitido.');
      return false;
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo se permiten: JPG, PNG, WEBP');
      return false;
    }
    
    return true;
  }, []);

  // Manejar selección de archivo de imagen
  const handleImagenChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validarImagen(file)) {
        return;
      }
      
      setImagenSeleccionada(file);
      
      // Generar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, [validarImagen]);

  // Subir imagen de publicidad
  const subirImagenPublicidad = useCallback(async (archivo = null) => {
    const archivoASubir = archivo || imagenSeleccionada;
    
    if (!archivoASubir) {
      toast.error('Seleccione una imagen para subir');
      return false;
    }

    setSubiendoImagen(true);

    try {
      console.log('🔄 Subiendo imagen de publicidad...');
      
      const formData = new FormData();
      formData.append('imagen', archivoASubir);

      const response = await axiosAuth.post('/admin/subir-imagen-publicidad', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('✅ Imagen de publicidad subida exitosamente');
        toast.success('Imagen de publicidad subida correctamente');
        
        // Recargar imágenes
        await cargarImagenes();
        
        // Limpiar selección
        setImagenSeleccionada(null);
        setImagenPreview(null);
        
        return true;
      } else {
        throw new Error(response.data.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('❌ Error subiendo imagen de publicidad:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al subir la imagen de publicidad');
      }
      return false;
    } finally {
      setSubiendoImagen(false);
    }
  }, [imagenSeleccionada, cargarImagenes]);

  // Eliminar imagen de publicidad
  const eliminarImagenPublicidad = useCallback(async (nombreImagen) => {
    if (!nombreImagen) {
      toast.error('Nombre de imagen requerido');
      return false;
    }

    if (!confirm('¿Está seguro de que desea eliminar esta imagen?')) {
      return false;
    }

    try {
      console.log(`🗑️ Eliminando imagen de publicidad: ${nombreImagen}`);
      
      const response = await axiosAuth.delete(`/admin/eliminar-imagen-publicidad/${nombreImagen}`);

      if (response.data.success) {
        console.log(`✅ Imagen ${nombreImagen} eliminada exitosamente`);
        toast.success('Imagen eliminada correctamente');
        
        // Actualizar lista local
        setImagenesPublicidad(prev => 
          prev.filter(img => !img.includes(nombreImagen))
        );
        
        return true;
      } else {
        throw new Error(response.data.message || 'Error al eliminar imagen');
      }
    } catch (error) {
      console.error(`❌ Error eliminando imagen ${nombreImagen}:`, error);
      toast.error('Error al eliminar la imagen');
      return false;
    }
  }, []);

  // Verificar si existe imagen de producto
  const verificarImagenProducto = useCallback(async (codigoBarra) => {
    if (!codigoBarra) return false;
    
    setVerificandoImagen(true);
    
    try {
      console.log(`🔍 Verificando imagen para producto: ${codigoBarra}`);
      
      const response = await axiosAuth.get(`/admin/verificar-imagen-producto/${codigoBarra}`);
      
      if (response.data.success) {
        const existe = response.data.data?.existe || false;
        console.log(`📸 Imagen para ${codigoBarra}: ${existe ? 'Existe' : 'No existe'}`);
        return existe;
      } else {
        console.warn(`⚠️ No se pudo verificar imagen para ${codigoBarra}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error verificando imagen del producto ${codigoBarra}:`, error);
      return false;
    } finally {
      setVerificandoImagen(false);
    }
  }, []);

  // Subir imagen de producto
  const subirImagenProducto = useCallback(async (codigoBarra, archivo = null) => {
    const archivoASubir = archivo || imagenSeleccionada;
    
    if (!archivoASubir || !codigoBarra) {
      toast.error('Código de barra e imagen son requeridos');
      return false;
    }

    setSubiendoImagen(true);

    try {
      console.log(`🔄 Subiendo imagen para producto: ${codigoBarra}`);
      
      const formData = new FormData();
      formData.append('imagen', archivoASubir);
      formData.append('codigo_barra', codigoBarra);

      const response = await axiosAuth.post('/admin/subir-imagen-producto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log(`✅ Imagen del producto ${codigoBarra} subida exitosamente`);
        toast.success('Imagen del producto subida correctamente');
        
        // Limpiar selección
        setImagenSeleccionada(null);
        setImagenPreview(null);
        
        return true;
      } else {
        throw new Error(response.data.message || 'Error al subir imagen del producto');
      }
    } catch (error) {
      console.error(`❌ Error subiendo imagen del producto ${codigoBarra}:`, error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al subir la imagen del producto');
      }
      return false;
    } finally {
      setSubiendoImagen(false);
    }
  }, [imagenSeleccionada]);

  // Limpiar estados
  const limpiarEstados = useCallback(() => {
    setImagenSeleccionada(null);
    setImagenPreview(null);
    setSubiendoImagen(false);
    setVerificandoImagen(false);
  }, []);

  // Obtener información de la imagen seleccionada
  const getImagenInfo = useCallback(() => {
    if (!imagenSeleccionada) return null;
    
    return {
      nombre: imagenSeleccionada.name,
      tamaño: (imagenSeleccionada.size / (1024 * 1024)).toFixed(2) + ' MB',
      tipo: imagenSeleccionada.type,
      preview: imagenPreview
    };
  }, [imagenSeleccionada, imagenPreview]);

  return {
    // Estados
    imagenesPublicidad,
    imagenSeleccionada,
    imagenPreview,
    loading,
    subiendoImagen,
    verificandoImagen,
    
    // Funciones principales
    cargarImagenes,
    handleImagenChange,
    subirImagenPublicidad,
    eliminarImagenPublicidad,
    
    // Funciones para productos
    verificarImagenProducto,
    subirImagenProducto,
    
    // Utilidades
    validarImagen,
    limpiarEstados,
    getImagenInfo,
    
    // Setters
    setImagenSeleccionada,
    setImagenPreview
  };
};