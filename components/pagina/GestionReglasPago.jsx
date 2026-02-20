// components/pagina/GestionReglasPago.jsx - Gestión de reglas de pago y cupones (Fase 4)
import { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import ModalRegla from './ModalRegla';
import ModalCupon from './ModalCupon';
import ModalConfirmarEliminar from './ModalConfirmarEliminar';

const TAB_REGLAS = 'reglas';
const TAB_CUPONES = 'cupones';

function formatVigencia(inicio, fin) {
  if (!inicio && !fin) return 'Siempre';
  const a = inicio ? new Date(inicio).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const b = fin ? new Date(fin).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  return `${a} - ${b}`;
}

function tipoReglaLabel(tipo) {
  return tipo === 'envio_gratis_monto' ? 'Envío gratis' : 'Descuento %';
}

function tipoCuponLabel(tipo) {
  return tipo === 'porcentaje' ? '%' : 'Monto fijo';
}

export default function GestionReglasPago({
  reglas = [],
  cupones = [],
  loading,
  cargarTodo,
  crearRegla,
  actualizarRegla,
  eliminarRegla,
  toggleRegla,
  crearCupon,
  actualizarCupon,
  eliminarCupon,
  toggleCupon,
}) {
  const [tabActiva, setTabActiva] = useState(TAB_REGLAS);
  const [modalRegla, setModalRegla] = useState({ mostrar: false, regla: null });
  const [modalCupon, setModalCupon] = useState({ mostrar: false, cupon: null });
  const [confirmarEliminar, setConfirmarEliminar] = useState({ mostrar: false, tipo: null, id: null, nombre: '' });
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  const handleGuardarRegla = async (data) => {
    const { id, ...payload } = data;
    if (id) return await actualizarRegla(id, payload);
    return await crearRegla(payload);
  };

  const handleGuardarCupon = async (data) => {
    const { id, ...payload } = data;
    if (id) return await actualizarCupon(id, payload);
    return await crearCupon(payload);
  };

  const handleEliminarRegla = (regla) => {
    setConfirmarEliminar({ mostrar: true, tipo: 'regla', id: regla.id, nombre: regla.nombre });
  };
  const handleEliminarCupon = (cupon) => {
    setConfirmarEliminar({ mostrar: true, tipo: 'cupon', id: cupon.id, nombre: cupon.codigo });
  };

  const ejecutarEliminacion = async () => {
    if (!confirmarEliminar.id || !confirmarEliminar.tipo) return;
    setEliminando(true);
    const ok = confirmarEliminar.tipo === 'regla'
      ? await eliminarRegla(confirmarEliminar.id)
      : await eliminarCupon(confirmarEliminar.id);
    setEliminando(false);
    setConfirmarEliminar({ mostrar: false, tipo: null, id: null, nombre: '' });
    if (!ok) toast.error('No se pudo eliminar');
  };

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setTabActiva(TAB_REGLAS)}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tabActiva === TAB_REGLAS
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Reglas de envío y descuento
        </button>
        <button
          type="button"
          onClick={() => setTabActiva(TAB_CUPONES)}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tabActiva === TAB_CUPONES
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Cupones
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      ) : tabActiva === TAB_REGLAS ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Reglas que aplican envío gratis o descuento por monto mínimo.</p>
            <button
              type="button"
              onClick={() => setModalRegla({ mostrar: true, regla: null })}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Nueva regla
            </button>
          </div>
          {reglas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No hay reglas. Creá una para envío gratis o descuento por monto.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto mín.</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor / %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Activo</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {reglas.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{tipoReglaLabel(r.tipo)}</td>
                        <td className="px-4 py-3 text-right">${parseFloat(r.monto_minimo || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          {r.tipo === 'envio_gratis_monto' ? (r.valor != null ? r.valor : '—') : (r.porcentaje_descuento != null ? `${r.porcentaje_descuento}%` : '—')}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatVigencia(r.fecha_inicio, r.fecha_fin)}</td>
                        <td className="px-4 py-3 text-center">
                          {r.activo ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600 inline" />
                          ) : (
                            <NoSymbolIcon className="h-5 w-5 text-gray-400 inline" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" onClick={() => setModalRegla({ mostrar: true, regla: r })} className="text-blue-600 hover:text-blue-800" title="Editar">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => toggleRegla(r.id)} className="text-amber-600 hover:text-amber-800" title={r.activo ? 'Desactivar' : 'Activar'}>
                              {r.activo ? <NoSymbolIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                            </button>
                            <button type="button" onClick={() => handleEliminarRegla(r)} className="text-red-600 hover:text-red-800" title="Eliminar">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-4">
                {reglas.map((r) => (
                  <div key={r.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{r.nombre}</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{tipoReglaLabel(r.tipo)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Mín. ${parseFloat(r.monto_minimo || 0).toFixed(2)} · {r.tipo === 'descuento_pct_monto' ? `${r.porcentaje_descuento}%` : 'Envío gratis'}</p>
                    <p className="text-xs text-gray-500 mb-3">{formatVigencia(r.fecha_inicio, r.fecha_fin)} · {r.activo ? 'Activa' : 'Inactiva'}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setModalRegla({ mostrar: true, regla: r })} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">Editar</button>
                      <button type="button" onClick={() => toggleRegla(r.id)} className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded">{r.activo ? 'Desactivar' : 'Activar'}</button>
                      <button type="button" onClick={() => handleEliminarRegla(r)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Cupones de uso único o múltiple (porcentaje o monto fijo).</p>
            <button
              type="button"
              onClick={() => setModalCupon({ mostrar: true, cupon: null })}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Nuevo cupón
            </button>
          </div>
          {cupones.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No hay cupones. Creá uno para ofrecer descuentos.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mín. carrito</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Usos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Activo</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {cupones.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-medium text-gray-900">{c.codigo}</td>
                        <td className="px-4 py-3 text-gray-600">{tipoCuponLabel(c.tipo)}</td>
                        <td className="px-4 py-3 text-right">{c.tipo === 'porcentaje' ? `${c.valor}%` : `$${parseFloat(c.valor || 0).toFixed(2)}`}</td>
                        <td className="px-4 py-3 text-right">${parseFloat(c.monto_minimo || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">{c.usos_actuales ?? 0} / {c.usos_maximos ?? 1}</td>
                        <td className="px-4 py-3 text-gray-600">{formatVigencia(c.fecha_inicio, c.fecha_fin)}</td>
                        <td className="px-4 py-3 text-center">
                          {c.activo ? <CheckCircleIcon className="h-5 w-5 text-green-600 inline" /> : <NoSymbolIcon className="h-5 w-5 text-gray-400 inline" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" onClick={() => setModalCupon({ mostrar: true, cupon: c })} className="text-blue-600 hover:text-blue-800" title="Editar">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => toggleCupon(c.id)} className="text-amber-600 hover:text-amber-800" title={c.activo ? 'Desactivar' : 'Activar'}>
                              {c.activo ? <NoSymbolIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                            </button>
                            <button type="button" onClick={() => handleEliminarCupon(c)} className="text-red-600 hover:text-red-800" title="Eliminar">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-4">
                {cupones.map((c) => (
                  <div key={c.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono font-medium text-gray-900">{c.codigo}</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{tipoCuponLabel(c.tipo)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{c.tipo === 'porcentaje' ? `${c.valor}%` : `$${parseFloat(c.valor || 0).toFixed(2)}`} · Mín. ${parseFloat(c.monto_minimo || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mb-3">Usos: {c.usos_actuales ?? 0}/{c.usos_maximos ?? 1} · {formatVigencia(c.fecha_inicio, c.fecha_fin)} · {c.activo ? 'Activo' : 'Inactivo'}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setModalCupon({ mostrar: true, cupon: c })} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">Editar</button>
                      <button type="button" onClick={() => toggleCupon(c.id)} className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded">{c.activo ? 'Desactivar' : 'Activar'}</button>
                      <button type="button" onClick={() => handleEliminarCupon(c)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ModalRegla
        mostrar={modalRegla.mostrar}
        regla={modalRegla.regla}
        onCerrar={() => setModalRegla({ mostrar: false, regla: null })}
        onGuardar={handleGuardarRegla}
      />
      <ModalCupon
        mostrar={modalCupon.mostrar}
        cupon={modalCupon.cupon}
        onCerrar={() => setModalCupon({ mostrar: false, cupon: null })}
        onGuardar={handleGuardarCupon}
      />
      <ModalConfirmarEliminar
        mostrar={confirmarEliminar.mostrar}
        titulo={confirmarEliminar.tipo === 'regla' ? 'Eliminar regla' : 'Eliminar cupón'}
        mensaje={confirmarEliminar.tipo === 'regla' ? 'La regla se eliminará y dejará de aplicarse.' : 'El cupón se eliminará. No podrás usarlo en nuevos pedidos.'}
        detalle={confirmarEliminar.nombre ? `Elemento: ${confirmarEliminar.nombre}` : null}
        onCerrar={() => setConfirmarEliminar({ mostrar: false, tipo: null, id: null, nombre: '' })}
        onConfirmar={ejecutarEliminacion}
        confirmando={eliminando}
      />
    </div>
  );
}
