// hooks/usePollingNotifications.js - Sistema inteligente de notificaciones por polling
import { useState, useEffect, useRef, useCallback } from 'react';
import { axiosAuth } from '../utils/apiClient';

export const usePollingNotifications = () => {
  const [nuevoPedido, setNuevoPedido] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
  const audioRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);
  const consecutiveErrorsRef = useRef(0);

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

  // Verificar nuevos pedidos
  const verificarNuevosPedidos = useCallback(async () => {
    try {
      console.log('[POLLING] Verificando nuevos pedidos...');

      const response = await axiosAuth.get('/admin/pedidos-pendientes-check', {
        params: {
          ultimo_id: ultimoPedidoId
        },
        timeout: 5000 // Timeout corto
      });

      const data = response.data;

      // Resetear contador de errores si la petición fue exitosa
      consecutiveErrorsRef.current = 0;

      // Si hay un nuevo pedido
      if (data.nuevo_pedido && data.pedido) {
        console.log('=¨ [POLLING] NUEVO PEDIDO DETECTADO:', data.pedido);

        // Actualizar último ID
        setUltimoPedidoId(data.pedido.id_pedido);

        // Mostrar notificación
        setNuevoPedido(data.pedido);
        setMostrarNotificacion(true);

        // Reproducir sonido
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => {
            console.warn('  No se pudo reproducir audio:', err);
          });
        }

        // Notificación del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('=¨ Nuevo Pedido', {
            body: `Pedido #${data.pedido.id_pedido} de ${data.pedido.cliente}`,
            icon: '/panel/logo.jpg',
            badge: '/panel/logo.jpg',
            requireInteraction: true,
            tag: `pedido-${data.pedido.id_pedido}` // Evita duplicados
          });
        }
      } else {
        console.log('[POLLING] No hay nuevos pedidos');
      }

    } catch (error) {
      consecutiveErrorsRef.current++;
      console.error(`L [POLLING] Error verificando pedidos (${consecutiveErrorsRef.current} consecutivos):`, error.message);

      // Si hay muchos errores consecutivos, aumentar intervalo
      if (consecutiveErrorsRef.current > 5) {
        console.warn('  [POLLING] Demasiados errores, reduciendo frecuencia...');
      }
    }
  }, [ultimoPedidoId]);

  // Iniciar polling
  const iniciarPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Ya está corriendo
    }

    console.log('¶ [POLLING] Iniciando sistema de notificaciones...');

    // Verificar inmediatamente
    verificarNuevosPedidos();

    // Intervalo adaptativo basado en errores
    const getInterval = () => {
      if (consecutiveErrorsRef.current > 5) {
        return 30000; // 30 segundos si hay errores
      }
      return isTabActiveRef.current ? 5000 : 15000; // 5s activo, 15s inactivo
    };

    pollingIntervalRef.current = setInterval(() => {
      verificarNuevosPedidos();
    }, getInterval());

    console.log(' [POLLING] Sistema de notificaciones activo');
  }, [verificarNuevosPedidos]);

  // Detener polling
  const detenerPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('ø [POLLING] Deteniendo sistema de notificaciones...');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cerrar notificación
  const cerrarNotificacion = useCallback(() => {
    console.log('L [POLLING] Cerrando notificación...');

    // Detener sonido
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setMostrarNotificacion(false);
    setNuevoPedido(null);

    // Recargar página después de un delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  // Detener sonido sin cerrar notificación
  const detenerSonido = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('= [POLLING] Sonido detenido');
    }
  }, []);

  // Solicitar permiso para notificaciones
  const solicitarPermisoNotificaciones = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('  Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log(' Permiso de notificaciones ya concedido');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('L Permiso de notificaciones denegado');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('= Permiso de notificaciones:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('L Error solicitando permiso:', error);
      return false;
    }
  }, []);

  // Manejar visibilidad de la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;

      if (isTabActiveRef.current) {
        console.log('=A [POLLING] Pestaña activa - aumentando frecuencia');
        // Verificar inmediatamente al volver
        verificarNuevosPedidos();
      } else {
        console.log('=A [POLLING] Pestaña inactiva - reduciendo frecuencia');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [verificarNuevosPedidos]);

  // Iniciar polling al montar
  useEffect(() => {
    iniciarPolling();

    return () => {
      detenerPolling();
    };
  }, [iniciarPolling, detenerPolling]);

  // Ajustar intervalo dinámicamente según errores
  useEffect(() => {
    if (pollingIntervalRef.current) {
      // Reiniciar con nuevo intervalo
      detenerPolling();
      iniciarPolling();
    }
  }, [consecutiveErrorsRef.current]);

  return {
    isConnected: pollingIntervalRef.current !== null, // Simular estado de conexión
    nuevoPedido,
    mostrarNotificacion,
    cerrarNotificacion,
    detenerSonido,
    solicitarPermisoNotificaciones,
    verificarPedidos: verificarNuevosPedidos // Alias para compatibilidad
  };
};
