// components/usuarios/ModalCrearUsuario.jsx - Modal para crear usuario
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ModalCrearUsuario({ mostrar, onCerrar, onConfirmar }) {
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    rol: 'kiosco'
  });
  const [errores, setErrores] = useState([]);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    if (mostrar) {
      setFormData({ usuario: '', password: '', rol: 'kiosco' });
      setErrores([]);
      setMostrarPassword(false);
    }
  }, [mostrar]);

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    if (errores.length > 0) setErrores([]);
  };

  const validarFormulario = () => {
    const nuevosErrores = [];
    
    if (!formData.usuario || formData.usuario.trim().length === 0) {
      nuevosErrores.push('El usuario/email es requerido');
    }
    
    if (!formData.password || formData.password.length < 6) {
      nuevosErrores.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (formData.rol !== 'admin' && formData.rol !== 'kiosco') {
      nuevosErrores.push('El rol debe ser admin o kiosco');
    }
    
    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    await onConfirmar(formData);
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md my-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <PlusIcon className="h-6 w-6 mr-2 text-blue-600" />
              Crear Nuevo Usuario
            </h2>
            <button 
              onClick={onCerrar}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {errores.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
              <ul className="text-sm text-red-700">
                {errores.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario / Email *
              </label>
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) => handleChange('usuario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  {mostrarPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                value={formData.rol}
                onChange={(e) => handleChange('rol', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="admin">Admin - Acceso completo</option>
                <option value="kiosco">Kiosco - Solo pedidos</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCerrar}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

