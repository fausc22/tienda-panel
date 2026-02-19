// components/usuarios/ModalEditarPassword.jsx - Modal para editar contraseña
import { useState, useEffect } from 'react';
import { XMarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function ModalEditarPassword({ mostrar, usuario, onCerrar, onConfirmar }) {
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errores, setErrores] = useState([]);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    if (mostrar) {
      setPassword('');
      setConfirmarPassword('');
      setErrores([]);
      setMostrarPassword(false);
    }
  }, [mostrar]);

  const validarFormulario = () => {
    const nuevosErrores = [];
    
    if (!password || password.length < 6) {
      nuevosErrores.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (password !== confirmarPassword) {
      nuevosErrores.push('Las contraseñas no coinciden');
    }
    
    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    await onConfirmar(password);
  };

  if (!mostrar || !usuario) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md my-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <LockClosedIcon className="h-6 w-6 mr-2 text-blue-600" />
              Cambiar Contraseña
            </h2>
            <button 
              onClick={onCerrar}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Usuario:</strong> {usuario.usuario}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Rol:</strong> {usuario.rol}
            </p>
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
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errores.length > 0) setErrores([]);
                  }}
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
                Confirmar Contraseña *
              </label>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={confirmarPassword}
                onChange={(e) => {
                  setConfirmarPassword(e.target.value);
                  if (errores.length > 0) setErrores([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repite la contraseña"
                required
              />
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
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

