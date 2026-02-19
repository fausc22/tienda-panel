// components/pagina/GestionImagenes.jsx - Componente de gestión de imágenes
import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PhotoIcon,
  CloudArrowUpIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useProductoSearch } from '../../hooks/useBusquedaProductos';
import OrdenadorShowcase from './OrdenadorShowcase';

export default function GestionImagenes({
  imagenesPublicidad,
  imagenSeleccionada,
  imagenPreview,
  loading,
  subiendoImagen,
  verificandoImagen,
  handleImagenChange,
  subirImagenPublicidad,
  eliminarImagenPublicidad,
  verificarImagenProducto,
  subirImagenProducto,
  limpiarEstados,
  getImagenInfo,
  cargarImagenes 
}) {
  const [seccionActiva, setSeccionActiva] = useState('publicidad');
  const [modalProducto, setModalProducto] = useState({ mostrar: false, producto: null });
  const fileInputRef = useRef(null);
  const fileInputProductoRef = useRef(null);

  // Hook para búsqueda de productos
  const {
    busqueda,
    setBusqueda,
    resultados,
    productoSeleccionado,
    loading: loadingBusqueda,
    buscarProducto,
    seleccionarProducto,
    limpiarSeleccion
  } = useProductoSearch();

  // Manejar subida de imagen de publicidad
  const handleSubirPublicidad = async () => {
    const exito = await subirImagenPublicidad();
    if (exito) {
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Manejar apertura de modal para imagen de producto
  const handleAbrirModalProducto = (producto) => {
    setModalProducto({ mostrar: true, producto });
    limpiarEstados();
  };

  // Manejar cierre de modal
  const handleCerrarModal = () => {
    setModalProducto({ mostrar: false, producto: null });
    limpiarSeleccion();
    limpiarEstados();
    if (fileInputProductoRef.current) {
      fileInputProductoRef.current.value = '';
    }
  };

  // Manejar subida de imagen de producto
  const handleSubirImagenProducto = async () => {
    if (!modalProducto.producto) {
      toast.error('No hay producto seleccionado');
      return;
    }

    const exito = await subirImagenProducto(modalProducto.producto.codigo_barra);
    if (exito) {
      handleCerrarModal();
    }
  };

  // Verificar imagen existente del producto
  const handleVerificarImagen = async (codigoBarra) => {
    const existe = await verificarImagenProducto(codigoBarra);
    if (existe) {
      const confirmar = confirm('Este producto ya tiene una imagen. ¿Desea reemplazarla?');
      if (!confirmar) return false;
    }
    return true;
  };

  // Obtener URL de la imagen
  const getImagenUrl = (rutaImagen) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('❌ NEXT_PUBLIC_API_URL no está definida');
      return rutaImagen;
    }
    return `${apiUrl}${rutaImagen}`;
  };

  // Información de la imagen seleccionada
  const imagenInfo = getImagenInfo();

  return (
    <div>
      {/* Header de la sección */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Imágenes</h2>
        <p className="text-gray-600">
          Administre las imágenes de publicidad y productos de su tienda
        </p>
      </div>

      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSeccionActiva('publicidad')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              seccionActiva === 'publicidad'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PhotoIcon className="h-5 w-5 inline mr-2" />
            Imágenes de Publicidad
          </button>
          <button
            onClick={() => setSeccionActiva('productos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              seccionActiva === 'productos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PhotoIcon className="h-5 w-5 inline mr-2" />
            Imágenes de Productos
          </button>
        </nav>
      </div>

      {/* Contenido según sección activa */}
      {seccionActiva === 'publicidad' && (
        <div>
          {/* Upload de imagen de publicidad */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Subir Nueva Imagen de Publicidad
            </h3>
            
            {/* Área de upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleImagenChange}
              accept="image/*,video/mp4,video/webm,video/quicktime"  
              className="hidden"
              id="imagen-publicidad-input"
            />
  
              <label
                htmlFor="imagen-publicidad-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-blue-600 hover:text-blue-800 font-medium mb-2 transition-colors">
                  Haz clic para seleccionar imagen o video
                </span>
                <span className="text-xs text-gray-500">
                  Formatos: JPG, PNG, WEBP, MP4, WEBM, MOV (Máx. 50MB)
                </span>
              </label>
            </div>

            {/* Preview de la imagen seleccionada */}
            {imagenInfo && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-4">
                  {imagenInfo.preview && (
                    <img 
                      src={imagenInfo.preview} 
                      alt="Vista previa" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">{imagenInfo.nombre}</p>
                    <p className="text-xs text-blue-700">{imagenInfo.tamaño}</p>
                  </div>
                  <button
                    onClick={handleSubirPublicidad}
                    disabled={subiendoImagen}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subiendoImagen ? 'Subiendo...' : 'Subir Imagen'}
                  </button>
                </div>
              </div>
            )}
          </div>

            <div className="mt-6">
              <OrdenadorShowcase 
                imagenesPublicidad={imagenesPublicidad}
                onOrdenGuardado={cargarImagenes}
              />
            </div>
          {/* Lista de imágenes existentes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Imágenes de Publicidad ({imagenesPublicidad?.length || 0})
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando imágenes...</span>
              </div>
            ) : imagenesPublicidad && imagenesPublicidad.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagenesPublicidad.map((imagen, index) => (
                  <div key={index} className="relative group bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
                    <img
                      src={getImagenUrl(imagen)}
                      alt={`Publicidad ${index + 1}`}
                      className="w-full h-32 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.png';
                      }}
                    />
                    
                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => window.open(getImagenUrl(imagen), '_blank')}
                          className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="Ver imagen"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => eliminarImagenPublicidad(imagen.split('/').pop())}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                          title="Eliminar imagen"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Nombre del archivo */}
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate" title={imagen.split('/').pop()}>
                        {imagen.split('/').pop()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PhotoIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-1">No hay imágenes de publicidad</p>
                <p className="text-sm">Las imágenes subidas aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      )}

      {seccionActiva === 'productos' && (
        <div>
          {/* Búsqueda de productos */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Buscar Producto para Subir Imagen
            </h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => {
                  const terminoLimpio = busqueda.trim();
                  if (terminoLimpio.length < 2) {
                    toast.error('Ingrese al menos 2 caracteres para buscar');
                    return;
                  }
                  buscarProducto();
                }}
                disabled={loadingBusqueda || busqueda.trim().length < 2}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                Buscar
              </button>
            </div>

            {/* Resultados de búsqueda */}
            {loadingBusqueda ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Buscando productos...</span>
              </div>
            ) : resultados.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                {resultados.map((producto, index) => (
                  <div
                    key={index}
                    className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAbrirModalProducto(producto)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">Código: {producto.codigo_barra}</p>
                      </div>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        <PlusIcon className="h-4 w-4 inline mr-1" />
                        Subir Imagen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : busqueda && (
              <div className="text-center py-4 text-gray-500">
                <p>No se encontraron productos con ese término</p>
              </div>
            )}
          </div>

          {/* Información sobre imágenes de productos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <PhotoIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Información sobre Imágenes de Productos</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Las imágenes deben tener el mismo nombre que el código de barra del producto</li>
                    <li>Formatos soportados: JPG, PNG, WEBP</li>
                    <li>Tamaño máximo recomendado: 5MB</li>
                    <li>Resolución recomendada: 800x800 píxeles o superior</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para subir imagen de producto */}
      {modalProducto.mostrar && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Subir Imagen para Producto
              </h3>
              
              {modalProducto.producto && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{modalProducto.producto.nombre}</p>
                  <p className="text-sm text-gray-600">Código: {modalProducto.producto.codigo_barra}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    La imagen debe llamarse: <code>{modalProducto.producto.codigo_barra}.jpg</code>
                  </p>
                </div>
              )}

              {/* Selector de archivo */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-4">
                <input
                  ref={fileInputProductoRef}
                  type="file"
                  onChange={handleImagenChange}
                  accept="image/*"
                  className="hidden"
                  id="imagen-producto-input"
                />
                
                <label
                  htmlFor="imagen-producto-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-blue-600 hover:text-blue-800 font-medium mb-1">
                    Seleccionar imagen del producto
                  </span>
                  <span className="text-xs text-gray-500">JPG, PNG, WEBP (Máx. 5MB)</span>
                </label>
              </div>

              {/* Preview de la imagen seleccionada */}
              {imagenInfo && (
                <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center space-x-3">
                    {imagenInfo.preview && (
                      <img 
                        src={imagenInfo.preview} 
                        alt="Vista previa" 
                        className="w-12 h-12 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">{imagenInfo.nombre}</p>
                      <p className="text-xs text-green-700">{imagenInfo.tamaño}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-between gap-3">
                <button
                  onClick={handleCerrarModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubirImagenProducto}
                  disabled={!imagenSeleccionada || subiendoImagen}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subiendoImagen ? 'Subiendo...' : 'Subir Imagen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}