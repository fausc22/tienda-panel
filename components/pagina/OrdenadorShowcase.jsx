// components/pagina/OrdenadorShowcase.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ArrowsUpDownIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { axiosAuth } from '../../utils/apiClient';

export default function OrdenadorShowcase({ imagenesPublicidad, onOrdenGuardado }) {
  const [items, setItems] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [ordenModificado, setOrdenModificado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Obtener la URL base de la API desde las variables de entorno
  const getApiBaseURL = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('❌ NEXT_PUBLIC_API_URL no está definida');
      throw new Error('NEXT_PUBLIC_API_URL no está configurada. Por favor, configúrala en tu archivo .env');
    }
    return apiUrl;
  };

  // Cargar imágenes cuando cambian
  useEffect(() => {
    if (imagenesPublicidad && imagenesPublicidad.length > 0) {
      const apiBase = getApiBaseURL();
      
      const itemsConMetadata = imagenesPublicidad.map((url, index) => {
        const esVideo = /\.(mp4|webm|mov)$/i.test(url);
        const nombreArchivo = url.split('/').pop();
        
        // Si la URL ya es completa (empieza con http), usarla tal cual
        // Si no, agregarle la base URL del API
        const urlCompleta = url.startsWith('http') ? url : `${apiBase}${url}`;
        
        return {
          id: index,
          url: urlCompleta,
          urlOriginal: url,
          nombreArchivo,
          tipo: esVideo ? 'video' : 'imagen'
        };
      });
      
      setItems(itemsConMetadata);
    }
  }, [imagenesPublicidad]);

  // Manejar inicio del drag
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // Manejar drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remover item de posición original
    newItems.splice(draggedIndex, 1);
    // Insertar en nueva posición
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
    setOrdenModificado(true);
  };

  // Manejar fin del drag
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Guardar nuevo orden
  const guardarOrden = async () => {
    setGuardando(true);
    
    try {
      const orden = items.map(item => item.nombreArchivo);
      
      console.log('📤 Guardando orden:', orden);
      
      const response = await axiosAuth.post('/admin/guardar-orden-showcase', {
        orden
      });
      
      if (response.data.success) {
        toast.success('Orden guardado correctamente');
        setOrdenModificado(false);
        
        if (onOrdenGuardado) {
          onOrdenGuardado();
        }
      } else {
        throw new Error(response.data.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('❌ Error guardando orden:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el orden');
    } finally {
      setGuardando(false);
    }
  };

  // Cancelar cambios
  const cancelarCambios = () => {
    // Recargar imágenes originales
    if (imagenesPublicidad && imagenesPublicidad.length > 0) {
      const apiBase = getApiBaseURL();
      
      const itemsConMetadata = imagenesPublicidad.map((url, index) => {
        const esVideo = /\.(mp4|webm|mov)$/i.test(url);
        const nombreArchivo = url.split('/').pop();
        const urlCompleta = url.startsWith('http') ? url : `${apiBase}${url}`;
        
        return {
          id: index,
          url: urlCompleta,
          urlOriginal: url,
          nombreArchivo,
          tipo: esVideo ? 'video' : 'imagen'
        };
      });
      
      setItems(itemsConMetadata);
      setOrdenModificado(false);
      toast.info('Cambios cancelados');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No hay archivos para ordenar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowsUpDownIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ordenar Contenido del Carrusel
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Arrastra y suelta para cambiar el orden
              </p>
            </div>
          </div>
          
          {ordenModificado && (
            <div className="flex gap-2">
              <button
                onClick={cancelarCambios}
                disabled={guardando}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <XMarkIcon className="w-5 h-5" />
                Cancelar
              </button>
              <button
                onClick={guardarOrden}
                disabled={guardando}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Guardar Orden
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de items */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-transparent
                cursor-move hover:bg-gray-100 transition-all
                ${draggedIndex === index ? 'opacity-50 border-blue-400' : ''}
              `}
            >
              {/* Número de orden */}
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>

              {/* Preview */}
              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                {item.tipo === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.nombreArchivo}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.nombreArchivo}
                </p>
                <p className="text-sm text-gray-500">
                  {item.tipo === 'video' ? '📹 Video' : '🖼️ Imagen'}
                </p>
              </div>

              {/* Drag handle */}
              <div className="flex-shrink-0 text-gray-400">
                <ArrowsUpDownIcon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}