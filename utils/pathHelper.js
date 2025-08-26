// utils/pathHelper.js - Helper para manejo de rutas en subdirectorio

/**
 * Obtiene la base path configurada
 */
export const getBasePath = () => {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
};

/**
 * Obtiene la URL completa del panel
 */
export const getPanelUrl = () => {
  return process.env.NEXT_PUBLIC_PANEL_URL || '';
};

/**
 * Construye una ruta completa con el base path
 * @param {string} path - Ruta relativa
 * @returns {string} Ruta completa
 */
export const buildPath = (path) => {
  const basePath = getBasePath();
  
  // Asegurar que el path comience con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // En desarrollo o si no hay basePath, devolver el path normal
  if (!basePath || process.env.NODE_ENV === 'development') {
    return normalizedPath;
  }
  
  // En producción con basePath, combinarlo
  return `${basePath}${normalizedPath}`;
};

/**
 * Construye una URL completa para redirects externos
 * @param {string} path - Ruta relativa
 * @returns {string} URL completa
 */
export const buildFullUrl = (path) => {
  const panelUrl = getPanelUrl();
  
  if (!panelUrl) {
    return buildPath(path);
  }
  
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${panelUrl}/${normalizedPath}`;
};

/**
 * Verifica si estamos en un entorno de producción
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_BUILD_ENV === 'production';
};

/**
 * Obtiene la configuración de rutas para el router
 */
export const getRouterConfig = () => {
  return {
    basePath: getBasePath(),
    trailingSlash: true,
  };
};

/**
 * Normaliza una ruta para el router de Next.js
 * @param {string} route - Ruta a normalizar
 * @returns {string} Ruta normalizada
 */
export const normalizeRoute = (route) => {
  // Remover el basePath si está presente
  const basePath = getBasePath();
  if (basePath && route.startsWith(basePath)) {
    route = route.slice(basePath.length);
  }
  
  // Asegurar que comience con /
  if (!route.startsWith('/')) {
    route = `/${route}`;
  }
  
  return route;
};

/**
 * Construye una ruta para assets estáticos
 * @param {string} assetPath - Ruta del asset
 * @returns {string} Ruta completa del asset
 */
export const buildAssetPath = (assetPath) => {
  const basePath = getBasePath();
  
  // Asegurar que el path comience con /
  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  
  return isProduction() && basePath ? `${basePath}${normalizedPath}` : normalizedPath;
};