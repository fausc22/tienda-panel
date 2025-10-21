// hooks/pedidos/useNotificacionesPedidos.js - VERSIÓN CORREGIDA Y ESTABLE
import { useState, useEffect, useRef, useCallback } from 'react';
import { axiosAuth } from '../../utils/apiClient';

export const useNotificacionesPedidos = () => {
  const [ultimoCheckeo, setUltimoCheckeo] = useState(null);
  const [nuevoPedido, setNuevoPedido] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(false);
  const [audioListo, setAudioListo] = useState(false);
  
  // ✅ USAR REFS PARA VALORES QUE NO DEBEN CAUSAR RE-RENDERS
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const parpadeadorRef = useRef(null);
  const pedidosAnterioresRef = useRef([]); // 🔑 CLAVE: REF en lugar de STATE
  const isCheckingRef = useRef(false); // 🔑 Prevenir race conditions

  // Verificar audio habilitado al cargar
  useEffect(() => {
    const audioHabilitado = localStorage.getItem('audio_habilitado') === 'true';
    setSonidoHabilitado(audioHabilitado);
    console.log('🔊 Audio habilitado desde localStorage:', audioHabilitado);
  }, []);

  // Inicializar audio con manejo robusto
  useEffect(() => {
    const initAudio = async () => {
      try {
        console.log('🎵 Inicializando audio...');
        const audio = new Audio('/panel/notification.mp3');
        audio.loop = true;
        audio.volume = 0.8;
        audio.preload = 'auto';
        
        // ✅ Esperar a que el audio esté completamente cargado
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            console.log('✅ Audio cargado y listo');
            resolve();
          }, { once: true });
          
          audio.addEventListener('error', (e) => {
            console.error('❌ Error cargando audio:', e);
            reject(e);
          }, { once: true });
          
          // Timeout de 5 segundos
          setTimeout(() => reject(new Error('Timeout cargando audio')), 5000);
        });
        
        audioRef.current = audio;
        setAudioListo(true);
      } catch (error) {
        console.error('❌ Error inicializando audio:', error);
        setAudioListo(false);
      }
    };

    initAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (parpadeadorRef.current) {
        clearInterval(parpadeadorRef.current);
        parpadeadorRef.current = null;
        document.title = 'PANEL ADMIN | INICIO - PUNTOSUR';
      }
    };
  }, []);

  const habilitarNotificaciones = useCallback(async () => {
    try {
      console.log('🔓 Habilitando notificaciones...');
      
      if (audioRef.current && !audioListo) {
        // Intentar reproducir un sonido silencioso para desbloquear
        audioRef.current.volume = 0.01;
        try {
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.volume = 0.8;
          audioRef.current.currentTime = 0;
          setAudioListo(true);
        } catch (e) {
          console.warn('⚠️ No se pudo desbloquear audio automáticamente:', e);
        }
      }
      
      localStorage.setItem('audio_habilitado', 'true');
      setSonidoHabilitado(true);
      
      return true;
    } catch (error) {
      console.error('❌ Error habilitando audio:', error);
      return false;
    }
  }, [audioListo]);

  const iniciarParpadeorTitulo = useCallback((pedido) => {
    if (parpadeadorRef.current) {
      clearInterval(parpadeadorRef.current);
    }

    const tituloOriginal = 'PANEL ADMIN | INICIO - PUNTOSUR';
    const tituloAlerta = `🚨 NUEVO PEDIDO #${pedido.id_pedido} - PUNTOSUR`;
    let parpadeando = true;

    document.title = tituloAlerta;

    parpadeadorRef.current = setInterval(() => {
      document.title = parpadeando ? tituloAlerta : tituloOriginal;
      parpadeando = !parpadeando;
    }, 1000);

    console.log(`📋 Parpadeo del título iniciado para pedido #${pedido.id_pedido}`);
  }, []);

  const detenerParpadeorTitulo = useCallback(() => {
    if (parpadeadorRef.current) {
      clearInterval(parpadeadorRef.current);
      parpadeadorRef.current = null;
    }
    document.title = 'PANEL ADMIN | INICIO - PUNTOSUR';
    console.log('⏹️ Parpadeo del título detenido');
  }, []);

  const reproducirSonidoNotificacion = useCallback(async () => {
    if (!sonidoHabilitado || !audioListo || !audioRef.current) {
      console.log('🔇 Sonido no disponible:', { sonidoHabilitado, audioListo, audioRef: !!audioRef.current });
      return false;
    }

    try {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Audio reproduciéndose en loop');
        return true;
      }
    } catch (error) {
      console.error('❌ Error reproduciendo audio:', error);
      
      // Si falla por política del navegador, intentar habilitar
      if (error.name === 'NotAllowedError') {
        console.warn('⚠️ Audio bloqueado por el navegador. Requiere interacción del usuario.');
      }
    }
    return false;
  }, [sonidoHabilitado, audioListo]);

  const detenerSonidoNotificacion = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('⏹️ Sonido detenido completamente');
    }
  }, []);

  // ✅ FUNCIÓN DE CHECKEO MEJORADA - USA SOLO REFS
  const checkearNuevosPedidos = useCallback(async () => {
    // 🔑 Prevenir ejecuciones simultáneas
    if (isCheckingRef.current) {
      console.log('⏭️ Checkeo ya en progreso, saltando...');
      return;
    }

    isCheckingRef.current = true;

    try {
      console.log('🔄 Chequeando nuevos pedidos...');
      const response = await axiosAuth.get('/admin/pedidos-pendientes-check');
      
      if (response.data && Array.isArray(response.data)) {
        const pedidosActuales = response.data;
        
        // ✅ USAR REF EN LUGAR DE STATE
        const pedidosAnterioresActual = pedidosAnterioresRef.current;
        
        // Primera ejecución - solo guardar
        if (pedidosAnterioresActual.length === 0) {
          console.log('📝 Primera carga - guardando', pedidosActuales.length, 'pedidos');
          pedidosAnterioresRef.current = pedidosActuales;
          setUltimoCheckeo(new Date());
          return;
        }

        // Detectar nuevos pedidos comparando IDs
        const idsAnteriores = new Set(pedidosAnterioresActual.map(p => p.id_pedido));
        const pedidosNuevos = pedidosActuales.filter(p => !idsAnteriores.has(p.id_pedido));
        
        if (pedidosNuevos.length > 0) {
          const pedidoNuevo = pedidosNuevos[pedidosNuevos.length - 1];
          console.log(`🚨 ¡NUEVO PEDIDO DETECTADO! #${pedidoNuevo.id_pedido}`);
          console.log('📊 Pedidos anteriores:', pedidosAnterioresActual.length, '| Actuales:', pedidosActuales.length);
          
          // Actualizar estado para mostrar notificación
          setNuevoPedido(pedidoNuevo);
          setMostrarNotificacion(true);
          
          // Iniciar efectos visuales y sonoros
          iniciarParpadeorTitulo(pedidoNuevo);
          
          setTimeout(async () => {
            const audioIniciado = await reproducirSonidoNotificacion();
            console.log(`🔊 Audio ${audioIniciado ? 'INICIADO' : 'NO INICIADO'}`);
          }, 500);
          
          // Actualizar ref con nuevos pedidos
          pedidosAnterioresRef.current = pedidosActuales;
        } else {
          console.log('✅ Sin nuevos pedidos. Total:', pedidosActuales.length);
        }
        
        setUltimoCheckeo(new Date());
      }
    } catch (error) {
      console.error('❌ Error chequeando pedidos:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [iniciarParpadeorTitulo, reproducirSonidoNotificacion]);

  // ✅ FUNCIÓN DE INICIO DE MONITOREO MEJORADA
  const iniciarMonitoreo = useCallback((intervalo = 60000) => {
    console.log(`🔄 Iniciando monitoreo (cada ${intervalo/1000}s)`);
    
    // 🔑 CRÍTICO: Limpiar intervalo anterior si existe
    if (intervalRef.current) {
      console.log('🧹 Limpiando intervalo anterior...');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Ejecutar inmediatamente
    checkearNuevosPedidos();
    
    // Configurar intervalo
    intervalRef.current = setInterval(() => {
      console.log('⏰ Ejecutando checkeo programado...');
      checkearNuevosPedidos();
    }, intervalo);
    
    console.log('✅ Monitoreo iniciado correctamente');
  }, [checkearNuevosPedidos]);

  const detenerMonitoreo = useCallback(() => {
    console.log('⏹️ Deteniendo monitoreo completo');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    detenerSonidoNotificacion();
    detenerParpadeorTitulo();
  }, [detenerSonidoNotificacion, detenerParpadeorTitulo]);

  const cerrarNotificacion = useCallback(() => {
    console.log('❌ Cerrando notificación y recargando página...');
    
    // ✅ Detener TODO antes de recargar
    detenerSonidoNotificacion();
    detenerParpadeorTitulo();
    setMostrarNotificacion(false);
    setNuevoPedido(null);
    
    // Recargar después de un pequeño delay
    setTimeout(() => {
      console.log('🔄 Recargando página...');
      window.location.reload(true);
    }, 100);
  }, [detenerSonidoNotificacion, detenerParpadeorTitulo]);

  return {
    ultimoCheckeo,
    nuevoPedido,
    mostrarNotificacion,
    sonidoHabilitado,
    audioListo,
    iniciarMonitoreo,
    detenerMonitoreo,
    cerrarNotificacion,
    detenerSonido: detenerSonidoNotificacion,
    habilitarNotificaciones
  };
};