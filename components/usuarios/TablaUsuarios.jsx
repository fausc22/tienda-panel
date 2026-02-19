// components/usuarios/TablaUsuarios.jsx - Tabla de usuarios responsiva
import { useState } from 'react';
import { PencilIcon, TrashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function TablaUsuarios({
  usuarios,
  loading,
  onEditarPassword,
  onEliminar
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const getRolBadge = (rol) => {
    if (rol === 'admin') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-300">
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-300">
        Kiosco
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="text-center py-12 p-6">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay usuarios registrados
        </h3>
        <p className="text-gray-500">
          Comienza agregando usuarios al sistema
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Vista Desktop - Tabla */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario / Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Creación
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {usuario.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.usuario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getRolBadge(usuario.rol)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.created_at 
                    ? new Date(usuario.created_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onEditarPassword(usuario)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-100 transition-colors"
                      title="Cambiar contraseña"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEliminar(usuario)}
                      className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-100 transition-colors"
                      title="Eliminar usuario"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil - Tarjetas */}
      <div className="lg:hidden space-y-4 p-4">
        {usuarios.map((usuario) => {
          const isExpanded = expandedRow === usuario.id;

          return (
            <div 
              key={usuario.id} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              {/* Header de la tarjeta */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedRow(isExpanded ? null : usuario.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 truncate text-base">
                        {usuario.usuario}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-mono">
                        ID: {usuario.id}
                      </span>
                      {getRolBadge(usuario.rol)}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <div className="text-xs text-gray-500 text-right">
                      {usuario.created_at 
                        ? new Date(usuario.created_at).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido expandible con acciones */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-3 space-y-3">
                    {/* Información adicional */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs">ID Usuario</span>
                        <span className="font-medium text-gray-900">{usuario.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Rol</span>
                        <div className="mt-1">{getRolBadge(usuario.rol)}</div>
                      </div>
                      {usuario.created_at && (
                        <div className="col-span-2">
                          <span className="text-gray-500 block text-xs">Fecha de Creación</span>
                          <span className="font-medium text-gray-900">
                            {new Date(usuario.created_at).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col space-y-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarPassword(usuario);
                        }}
                        className="flex items-center justify-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <LockClosedIcon className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminar(usuario);
                        }}
                        className="flex items-center justify-center px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Eliminar Usuario
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

