// hooks/pagina/useImagenes.js - VERSION CON FETCH NATIVO PARA UPLOADS
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useImagenes = () => {
  const [imagenesPublicidad, setImagenesPublicidad] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState();
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [verificandoImagen, setVerificandoImagen] = useState(false);

  // Obtener token del localStorage
  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Función para cargar imágenes de publicidad (mantener con axios)
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

  // Validar archivo de imagen
  const validarImagen = useCallback((file) => {
    console.log('🔍 Validando archivo:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    if (!file || !(file instanceof File)) {
      toast.error('Archivo no válido');
      return false;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`La imagen es demasiado grande. Máximo 5MB permitido. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    
    if (file.size === 0) {
      toast.error('El archivo está vacío');
      return false;
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const typeValid = allowedTypes.includes(file.type.toLowerCase());
    const nameValid = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!typeValid || !nameValid) {
      toast.error(`Tipo de archivo no válido: ${file.type}. Solo se permiten: JPG, PNG, WEBP`);
      return false;
    }
    
    console.log('✅ Archivo válido');
    return true;
  }, []);

  // Manejar selección de archivo
  const handleImagenChange = useCallback((e) => {
    console.log('📁 Evento de cambio de archivo:', e.target.files);
    
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

  // SUBIR IMAGEN DE PUBLICIDAD - CON FETCH NATIVO
  const subirImagenPublicidad = useCallback(async (archivo = null) => {
  const archivoASubir = archivo || imagenSeleccionada;
  
  console.log('📤 Iniciando subida de imagen con BASE64:', {
    archivoParametro: !!archivo,
    imagenSeleccionada: !!imagenSeleccionada,
    archivoASubir: !!archivoASubir
  });
  
  if (!archivoASubir) {
    toast.error('Seleccione una imagen para subir');
    return false;
  }

  if (!validarImagen(archivoASubir)) {
    return false;
  }

  setSubiendoImagen(true);

  try {
    console.log('🔄 Convirtiendo imagen a Base64...');
    
    // ✅ CAMBIO 1: Convertir a Base64 en lugar de FormData
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(archivoASubir);
    });

    console.log('✅ Imagen convertida a Base64');

    // ✅ CAMBIO 2: Crear payload JSON en lugar de FormData
    const payload = {
      imagen: base64,
      nombreArchivo: archivoASubir.name,
      tipoArchivo: archivoASubir.type,
      tamaño: archivoASubir.size
    };

    console.log('🚀 Enviando petición con JSON...');

    // ✅ CAMBIO 3: Usar axiosAuth con JSON
    const response = await axiosAuth.post('/admin/subir-imagen-publicidad-base64', payload);

    console.log('📥 Respuesta recibida:', response.data);

    if (response.data.success) {
      console.log('✅ Imagen de publicidad subida exitosamente');
      toast.success('Imagen de publicidad subida correctamente');
      
      await cargarImagenes();
      setImagenSeleccionada(null);
      setImagenPreview(null);
      
      return true;
    } else {
      throw new Error(response.data.message || 'Error al subir imagen');
    }
  } catch (error) {
    console.error('❌ Error subiendo imagen de publicidad:', error);
    
    if (error.response?.status === 413) {
      toast.error('Imagen demasiado grande para el servidor.');
    } else if (error.response?.status === 400) {
      toast.error(error.response?.data?.message || 'Formato de imagen no válido.');
    } else if (error.response?.status === 401) {
      toast.error('Sesión expirada. Inicie sesión nuevamente.');
    } else {
      toast.error(error.response?.data?.message || error.message || 'Error al subir la imagen');
    }
    return false;
  } finally {
    setSubiendoImagen(false);
  }
  }, [imagenSeleccionada, cargarImagenes, validarImagen]);

  // SUBIR IMAGEN DE PRODUCTO - CON FETCH NATIVO  
  const subirImagenProducto = useCallback(async (codigoBarra, archivo = null) => {
  const archivoASubir = archivo || imagenSeleccionada;
  
  console.log('📤 Iniciando subida de imagen de producto con BASE64:', {
    codigoBarra,
    archivoParametro: !!archivo,
    imagenSeleccionada: !!imagenSeleccionada
  });
  
  if (!archivoASubir || !codigoBarra) {
    toast.error('Código de barra e imagen son requeridos');
    return false;
  }

  if (!validarImagen(archivoASubir)) {
    return false;
  }

  setSubiendoImagen(true);

  try {
    console.log('🔄 Convirtiendo imagen de producto a Base64...');
    
    // Convertir a Base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(archivoASubir);
    });

    console.log('✅ Imagen convertida a Base64');

    // Crear payload JSON
    const payload = {
      imagen: base64,
      codigo_barra: codigoBarra,
      nombreArchivo: archivoASubir.name,
      tipoArchivo: archivoASubir.type
    };

    console.log('🚀 Enviando imagen de producto...');

    // Usar axiosAuth con JSON
    const response = await axiosAuth.post('/admin/subir-imagen-producto-base64', payload);

    if (response.data.success) {
      console.log(`✅ Imagen del producto ${codigoBarra} subida exitosamente`);
      toast.success('Imagen del producto subida correctamente');
      
      setImagenSeleccionada(null);
      setImagenPreview(null);
      
      return true;
    } else {
      throw new Error(response.data.message || 'Error al subir imagen del producto');
    }
  } catch (error) {
    console.error(`❌ Error subiendo imagen del producto ${codigoBarra}:`, error);
    toast.error(error.response?.data?.message || error.message || 'Error al subir la imagen del producto');
    return false;
  } finally {
    setSubiendoImagen(false);
  }
}, [imagenSeleccionada, validarImagen]);

  // Eliminar imagen de publicidad (mantener con axios)
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

  // Verificar si existe imagen de producto (mantener con axios)
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
    
    // // Setters
    // setImagenSeleccionada,
    // setImagenPreview
  };
};