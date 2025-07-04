// hooks/useAuth.js - Hook simplificado para autenticación (compatibilidad)
import { useAuth as useAuthContext } from '../context/AuthContext';

// Hook wrapper para mantener compatibilidad con el código existente
const useAuth = () => {
  const authContext = useAuthContext();
  
  // Agregar rol por defecto si no existe
  const user = authContext.user ? {
    ...authContext.user,
    rol: authContext.user.rol || 'ADMIN', // Rol por defecto
    nombre: authContext.user.nombre || authContext.user.username,
    id: authContext.user.id || authContext.user.username
  } : null;

  return {
    ...authContext,
    user
  };
};

export default useAuth;