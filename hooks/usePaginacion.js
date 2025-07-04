// hooks/usePaginacion.js - Hook para manejo de paginación
import { useState, useMemo, useCallback } from 'react';

export const usePaginacion = (datos, registrosPorPaginaInicial = 10) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(registrosPorPaginaInicial);

  // Calcular índices
  const indexOfUltimo = paginaActual * registrosPorPagina;
  const indexOfPrimero = indexOfUltimo - registrosPorPagina;
  
  // Datos de la página actual
  const datosActuales = useMemo(() => {
    if (!datos || !Array.isArray(datos)) return [];
    return datos.slice(indexOfPrimero, indexOfUltimo);
  }, [datos, indexOfPrimero, indexOfUltimo]);

  // Total de páginas
  const totalPaginas = useMemo(() => {
    if (!datos || !Array.isArray(datos)) return 0;
    return Math.ceil(datos.length / registrosPorPagina);
  }, [datos, registrosPorPagina]);

  // Cambiar página
  const cambiarPagina = useCallback((numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina);
    }
  }, [totalPaginas]);

  // Cambiar registros por página
  const cambiarRegistrosPorPagina = useCallback((nuevoRegistrosPorPagina) => {
    setRegistrosPorPagina(nuevoRegistrosPorPagina);
    setPaginaActual(1); // Resetear a la primera página
  }, []);

  // Resetear paginación cuando cambien los datos
  const resetearPaginacion = useCallback(() => {
    setPaginaActual(1);
  }, []);

  // Ir a la primera página
  const irAPrimeraPagina = useCallback(() => {
    setPaginaActual(1);
  }, []);

  // Ir a la última página
  const irAUltimaPagina = useCallback(() => {
    setPaginaActual(totalPaginas);
  }, [totalPaginas]);

  // Página siguiente
  const paginaSiguiente = useCallback(() => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(prev => prev + 1);
    }
  }, [paginaActual, totalPaginas]);

  // Página anterior
  const paginaAnterior = useCallback(() => {
    if (paginaActual > 1) {
      setPaginaActual(prev => prev - 1);
    }
  }, [paginaActual]);

  return {
    // Estados
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    datosActuales,
    
    // Funciones
    cambiarPagina,
    cambiarRegistrosPorPagina,
    resetearPaginacion,
    irAPrimeraPagina,
    irAUltimaPagina,
    paginaSiguiente,
    paginaAnterior,
    
    // Información útil
    hayPaginaAnterior: paginaActual > 1,
    hayPaginaSiguiente: paginaActual < totalPaginas,
    totalElementos: datos?.length || 0,
    elementosEnPaginaActual: datosActuales.length
  };
};