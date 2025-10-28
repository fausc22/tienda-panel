// hooks/pagina/useImagenes.js - VERSION DEFINITIVA SIN DEPENDENCIAS CIRCULARES
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
  
  // 🆕 NUEVO: Estado para saber si el producto tiene imagen existente
  const [imagenExistente, setImagenExistente] = useState(null);

  // Obtener token del localStorage
  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

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

  // ✅ Validar archivo de imagen O video
  const validarArchivo = useCallback((file, permitirVideo = true) => {
    console.log('🔍 Validando archivo:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      permitirVideo
    });

    if (!file || !(file instanceof File)) {
      toast.error('Archivo no válido');
      return false;
    }

    // Validar tamaño (20MB máximo para videos, 5MB para imágenes)
    const esVideo = file.type.startsWith('video/');
    const maxSize = permitirVideo && esVideo 
      ? 20 * 1024 * 1024  // 20MB para videos
      : 5 * 1024 * 1024;   // 5MB para imágenes
    
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB permitido. Tamaño actual: ${currentSizeMB}MB`);
      return false;
    }
    
    if (file.size === 0) {
      toast.error('El archivo está vacío');
      return false;
    }
    
    // Validar tipo de archivo (imágenes y videos)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      ...(permitirVideo ? ['video/mp4', 'video/webm', 'video/quicktime'] : [])
    ];
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.webp',
      ...(permitirVideo ? ['.mp4', '.webm', '.mov'] : [])
    ];
    
    const typeValid = allowedTypes.includes(file.type.toLowerCase());
    const nameValid = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!typeValid || !nameValid) {
      const tiposPermitidos = permitirVideo 
        ? 'JPG, PNG, WEBP, MP4, WEBM, MOV'
        : 'JPG, PNG, WEBP';
      toast.error(`Tipo de archivo no válido: ${file.type}. Solo se permiten: ${tiposPermitidos}`);
      return false;
    }
    
    console.log('✅ Archivo válido');
    return true;
  }, []);

  // ✅ Mantener validarImagen para compatibilidad (solo imágenes)
  const validarImagen = useCallback((file) => {
    return validarArchivo(file, false);
  }, [validarArchivo]);

  // Manejar selección de archivo
  const handleImagenChange = useCallback((e) => {
    console.log('📁 Evento de cambio de archivo:', e.target.files);
    
    setImagenSeleccionada(null);
    setImagenPreview(null);
    setImagenExistente(null); // 🆕 Limpiar estado de imagen existente
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      console.log('📄 Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });
      
      // ✅ Usar validarArchivo en lugar de validarImagen para aceptar videos
      if (!validarArchivo(file, true)) {
        e.target.value = '';
        return;
      }
      
      setImagenSeleccionada(file);
      
      // Generar preview (funciona para imágenes y videos)
      const esVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(`🖼️ Preview generado (${esVideo ? 'video' : 'imagen'})`);
        setImagenPreview(e.target.result);
      };
      reader.onerror = (error) => {
        console.error('❌ Error generando preview:', error);
        toast.error('Error al generar vista previa del archivo');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('❌ No se seleccionó ningún archivo');
    }
  }, [validarArchivo]);

  // SUBIR IMAGEN/VIDEO DE PUBLICIDAD - CON BASE64
  const subirImagenPublicidad = useCallback(async (archivo = null) => {
    const archivoASubir = archivo || imagenSeleccionada;
    
    console.log('📤 Iniciando subida de archivo con BASE64:', {
      archivoParametro: !!archivo,
      imagenSeleccionada: !!imagenSeleccionada,
      archivoASubir: !!archivoASubir
    });
    
    if (!archivoASubir) {
      toast.error('Seleccione un archivo para subir');
      return false;
    }

    // ✅ Validar permitiendo videos
    if (!validarArchivo(archivoASubir, true)) {
      return false;
    }

    setSubiendoImagen(true);

    try {
      const esVideo = archivoASubir.type.startsWith('video/');
      console.log(`🔄 Convirtiendo ${esVideo ? 'video' : 'imagen'} a Base64...`);
      
      // Convertir a Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(archivoASubir);
      });

      console.log(`✅ Archivo convertido a Base64 (${esVideo ? 'video' : 'imagen'})`);
      
      // Debug: verificar formato del Base64
      console.log('🔍 Debug Base64:', {
        primeros50Caracteres: base64.substring(0, 50),
        longitud: base64.length,
        tieneDataPrefix: base64.startsWith('data:'),
        tieneBase64Tag: base64.includes('base64,')
      });

      // Crear payload JSON según el tipo de archivo
      const payload = esVideo 
        ? {
            video: base64,
            nombreArchivo: archivoASubir.name,
            tipoArchivo: archivoASubir.type,
            tamaño: archivoASubir.size
          }
        : {
            imagen: base64,
            nombreArchivo: archivoASubir.name,
            tipoArchivo: archivoASubir.type,
            tamaño: archivoASubir.size
          };

      console.log('🚀 Enviando petición con JSON...', {
        endpoint: esVideo ? 'video' : 'imagen',
        nombreArchivo: archivoASubir.name,
        tipoArchivo: archivoASubir.type,
        tamañoPayload: JSON.stringify(payload).length
      });

      // ✅ Usar el endpoint apropiado según el tipo de archivo
      const endpoint = esVideo 
        ? '/admin/subir-video-publicidad-base64'
        : '/admin/subir-imagen-publicidad-base64';

      const response = await axiosAuth.post(endpoint, payload);

      console.log('📥 Respuesta recibida:', response.data);

      if (response.data.success) {
        console.log(`✅ ${esVideo ? 'Video' : 'Imagen'} de publicidad subido exitosamente`);
        toast.success(`${esVideo ? 'Video' : 'Imagen'} de publicidad subido correctamente`);
        
        await cargarImagenes();
        setImagenSeleccionada(null);
        setImagenPreview(null);
        
        return true;
      } else {
        throw new Error(response.data.message || 'Error al subir archivo');
      }
    } catch (error) {
      console.error('❌ Error subiendo archivo de publicidad:', error);
      
      if (error.response?.status === 413) {
        toast.error('Archivo demasiado grande para el servidor.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Formato de archivo no válido.');
      } else if (error.response?.status === 401) {
        toast.error('Sesión expirada. Inicie sesión nuevamente.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Error al subir el archivo');
      }
      return false;
    } finally {
      setSubiendoImagen(false);
    }
  }, [imagenSeleccionada, cargarImagenes, validarArchivo]);

  // ⚠️ VERIFICAR IMAGEN - Función auxiliar sin useCallback para evitar dependencias circulares
  const verificarImagenProductoInterno = async (codigoBarra) => {
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
  };

  // Wrapper con useCallback para exportar (sin dependencias que causen problemas)
  const verificarImagenProducto = useCallback(verificarImagenProductoInterno, []);

  // 🆕 NUEVA FUNCIÓN: Verificar imagen antes de mostrar en el UI
  const verificarImagenAntesDeMostrar = useCallback(async (codigoBarra) => {
    if (!codigoBarra) return null;
    
    try {
      console.log(`🔍 Verificando imagen existente para producto: ${codigoBarra}`);
      
      const response = await axiosAuth.get(`/admin/verificar-imagen-producto/${codigoBarra}`);
      
      if (response.data.success && response.data.data?.existe) {
        console.log(`📸 Producto ${codigoBarra} YA TIENE IMAGEN`);
        const infoImagen = {
          existe: true,
          url: response.data.data.url || null,
          nombreArchivo: response.data.data.nombreArchivo || null
        };
        setImagenExistente(infoImagen);
        return infoImagen;
      } else {
        console.log(`📸 Producto ${codigoBarra} NO tiene imagen`);
        setImagenExistente(null);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error verificando imagen del producto ${codigoBarra}:`, error);
      setImagenExistente(null);
      return null;
    }
  }, []);

  // 🆕 MEJORADO: SUBIR IMAGEN DE PRODUCTO - CON VALIDACIÓN Y REEMPLAZO
  const subirImagenProducto = useCallback(async (codigoBarra, archivo = null, forzarReemplazo = false) => {
    const archivoASubir = archivo || imagenSeleccionada;
    
    console.log('📤 Iniciando subida de imagen de producto con BASE64:', {
      codigoBarra,
      archivoParametro: !!archivo,
      imagenSeleccionada: !!imagenSeleccionada,
      forzarReemplazo
    });
    
    if (!archivoASubir || !codigoBarra) {
      toast.error('Código de barra e imagen son requeridos');
      return false;
    }

    // ✅ Para productos solo permitir imágenes
    if (!validarImagen(archivoASubir)) {
      return false;
    }

    // 🆕 VERIFICAR SI YA EXISTE IMAGEN (solo si no es forzado)
    if (!forzarReemplazo) {
      setVerificandoImagen(true);
      try {
        // ⚠️ Usar función interna directamente en lugar de la wrapped
        const imagenExiste = await verificarImagenProductoInterno(codigoBarra);
        
        if (imagenExiste) {
          // Mostrar confirmación al usuario
          const confirmar = window.confirm(
            `⚠️ ATENCIÓN: El producto "${codigoBarra}" ya tiene una imagen asociada.\n\n` +
            `¿Desea REEMPLAZAR la imagen existente con la nueva?\n\n` +
            `Esta acción eliminará la imagen anterior permanentemente.`
          );
          
          if (!confirmar) {
            console.log('❌ Usuario canceló el reemplazo de imagen');
            toast.info('Subida de imagen cancelada');
            setVerificandoImagen(false);
            return false;
          }
          
          console.log('✅ Usuario confirmó reemplazo de imagen');
          toast.info('Reemplazando imagen existente...');
        }
      } catch (error) {
        console.error('❌ Error verificando imagen existente:', error);
        // Continuar con la subida aunque falle la verificación
      } finally {
        setVerificandoImagen(false);
      }
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

      // Crear payload JSON con flag de reemplazo
      const payload = {
        imagen: base64,
        codigo_barra: codigoBarra,
        nombreArchivo: archivoASubir.name,
        tipoArchivo: archivoASubir.type,
        reemplazar: true // 🆕 Siempre reemplazar si llegamos hasta acá
      };

      console.log('🚀 Enviando imagen de producto con reemplazo...');

      // Usar axiosAuth con JSON
      const response = await axiosAuth.post('/admin/subir-imagen-producto-base64', payload);

      if (response.data.success) {
        const mensaje = response.data.reemplazada 
          ? `✅ Imagen del producto ${codigoBarra} REEMPLAZADA exitosamente`
          : `✅ Imagen del producto ${codigoBarra} subida exitosamente`;
        
        console.log(mensaje);
        toast.success(
          response.data.reemplazada 
            ? 'Imagen reemplazada correctamente' 
            : 'Imagen del producto subida correctamente'
        );
        
        setImagenSeleccionada(null);
        setImagenPreview(null);
        setImagenExistente(null); // 🆕 Limpiar estado
        
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
  }, [imagenSeleccionada, validarImagen]); // ⚠️ NO incluir verificarImagenProducto aquí

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

  // Limpiar estados
  const limpiarEstados = useCallback(() => {
    setImagenSeleccionada(null);
    setImagenPreview(null);
    setSubiendoImagen(false);
    setVerificandoImagen(false);
    setImagenExistente(null); // 🆕 Limpiar también imagen existente
  }, []);

  // Obtener información de la imagen seleccionada
  const getImagenInfo = useCallback(() => {
    if (!imagenSeleccionada) return null;
    
    const esVideo = imagenSeleccionada.type.startsWith('video/');
    
    return {
      nombre: imagenSeleccionada.name,
      tamaño: (imagenSeleccionada.size / (1024 * 1024)).toFixed(2) + ' MB',
      tipo: imagenSeleccionada.type,
      esVideo: esVideo,
      preview: imagenPreview,
      imagenExistente: imagenExistente // 🆕 Incluir info de imagen existente
    };
  }, [imagenSeleccionada, imagenPreview, imagenExistente]);

  return {
    // Estados
    imagenesPublicidad,
    imagenSeleccionada,
    imagenPreview,
    loading,
    subiendoImagen,
    verificandoImagen,
    imagenExistente, // 🆕 Nuevo estado exportado
    
    // Funciones principales
    cargarImagenes,
    handleImagenChange,
    subirImagenPublicidad,
    eliminarImagenPublicidad,
    
    // Funciones para productos
    verificarImagenProducto,
    verificarImagenAntesDeMostrar, // 🆕 Nueva función exportada
    subirImagenProducto,
    
    // Utilidades
    validarImagen,
    validarArchivo,
    limpiarEstados,
    getImagenInfo,
  };
};