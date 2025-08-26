import { useState, useEffect, useRef, useCallback } from 'react';
import { axiosAuth } from '../../utils/apiClient';

export const useNotificacionesPedidos = () => {
  const [ultimoCheckeo, setUltimoCheckeo] = useState(null);
  const [pedidosAnteriores, setPedidosAnteriores] = useState([]);
  const [nuevoPedido, setNuevoPedido] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
  const [audioListo, setAudioListo] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null); // Audio para notificaciones
  const audioTestRef = useRef(null); // Audio para pruebas

  // Inicializar audio con archivo MP3
  useEffect(() => {
    const initAudio = async () => {
      try {
        console.log('🎵 Inicializando audio con notification.mp3...');
        
        // AUDIO PRINCIPAL para notificaciones
        const audioNotificacion = new Audio('/notification.mp3');
        audioNotificacion.loop = true;
        audioNotificacion.volume = 0.8;
        audioNotificacion.preload = 'auto';
        
        // AUDIO SECUNDARIO para pruebas
        const audioPrueba = new Audio('/notification.mp3');
        audioPrueba.loop = false; // No loop para pruebas
        audioPrueba.volume = 0.8;
        audioPrueba.preload = 'auto';
        
        // Eventos para audio principal
        audioNotificacion.addEventListener('canplaythrough', () => {
          console.log('✅ Audio principal cargado y listo');
          setAudioListo(true);
        });
        
        audioNotificacion.addEventListener('error', (e) => {
          console.error('❌ Error cargando audio principal:', e);
          setAudioListo(false);
        });

        // Eventos para audio de prueba
        audioPrueba.addEventListener('error', (e) => {
          console.error('❌ Error cargando audio de prueba:', e);
        });
        
        // Asignar referencias
        audioRef.current = audioNotificacion;
        audioTestRef.current = audioPrueba;
        
        // Forzar carga de ambos audios
        try {
          await audioNotificacion.load();
          await audioPrueba.load();
        } catch (error) {
          console.warn('⚠️ Error en load(), pero continuando...');
        }
        
      } catch (error) {
        console.error('❌ Error inicializando audio MP3:', error);
        setAudioListo(false);
      }
    };

    initAudio();

    return () => {
      // Limpiar ambos audios al desmontar
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (audioTestRef.current) {
        audioTestRef.current.pause();
        audioTestRef.current.currentTime = 0;
        audioTestRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Función para reproducir sonido de NOTIFICACIÓN en bucle
  const reproducirSonidoNotificacion = useCallback(async () => {
    if (!sonidoHabilitado || !audioListo || !audioRef.current) {
      console.log('🔇 Sonido deshabilitado o no disponible para notificación');
      return false;
    }

    try {
      console.log('🔊 Reproduciendo notification.mp3 para NOTIFICACIÓN en bucle...');
      
      // Resetear audio al inicio
      audioRef.current.currentTime = 0;
      
      // IMPORTANTE: Reproducir con manejo de promesa
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Audio de NOTIFICACIÓN reproduciéndose en bucle');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error reproduciendo audio de notificación:', error);
      // Intentar reproducir sin await como fallback
      try {
        audioRef.current.play();
        return true;
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return false;
      }
    }
    return false;
  }, [sonidoHabilitado, audioListo]);

  // Función para detener sonido de notificación
  const detenerSonidoNotificacion = useCallback(() => {
    if (audioRef.current) {
      console.log('⏹️ Deteniendo sonido de NOTIFICACIÓN...');
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log('✅ Sonido de notificación detenido');
      } catch (error) {
        console.error('❌ Error deteniendo sonido:', error);
      }
    }
  }, []);

  // Función para checkear nuevos pedidos
  const checkearNuevosPedidos = useCallback(async () => {
    try {
      console.log('🔍 Chequeando nuevos pedidos...');
      
      const response = await axiosAuth.get('/admin/pedidos-pendientes-check');
      
      if (response.data && Array.isArray(response.data)) {
        const pedidosActuales = response.data;
        
        // Primera vez - solo guardar los pedidos actuales
        if (pedidosAnteriores.length === 0) {
          setPedidosAnteriores(pedidosActuales);
          setUltimoCheckeo(new Date());
          console.log('📋 Primera carga - guardando estado inicial');
          return;
        }

        // Buscar pedidos nuevos (que no estaban antes)
        const idsAnteriores = pedidosAnteriores.map(p => p.id_pedido);
        const pedidosNuevos = pedidosActuales.filter(p => !idsAnteriores.includes(p.id_pedido));
        
        if (pedidosNuevos.length > 0) {
          console.log(`🚨 ${pedidosNuevos.length} nuevos pedidos detectados!`, pedidosNuevos);
          
          // Tomar el pedido más reciente
          const pedidoNuevo = pedidosNuevos[pedidosNuevos.length - 1];
          
          // Mostrar notificación PRIMERO
          setNuevoPedido(pedidoNuevo);
          setMostrarNotificacion(true);
          
          // LUEGO reproducir sonido - CON DELAY para asegurar que el modal esté montado
          setTimeout(async () => {
            console.log('🎵 Intentando reproducir sonido de notificación...');
            const audioIniciado = await reproducirSonidoNotificacion();
            console.log(`🔊 Audio iniciado: ${audioIniciado ? 'SÍ' : 'NO'}`);
          }, 500); // 500ms de delay
          
          // Actualizar lista de pedidos anteriores
          setPedidosAnteriores(pedidosActuales);
        } else {
          console.log('✅ No hay nuevos pedidos');
        }
        
        setUltimoCheckeo(new Date());
      }
    } catch (error) {
      console.error('❌ Error chequeando nuevos pedidos:', error);
    }
  }, [pedidosAnteriores, reproducirSonidoNotificacion]);

  // Iniciar monitoreo
  const iniciarMonitoreo = useCallback((intervalo = 10000) => {
    console.log(`🔄 Iniciando monitoreo de nuevos pedidos (cada ${intervalo/1000}s)`);
    console.log(`🔊 Audio habilitado: ${sonidoHabilitado}, Audio listo: ${audioListo}`);
    
    // Checkeo inicial
    checkearNuevosPedidos();
    
    // Configurar intervalo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(checkearNuevosPedidos, intervalo);
  }, [checkearNuevosPedidos, sonidoHabilitado, audioListo]);

  // Detener monitoreo
  const detenerMonitoreo = useCallback(() => {
    console.log('⏹️ Deteniendo monitoreo de pedidos');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    detenerSonidoNotificacion(); // También detener el audio
  }, [detenerSonidoNotificacion]);

  // Cerrar notificación con recarga de página - MEJORADO
  const cerrarNotificacion = useCallback(() => {
    console.log('❌ Cerrando notificación...');
    
    // 1. Detener sonido INMEDIATAMENTE
    detenerSonidoNotificacion();
    
    // 2. Limpiar estados
    setMostrarNotificacion(false);
    setNuevoPedido(null);
    
    console.log('🔄 Preparando recarga de página...');
    
    // 3. FORZAR RECARGA después de un breve delay
    setTimeout(() => {
      console.log('🔄 RECARGANDO PÁGINA AHORA...');
      // Usar location.reload(true) para forzar recarga completa
      window.location.reload(true);
    }, 100); // Delay muy corto para que se vean los cambios
  }, [detenerSonidoNotificacion]);

  // Toggle sonido
  const toggleSonido = useCallback(() => {
    setSonidoHabilitado(prev => {
      const nuevoEstado = !prev;
      console.log(`🔊 Sonido ${nuevoEstado ? 'activado' : 'desactivado'}`);
      
      // Si se desactiva y está sonando, detenerlo
      if (!nuevoEstado) {
        detenerSonidoNotificacion();
      }
      
      return nuevoEstado;
    });
  }, [detenerSonidoNotificacion]);

  // Función para probar sonido manualmente - MEJORADA
  const probarSonido = useCallback(async () => {
    if (!audioListo || !audioTestRef.current) {
      console.log('🔇 Audio de prueba no disponible');
      toast?.error?.('Audio no disponible');
      return;
    }

    try {
      console.log('🎵 Probando sonido manualmente...');
      
      // Usar el audio de PRUEBA (sin loop)
      audioTestRef.current.currentTime = 0;
      
      const playPromise = audioTestRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Audio de PRUEBA reproduciéndose');
        
        // Detener después de 3 segundos
        setTimeout(() => {
          audioTestRef.current.pause();
          audioTestRef.current.currentTime = 0;
          console.log('⏹️ Audio de prueba detenido');
        }, 3000);
      }
      
    } catch (error) {
      console.error('❌ Error en prueba de sonido:', error);
      // Fallback sin await
      try {
        audioTestRef.current.play();
        setTimeout(() => {
          audioTestRef.current.pause();
          audioTestRef.current.currentTime = 0;
        }, 3000);
      } catch (fallbackError) {
        console.error('❌ Error en fallback de prueba:', fallbackError);
      }
    }
  }, [audioListo]);

  return {
    // Estados
    ultimoCheckeo,
    nuevoPedido,
    mostrarNotificacion,
    sonidoHabilitado,
    audioListo,
    
    // Funciones
    iniciarMonitoreo,
    detenerMonitoreo,
    cerrarNotificacion, // ← MEJORADA - fuerza recarga
    toggleSonido,
    probarSonido, // ← MEJORADA - usa audio separado
    detenerSonido: detenerSonidoNotificacion // ← Función específica para notificaciones
  };
};