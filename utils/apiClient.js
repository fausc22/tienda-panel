// utils/apiClient.js - Cliente API con manejo de autenticación
import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Crear instancia base de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    // Sin headers por defecto
  },
});

// Crear instancia para requests autenticados
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    // ❌ ELIMINAR ESTA LÍNEA PARA EVITAR CONFLICTOS CON FORMDATA
    // 'Content-Type': 'application/json',
  },
});

// Sistema de logs para API
const logApi = (message, level = 'info', operation = 'API') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${operation}-${level.toUpperCase()}] ${message}`;
  
  if (level === 'error') {
    console.error('\x1b[31m%s\x1b[0m', logMessage);
  } else if (level === 'warn') {
    console.warn('\x1b[33m%s\x1b[0m', logMessage);
  } else if (level === 'success') {
    console.log('\x1b[32m%s\x1b[0m', logMessage);
  } else {
    console.log('\x1b[36m%s\x1b[0m', logMessage);
  }
};

// Interceptor de request para logging
apiClient.interceptors.request.use(
  (config) => {
    logApi(`📤 ${config.method?.toUpperCase()} ${config.url}`, 'info', 'REQUEST');
    return config;
  },
  (error) => {
    logApi(`❌ Error en request: ${error.message}`, 'error', 'REQUEST');
    return Promise.reject(error);
  }
);

// Interceptor mejorado para requests autenticados
authApiClient.interceptors.request.use(
  (config) => {
    logApi(`📤 ${config.method?.toUpperCase()} ${config.url} [AUTH]`, 'info', 'REQUEST');
    
    // Detectar tipo de contenido y establecer headers apropiados
    if (config.data instanceof FormData) {
      // Para FormData, NO establecer Content-Type - axios lo maneja automáticamente
      logApi(`📋 FormData detectado - dejando que axios maneje Content-Type`, 'info', 'REQUEST');
      
      // Asegurarse de que no hay Content-Type manual que pueda interferir
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      
      logApi(`🧹 Headers de Content-Type eliminados para FormData`, 'info', 'REQUEST');
      
    } else if (config.data && typeof config.data === 'object') {
      // Para objetos JSON, establecer Content-Type explícitamente
      config.headers['Content-Type'] = 'application/json';
      logApi(`📋 Content-Type establecido como application/json para objeto`, 'info', 'REQUEST');
      
    } else if (!config.headers['Content-Type'] && config.method !== 'get') {
      // Para otros casos (excepto GET), usar JSON por defecto
      config.headers['Content-Type'] = 'application/json';
      logApi(`📋 Content-Type por defecto establecido como application/json`, 'info', 'REQUEST');
    }
    
    // Log de headers finales para debug
    logApi(`🔍 Headers finales: ${JSON.stringify(config.headers)}`, 'info', 'REQUEST');
    
    return config;
  },
  (error) => {
    logApi(`❌ Error en request autenticado: ${error.message}`, 'error', 'REQUEST');
    return Promise.reject(error);
  }
);

// Interceptor de response para logging y manejo de errores
const responseInterceptor = (client, isAuth = false) => {
  const prefix = isAuth ? '[AUTH]' : '';
  
  client.interceptors.response.use(
    (response) => {
      const duration = response.config.metadata?.startTime 
        ? Date.now() - response.config.metadata.startTime 
        : 0;
      
      logApi(
        `📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms) ${prefix}`, 
        'success', 
        'RESPONSE'
      );
      return response;
    },
    (error) => {
      const duration = error.config?.metadata?.startTime 
        ? Date.now() - error.config.metadata.startTime 
        : 0;

      if (error.response) {
        // El servidor respondió con un código de estado de error
        const status = error.response.status;
        const method = error.config?.method?.toUpperCase();
        const url = error.config?.url;
        
        logApi(
          `📥 ${status} ${method} ${url} (${duration}ms) ${prefix} - ${error.response.data?.message || error.message}`, 
          'error', 
          'RESPONSE'
        );

        // Manejo específico de errores de autenticación
        if (status === 401 && isAuth) {
          logApi('🔒 Token expirado o inválido, redirigiendo al login', 'warn', 'AUTH');
          // Limpiar datos de sesión
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_session');
            localStorage.removeItem('admin_user');
            localStorage.removeItem('session_expiry');
            window.location.href = '/login';
          }
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        logApi(
          `🔌 Sin respuesta del servidor (${duration}ms) ${prefix} - ${error.message}`, 
          'error', 
          'NETWORK'
        );
      } else {
        // Algo pasó al configurar la petición
        logApi(`⚙️ Error de configuración ${prefix} - ${error.message}`, 'error', 'CONFIG');
      }

      return Promise.reject(error);
    }
  );
};

// Aplicar interceptors de response
responseInterceptor(apiClient, false);
responseInterceptor(authApiClient, true);

// Interceptor para agregar timestamp a requests
apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

authApiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// Función para verificar conexión con el servidor
export const checkServerHealth = async () => {
  try {
    logApi('🏥 Verificando salud del servidor...', 'info', 'HEALTH');
    const response = await apiClient.get('/health');
    logApi('✅ Servidor disponible', 'success', 'HEALTH');
    return {
      available: true,
      data: response.data
    };
  } catch (error) {
    logApi(`❌ Servidor no disponible: ${error.message}`, 'error', 'HEALTH');
    return {
      available: false,
      error: error.message
    };
  }
};

// Función para manejar errores de red de forma consistente
export const handleApiError = (error, context = 'operación') => {
  let errorMessage = `Error en ${context}`;
  
  if (error.response) {
    // Error del servidor con respuesta
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = data?.message || 'Solicitud inválida';
        break;
      case 401:
        errorMessage = 'No autorizado - Sesión expirada';
        break;
      case 403:
        errorMessage = 'Acceso denegado';
        break;
      case 404:
        errorMessage = 'Recurso no encontrado';
        break;
      case 429:
        errorMessage = 'Demasiadas peticiones - Intente más tarde';
        break;
      case 500:
        errorMessage = 'Error interno del servidor';
        break;
      default:
        errorMessage = data?.message || `Error del servidor (${status})`;
    }
  } else if (error.request) {
    // Error de red
    errorMessage = 'Error de conexión con el servidor';
  } else {
    // Error de configuración
    errorMessage = 'Error en la configuración de la petición';
  }
  
  logApi(`🚨 ${errorMessage}`, 'error', 'ERROR_HANDLER');
  return errorMessage;
};

// Función para hacer peticiones con retry automático
export const apiWithRetry = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logApi(`🔄 Intento ${attempt}/${maxRetries}`, 'info', 'RETRY');
      const result = await requestFn();
      logApi(`✅ Éxito en intento ${attempt}`, 'success', 'RETRY');
      return result;
    } catch (error) {
      lastError = error;
      logApi(`❌ Fallo en intento ${attempt}: ${error.message}`, 'warn', 'RETRY');
      
      if (attempt < maxRetries) {
        logApi(`⏱️ Esperando ${delay}ms antes del siguiente intento...`, 'info', 'RETRY');
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Aumentar el delay exponencialmente
      }
    }
  }
  
  logApi(`💥 Falló después de ${maxRetries} intentos`, 'error', 'RETRY');
  throw lastError;
};

// Exportar instancias configuradas
export const axiosPublic = apiClient;
export const axiosAuth = authApiClient;

// Alias para compatibilidad
export default apiClient;