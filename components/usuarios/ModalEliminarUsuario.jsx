// components/usuarios/ModalEliminarUsuario.jsx - Modal para eliminar usuario
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ModalEliminarUsuario({ mostrar, usuario, onCerrar, onConfirmar }) {
  if (!mostrar || !usuario) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md my-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />
              Eliminar Usuario
            </h2>
            <button 
              onClick={onCerrar}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                ⚠️ Esta acción no se puede deshacer
              </p>
              <p className="text-sm text-red-700">
                El usuario será eliminado permanentemente del sistema.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Usuario:</strong> {usuario.usuario}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Rol:</strong> {usuario.rol}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
            <button
              onClick={onCerrar}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Eliminar Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

