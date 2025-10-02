// components/estadisticas/FiltrosEstadisticas.jsx - Filtros para estadísticas
import { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function FiltrosEstadisticas({
  onAplicarFiltros,
  onLimpiarFiltros,
  loading,
  rangoDefecto
}) {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoVista: 'resumen'
  });

  // Establecer fechas por defecto
  useEffect(() => {
    if (rangoDefecto) {
      setFiltros(prev => ({
        ...prev,
        fechaInicio: rangoDefecto.fechaInicio,
        fechaFin: rangoDefecto.fechaFin
      }));
    }
  }, [rangoDefecto]);

  const handleInputChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleAplicar = () => {
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      toast.error('Seleccione un rango de fechas válido');
      return;
    }

    if (new Date(filtros.fechaInicio) > new Date(filtros.fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    onAplicarFiltros(filtros);
  };

  const handleLimpiar = () => {
    setFiltros({
      fechaInicio: rangoDefecto?.fechaInicio || '',
      fechaFin: rangoDefecto?.fechaFin || '',
      tipoVista: 'resumen'
    });
    onLimpiarFiltros();
  };

  const obtenerPresetFechas = (preset) => {
    const hoy = new Date();
    let fechaInicio, fechaFin;

    switch (preset) {
      case 'hoy':
        fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'ayer':
        const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);
        fechaInicio = fechaFin = ayer.toISOString().split('T')[0];
        break;
      case '7dias':
        fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case '30dias':
        fechaInicio = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'mes_actual':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'mes_anterior':
        const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        fechaInicio = mesAnterior.toISOString().split('T')[0];
        fechaFin = ultimoDiaMesAnterior.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFiltros(prev => ({
      ...prev,
      fechaInicio,
      fechaFin
    }));
  };

  const presetsDisponibles = [
    { id: 'hoy', label: 'Hoy', color: 'blue' },
    { id: 'ayer', label: 'Ayer', color: 'gray' },
    { id: '7dias', label: 'Últimos 7 días', color: 'green' },
    { id: '30dias', label: 'Últimos 30 días', color: 'yellow' },
    { id: 'mes_actual', label: 'Mes actual', color: 'purple' },
    { id: 'mes_anterior', label: 'Mes anterior', color: 'indigo' }
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <FunnelIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Filtros de Estadísticas</h3>
      </div>

      {/* Presets de fechas */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Períodos predefinidos
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presetsDisponibles.map((preset) => (
            <button
              key={preset.id}
              onClick={() => obtenerPresetFechas(preset.id)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors hover:shadow-md ${
                preset.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' :
                preset.color === 'gray' ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' :
                preset.color === 'green' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' :
                preset.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' :
                preset.color === 'purple' ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' :
                'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Fecha de inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio
          </label>
          <div className="relative">
            <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fecha de fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Fin
          </label>
          <div className="relative">
            <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => handleInputChange('fechaFin', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tipo de vista */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Vista
          </label>
          <div className="relative">
            <ChartBarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filtros.tipoVista}
              onChange={(e) => handleInputChange('tipoVista', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="resumen">Resumen General</option>
              <option value="detallado">Vista Detallada</option>
              <option value="graficos">Solo Gráficos</option>
              <option value="tablas">Solo Tablas</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-end space-x-2">
          <button
            onClick={handleAplicar}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Aplicar
              </>
            )}
          </button>
          
          <button
            onClick={handleLimpiar}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Información del período seleccionado */}
      {filtros.fechaInicio && filtros.fechaFin && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Analizando período: {' '}
              <span className="font-semibold">
                {new Date(filtros.fechaInicio).toLocaleDateString('es-ES')} 
                {' '} - {' '}
                {new Date(filtros.fechaFin).toLocaleDateString('es-ES')}
              </span>
              {' '}({Math.ceil((new Date(filtros.fechaFin) - new Date(filtros.fechaInicio)) / (1000 * 60 * 60 * 24)) + 1} días)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}