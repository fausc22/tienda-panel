import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { normalizeRoute } from '../utils/pathHelper';

/**
 * Rutas permitidas por rol
 */
const ROUTES_BY_ROLE = {
  admin: ['/inicio', '/productos', '/pagina', '/estadisticas', '/usuarios'],
  kiosco: ['/inicio'],
};

/**
 * Hook para manejar redirecciones basadas en autenticación y rol
 * @param {boolean} requireAuth - Si la página requiere autenticación
 * @param {string} redirectTo - URL de redirección (opcional)
 * @param {string[]} allowedRoles - Roles permitidos para esta ruta (opcional, por defecto todos los roles autenticados)
 */
export const useAuthRedirect = (requireAuth = false, redirectTo = null, allowedRoles = null) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // No hacer nada hasta que el router esté listo (pathname correcto) y auth cargada
    if (!router.isReady || isLoading || hasRedirected.current) return;

    // Si la página requiere auth y no está autenticado
    if (requireAuth && !isAuthenticated) {
      hasRedirected.current = true;
      console.log('🔒 Redirecting to login - no authentication');
      router.replace(normalizeRoute('/login'));
      return;
    }

    // Verificar permisos de rol si está autenticado y hay restricciones
    if (requireAuth && isAuthenticated && user) {
      const userRol = (user.rol && String(user.rol).toLowerCase()) || 'admin';
      const currentPath = (router.pathname || '').replace(/\/$/, '') || '/';

      // Si se especificaron roles permitidos, verificar contra ellos
      if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(userRol)) {
        hasRedirected.current = true;
        console.log(`🚫 Usuario con rol ${userRol} no tiene acceso a esta ruta`);
        router.replace(normalizeRoute('/inicio'));
        return;
      }

      // Verificar si la ruta actual está permitida para el rol del usuario (rutas sin barra final)
      const allowedRoutes = (ROUTES_BY_ROLE[userRol] || ROUTES_BY_ROLE.admin).map(r => r.replace(/\/$/, ''));
      if (!allowedRoutes.includes(currentPath)) {
        hasRedirected.current = true;
        console.log(`🚫 Ruta ${currentPath} no permitida para rol ${userRol}, redirigiendo a /inicio`);
        router.replace(normalizeRoute('/inicio'));
        return;
      }
    }

    // Si no requiere auth y está autenticado (ej: página de login)
    if (!requireAuth && isAuthenticated) {
      hasRedirected.current = true;
      const destination = redirectTo ? normalizeRoute(redirectTo) : normalizeRoute('/inicio');
      console.log(`✅ Redirecting authenticated user to: ${destination}`);
      router.replace(destination);
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router.isReady, router.pathname, router, user, allowedRoles]);

  // Reset flag cuando cambie la ruta
  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log(`🔄 Route changed to: ${url}`);
      hasRedirected.current = false;
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook para proteger páginas que requieren autenticación
 * @param {string[]} allowedRoles - Roles permitidos (opcional, por defecto todos los roles autenticados)
 */
export const useProtectedPage = (allowedRoles = null) => {
  return useAuthRedirect(true, null, allowedRoles);
};

/**
 * Hook para páginas públicas (como login) que redirigen si ya está autenticado
 */
export const usePublicPage = (redirectTo = '/inicio') => {
  return useAuthRedirect(false, redirectTo);
};