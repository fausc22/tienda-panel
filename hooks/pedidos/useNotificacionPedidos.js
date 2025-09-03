// hooks/pedidos/useNotificacionPedidos.js - VERSIÓN MEJORADA CON TÍTULO Y AUDIO
import { useState, useEffect, useRef, useCallback } from 'react';
import { axiosAuth } from '../../utils/apiClient';

export const useNotificacionesPedidos = () => {
  const [ultimoCheckeo, setUltimoCheckeo] = useState(null);
  const [pedidosAnteriores, setPedidosAnteriores] = useState([]);
  const [nuevoPedido, setNuevoPedido] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(false);
  const [audioListo, setAudioListo] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const parpadeadorRef = useRef(null); // NUEVO: Para controlar parpadeo del título

  // NUEVO: Verificar si audio está habilitado al cargar
  useEffect(() => {
    const audioHabilitado = localStorage.getItem('audio_habilitado') === 'true';
    setSonidoHabilitado(audioHabilitado);
    console.log('🔊 Audio habilitado desde localStorage:', audioHabilitado);
  }, []);

  // Inicializar audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        console.log('🎵 Inicializando audio...');
        const audio = new Audio('/panel/notification.mp3');
        audio.loop = true;
        audio.volume = 0.8;
        audio.preload = 'auto';
        
        audio.addEventListener('canplaythrough', () => {
          console.log('✅ Audio cargado y listo');
          setAudioListo(true);
        });
        
        audioRef.current = audio;
      } catch (error) {
        console.error('❌ Error inicializando audio:', error);
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
      }
      // NUEVO: Limpiar parpadeo del título
      if (parpadeadorRef.current) {
        clearInterval(parpadeadorRef.current);
        document.title = 'PANEL ADMIN | INICIO - PUNTOSUR';
      }
    };
  }, []);

  // NUEVO: Función para habilitar notificaciones (usuario debe hacer clic)
  const habilitarNotificaciones = useCallback(async () => {
    try {
      console.log('🔓 Habilitando notificaciones...');
      
      if (audioRef.current) {
        audioRef.current.volume = 0.01; // Casi silencioso
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.volume = 0.8; // Restaurar volumen
        audioRef.current.currentTime = 0;
      }
      
      localStorage.setItem('audio_habilitado', 'true');
      setSonidoHabilitado(true);
      
      return true;
    } catch (error) {
      console.error('❌ Error habilitando audio:', error);
      return false;
    }
  }, []);

  // NUEVO: Iniciar parpadeo del título
  const iniciarParpadeorTitulo = useCallback((pedido) => {
    // Limpiar parpadeo anterior si existe
    if (parpadeadorRef.current) {
      clearInterval(parpadeadorRef.current);
    }

    const tituloOriginal = 'PANEL ADMIN | INICIO - PUNTOSUR';
    const tituloAlerta = `🚨 NUEVO PEDIDO #${pedido.id_pedido} - PUNTOSUR`;
    let parpadeando = true;

    // Cambiar título inmediatamente
    document.title = tituloAlerta;

    // Iniciar parpadeo
    parpadeadorRef.current = setInterval(() => {
      document.title = parpadeando ? tituloAlerta : tituloOriginal;
      parpadeando = !parpadeando;
    }, 1000);

    console.log(`📋 Iniciado parpadeo del título para pedido #${pedido.id_pedido}`);
  }, []);

  // NUEVO: Detener parpadeo del título
  const detenerParpadeorTitulo = useCallback(() => {
    if (parpadeadorRef.current) {
      clearInterval(parpadeadorRef.current);
      parpadeadorRef.current = null;
    }
    document.title = 'PANEL ADMIN | INICIO - PUNTOSUR';
    console.log('⏹️ Parpadeo del título detenido');
  }, []);

  // Función para reproducir sonido
  const reproducirSonidoNotificacion = useCallback(async () => {
    if (!sonidoHabilitado || !audioListo || !audioRef.current) {
      console.log('🔇 Sonido no habilitado o no disponible');
      return false;
    }

    try {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Audio reproduciéndose');
        return true;
      }
    } catch (error) {
      console.error('❌ Error reproduciendo audio:', error);
    }
    return false;
  }, [sonidoHabilitado, audioListo]);

  // Función para detener sonido
  const detenerSonidoNotificacion = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('⏹️ Sonido detenido');
    }
  }, []);

  // Función para checkear nuevos pedidos - MODIFICADA
  const checkearNuevosPedidos = useCallback(async () => {
    try {
      const response = await axiosAuth.get('/admin/pedidos-pendientes-check');
      
      if (response.data && Array.isArray(response.data)) {
        const pedidosActuales = response.data;
        
        if (pedidosAnteriores.length === 0) {
          setPedidosAnteriores(pedidosActuales);
          setUltimoCheckeo(new Date());
          return;
        }

        const idsAnteriores = pedidosAnteriores.map(p => p.id_pedido);
        const pedidosNuevos = pedidosActuales.filter(p => !idsAnteriores.includes(p.id_pedido));
        
        if (pedidosNuevos.length > 0) {
          const pedidoNuevo = pedidosNuevos[pedidosNuevos.length - 1];
          console.log(`🚨 Nuevo pedido detectado: #${pedidoNuevo.id_pedido}`);
          
          setNuevoPedido(pedidoNuevo);
          setMostrarNotificacion(true);
          
          // 🔔 INICIAR PARPADEO DEL TÍTULO (SIEMPRE FUNCIONA)
          iniciarParpadeorTitulo(pedidoNuevo);
          
          // 🎵 INTENTAR REPRODUCIR SONIDO (SI ESTÁ HABILITADO)
          setTimeout(async () => {
            const audioIniciado = await reproducirSonidoNotificacion();
            console.log(`🔊 Audio: ${audioIniciado ? 'SÍ' : 'NO'}`);
          }, 500);
          
          setPedidosAnteriores(pedidosActuales);
        }
        
        setUltimoCheckeo(new Date());
      }
    } catch (error) {
      console.error('❌ Error chequeando pedidos:', error);
    }
  }, [pedidosAnteriores, iniciarParpadeorTitulo, reproducirSonidoNotificacion]);

  // Iniciar monitoreo
  const iniciarMonitoreo = useCallback((intervalo = 10000) => {
    console.log(`🔄 Iniciando monitoreo (cada ${intervalo/1000}s)`);
    
    checkearNuevosPedidos();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(checkearNuevosPedidos, intervalo);
  }, [checkearNuevosPedidos]);

  // Detener monitoreo
  const detenerMonitoreo = useCallback(() => {
    console.log('⏹️ Deteniendo monitoreo');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    detenerSonidoNotificacion();
    detenerParpadeorTitulo(); // NUEVO
  }, [detenerSonidoNotificacion, detenerParpadeorTitulo]);

  // Cerrar notificación - MODIFICADA
  const cerrarNotificacion = useCallback(() => {
    console.log('❌ Cerrando notificación...');
    
    detenerSonidoNotificacion();
    detenerParpadeorTitulo(); // NUEVO: Detener parpadeo
    setMostrarNotificacion(false);
    setNuevoPedido(null);
    
    setTimeout(() => {
      window.location.reload(true);
    }, 100);
  }, [detenerSonidoNotificacion, detenerParpadeorTitulo]);

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
    cerrarNotificacion,
    detenerSonido: detenerSonidoNotificacion,
    
    // NUEVAS funciones
    habilitarNotificaciones
  };
};