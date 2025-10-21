// hooks/pagina/useHorariosAvanzado.js
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useHorariosAvanzado = () => {
  const [horarios, setHorarios] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [estadoGeneral, setEstadoGeneral] = useState('ACTIVA');
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const DIAS_SEMANA = [
    { id: 0, nombre: 'Domingo', abrev: 'Dom' },
    { id: 1, nombre: 'Lunes', abrev: 'Lun' },
    { id: 2, nombre: 'Martes', abrev: 'Mar' },
    { id: 3, nombre: 'Miércoles', abrev: 'Mié' },
    { id: 4, nombre: 'Jueves', abrev: 'Jue' },
    { id: 5, nombre: 'Viernes', abrev: 'Vie' },
    { id: 6, nombre: 'Sábado', abrev: 'Sáb' }
  ];

  // Cargar configuración de horarios
  const cargarHorarios = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Cargando configuración de horarios...');
      
      const response = await axiosAuth.get('/admin/horarios');
      
      if (response.data.success) {
        setHorarios(response.data.data.horarios);
        setExcepciones(response.data.data.excepciones);
        setEstadoGeneral(response.data.data.estadoGeneral);
        console.log('✅ Horarios cargados exitosamente');
      }
    } catch (error) {
      console.error('❌ Error cargando horarios:', error);
      toast.error('Error al cargar configuración de horarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar horarios de un día específico
  const actualizarHorarioDia = useCallback(async (diaSemana, franjas) => {
    setGuardando(true);
    
    try {
      console.log(`🔄 Actualizando horarios para día ${diaSemana}...`);
      
      const response = await axiosAuth.put('/admin/horarios/dia', {
        dia_semana: diaSemana,
        franjas: franjas
      });
      
      if (response.data.success) {
        await cargarHorarios(); // Recargar
        toast.success('Horarios actualizados correctamente');
        return true;
      }
    } catch (error) {
      console.error('❌ Error actualizando horarios:', error);
      toast.error('Error al actualizar horarios');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [cargarHorarios]);

  // Agregar excepción (feriado, vacaciones, etc.)
  const agregarExcepcion = useCallback(async (excepcionData) => {
    setGuardando(true);
    
    try {
      console.log('🔄 Agregando excepción de horario...');
      
      const response = await axiosAuth.post('/admin/horarios/excepcion', excepcionData);
      
      if (response.data.success) {
        await cargarHorarios(); // Recargar
        toast.success('Excepción agregada correctamente');
        return true;
      }
    } catch (error) {
      console.error('❌ Error agregando excepción:', error);
      toast.error('Error al agregar excepción');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [cargarHorarios]);

  // Eliminar excepción
  const eliminarExcepcion = useCallback(async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar esta excepción?')) {
      return false;
    }
    
    try {
      console.log(`🗑️ Eliminando excepción ${id}...`);
      
      const response = await axiosAuth.delete(`/admin/horarios/excepcion/${id}`);
      
      if (response.data.success) {
        await cargarHorarios(); // Recargar
        toast.success('Excepción eliminada correctamente');
        return true;
      }
    } catch (error) {
      console.error('❌ Error eliminando excepción:', error);
      toast.error('Error al eliminar excepción');
      return false;
    }
  }, [cargarHorarios]);

  // Obtener horarios de un día específico
  const obtenerHorariosDia = useCallback((diaSemana) => {
    return horarios.filter(h => h.dia_semana === diaSemana);
  }, [horarios]);

  const aplicarHorariosGrupo = useCallback(async (diasSeleccionados, franjas) => {
    if (!diasSeleccionados || diasSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos un día');
      return false;
    }

    if (!franjas || franjas.length === 0) {
      toast.error('Debe configurar al menos una franja horaria');
      return false;
    }

    setGuardando(true);
    
    try {
      console.log(`🔄 Aplicando horarios a ${diasSeleccionados.length} días...`);
      
      // Aplicar a cada día seleccionado
      const promesas = diasSeleccionados.map(dia => 
        axiosAuth.put('/admin/horarios/dia', {
          dia_semana: dia,
          franjas: franjas
        })
      );

      const resultados = await Promise.all(promesas);
      
      const exitosos = resultados.filter(r => r.data.success).length;
      
      if (exitosos === diasSeleccionados.length) {
        await cargarHorarios(); // Recargar
        toast.success(`Horarios aplicados correctamente a ${exitosos} días`);
        return true;
      } else {
        toast.warning(`Se aplicaron horarios a ${exitosos} de ${diasSeleccionados.length} días`);
        await cargarHorarios();
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error aplicando horarios en grupo:', error);
      toast.error('Error al aplicar horarios al grupo de días');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [cargarHorarios]);

  // 🆕 NUEVA FUNCIÓN: Copiar horarios de un día a otros
  const copiarHorariosDia = useCallback(async (diaOrigen, diasDestino) => {
    const horariosOrigen = obtenerHorariosDia(diaOrigen);
    
    if (horariosOrigen.length === 0) {
      toast.error('El día origen no tiene horarios configurados');
      return false;
    }

    const franjasFormateadas = horariosOrigen.map(h => ({
      hora_apertura: h.hora_apertura.substring(0, 5),
      hora_cierre: h.hora_cierre.substring(0, 5),
      activo: Boolean(h.activo)
    }));

    return await aplicarHorariosGrupo(diasDestino, franjasFormateadas);
  }, [horarios, obtenerHorariosDia, aplicarHorariosGrupo]);

  return {
    // Estados
    horarios,
    excepciones,
    estadoGeneral,
    loading,
    guardando,
    DIAS_SEMANA,
    
    // Funciones
    cargarHorarios,
    actualizarHorarioDia,
    agregarExcepcion,
    eliminarExcepcion,
    obtenerHorariosDia,
    aplicarHorariosGrupo,
    copiarHorariosDia
  };
};