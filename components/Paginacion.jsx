// components/Paginacion.jsx - Componente de paginación reutilizable
import { useState } from 'react';

export function Paginacion({
  datosOriginales,
  paginaActual,
  registrosPorPagina,
  totalPaginas,
  indexOfPrimero,
  indexOfUltimo,
  onCambiarPagina,
  onCambiarRegistrosPorPagina
}) {
  const [mostrandoSelector, setMostrandoSelector] = useState(false);

  const generarNumerosPaginas = () => {
    const numeros = [];
    const maxVisibles = 5;
    
    if (totalPaginas <= maxVisibles) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        numeros.push(1);
        numeros.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }
    
    return numeros;
  };

  const opcionesRegistros = [5, 10, 25, 50];

  if (totalPaginas <= 1) return null;

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        {/* Vista móvil */}
        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{indexOfPrimero + 1}</span>
            {' '}a{' '}
            <span className="font-medium">
              {Math.min(indexOfUltimo, datosOriginales.length)}
            </span>
            {' '}de{' '}
            <span className="font-medium">{datosOriginales.length}</span>
            {' '}resultados
          </p>
          
          {/* Selector de registros por página */}
          <div className="relative">
            <button
              onClick={() => setMostrandoSelector(!mostrandoSelector)}
              className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              {registrosPorPagina} por página ▼
            </button>
            
            {mostrandoSelector && (
              <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {opcionesRegistros.map(opcion => (
                  <button
                    key={opcion}
                    onClick={() => {
                      onCambiarRegistrosPorPagina(opcion);
                      setMostrandoSelector(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      registrosPorPagina === opcion ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {opcion} por página
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Botón Anterior */}
            <button
              onClick={() => onCambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Números de página */}
            {generarNumerosPaginas().map((numero, index) => {
              if (numero === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={numero}
                  onClick={() => onCambiarPagina(numero)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    paginaActual === numero
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {numero}
                </button>
              );
            })}

            {/* Botón Siguiente */}
            <button
              onClick={() => onCambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}