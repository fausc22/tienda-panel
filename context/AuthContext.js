import { createContext, useContext, useReducer, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// Estado inicial
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  sessionExpiry: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        sessionExpiry: action.payload.sessionExpiry,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        sessionExpiry: null,
        error: action.payload.error,
      };
    
    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.SESSION_EXPIRED:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        sessionExpiry: null,
        error: action.type === AUTH_ACTIONS.SESSION_EXPIRED ? 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.' : null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Context
const AuthContext = createContext({});

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const sessionTimer = useRef(null);
  const warningTimer = useRef(null);

  // Constantes de tiempo
  const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
  const WARNING_TIME = 10 * 60 * 1000; // 10 minutos antes de expirar

  // Verificar autenticación al cargar - SOLO UNA VEZ
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('admin_session');
        const userData = localStorage.getItem('admin_user');
        const sessionExpiry = localStorage.getItem('session_expiry');
        
        if (token && userData && sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry);
          const now = Date.now();
          
          // Verificar si la sesión ha expirado
          if (now >= expiryTime) {
            // Sesión expirada, limpiar datos
            cleanupSession();
            dispatch({ type: AUTH_ACTIONS.SESSION_EXPIRED });
            return;
          }
          
          // Sesión válida, configurar timers
          const timeRemaining = expiryTime - now;
          setupSessionTimers(timeRemaining);
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: JSON.parse(userData),
              sessionExpiry: expiryTime,
            },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        cleanupSession();
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
    
    // Cleanup al desmontar
    return () => {
      clearSessionTimers();
    };
  }, []); // Dependencias vacías para ejecutar solo una vez

  // Función para limpiar la sesión
  const cleanupSession = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('session_expiry');
    clearSessionTimers();
  };

  // Función para limpiar timers
  const clearSessionTimers = () => {
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
      sessionTimer.current = null;
    }
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }
  };

  // Función para configurar timers de sesión
  const setupSessionTimers = (timeRemaining) => {
    clearSessionTimers();
    
    // Timer para advertencia (10 minutos antes)
    const warningTime = timeRemaining - WARNING_TIME;
    if (warningTime > 0) {
      warningTimer.current = setTimeout(() => {
        toast.warning('Su sesión expirará en 10 minutos. Guarde su trabajo.', {
          duration: 8000,
        });
      }, warningTime);
    }
    
    // Timer para expiración de sesión
    sessionTimer.current = setTimeout(() => {
      cleanupSession();
      dispatch({ type: AUTH_ACTIONS.SESSION_EXPIRED });
      toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      router.push('/login');
    }, timeRemaining);
  };

  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/loginCheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.status === 200) {
        // Calcular tiempo de expiración (4 horas desde ahora)
        const now = Date.now();
        const sessionExpiry = now + SESSION_DURATION;
        
        // Guardar datos en localStorage
        const userData = {
          username: credentials.username,
          loginTime: new Date().toISOString(),
        };
        
        localStorage.setItem('admin_session', 'authenticated');
        localStorage.setItem('admin_user', JSON.stringify(userData));
        localStorage.setItem('session_expiry', sessionExpiry.toString());
        
        // Configurar timers para esta sesión
        setupSessionTimers(SESSION_DURATION);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { 
            user: userData,
            sessionExpiry: sessionExpiry,
          },
        });

        return { success: true, message: result.message };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: { error: result.message },
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión con el servidor';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    try {
      cleanupSession();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para extender la sesión (opcional)
  const extendSession = () => {
    if (state.isAuthenticated) {
      const now = Date.now();
      const newExpiry = now + SESSION_DURATION;
      
      localStorage.setItem('session_expiry', newExpiry.toString());
      setupSessionTimers(SESSION_DURATION);
      
      toast.success('Sesión extendida por 4 horas más');
    }
  };

  // Función para obtener tiempo restante de sesión
  const getTimeRemaining = () => {
    if (state.sessionExpiry) {
      const remaining = state.sessionExpiry - Date.now();
      return Math.max(0, remaining);
    }
    return 0;
  };

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    clearError,
    extendSession,
    getTimeRemaining,
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export { AUTH_ACTIONS };