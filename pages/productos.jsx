// pages/productos.jsx - Página de gestión de productos
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedPage } from '../hooks/useAuthRedirect';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CubeIcon 
} from '@heroicons/react/24/outline';

const ProductosPage = () => {
  const { isLoading: authLoading } = useProtectedPage();
  const { user } = useAuth();
  
  // Estados
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProductos, setFilteredProductos] = useState([]);

  // Datos de ejemplo - reemplazar con llamadas reales a la API
  const productosEjemplo = [
    {
      id: 1,
      codigo_barra: '7790001234567',
      nombre: 'Producto Ejemplo 1',
      precio: 1250.50,
      stock: 45,
      categoria: 'Electrónicos',
      estado: 'Activo'
    },
    {
      id: 2,
      codigo_barra: '7790001234568',
      nombre: 'Producto Ejemplo 2', 
      precio: 890.00,
      stock: 12,
      categoria: 'Hogar',
      estado: 'Activo'
    },
    {
      id: 3,
      codigo_barra: '7790001234569',
      nombre: 'Producto Ejemplo 3',
      precio: 2100.75,
      stock: 0,
      categoria: 'Deportes',
      estado: 'Sin Stock'
    }
  ];

  useEffect(() => {
    if (!authLoading && user) {
      cargarProductos();
    }
  }, [user, authLoading]);

  // Filtrar productos basado en búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo_barra.includes(searchTerm) ||
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchTerm, productos]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      // Simular carga de datos - reemplazar con llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProductos(productosEjemplo);
      toast.success('Productos cargados correctamente');
    } catch (error) {
      toast.error('Error al cargar productos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarProducto = () => {
    toast.info('Función agregar producto - Por implementar');
  };

  const handleEditarProducto = (producto) => {
    toast.info(`Editar producto: ${producto.nombre} - Por implementar`);
  };

  const handleEliminarProducto = (producto) => {
    toast.info(`Eliminar producto: ${producto.nombre} - Por implementar`);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-600 bg-red-100', text: 'Sin Stock' };
    if (stock <= 10) return { color: 'text-orange-600 bg-orange-100', text: 'Stock Bajo' };
    return { color: 'text-green-600 bg-green-100', text: 'En Stock' };
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>Productos - Panel Admin PuntoSur</title>
        <meta name="description" content="Gestión de productos - Panel de administración PuntoSur" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <CubeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Gestión de Productos
                </h1>
                <p className="text-gray-600 mt-1">
                  Administra tu inventario y catálogo de productos
                </p>
              </div>
            </div>

            <button
              onClick={handleAgregarProducto}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={cargarProductos}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando productos...</span>
            </div>
          ) : (
            <>
              {/* Vista Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProductos.map((producto) => {
                      const stockStatus = getStockStatus(producto.stock);
                      return (
                        <tr key={producto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">
                            {producto.codigo_barra}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{producto.nombre}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {producto.categoria}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                            ${producto.precio.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold">
                            {producto.stock}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEditarProducto(producto)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar producto"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEliminarProducto(producto)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Eliminar producto"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista Móvil */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredProductos.map((producto) => {
                  const stockStatus = getStockStatus(producto.stock);
                  return (
                    <div key={producto.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{producto.nombre}</h3>
                          <p className="text-sm text-gray-500">Código: {producto.codigo_barra}</p>
                          <p className="text-sm text-gray-500">Categoría: {producto.categoria}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditarProducto(producto)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarProducto(producto)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Precio:</span>
                          <div className="font-semibold text-green-600">${producto.precio.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <div className="font-semibold">{producto.stock}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Estado:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mensaje cuando no hay productos */}
              {filteredProductos.length === 0 && !loading && (
                <div className="text-center py-12">
                  <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Intenta ajustar tu búsqueda'
                      : 'Comienza agregando productos a tu inventario'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductosPage;