// hooks/useWebSocket.js - Hook para gestión de WebSocket
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [nuevoPedido, setNuevoPedido] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Inicializar audio
  useEffect(() => {
    const audio = new Audio('/panel/notification.mp3');
    audio.loop = true;
    audio.volume = 0.8;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Conectar al WebSocket
  const conectarWebSocket = useCallback(() => {
    try {
      console.log('🔌 Intentando conectar al WebSocket...');

      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000
      });

      // Evento: Conexión exitosa
      socket.on('connect', () => {
        console.log('✅ WebSocket conectado:', socket.id);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      });

      // Evento: Recibir confirmación de conexión
      socket.on('connected', (data) => {
        console.log('📡 Confirmación del servidor:', data);
      });

      // 🚨 Evento: NUEVO PEDIDO
      socket.on('nuevo_pedido', (pedido) => {
        console.log('🚨 NUEVO PEDIDO RECIBIDO:', pedido);

        // Guardar pedido
        setNuevoPedido(pedido);
        setMostrarNotificacion(true);

        // Reproducir sonido
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => {
            console.warn('⚠️ No se pudo reproducir audio:', err);
          });
        }

        // Notificación del navegador (si está permitida)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Nuevo Pedido', {
            body: `Pedido #${pedido.id_pedido} de ${pedido.cliente}`,
            icon: '/panel/logo.jpg',
            badge: '/panel/logo.jpg',
            requireInteraction: true
          });
        }

        // Confirmar recepción al servidor
        socket.emit('notificacion_recibida', {
          pedido_id: pedido.id_pedido,
          timestamp: new Date().toISOString()
        });
      });

      // Evento: Desconexión
      socket.on('disconnect', (reason) => {
        console.warn('❌ WebSocket desconectado:', reason);
        setIsConnected(false);

        if (reason === 'io server disconnect') {
          // Reconectar manualmente si el servidor cerró la conexión
          socket.connect();
        }
      });

      // Evento: Error de conexión
      socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error.message);
        reconnectAttemptsRef.current++;

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('💥 Máximo de intentos de reconexión alcanzado');
        }
      });

      // Evento: Error general
      socket.on('error', (error) => {
        console.error('❌ Error en WebSocket:', error);
      });

      socketRef.current = socket;

      return socket;
    } catch (error) {
      console.error('❌ Error inicializando WebSocket:', error);
      return null;
    }
  }, []);

  // Desconectar WebSocket
  const desconectarWebSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Desconectando WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsConnected(false);
  }, []);

  // Verificar pedidos manualmente
  const verificarPedidos = useCallback(() => {
    if (socketRef.current && isConnected) {
      console.log('🔄 Solicitando verificación manual de pedidos...');
      socketRef.current.emit('verificar_pedidos');
    }
  }, [isConnected]);

  // Cerrar notificación
  const cerrarNotificacion = useCallback(() => {
    console.log('❌ Cerrando notificación...');

    // Detener sonido
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setMostrarNotificacion(false);
    setNuevoPedido(null);

    // Recargar página para actualizar lista de pedidos
    setTimeout(() => {
      window.location.reload(true);
    }, 100);
  }, []);

  // Detener sonido sin cerrar notificación
  const detenerSonido = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('🔇 Sonido detenido');
    }
  }, []);

  // Solicitar permiso para notificaciones del navegador
  const solicitarPermisoNotificaciones = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('⚠️ Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permiso de notificaciones ya concedido');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('❌ Permiso de notificaciones denegado por el usuario');
      console.warn('💡 Para habilitarlas:');
      console.warn('   Chrome: Configuración > Privacidad > Configuración de sitios > Notificaciones');
      console.warn('   Firefox: Opciones > Privacidad > Permisos > Notificaciones');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Respuesta de permiso de notificaciones:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permiso:', error);
      return false;
    }
  }, []);

  // Conectar automáticamente al montar
  useEffect(() => {
    conectarWebSocket();

    // 🆕 NO solicitar permiso automáticamente - solo conectar WebSocket
    // El usuario debe hacer click en el botón para habilitar notificaciones

    return () => {
      desconectarWebSocket();
    };
  }, [conectarWebSocket, desconectarWebSocket]);

  // Reconectar cuando la pestaña vuelve a estar activa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isConnected && socketRef.current) {
        console.log('👁️ Pestaña activa - reconectando WebSocket...');
        if (socketRef.current.disconnected) {
          socketRef.current.connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected]);

  return {
    isConnected,
    nuevoPedido,
    mostrarNotificacion,
    conectarWebSocket,
    desconectarWebSocket,
    verificarPedidos,
    cerrarNotificacion,
    detenerSonido,
    solicitarPermisoNotificaciones
  };
};