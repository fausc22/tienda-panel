// components/pagina/ConfiguracionGeneral.jsx - Componente de configuración general
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function ConfiguracionGeneral({
  configuracion,
  loading,
  guardando,
  guardarConfiguracion,
  actualizarCampo,
  validarConfiguracion,
  resetearConfiguracion
}) {
  const [formData, setFormData] = useState({});
  const [errores, setErrores] = useState([]);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  // Sincronizar datos del formulario con la configuración
  useEffect(() => {
    if (configuracion) {
      setFormData(configuracion);
      setCambiosPendientes(false);
    }
  }, [configuracion]);

  // Manejar cambios en los campos
  const handleCampoChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    setCambiosPendientes(true);
  };

  // Validar formulario en tiempo real
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      const validacion = validarConfiguracion(formData);
      setErrores(validacion.errores);
    }
  }, [formData, validarConfiguracion]);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validacion = validarConfiguracion(formData);
    if (!validacion.esValido) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    const exito = await guardarConfiguracion(formData);
    if (exito) {
      setCambiosPendientes(false);
    }
  };

  // Manejar reseteo
  const handleReset = () => {
    if (cambiosPendientes && !confirm('¿Está seguro de que desea descartar los cambios?')) {
      return;
    }
    resetearConfiguracion();
    setCambiosPendientes(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header de la sección */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuración General</h2>
        <p className="text-gray-600">
          Configure los datos básicos de su tienda online
        </p>
      </div>

      {/* Alertas de estado */}
      {errores.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Se encontraron errores en la configuración:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errores.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {cambiosPendientes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Tiene cambios sin guardar. Recuerde guardar la configuración para aplicar los cambios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de configuración */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica de la Tienda */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Información Básica de la Tienda
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Tienda *
              </label>
              <input
                type="text"
                value={formData.storeName || ''}
                onChange={(e) => handleCampoChange('storeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: PuntoSur"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.storePhone || ''}
                onChange={(e) => handleCampoChange('storePhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: +54 351 123-4567"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.storeAddress || ''}
                onChange={(e) => handleCampoChange('storeAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Av. Córdoba 1234, Córdoba, Argentina"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.storeEmail || ''}
                onChange={(e) => handleCampoChange('storeEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: contacto@puntosur.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={formData.storeInstagram || ''}
                onChange={(e) => handleCampoChange('storeInstagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: @puntosur_oficial"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de la Tienda
              </label>
              <textarea
                value={formData.storeDescription || ''}
                onChange={(e) => handleCampoChange('storeDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción breve de su tienda..."
              />
            </div>
          </div>
        </div>

        {/* Configuración de Envíos */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Configuración de Envíos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Base de Envío ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.storeDeliveryBase || '0'}
                onChange={(e) => handleCampoChange('storeDeliveryBase', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Costo fijo de envío para todas las órdenes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo por Kilómetro ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.storeDeliveryKm || '0'}
                onChange={(e) => handleCampoChange('storeDeliveryKm', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Costo adicional por kilómetro de distancia
              </p>
            </div>
          </div>
        </div>

        {/* Configuración Fiscal y Pagos */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Configuración Fiscal y Pagos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lista de Precio
              </label>
              <select
                value={formData.iva || '0'}
                onChange={(e) => handleCampoChange('iva', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">LISTA 0</option>
                <option value="1">LISTA 1</option>
                <option value="2">LISTA 2</option>
                <option value="3">LISTA 3</option>
                <option value="4">LISTA 4</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona la lista de precios a utilizar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de MercadoPago
              </label>
              <input
                type="password"
                value={formData.mercadoPagoToken || ''}
                onChange={(e) => handleCampoChange('mercadoPagoToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese su token de MercadoPago"
              />
              <p className="text-xs text-gray-500 mt-1">
                Token para procesar pagos online
              </p>
            </div>
          </div>
        </div>

        {/* Estado de la Página */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Estado de la Página
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Actual
              </label>
              <select
                value={formData.pageStatus || 'ACTIVA'}
                onChange={(e) => handleCampoChange('pageStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ACTIVA">Activa - Tienda Online Funcionando</option>
                <option value="MANTENIMIENTO">Mantenimiento - Tienda Temporalmente Cerrada</option>
                <option value="INACTIVA">Inactiva - Tienda Cerrada</option>
              </select>
            </div>

            <div className="flex items-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                formData.pageStatus === 'ACTIVA' ? 'bg-green-100 text-green-800' :
                formData.pageStatus === 'MANTENIMIENTO' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {formData.pageStatus === 'ACTIVA' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                {formData.pageStatus === 'MANTENIMIENTO' && <ArrowPathIcon className="w-4 h-4 mr-1" />}
                {formData.pageStatus === 'INACTIVA' && <ExclamationTriangleIcon className="w-4 h-4 mr-1" />}
                
                {formData.pageStatus === 'ACTIVA' ? 'Tienda Activa' :
                 formData.pageStatus === 'MANTENIMIENTO' ? 'En Mantenimiento' :
                 'Tienda Inactiva'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                HORARIOS
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">INICIO</label>
                  <select
                    value={formData.horaInicio || '08:00'}
                    onChange={(e) => handleCampoChange('horaInicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">FIN</label>
                  <select
                    value={formData.horaFin || '22:00'}
                    onChange={(e) => handleCampoChange('horaFin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credenciales de Administrador */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-4">
            Credenciales de Administrador
          </h3>
          <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  <strong>¡Cuidado!</strong> Cambiar estas credenciales afectará el acceso al panel de administración.
                  Asegúrese de recordar las nuevas credenciales.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                Usuario Administrador *
              </label>
              <input
                type="text"
                value={formData.userName || ''}
                onChange={(e) => handleCampoChange('userName', e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Usuario del administrador"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                Contraseña Administrador *
              </label>
              <input
                type="password"
                value={formData.passWord || ''}
                onChange={(e) => handleCampoChange('passWord', e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nueva contraseña"
                required
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={guardando}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Resetear
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              disabled={guardando}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando || errores.length > 0}
              className="flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {guardando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}