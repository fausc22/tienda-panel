// components/productos/ModalesProductos.jsx - Modales para gestión de productos
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useCategorias } from '../../hooks/useCategorias';

// Modal para agregar nuevo producto
export function ModalAgregarProducto({ mostrar, onClose, onAgregar, validarProducto }) {
  const [producto, setProducto] = useState({
    codigo_barra: '',
    nombre: '',
    costo: '',
    precio: '',
    precio_sin_iva: '',
    precio_sin_iva_4: '',
    categoria: '',
    stock: 0,
    descripcion: '',
    habilitado: 'S',
    marca: ''
  });
  
  const [errores, setErrores] = useState([]);

  // Hook para cargar categorías
  const { 
    categorias, 
    loading: loadingCategorias, 
    categoriasParaSelect 
  } = useCategorias();

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (mostrar) {
      setProducto({
        codigo_barra: '',
        nombre: '',
        costo: '',
        precio: '',
        precio_sin_iva: '',
        precio_sin_iva_4: '',
        categoria: '',
        stock: 0,
        descripcion: '',
        habilitado: 'S',
        marca: ''
      });
      setErrores([]);
    }
  }, [mostrar]);

  const handleInputChange = (campo, valor) => {
    setProducto(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleSubmit = async () => {
    // Validar producto
    const { esValido, errores: erroresValidacion } = validarProducto(producto);
    
    if (!esValido) {
      setErrores(erroresValidacion);
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    // Preparar datos para envío
    const productoParaEnvio = {
      ...producto,
      costo: parseFloat(producto.costo) || 0,
      precio: parseFloat(producto.precio) || 0,
      precio_sin_iva: parseFloat(producto.precio_sin_iva) || 0,
      precio_sin_iva_4: parseFloat(producto.precio_sin_iva_4) || 0,
      stock: parseInt(producto.stock) || 0,
      // Buscar el id_clasif de la categoría seleccionada
      categoria: categorias.find(cat => cat.NOM_CLASIF === producto.categoria)?.id_clasif || null
    };

    const exito = await onAgregar(productoParaEnvio);
    if (exito) {
      onClose();
    }
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <PlusIcon className="h-6 w-6 mr-2 text-green-600" />
              Agregar Nuevo Producto
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mostrar errores */}
          {errores.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
              <h3 className="font-medium text-red-800 mb-2">Errores encontrados:</h3>
              <ul className="text-sm text-red-700">
                {errores.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código de Barra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barra *
              </label>
              <input
                type="text"
                value={producto.codigo_barra}
                onChange={(e) => handleInputChange('codigo_barra', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese código de barra"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={producto.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese nombre del producto"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={producto.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Marca del producto"
              />
            </div>

            {/* Categoría - Cargada dinámicamente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
                {loadingCategorias && (
                  <span className="ml-2 text-xs text-gray-500">(Cargando...)</span>
                )}
              </label>
              <select
                value={producto.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                disabled={loadingCategorias}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccionar categoría</option>
                {categoriasParaSelect().map((categoria) => (
                  <option key={categoria.value} value={categoria.label}>
                    {categoria.label} ({categoria.count} productos)
                  </option>
                ))}
              </select>
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo
              </label>
              <input
                type="number"
                step="0.01"
                value={producto.costo}
                onChange={(e) => handleInputChange('costo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                value={producto.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Precio Sin IVA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Sin IVA
              </label>
              <input
                type="number"
                step="0.01"
                value={producto.precio_sin_iva}
                onChange={(e) => handleInputChange('precio_sin_iva', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Precio Sin IVA 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Sin IVA 4
              </label>
              <input
                type="number"
                step="0.01"
                value={producto.precio_sin_iva_4}
                onChange={(e) => handleInputChange('precio_sin_iva_4', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={producto.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={producto.habilitado}
                onChange={(e) => handleInputChange('habilitado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="S">Habilitado</option>
                <option value="N">Deshabilitado</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={producto.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loadingCategorias}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Agregar Producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para editar producto existente
export function ModalEditarProducto({ producto, onClose, onGuardar, validarProducto }) {
  const [productoEditado, setProductoEditado] = useState({});
  const [errores, setErrores] = useState([]);

  // Hook para cargar categorías
  const { 
    categorias, 
    loading: loadingCategorias, 
    categoriasParaSelect,
    obtenerCategoriaPorId 
  } = useCategorias();

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (producto) {
      // Buscar el nombre de la categoría basado en el COD_DPTO
      const categoriaActual = obtenerCategoriaPorId(producto.categoria);
      
      setProductoEditado({ 
        ...producto,
        categoria: categoriaActual?.NOM_CLASIF || ''
      });
      setErrores([]);
    }
  }, [producto, obtenerCategoriaPorId]);

  const handleInputChange = (campo, valor) => {
    setProductoEditado(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleSubmit = async () => {
    // Validar producto
    const { esValido, errores: erroresValidacion } = validarProducto(productoEditado);
    
    if (!esValido) {
      setErrores(erroresValidacion);
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    // Preparar datos para envío
    const productoParaEnvio = {
      ...productoEditado,
      costo: parseFloat(productoEditado.costo) || 0,
      precio: parseFloat(productoEditado.precio) || 0,
      precio_sin_iva: parseFloat(productoEditado.precio_sin_iva) || 0,
      precio_sin_iva_4: parseFloat(productoEditado.precio_sin_iva_4) || 0,
      stock: parseInt(productoEditado.stock) || 0,
      // Buscar el id_clasif de la categoría seleccionada
      categoria: categorias.find(cat => cat.NOM_CLASIF === productoEditado.categoria)?.id_clasif || null
    };

    const exito = await onGuardar(productoParaEnvio);
    if (exito) {
      onClose();
    }
  };

  if (!producto) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <PencilIcon className="h-6 w-6 mr-2 text-blue-600" />
              Editar Producto
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mostrar errores */}
          {errores.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
              <h3 className="font-medium text-red-800 mb-2">Errores encontrados:</h3>
              <ul className="text-sm text-red-700">
                {errores.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código de Barra (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barra
              </label>
              <input
                type="text"
                value={productoEditado.codigo_barra || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={productoEditado.nombre || ''}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={productoEditado.marca || ''}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Categoría - Cargada dinámicamente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
                {loadingCategorias && (
                  <span className="ml-2 text-xs text-gray-500">(Cargando...)</span>
                )}
              </label>
              <select
                value={productoEditado.categoria || ''}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                disabled={loadingCategorias}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccionar categoría</option>
                {categoriasParaSelect().map((categoria) => (
                  <option key={categoria.value} value={categoria.label}>
                    {categoria.label} ({categoria.count} productos)
                  </option>
                ))}
              </select>
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo
              </label>
              <input
                type="number"
                step="0.01"
                value={productoEditado.costo || ''}
                onChange={(e) => handleInputChange('costo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                value={productoEditado.precio || ''}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Precio Sin IVA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Sin IVA
              </label>
              <input
                type="number"
                step="0.01"
                value={productoEditado.precio_sin_iva || ''}
                onChange={(e) => handleInputChange('precio_sin_iva', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Precio Sin IVA 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Sin IVA 4
              </label>
              <input
                type="number"
                step="0.01"
                value={productoEditado.precio_sin_iva_4 || ''}
                onChange={(e) => handleInputChange('precio_sin_iva_4', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={productoEditado.stock || ''}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={productoEditado.habilitado || 'S'}
                onChange={(e) => handleInputChange('habilitado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="S">Habilitado</option>
                <option value="N">Deshabilitado</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loadingCategorias}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para confirmar eliminación
export function ModalEliminarProducto({ producto, onClose, onConfirmar }) {
  if (!producto) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <TrashIcon className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">
              Confirmar Eliminación
            </h2>
          </div>
          
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar el producto <strong>{producto.nombre}</strong>?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> Esta acción deshabilitará el producto del sistema. Podrás rehabilitarlo más tarde editándolo.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirmar(producto.codigo_barra)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Eliminar Producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}