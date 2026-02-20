// hooks/pagina/useReglasPago.js - Hook para reglas de pago y cupones (Fase 4)
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useReglasPago = () => {
  const [reglas, setReglas] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarReglas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosAuth.get('/admin/promo-rules');
      setReglas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error cargando reglas:', err);
      setError(err.response?.data?.error || 'Error al cargar reglas');
      toast.error('Error al cargar reglas de pago');
      setReglas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCupones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosAuth.get('/admin/coupons');
      setCupones(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error cargando cupones:', err);
      setError(err.response?.data?.error || 'Error al cargar cupones');
      toast.error('Error al cargar cupones');
      setCupones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resReglas, resCupones] = await Promise.all([
        axiosAuth.get('/admin/promo-rules'),
        axiosAuth.get('/admin/coupons'),
      ]);
      setReglas(Array.isArray(resReglas.data) ? resReglas.data : []);
      setCupones(Array.isArray(resCupones.data) ? resCupones.data : []);
    } catch (err) {
      console.error('Error cargando reglas/cupones:', err);
      setError(err.response?.data?.error || 'Error al cargar datos');
      toast.error('Error al cargar reglas y cupones');
      setReglas([]);
      setCupones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearRegla = useCallback(async (datos) => {
    try {
      const response = await axiosAuth.post('/admin/promo-rules', datos);
      setReglas((prev) => [...prev, response.data]);
      toast.success('Regla creada correctamente');
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear regla';
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  const actualizarRegla = useCallback(async (id, datos) => {
    try {
      const response = await axiosAuth.put(`/admin/promo-rules/${id}`, datos);
      setReglas((prev) => prev.map((r) => (r.id === parseInt(id, 10) ? response.data : r)));
      toast.success('Regla actualizada');
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar regla';
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  const eliminarRegla = useCallback(async (id) => {
    try {
      await axiosAuth.delete(`/admin/promo-rules/${id}`);
      setReglas((prev) => prev.filter((r) => r.id !== parseInt(id, 10)));
      toast.success('Regla eliminada');
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al eliminar regla';
      toast.error(msg);
      return false;
    }
  }, []);

  const toggleRegla = useCallback(async (id) => {
    try {
      const response = await axiosAuth.put(`/admin/promo-rules/${id}/toggle`);
      setReglas((prev) => prev.map((r) => (r.id === parseInt(id, 10) ? response.data : r)));
      toast.success(response.data?.activo ? 'Regla activada' : 'Regla desactivada');
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al cambiar estado';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  const crearCupon = useCallback(async (datos) => {
    try {
      const response = await axiosAuth.post('/admin/coupons', datos);
      setCupones((prev) => [...prev, response.data]);
      toast.success('Cupón creado correctamente');
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear cupón';
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  const actualizarCupon = useCallback(async (id, datos) => {
    try {
      const response = await axiosAuth.put(`/admin/coupons/${id}`, datos);
      setCupones((prev) => prev.map((c) => (c.id === parseInt(id, 10) ? response.data : c)));
      toast.success('Cupón actualizado');
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar cupón';
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  const eliminarCupon = useCallback(async (id) => {
    try {
      await axiosAuth.delete(`/admin/coupons/${id}`);
      setCupones((prev) => prev.filter((c) => c.id !== parseInt(id, 10)));
      toast.success('Cupón eliminado');
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al eliminar cupón';
      toast.error(msg);
      return false;
    }
  }, []);

  const toggleCupon = useCallback(async (id) => {
    try {
      const response = await axiosAuth.put(`/admin/coupons/${id}/toggle`);
      setCupones((prev) => prev.map((c) => (c.id === parseInt(id, 10) ? response.data : c)));
      toast.success(response.data?.activo ? 'Cupón activado' : 'Cupón desactivado');
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al cambiar estado';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  return {
    reglas,
    cupones,
    loading,
    error,
    cargarReglas,
    cargarCupones,
    cargarTodo,
    crearRegla,
    actualizarRegla,
    eliminarRegla,
    toggleRegla,
    crearCupon,
    actualizarCupon,
    eliminarCupon,
    toggleCupon,
  };
};
