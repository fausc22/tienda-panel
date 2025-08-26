import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { normalizeRoute } from '../utils/pathHelper';

/**
 * Hook para manejar redirecciones basadas en autenticación
 * @param {boolean} requireAuth - Si la página requiere autenticación
 * @param {string} redirectTo - URL de redirección (opcional)
 */
export const useAuthRedirect = (requireAuth = false, redirectTo = null) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // No hacer nada si está cargando o ya se redirigió
    if (isLoading || hasRedirected.current) return;

    // Si la página requiere auth y no está autenticado
    if (requireAuth && !isAuthenticated) {
      hasRedirected.current = true;
      console.log('🔒 Redirecting to login - no authentication');
      router.replace(normalizeRoute('/login'));
      return;
    }

    // Si no requiere auth y está autenticado (ej: página de login)
    if (!requireAuth && isAuthenticated) {
      hasRedirected.current = true;
      const destination = redirectTo ? normalizeRoute(redirectTo) : normalizeRoute('/inicio');
      console.log(`✅ Redirecting authenticated user to: ${destination}`);
      router.replace(destination);
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

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
 */
export const useProtectedPage = () => {
  return useAuthRedirect(true);
};

/**
 * Hook para páginas públicas (como login) que redirigen si ya está autenticado
 */
export const usePublicPage = (redirectTo = '/inicio') => {
  return useAuthRedirect(false, redirectTo);
};