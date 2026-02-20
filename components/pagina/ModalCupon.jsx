// components/pagina/ModalCupon.jsx - Modal crear/editar cupón
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const TIPOS = [
  { value: 'porcentaje', label: 'Porcentaje' },
  { value: 'monto_fijo', label: 'Monto fijo' },
];

function normalizeCodigo(str) {
  return String(str || '').trim().toUpperCase().replace(/\s+/g, '');
}

export default function ModalCupon({ mostrar, cupon, onCerrar, onGuardar }) {
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('porcentaje');
  const [valor, setValor] = useState('');
  const [monto_minimo, setMonto_minimo] = useState('0');
  const [usos_maximos, setUsos_maximos] = useState('1');
  const [fecha_inicio, setFecha_inicio] = useState('');
  const [fecha_fin, setFecha_fin] = useState('');
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const esEdicion = !!cupon?.id;

  useEffect(() => {
    if (!mostrar) return;
    if (cupon) {
      setCodigo(cupon.codigo || '');
      setTipo(cupon.tipo || 'porcentaje');
      setValor(String(cupon.valor ?? ''));
      setMonto_minimo(String(cupon.monto_minimo ?? '0'));
      setUsos_maximos(String(cupon.usos_maximos ?? 1));
      setFecha_inicio(cupon.fecha_inicio ? cupon.fecha_inicio.slice(0, 16) : '');
      setFecha_fin(cupon.fecha_fin ? cupon.fecha_fin.slice(0, 16) : '');
      setActivo(!!cupon.activo);
    } else {
      setCodigo('');
      setTipo('porcentaje');
      setValor('');
      setMonto_minimo('0');
      setUsos_maximos('1');
      setFecha_inicio('');
      setFecha_fin('');
      setActivo(true);
    }
  }, [mostrar, cupon]);

  const validar = () => {
    const cod = normalizeCodigo(codigo);
    if (!cod) {
      toast.error('El código es obligatorio');
      return false;
    }
    const val = parseFloat(valor);
    if (isNaN(val) || val < 0) {
      toast.error('El valor debe ser un número >= 0');
      return false;
    }
    if (tipo === 'porcentaje' && val > 100) {
      toast.error('El porcentaje no puede ser mayor a 100');
      return false;
    }
    const montoMin = parseFloat(monto_minimo);
    if (isNaN(montoMin) || montoMin < 0) {
      toast.error('Monto mínimo debe ser >= 0');
      return false;
    }
    const usos = parseInt(usos_maximos, 10);
    if (isNaN(usos) || usos < 1) {
      toast.error('Usos máximos debe ser al menos 1 (1 = un solo uso)');
      return false;
    }
    if (esEdicion && cupon.usos_actuales != null && usos < parseInt(cupon.usos_actuales, 10)) {
      toast.error('Usos máximos no puede ser menor que los usos actuales');
      return false;
    }
    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
      toast.error('La fecha de inicio no puede ser posterior a la de fin');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar() || guardando) return;
    setGuardando(true);
    const payload = {
      codigo: normalizeCodigo(codigo),
      tipo,
      valor: parseFloat(valor) || 0,
      monto_minimo: parseFloat(monto_minimo) || 0,
      usos_maximos: parseInt(usos_maximos, 10) || 1,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      activo,
    };
    const result = await onGuardar(esEdicion ? { id: cupon.id, ...payload } : payload);
    setGuardando(false);
    if (result?.success) onCerrar();
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {esEdicion ? 'Editar cupón' : 'Nuevo cupón'}
            </h2>
            <button type="button" onClick={onCerrar} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {!esEdicion && (
            <p className="text-sm text-gray-600 mb-4">El código se guardará en mayúsculas y sin espacios. Si ya existe uno igual, el backend lo rechazará.</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono uppercase"
                placeholder="Ej: BIENVENIDO10"
                disabled={esEdicion}
              />
              {!esEdicion && codigo && (
                <p className="text-xs text-gray-500 mt-1">Se guardará como: {normalizeCodigo(codigo) || '(vacío)'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tipo === 'porcentaje' ? 'Porcentaje (0-100) *' : 'Monto fijo ($) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={tipo === 'porcentaje' ? 100 : undefined}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder={tipo === 'porcentaje' ? '10' : '500'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto mínimo del carrito *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto_minimo}
                onChange={(e) => setMonto_minimo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos (1 = un solo uso) *</label>
              <input
                type="number"
                min="1"
                value={usos_maximos}
                onChange={(e) => setUsos_maximos(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {esEdicion && cupon?.usos_actuales != null && (
                <p className="text-xs text-gray-500 mt-1">Usos actuales: {cupon.usos_actuales}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia desde</label>
                <input
                  type="datetime-local"
                  value={fecha_inicio}
                  onChange={(e) => setFecha_inicio(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia hasta</label>
                <input
                  type="datetime-local"
                  value={fecha_fin}
                  onChange={(e) => setFecha_fin(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo-cupon"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="activo-cupon" className="text-sm text-gray-700">Activo</label>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
