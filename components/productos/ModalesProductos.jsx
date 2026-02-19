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

// Campos base del JSON de productos
const camposIniciales = {
  codigo_barra: '',
  cod_interno: '',
  art_desc_vta: '',
  marca: '',
  precio: '',
  stock: 0,
  pesable: 0,
  costo: '',
  cod_iva: 0,
  habilitado: 'S',
  porc_impint: '',
  precio_sin_iva: '',
  precio_sin_iva_1: '',
  precio_sin_iva_2: '',
  precio_sin_iva_3: '',
  precio_sin_iva_4: '',
  cod_dpto: '',
  cod_rubro: '',
  cod_subrubro: '',
  impuesto_interno: ''
};

// Modal para agregar nuevo producto
export function ModalAgregarProducto({ mostrar, onClose, onAgregar, validarProducto }) {
  const [producto, setProducto] = useState(camposIniciales);
  const [errores, setErrores] = useState([]);
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

  // Hook para cargar categorías
  const { 
    categorias, 
    loading: loadingCategorias, 
    categoriasParaSelect 
  } = useCategorias();

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (mostrar) {
      setProducto(camposIniciales);
      setErrores([]);
      setMostrarAvanzados(false);
    }
  }, [mostrar]);

  const handleInputChange = (campo, valor) => {
    setProducto(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleSubmit = async () => {
    const productoValidado = {
      ...producto,
      nombre: producto.art_desc_vta,
      categoria: categorias.find(cat => cat.DAT_CLASIF === producto.cod_dpto)?.DAT_CLASIF || producto.cod_dpto
    };
    
    const { esValido, errores: erroresValidacion } = validarProducto(productoValidado);
    
    if (!esValido) {
      setErrores(erroresValidacion);
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    const productoParaEnvio = {
      ...producto,
      cod_interno: parseInt(producto.cod_interno) || 0,
      precio: parseFloat(producto.precio) || 0,
      stock: parseInt(producto.stock) || 0,
      pesable: parseInt(producto.pesable) || 0,
      costo: parseFloat(producto.costo) || 0,
      cod_iva: parseInt(producto.cod_iva) || 0,
      porc_impint: parseFloat(producto.porc_impint) || 0,
      precio_sin_iva: parseFloat(producto.precio_sin_iva) || 0,
      precio_sin_iva_1: parseFloat(producto.precio_sin_iva_1) || 0,
      precio_sin_iva_2: parseFloat(producto.precio_sin_iva_2) || 0,
      precio_sin_iva_3: parseFloat(producto.precio_sin_iva_3) || 0,
      precio_sin_iva_4: parseFloat(producto.precio_sin_iva_4) || 0,
      cod_dpto: producto.cod_dpto || null,
      cod_rubro: producto.cod_rubro || null,
      cod_subrubro: producto.cod_subrubro || null,
      impuesto_interno: parseFloat(producto.impuesto_interno) || 0,
      nombre: producto.art_desc_vta,
      categoria: categorias.find(cat => cat.DAT_CLASIF === producto.cod_dpto)?.DAT_CLASIF || producto.cod_dpto
    };

    const exito = await onAgregar(productoParaEnvio);
    if (exito) {
      onClose();
    }
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Campos básicos */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Interno
                </label>
                <input
                  type="number"
                  value={producto.cod_interno}
                  onChange={(e) => handleInputChange('cod_interno', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto (art_desc_vta) *
                </label>
                <input
                  type="text"
                  value={producto.art_desc_vta}
                  onChange={(e) => handleInputChange('art_desc_vta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese nombre del producto"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento (COD_DPTO)
                  {loadingCategorias && (
                    <span className="ml-2 text-xs text-gray-500">(Cargando...)</span>
                  )}
                </label>
                <select
                  value={producto.cod_dpto}
                  onChange={(e) => handleInputChange('cod_dpto', e.target.value)}
                  disabled={loadingCategorias}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccionar departamento</option>
                  {categoriasParaSelect().map((categoria) => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rubro (COD_RUBRO)
                </label>
                <input
                  type="text"
                  value={producto.cod_rubro}
                  onChange={(e) => handleInputChange('cod_rubro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 011001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subrubro (COD_SUBRUBRO)
                </label>
                <input
                  type="text"
                  value={producto.cod_subrubro}
                  onChange={(e) => handleInputChange('cod_subrubro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 011001001"
                />
              </div>
            </div>
          </div>

          {/* Precios y costos */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Precios y Costos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Sin IVA 1
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={producto.precio_sin_iva_1}
                  onChange={(e) => handleInputChange('precio_sin_iva_1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Sin IVA 2
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={producto.precio_sin_iva_2}
                  onChange={(e) => handleInputChange('precio_sin_iva_2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Sin IVA 3
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={producto.precio_sin_iva_3}
                  onChange={(e) => handleInputChange('precio_sin_iva_3', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impuesto Interno
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={producto.impuesto_interno}
                  onChange={(e) => handleInputChange('impuesto_interno', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Stock e impuestos */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Stock e Impuestos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesable
                </label>
                <select
                  value={producto.pesable}
                  onChange={(e) => handleInputChange('pesable', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código IVA (COD_IVA)
                </label>
                <select
                  value={producto.cod_iva}
                  onChange={(e) => handleInputChange('cod_iva', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">0 - 21%</option>
                  <option value="1">1 - 10.5%</option>
                  <option value="2">2 - 0%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje Imp. Interno
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={producto.porc_impint}
                  onChange={(e) => handleInputChange('porc_impint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

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
      const categoriaActual = obtenerCategoriaPorId(producto.categoria_id || producto.categoria);
      
      setProductoEditado({ 
        codigo_barra: producto.codigo_barra || '',
        cod_interno: producto.cod_interno || '',
        art_desc_vta: producto.nombre || producto.art_desc_vta || '',
        marca: producto.marca || '',
        precio: producto.precio || '',
        stock: producto.stock || 0,
        pesable: producto.pesable || 0,
        costo: producto.costo || '',
        cod_iva: producto.COD_IVA || producto.cod_iva || 0,
        habilitado: producto.habilitado || 'S',
        porc_impint: producto.porc_impint || '',
        precio_sin_iva: producto.precio_sin_iva || '',
        precio_sin_iva_1: producto.precio_sin_iva_1 || '',
        precio_sin_iva_2: producto.precio_sin_iva_2 || '',
        precio_sin_iva_3: producto.precio_sin_iva_3 || '',
        precio_sin_iva_4: producto.precio_sin_iva_4 || '',
        cod_dpto: producto.categoria_id || producto.cod_dpto || '',
        cod_rubro: producto.cod_rubro || '',
        cod_subrubro: producto.cod_subrubro || '',
        impuesto_interno: producto.impuesto_interno || '',
        categoria: categoriaActual?.NOM_CLASIF || categoriaActual?.DAT_CLASIF || ''
      });
      setErrores([]);
    }
  }, [producto, obtenerCategoriaPorId]);

  const handleInputChange = (campo, valor) => {
    setProductoEditado(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleSubmit = async () => {
    const productoValidado = {
      ...productoEditado,
      nombre: productoEditado.art_desc_vta,
      categoria: categorias.find(cat => cat.DAT_CLASIF === productoEditado.cod_dpto)?.DAT_CLASIF || productoEditado.cod_dpto
    };
    
    const { esValido, errores: erroresValidacion } = validarProducto(productoValidado);
    
    if (!esValido) {
      setErrores(erroresValidacion);
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    const productoParaEnvio = {
      ...productoEditado,
      cod_interno: parseInt(productoEditado.cod_interno) || 0,
      precio: parseFloat(productoEditado.precio) || 0,
      stock: parseInt(productoEditado.stock) || 0,
      pesable: parseInt(productoEditado.pesable) || 0,
      costo: parseFloat(productoEditado.costo) || 0,
      cod_iva: parseInt(productoEditado.cod_iva) || 0,
      porc_impint: parseFloat(productoEditado.porc_impint) || 0,
      precio_sin_iva: parseFloat(productoEditado.precio_sin_iva) || 0,
      precio_sin_iva_1: parseFloat(productoEditado.precio_sin_iva_1) || 0,
      precio_sin_iva_2: parseFloat(productoEditado.precio_sin_iva_2) || 0,
      precio_sin_iva_3: parseFloat(productoEditado.precio_sin_iva_3) || 0,
      precio_sin_iva_4: parseFloat(productoEditado.precio_sin_iva_4) || 0,
      cod_dpto: productoEditado.cod_dpto || null,
      cod_rubro: productoEditado.cod_rubro || null,
      cod_subrubro: productoEditado.cod_subrubro || null,
      impuesto_interno: parseFloat(productoEditado.impuesto_interno) || 0,
      nombre: productoEditado.art_desc_vta,
      categoria: categorias.find(cat => cat.DAT_CLASIF === productoEditado.cod_dpto)?.DAT_CLASIF || productoEditado.cod_dpto
    };

    const exito = await onGuardar(productoParaEnvio);
    if (exito) {
      onClose();
    }
  };

  if (!producto) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Campos básicos */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Interno
                </label>
                <input
                  type="number"
                  value={productoEditado.cod_interno || ''}
                  onChange={(e) => handleInputChange('cod_interno', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto (art_desc_vta) *
                </label>
                <input
                  type="text"
                  value={productoEditado.art_desc_vta || ''}
                  onChange={(e) => handleInputChange('art_desc_vta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento (COD_DPTO)
                  {loadingCategorias && (
                    <span className="ml-2 text-xs text-gray-500">(Cargando...)</span>
                  )}
                </label>
                <select
                  value={productoEditado.cod_dpto || ''}
                  onChange={(e) => handleInputChange('cod_dpto', e.target.value)}
                  disabled={loadingCategorias}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccionar departamento</option>
                  {categoriasParaSelect().map((categoria) => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rubro (COD_RUBRO)
                </label>
                <input
                  type="text"
                  value={productoEditado.cod_rubro || ''}
                  onChange={(e) => handleInputChange('cod_rubro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 011001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subrubro (COD_SUBRUBRO)
                </label>
                <input
                  type="text"
                  value={productoEditado.cod_subrubro || ''}
                  onChange={(e) => handleInputChange('cod_subrubro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 011001001"
                />
              </div>
            </div>
          </div>

          {/* Precios y costos */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Precios y Costos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Sin IVA 1
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productoEditado.precio_sin_iva_1 || ''}
                  onChange={(e) => handleInputChange('precio_sin_iva_1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Sin IVA 2
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productoEditado.precio_sin_iva_2 || ''}
                  onChange={(e) => handleInputChange('precio_sin_iva_2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Sin IVA 3
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productoEditado.precio_sin_iva_3 || ''}
                  onChange={(e) => handleInputChange('precio_sin_iva_3', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impuesto Interno
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productoEditado.impuesto_interno || ''}
                  onChange={(e) => handleInputChange('impuesto_interno', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Stock e impuestos */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Stock e Impuestos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesable
                </label>
                <select
                  value={productoEditado.pesable || 0}
                  onChange={(e) => handleInputChange('pesable', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código IVA (COD_IVA)
                </label>
                <select
                  value={productoEditado.cod_iva || 0}
                  onChange={(e) => handleInputChange('cod_iva', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">0 - 21%</option>
                  <option value="1">1 - 10.5%</option>
                  <option value="2">2 - 0%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje Imp. Interno
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productoEditado.porc_impint || ''}
                  onChange={(e) => handleInputChange('porc_impint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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
            ¿Estás seguro de que deseas eliminar el producto <strong>{producto.nombre || producto.art_desc_vta}</strong>?
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
