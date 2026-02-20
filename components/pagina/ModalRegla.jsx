// components/pagina/ModalRegla.jsx - Modal crear/editar regla de pago
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const TIPOS = [
  { value: 'envio_gratis_monto', label: 'Envío gratis por monto' },
  { value: 'descuento_pct_monto', label: 'Descuento % por monto' },
];

export default function ModalRegla({ mostrar, regla, onCerrar, onGuardar }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('envio_gratis_monto');
  const [monto_minimo, setMonto_minimo] = useState('0');
  const [porcentaje_descuento, setPorcentaje_descuento] = useState('');
  const [fecha_inicio, setFecha_inicio] = useState('');
  const [fecha_fin, setFecha_fin] = useState('');
  const [orden, setOrden] = useState('0');
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const esEdicion = !!regla?.id;

  useEffect(() => {
    if (!mostrar) return;
    if (regla) {
      setNombre(regla.nombre || '');
      setTipo(regla.tipo || 'envio_gratis_monto');
      setMonto_minimo(String(regla.monto_minimo ?? '0'));
      setPorcentaje_descuento(regla.porcentaje_descuento != null ? String(regla.porcentaje_descuento) : '');
      setFecha_inicio(regla.fecha_inicio ? regla.fecha_inicio.slice(0, 16) : '');
      setFecha_fin(regla.fecha_fin ? regla.fecha_fin.slice(0, 16) : '');
      setOrden(String(regla.orden ?? 0));
      setActivo(!!regla.activo);
    } else {
      setNombre('');
      setTipo('envio_gratis_monto');
      setMonto_minimo('0');
      setPorcentaje_descuento('');
      setFecha_inicio('');
      setFecha_fin('');
      setOrden('0');
      setActivo(true);
    }
  }, [mostrar, regla]);

  const validar = () => {
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    const montoMin = parseFloat(monto_minimo);
    if (isNaN(montoMin) || montoMin < 0) {
      toast.error('Monto mínimo debe ser un número >= 0');
      return false;
    }
    if (tipo === 'descuento_pct_monto') {
      const pct = parseFloat(porcentaje_descuento);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        toast.error('El porcentaje de descuento debe estar entre 0 y 100');
        return false;
      }
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
      nombre: nombre.trim(),
      tipo,
      monto_minimo: parseFloat(monto_minimo) || 0,
      orden: parseInt(orden, 10) || 0,
      activo,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
    };
    if (tipo === 'envio_gratis_monto') {
      payload.valor = null;
      payload.porcentaje_descuento = null;
    } else {
      payload.porcentaje_descuento = parseFloat(porcentaje_descuento) || 0;
      payload.valor = null;
    }
    const result = await onGuardar(esEdicion ? { id: regla.id, ...payload } : payload);
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
              {esEdicion ? 'Editar regla' : 'Nueva regla'}
            </h2>
            <button type="button" onClick={onCerrar} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Ej: Envío gratis +$8000"
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto mínimo (subtotal) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto_minimo}
                onChange={(e) => setMonto_minimo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            {tipo === 'descuento_pct_monto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de descuento (0-100) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={porcentaje_descuento}
                  onChange={(e) => setPorcentaje_descuento(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ej: 10"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden (prioridad, menor = primero)</label>
              <input
                type="number"
                min="0"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
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
                id="activo-regla"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="activo-regla" className="text-sm text-gray-700">Activa</label>
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
