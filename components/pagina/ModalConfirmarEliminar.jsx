// components/pagina/ModalConfirmarEliminar.jsx - Confirmación antes de eliminar
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ModalConfirmarEliminar({ mostrar, titulo, mensaje, detalle, onCerrar, onConfirmar, confirmando }) {
  if (!mostrar) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />
              {titulo}
            </h2>
            <button type="button" onClick={onCerrar} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-red-800 font-medium mb-2">Esta acción no se puede deshacer.</p>
          {mensaje && <p className="text-sm text-gray-700 mb-2">{mensaje}</p>}
          {detalle && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
              <p className="text-sm text-gray-700">{detalle}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="button" onClick={onConfirmar} disabled={confirmando} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {confirmando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
