// hooks/pagina/useImagenes.js - Hook corregido para gestión de imágenes
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

  // Validar archivo de imagen - MEJORADO
  const validarImagen = useCallback((file) => {
    console.log('🔍 Validando archivo:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validar que sea un archivo
    if (!file || !(file instanceof File)) {
      toast.error('Archivo no válido');
      return false;
    }

    // Validar tamaño (5MB máximo para imágenes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`La imagen es demasiado grande. Máximo 5MB permitido. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    
    // Validar que no esté vacío
    if (file.size === 0) {
      toast.error('El archivo está vacío');
      return false;
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Tipo de archivo no válido: ${file.type}. Solo se permiten: JPG, PNG, WEBP`);
      return false;
    }
    
    console.log('✅ Archivo válido');
    return true;
  }, []);

  // Manejar selección de archivo de imagen - MEJORADO
  const handleImagenChange = useCallback((e) => {
    console.log('📁 Evento de cambio de archivo:', e.target.files);
    
    // Limpiar estados previos
    setImagenSeleccionada(null);
    setImagenPreview(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      console.log('📄 Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });
      
      if (!validarImagen(file)) {
        // Limpiar el input si el archivo no es válido
        e.target.value = '';
        return;
      }
      
      setImagenSeleccionada(file);
      
      // Generar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('🖼️ Preview generado');
        setImagenPreview(e.target.result);
      };
      reader.onerror = (error) => {
        console.error('❌ Error generando preview:', error);
        toast.error('Error al generar vista previa de la imagen');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('❌ No se seleccionó ningún archivo');
    }
  }, [validarImagen]);

  // Subir imagen de publicidad - CORREGIDO
  const subirImagenPublicidad = useCallback(async (archivo = null) => {
    const archivoASubir = archivo || imagenSeleccionada;
    
    console.log('📤 Iniciando subida de imagen:', {
      archivoParametro: !!archivo,
      imagenSeleccionada: !!imagenSeleccionada,
      archivoASubir: !!archivoASubir
    });
    
    if (!archivoASubir) {
      toast.error('Seleccione una imagen para subir');
      return false;
    }

    // Validar nuevamente antes de subir
    if (!validarImagen(archivoASubir)) {
      return false;
    }

    setSubiendoImagen(true);

    try {
      console.log('🔄 Preparando FormData...');
      
      // CREAR FORMDATA CORRECTAMENTE
      const formData = new FormData();
      
      // IMPORTANTE: El nombre del campo debe coincidir con el configurado en multer
      formData.append('imagen', archivoASubir, archivoASubir.name);

      // Debug: Verificar FormData
      console.log('📋 FormData creado:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      console.log('🚀 Enviando petición...');

      const response = await axiosAuth.post('/admin/subir-imagen-publicidad', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // AGREGAR TIMEOUT Y CONFIGURACIONES ADICIONALES
        timeout: 30000, // 30 segundos
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📊 Progreso de subida: ${percentCompleted}%`);
        }
      });

      console.log('📥 Respuesta recibida:', response.data);

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
      console.error('❌ Error subiendo imagen de publicidad:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Tiempo de espera agotado. La imagen puede ser demasiado grande.');
      } else if (error.message.includes('Network Error')) {
        toast.error('Error de red. Verifique su conexión a internet.');
      } else {
        toast.error('Error al subir la imagen de publicidad');
      }
      return false;
    } finally {
      setSubiendoImagen(false);
    }
  }, [imagenSeleccionada, cargarImagenes, validarImagen]);

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

  // Subir imagen de producto - CORREGIDO
  const subirImagenProducto = useCallback(async (codigoBarra, archivo = null) => {
    const archivoASubir = archivo || imagenSeleccionada;
    
    console.log('📤 Iniciando subida de imagen de producto:', {
      codigoBarra,
      archivoParametro: !!archivo,
      imagenSeleccionada: !!imagenSeleccionada,
      archivoASubir: !!archivoASubir
    });
    
    if (!archivoASubir || !codigoBarra) {
      toast.error('Código de barra e imagen son requeridos');
      return false;
    }

    // Validar nuevamente antes de subir
    if (!validarImagen(archivoASubir)) {
      return false;
    }

    setSubiendoImagen(true);

    try {
      console.log(`🔄 Preparando FormData para producto: ${codigoBarra}`);
      
      const formData = new FormData();
      formData.append('imagen', archivoASubir, archivoASubir.name);
      formData.append('codigo_barra', codigoBarra);

      // Debug: Verificar FormData
      console.log('📋 FormData creado:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      const response = await axiosAuth.post('/admin/subir-imagen-producto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📊 Progreso de subida: ${percentCompleted}%`);
        }
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
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Tiempo de espera agotado. La imagen puede ser demasiado grande.');
      } else {
        toast.error('Error al subir la imagen del producto');
      }
      return false;
    } finally {
      setSubiendoImagen(false);
    }
  }, [imagenSeleccionada, validarImagen]);

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

  // NUEVA FUNCIÓN: Debug para diagnosticar problemas
  const debugSubida = useCallback(() => {
    console.log('🐛 DEBUG INFO:');
    console.log('- imagenSeleccionada:', imagenSeleccionada);
    console.log('- imagenPreview:', !!imagenPreview);
    console.log('- subiendoImagen:', subiendoImagen);
    
    if (imagenSeleccionada) {
      console.log('- Detalles del archivo:', {
        name: imagenSeleccionada.name,
        size: imagenSeleccionada.size,
        type: imagenSeleccionada.type,
        lastModified: new Date(imagenSeleccionada.lastModified),
        isFile: imagenSeleccionada instanceof File
      });
    }
  }, [imagenSeleccionada, imagenPreview, subiendoImagen]);

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
    debugSubida, // Nueva función para debug
    
    // Setters
    setImagenSeleccionada,
    setImagenPreview
  };
};