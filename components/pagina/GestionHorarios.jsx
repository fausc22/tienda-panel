// components/pagina/GestionHorarios.jsx - COMPONENTE COMPLETO
import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function GestionHorarios({
  horarios = [],
  excepciones = [],
  estadoGeneral,
  loading,
  guardando,
  DIAS_SEMANA,
  cargarHorarios,
  actualizarHorarioDia,
  agregarExcepcion,
  eliminarExcepcion,
  obtenerHorariosDia,
  aplicarHorariosGrupo,
  copiarHorariosDia
}) {
  // Estados para modal de día individual
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalFranjas, setModalFranjas] = useState(false);
  
  // Estados para modal de excepciones
  const [modalExcepcion, setModalExcepcion] = useState(false);
  const [nuevaExcepcion, setNuevaExcepcion] = useState({
    fecha: '',
    descripcion: '',
    cerrado: true,
    hora_apertura: '09:00',
    hora_cierre: '22:00'
  });
  
  // Estados para modal de grupo
  const [modalGrupo, setModalGrupo] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [modoGrupo, setModoGrupo] = useState('nuevo'); // 'nuevo' o 'copiar'
  const [diaOrigenCopia, setDiaOrigenCopia] = useState(null);
  
  // Estado compartido para franjas
  const [franjasEditando, setFranjasEditando] = useState([]);

  // Cargar horarios al montar
  useEffect(() => {
    cargarHorarios();
  }, []);

  // =============================================
  // FUNCIONES PARA MODAL DE DÍA INDIVIDUAL
  // =============================================

  const handleEditarDia = (dia) => {
    const horariosDelDia = obtenerHorariosDia(dia.id);
    
    if (horariosDelDia.length === 0) {
      setFranjasEditando([{
        hora_apertura: '09:00',
        hora_cierre: '22:00',
        activo: false
      }]);
    } else {
      setFranjasEditando(horariosDelDia.map(h => ({
        hora_apertura: h.hora_apertura.substring(0, 5),
        hora_cierre: h.hora_cierre.substring(0, 5),
        activo: Boolean(h.activo)
      })));
    }
    
    setDiaSeleccionado(dia);
    setModalFranjas(true);
  };

  const handleGuardarHorariosDia = async () => {
    // Validar franjas
    for (let i = 0; i < franjasEditando.length; i++) {
      const franja = franjasEditando[i];
      
      if (franja.activo ) {
        
      }
    }
    
    const exito = await actualizarHorarioDia(diaSeleccionado.id, franjasEditando);
    
    if (exito) {
      setModalFranjas(false);
      setDiaSeleccionado(null);
      setFranjasEditando([]);
    }
  };

  const handleCerrarModalFranjas = () => {
    setModalFranjas(false);
    setDiaSeleccionado(null);
    setFranjasEditando([]);
  };

  // =============================================
  // FUNCIONES PARA MODAL DE GRUPO
  // =============================================

  const handleAbrirModalGrupo = () => {
    setDiasSeleccionados([]);
    setModoGrupo('nuevo');
    setDiaOrigenCopia(null);
    setFranjasEditando([{
      hora_apertura: '09:00',
      hora_cierre: '22:00',
      activo: true
    }]);
    setModalGrupo(true);
  };

  const handleToggleDia = (diaId) => {
    setDiasSeleccionados(prev => {
      if (prev.includes(diaId)) {
        return prev.filter(d => d !== diaId);
      } else {
        return [...prev, diaId];
      }
    });
  };

  const handleSeleccionarGrupoPredefinido = (grupo) => {
    switch (grupo) {
      case 'semana':
        setDiasSeleccionados([1, 2, 3, 4, 5]); // Lunes a Viernes
        break;
      case 'finde':
        setDiasSeleccionados([6, 0]); // Sábado y Domingo
        break;
      case 'todos':
        setDiasSeleccionados([0, 1, 2, 3, 4, 5, 6]); // Todos
        break;
      default:
        setDiasSeleccionados([]);
    }
  };

  const handleCambiarModo = (nuevoModo) => {
    setModoGrupo(nuevoModo);
    if (nuevoModo === 'nuevo') {
      setDiaOrigenCopia(null);
    }
  };

  const handleGuardarHorariosGrupo = async () => {
    if (diasSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos un día');
      return;
    }

    // Validar franjas solo si es modo nuevo
    if (modoGrupo === 'nuevo') {
      for (let i = 0; i < franjasEditando.length; i++) {
        const franja = franjasEditando[i];
        
        if (franja.activo && franja.hora_apertura >= franja.hora_cierre) {
          toast.error(`Franja ${i + 1}: La hora de apertura debe ser menor a la hora de cierre`);
          return;
        }
      }
    }

    let exito = false;

    if (modoGrupo === 'copiar' && diaOrigenCopia !== null) {
      exito = await copiarHorariosDia(diaOrigenCopia, diasSeleccionados);
    } else {
      exito = await aplicarHorariosGrupo(diasSeleccionados, franjasEditando);
    }
    
    if (exito) {
      setModalGrupo(false);
      setDiasSeleccionados([]);
      setFranjasEditando([]);
      setModoGrupo('nuevo');
      setDiaOrigenCopia(null);
    }
  };

  // =============================================
  // FUNCIONES PARA FRANJAS (COMPARTIDAS)
  // =============================================

  const handleAgregarFranja = () => {
    if (franjasEditando.length >= 3) {
      toast.error('Máximo 3 franjas horarias por día');
      return;
    }
    
    setFranjasEditando([
      ...franjasEditando,
      { hora_apertura: '09:00', hora_cierre: '22:00', activo: true }
    ]);
  };

  const handleEliminarFranja = (index) => {
    const nuevasFranjas = franjasEditando.filter((_, i) => i !== index);
    setFranjasEditando(nuevasFranjas);
  };

  const handleCambioFranja = (index, campo, valor) => {
    const nuevasFranjas = [...franjasEditando];
    nuevasFranjas[index][campo] = valor;
    setFranjasEditando(nuevasFranjas);
  };

  // =============================================
  // FUNCIONES PARA MODAL DE EXCEPCIONES
  // =============================================

  const handleAbrirModalExcepcion = () => {
    const fechaMinima = new Date().toISOString().split('T')[0];
    setNuevaExcepcion({
      fecha: fechaMinima,
      descripcion: '',
      cerrado: true,
      hora_apertura: '09:00',
      hora_cierre: '22:00'
    });
    setModalExcepcion(true);
  };

  const handleGuardarExcepcion = async () => {
    if (!nuevaExcepcion.fecha || !nuevaExcepcion.descripcion) {
      toast.error('Fecha y descripción son requeridas');
      return;
    }
    
    if (!nuevaExcepcion.cerrado && nuevaExcepcion.hora_apertura >= nuevaExcepcion.hora_cierre) {
      toast.error('La hora de apertura debe ser menor a la hora de cierre');
      return;
    }
    
    const exito = await agregarExcepcion({
      ...nuevaExcepcion,
      hora_apertura: nuevaExcepcion.cerrado ? null : nuevaExcepcion.hora_apertura,
      hora_cierre: nuevaExcepcion.cerrado ? null : nuevaExcepcion.hora_cierre
    });
    
    if (exito) {
      setModalExcepcion(false);
    }
  };

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerEstadoDia = (diaId) => {
    const horariosDelDia = obtenerHorariosDia(diaId);
    const horariosActivos = horariosDelDia.filter(h => h.activo);
    
    if (horariosActivos.length === 0) {
      return { estado: 'cerrado', texto: 'Cerrado', color: 'bg-red-100 text-red-800' };
    }
    
    return { 
      estado: 'abierto', 
      texto: `${horariosActivos.length} franja${horariosActivos.length > 1 ? 's' : ''}`, 
      color: 'bg-green-100 text-green-800' 
    };
  };

  // =============================================
  // RENDER
  // =============================================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando horarios...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Horarios</h2>
            <p className="text-gray-600">
              Configure los horarios de atención de su tienda por día de la semana
            </p>
          </div>
          
          {/* Botón Configuración Grupal */}
          <button
            onClick={handleAbrirModalGrupo}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ClockIcon className="h-4 w-4" />
            Configuración Grupal
          </button>
        </div>
      </div>

      {/* Estado General */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Estado General de la Tienda</h3>
              <p className="text-sm text-blue-700">
                {estadoGeneral === 'ACTIVA' 
                  ? '🟢 Tienda activa - Los horarios se aplicarán normalmente'
                  : estadoGeneral === 'MANTENIMIENTO'
                  ? '🟡 Tienda en mantenimiento - Los clientes no pueden realizar pedidos'
                  : '🔴 Tienda inactiva - Los horarios no se están aplicando'
                }
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            estadoGeneral === 'ACTIVA' ? 'bg-green-100 text-green-800' :
            estadoGeneral === 'MANTENIMIENTO' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {estadoGeneral}
          </span>
        </div>
      </div>

      {/* Tabla de días de la semana */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Horarios por Día de la Semana</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Día
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Horarios
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {DIAS_SEMANA.map((dia) => {
                const estadoDia = obtenerEstadoDia(dia.id);
                const horariosDelDia = obtenerHorariosDia(dia.id).filter(h => h.activo);
                
                return (
                  <tr key={dia.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{dia.nombre}</span>
                        {dia.id === new Date().getDay() && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Hoy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${estadoDia.color}`}>
                        {estadoDia.texto}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {horariosDelDia.length > 0 ? (
                        <div className="space-y-1">
                          {horariosDelDia.map((h, idx) => (
                            <div key={idx} className="text-gray-700">
                              {h.hora_apertura.substring(0, 5)} - {h.hora_cierre.substring(0, 5)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sin horarios configurados</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditarDia(dia)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excepciones (Feriados, Vacaciones, etc.) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Excepciones de Horario</h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure fechas especiales como feriados, vacaciones o eventos
            </p>
          </div>
          <button
            onClick={handleAbrirModalExcepcion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Excepción
          </button>
        </div>
        
        <div className="p-4">
          {excepciones.length > 0 ? (
            <div className="space-y-3">
              {excepciones.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{exc.descripcion}</div>
                      <div className="text-sm text-gray-600">
                        {formatearFecha(exc.fecha)}
                      </div>
                      {!exc.cerrado && (
                        <div className="text-xs text-green-600 mt-1">
                          Horario especial: {exc.hora_apertura} - {exc.hora_cierre}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exc.cerrado 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {exc.cerrado ? 'Cerrado' : 'Horario especial'}
                    </span>
                    <button
                      onClick={() => eliminarExcepcion(exc.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar excepción"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium mb-2">No hay excepciones configuradas</p>
              <p className="text-sm">Agregue fechas especiales para feriados o eventos</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* MODAL: Editar franjas horarias de un día */}
      {/* ============================================= */}
      {modalFranjas && diaSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Horarios para {diaSeleccionado.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure una o más franjas horarias para este día
                  </p>
                </div>
                <button
                  onClick={handleCerrarModalFranjas}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              {franjasEditando.map((franja, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      Franja {index + 1}
                    </h4>
                    {franjasEditando.length > 1 && (
                      <button
                        onClick={() => handleEliminarFranja(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar franja"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Hora de apertura */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de Apertura
                      </label>
                      <input
                        type="time"
                        value={franja.hora_apertura}
                        onChange={(e) => handleCambioFranja(index, 'hora_apertura', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Hora de cierre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de Cierre
                      </label>
                      <input
                        type="time"
                        value={franja.hora_cierre}
                        onChange={(e) => handleCambioFranja(index, 'hora_cierre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Estado activo/inactivo */}
                    <div className="flex items-end">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={franja.activo}
                          onChange={(e) => handleCambioFranja(index, 'activo', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {franja.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Validación visual */}
                  {franja.activo && franja.hora_apertura >= franja.hora_cierre && (
                    <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm">
                      <InformationCircleIcon className="h-4 w-4" />
                      <span>
                        ℹ️ Este horario cruza medianoche (cierra al día siguiente: {franja.hora_cierre})
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Botón para agregar franja */}
              {franjasEditando.length < 3 && (
                <button
                  onClick={handleAgregarFranja}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Agregar otra franja horaria
                </button>
              )}

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">💡 Consejos:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Puede configurar hasta 3 franjas horarias por día</li>
                      <li>Desactive una franja si desea cerrar ese horario temporalmente</li>
                      <li>Las franjas inactivas no se mostrarán a los clientes</li>
                      <li>Si no tiene franjas activas, el día aparecerá como cerrado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCerrarModalFranjas}
                  disabled={guardando}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarHorariosDia}
                  disabled={guardando}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Guardar Horarios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* MODAL: Configuración Grupal */}
      {/* ============================================= */}
      {modalGrupo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Configuración de Horarios Grupal
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Aplique el mismo horario a múltiples días de la semana
                  </p>
                </div>
                <button
                  onClick={() => setModalGrupo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Selector de Modo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Modo de Configuración
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCambiarModo('nuevo')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      modoGrupo === 'nuevo'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <PlusIcon className={`h-6 w-6 mx-auto mb-2 ${
                        modoGrupo === 'nuevo' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <div className="font-medium text-gray-900">Horario Nuevo</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Configure horarios desde cero
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCambiarModo('copiar')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      modoGrupo === 'copiar'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <ClockIcon className={`h-6 w-6 mx-auto mb-2 ${
                        modoGrupo === 'copiar' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <div className="font-medium text-gray-900">Copiar Horario</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Copie horarios de otro día
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Si modo es COPIAR - Selector de día origen */}
              {modoGrupo === 'copiar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copiar Horarios Desde:
                  </label>
                  <select
                    value={diaOrigenCopia !== null ? diaOrigenCopia : ''}
                    onChange={(e) => setDiaOrigenCopia(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccione un día</option>
                    {DIAS_SEMANA.map(dia => {
                      const horariosDelDia = obtenerHorariosDia(dia.id);
                      return (
                        <option key={dia.id} value={dia.id} disabled={horariosDelDia.length === 0}>
                          {dia.nombre} {horariosDelDia.length === 0 ? '(sin horarios)' : `(${horariosDelDia.length} franja${horariosDelDia.length > 1 ? 's' : ''})`}
                        </option>
                      );
                    })}
                  </select>

                  {/* Preview de horarios a copiar */}
                  {diaOrigenCopia !== null && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-2">
                        Horarios que se copiarán:
                      </div>
                      {obtenerHorariosDia(diaOrigenCopia).filter(h => h.activo).map((h, idx) => (
                        <div key={idx} className="text-sm text-blue-800">
                          • {h.hora_apertura.substring(0, 5)} - {h.hora_cierre.substring(0, 5)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Grupos Predefinidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selección Rápida:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSeleccionarGrupoPredefinido('semana')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Lun-Vie
                  </button>
                  <button
                    onClick={() => handleSeleccionarGrupoPredefinido('finde')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Sáb-Dom
                  </button>
                  <button
                    onClick={() => handleSeleccionarGrupoPredefinido('todos')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Todos
                  </button>
                </div>
              </div>

              {/* Selector de Días */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Aplicar a los siguientes días: ({diasSeleccionados.length} seleccionados)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DIAS_SEMANA.map(dia => (
                    <button
                      key={dia.id}
                      onClick={() => handleToggleDia(dia.id)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        diasSeleccionados.includes(dia.id)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div>{dia.abrev}</div>
                      <div className="text-xs mt-1">
                        {dia.nombre}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuración de Franjas (solo si modo es NUEVO) */}
              {modoGrupo === 'nuevo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Configurar Horarios:
                  </label>
                  
                  <div className="space-y-3">
                    {franjasEditando.map((franja, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">
                            Franja {index + 1}
                          </h4>
                          {franjasEditando.length > 1 && (
                            <button
                              onClick={() => handleEliminarFranja(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Apertura
                            </label>
                            <input
                              type="time"
                              value={franja.hora_apertura}
                              onChange={(e) => handleCambioFranja(index, 'hora_apertura', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Cierre
                            </label>
                            <input
                              type="time"
                              value={franja.hora_cierre}
                              onChange={(e) => handleCambioFranja(index, 'hora_cierre', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={franja.activo}
                                onChange={(e) => handleCambioFranja(index, 'activo', e.target.checked)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700">
                                {franja.activo ? 'Activa' : 'Inactiva'}
                              </span>
                            </label>
                          </div>
                        </div>

                        {franja.activo && franja.hora_apertura >= franja.hora_cierre && (
                          <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>La hora de apertura debe ser menor a la hora de cierre</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {franjasEditando.length < 3 && (
                      <button
                        onClick={handleAgregarFranja}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Agregar otra franja
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen de cambios */}
              {diasSeleccionados.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Resumen de Cambios:</p>
                      <p>
                        Los horarios se aplicarán a{' '}
                        <strong>{diasSeleccionados.length}</strong> día
                        {diasSeleccionados.length !== 1 ? 's' : ''}:{' '}
                        {diasSeleccionados.map(id => 
                          DIAS_SEMANA.find(d => d.id === id)?.abrev
                        ).join(', ')}
                      </p>
                      {modoGrupo === 'copiar' && diaOrigenCopia !== null && (
                        <p className="mt-1">
                          Copiando desde: <strong>{DIAS_SEMANA.find(d => d.id === diaOrigenCopia)?.nombre}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalGrupo(false)}
                  disabled={guardando}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarHorariosGrupo}
                  disabled={guardando || diasSeleccionados.length === 0 || (modoGrupo === 'copiar' && diaOrigenCopia === null)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Aplicar a {diasSeleccionados.length} Día{diasSeleccionados.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* MODAL: Agregar excepción */}
      {/* ============================================= */}
      {modalExcepcion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Agregar Excepción de Horario
                </h3>
                <button
                  onClick={() => setModalExcepcion(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={nuevaExcepcion.fecha}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={nuevaExcepcion.descripcion}
                  onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, descripcion: e.target.value })}
                  placeholder="Ej: Feriado Nacional, Vacaciones, Evento Especial"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tipo de excepción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Excepción
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={nuevaExcepcion.cerrado === true}
                      onChange={() => setNuevaExcepcion({ ...nuevaExcepcion, cerrado: true })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Cerrado todo el día
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={nuevaExcepcion.cerrado === false}
                      onChange={() => setNuevaExcepcion({ ...nuevaExcepcion, cerrado: false })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Horario especial
                    </span>
                  </label>
                </div>
              </div>

              {/* Horarios especiales (solo si no está cerrado) */}
              {!nuevaExcepcion.cerrado && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Apertura
                    </label>
                    <input
                      type="time"
                      value={nuevaExcepcion.hora_apertura}
                      onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, hora_apertura: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Cierre
                    </label>
                    <input
                      type="time"
                      value={nuevaExcepcion.hora_cierre}
                      onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, hora_cierre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>Las excepciones tienen prioridad sobre los horarios regulares.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalExcepcion(false)}
                  disabled={guardando}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarExcepcion}
                  disabled={guardando || !nuevaExcepcion.fecha || !nuevaExcepcion.descripcion}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Agregar Excepción
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}