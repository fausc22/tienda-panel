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
  const isCheckingRef = useRef(false); // 🔑 Prevenir race conditions
  const ultimoPedidoIdRef = useRef(null); // 🔑 ID del último pedido visto
  const notificacionVisibleRef = useRef(false); // 🔑 Flag para saber si la notificación está visible
  const sonidoHabilitadoRef = useRef(false); // 🔑 Ref para el estado del sonido
  const audioListoRef = useRef(false); // 🔑 Ref para el estado del audio
  const esPrimerChequeoRef = useRef(true); // 🔑 Flag para saber si es el primer chequeo después de cargar la página

  // Verificar audio habilitado al cargar
  useEffect(() => {
    const audioHabilitado = localStorage.getItem('audio_habilitado') === 'true';
    setSonidoHabilitado(audioHabilitado);
    sonidoHabilitadoRef.current = audioHabilitado; // 🔑 Mantener en ref también
    console.log('🔊 Audio habilitado desde localStorage:', audioHabilitado);

    // 🔑 Cargar último ID de pedido visto desde localStorage
    const ultimoIdGuardado = localStorage.getItem('ultimo_pedido_id');
    if (ultimoIdGuardado) {
      ultimoPedidoIdRef.current = parseInt(ultimoIdGuardado);
      console.log(`📋 Último pedido conocido desde localStorage: #${ultimoPedidoIdRef.current}`);
    } else {
      ultimoPedidoIdRef.current = 0; // Inicializar a 0 si no existe
      console.log('📋 No hay último pedido en localStorage. Inicializando a 0.');
    }
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
        audioListoRef.current = true; // 🔑 Mantener en ref también
      } catch (error) {
        console.error('❌ Error inicializando audio:', error);
        setAudioListo(false);
        audioListoRef.current = false; // 🔑 Mantener en ref también
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
      sonidoHabilitadoRef.current = true; // 🔑 Actualizar ref también
      
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
    // ✅ USAR REFS para evitar problemas de closure
    if (!sonidoHabilitadoRef.current || !audioListoRef.current || !audioRef.current) {
      console.log('🔇 Sonido no disponible:', { 
        sonidoHabilitado: sonidoHabilitadoRef.current, 
        audioListo: audioListoRef.current, 
        audioRef: !!audioRef.current 
      });
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
      // Asegurar que tenemos un valor numérico válido
      const ultimoIdEnviado = ultimoPedidoIdRef.current ?? 0;
      console.log('🔄 Chequeando nuevos pedidos...');
      console.log(`📤 Enviando ultimo_id: ${ultimoIdEnviado}`);
      console.log(`🏁 esPrimerChequeo: ${esPrimerChequeoRef.current}`);

      // Enviar el ID del último pedido visto como parámetro
      console.log(`🌐 [FRONTEND] Haciendo request con params:`, { ultimo_id: ultimoIdEnviado });

      const response = await axiosAuth.get('/admin/pedidos-pendientes-check', {
        params: {
          ultimo_id: ultimoIdEnviado
        }
      });

      console.log(`🌐 [FRONTEND] URL completa:`, response.config.url);

      console.log('📥 Respuesta del backend:', response.data);

      // 🔑 CRÍTICO: Actualizar el ultimo_id con lo que retorna el backend
      if (response.data && response.data.ultimo_id !== undefined) {
        const nuevoUltimoId = response.data.ultimo_id;

        // Si es el primer chequeo Y estábamos en 0, solo inicializar sin notificar
        if (esPrimerChequeoRef.current && ultimoPedidoIdRef.current === 0) {
          console.log(`🆕 [PRIMER CHEQUEO] Inicializando ultimo_pedido_id a #${nuevoUltimoId} (sin notificar)`);
          ultimoPedidoIdRef.current = nuevoUltimoId;
          localStorage.setItem('ultimo_pedido_id', nuevoUltimoId.toString());
          esPrimerChequeoRef.current = false; // Ya no es el primer chequeo
          setUltimoCheckeo(new Date());
          return; // Salir sin notificar
        }

        // Si NO es el primer chequeo, continuar con la lógica normal
        esPrimerChequeoRef.current = false;
      }

      // El backend devuelve { nuevo_pedido: true/false, pedido: {...} }
      if (response.data && response.data.nuevo_pedido) {
        const pedidoNuevo = response.data.pedido;

        // ⚠️ CRÍTICO: Si ya hay una notificación visible, no mostrar otra
        if (notificacionVisibleRef.current) {
          console.log('⏸️ Notificación ya visible, ignorando nuevo pedido hasta que se cierre');
          return;
        }

        console.log(`🚨 ¡NUEVO PEDIDO DETECTADO! #${pedidoNuevo.id_pedido}`);
        console.log('Pedido:', pedidoNuevo);

        // ⚠️ IMPORTANTE: Actualizar el último ID ANTES de mostrar notificación
        // Esto previene que se vuelva a mostrar el mismo pedido
        ultimoPedidoIdRef.current = pedidoNuevo.id_pedido;

        // 🔑 Guardar en localStorage para persistir entre recargas
        localStorage.setItem('ultimo_pedido_id', pedidoNuevo.id_pedido.toString());

        console.log(`💾 Actualizado ultimoPedidoIdRef a #${ultimoPedidoIdRef.current}`);

        // Actualizar estado para mostrar notificación
        notificacionVisibleRef.current = true; // Marcar como visible
        setNuevoPedido(pedidoNuevo);
        setMostrarNotificacion(true);

        // Iniciar efectos visuales y sonoros
        iniciarParpadeorTitulo(pedidoNuevo);

        // 🔊 Iniciar audio INMEDIATAMENTE (sin delay)
        setTimeout(async () => {
          const audioIniciado = await reproducirSonidoNotificacion();
          console.log(`🔊 Audio ${audioIniciado ? 'INICIADO' : 'NO INICIADO'}`);
        }, 100); // 100ms en lugar de 500ms

      } else {
        console.log('✅ Sin nuevos pedidos');
      }

      setUltimoCheckeo(new Date());
    } catch (error) {
      console.error('❌ Error chequeando pedidos:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [iniciarParpadeorTitulo, reproducirSonidoNotificacion]);

  // ✅ FUNCIÓN DE INICIO DE MONITOREO MEJORADA
  const iniciarMonitoreo = useCallback((intervalo = 60000) => {
    console.log(`🔄 Iniciando monitoreo (cada ${intervalo/1000}s)`);
    
    // 🔑 CRÍTICO: Cargar último ID de pedido SI AÚN NO SE HA CARGADO
    // Esto es necesario porque el useEffect puede no haberse ejecutado aún
    if (ultimoPedidoIdRef.current === null) {
      const ultimoIdGuardado = localStorage.getItem('ultimo_pedido_id');
      if (ultimoIdGuardado) {
        ultimoPedidoIdRef.current = parseInt(ultimoIdGuardado);
        console.log(`📋 Último pedido conocido (cargado al iniciar monitoreo): #${ultimoPedidoIdRef.current}`);
      } else {
        ultimoPedidoIdRef.current = 0; // Inicializar a 0 explícitamente
        console.log('📋 No hay último pedido conocido en localStorage. Inicializando a 0.');
      }
    }
    
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
    console.log('❌ Cerrando notificación...');
    console.log(`💾 Valor actual en localStorage: ${localStorage.getItem('ultimo_pedido_id')}`);
    console.log(`💾 Valor actual en ultimoPedidoIdRef: ${ultimoPedidoIdRef.current}`);

    // ✅ Detener TODO visual
    detenerSonidoNotificacion();
    detenerParpadeorTitulo();
    notificacionVisibleRef.current = false; // Marcar como cerrada
    setMostrarNotificacion(false);

    // ⚠️ Asegurar que el valor esté guardado
    if (ultimoPedidoIdRef.current !== null) {
      localStorage.setItem('ultimo_pedido_id', ultimoPedidoIdRef.current.toString());
      console.log(`💾 Guardado en localStorage: #${ultimoPedidoIdRef.current}`);
    }

    // Limpiar el pedido mostrado
    setNuevoPedido(null);

    console.log('✅ Notificación cerrada sin recargar página');
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