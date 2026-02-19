// hooks/usuarios/useUsuarios.js - Hook para gestión de usuarios
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar lista de usuarios
  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Cargando usuarios...');
      const response = await axiosAuth.get('/admin/usuarios');
      
      if (response.data && response.data.usuarios) {
        setUsuarios(response.data.usuarios);
        console.log(`✅ ${response.data.usuarios.length} usuarios cargados`);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar usuarios';
      toast.error(errorMessage);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo usuario
  const crearUsuario = useCallback(async (datosUsuario) => {
    try {
      console.log('🔄 Creando usuario...', datosUsuario);
      const response = await axiosAuth.post('/admin/usuarios', datosUsuario);
      
      if (response.data) {
        toast.success('Usuario creado exitosamente');
        console.log('✅ Usuario creado:', response.data.usuario);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear usuario';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Actualizar contraseña de usuario
  const actualizarPassword = useCallback(async (id, password) => {
    try {
      console.log(`🔄 Actualizando contraseña del usuario ID: ${id}`);
      const response = await axiosAuth.put(`/admin/usuarios/${id}/password`, { password });
      
      if (response.data) {
        toast.success('Contraseña actualizada exitosamente');
        console.log('✅ Contraseña actualizada');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error actualizando contraseña:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar contraseña';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Eliminar usuario
  const eliminarUsuario = useCallback(async (id) => {
    try {
      console.log(`🔄 Eliminando usuario ID: ${id}`);
      const response = await axiosAuth.delete(`/admin/usuarios/${id}`);
      
      if (response.data) {
        toast.success('Usuario eliminado exitosamente');
        console.log('✅ Usuario eliminado');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  return {
    usuarios,
    loading,
    cargarUsuarios,
    crearUsuario,
    actualizarPassword,
    eliminarUsuario
  };
};

