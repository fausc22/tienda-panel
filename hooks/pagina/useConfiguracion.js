// hooks/pagina/useConfiguracion.js - VERSIÓN CORREGIDA
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export const useConfiguracion = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Función para cargar configuración actual
  const cargarConfiguracion = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Cargando configuración...');
      
      const response = await axiosAuth.get('/admin/getConfig');
      
      // 🆕 FIX: Extraer data correctamente
      if (response.data && response.data.success) {
        const config = response.data.data || response.data;
        
        // 🆕 ASEGURAR QUE pageStatus SIEMPRE EXISTA
        const configuracionCompleta = {
          ...config,
          pageStatus: config.pageStatus || 'ACTIVA' // ← DEFAULT
        };
        
        setConfiguracion(configuracionCompleta);
        console.log('✅ Configuración cargada exitosamente:', configuracionCompleta);
      } else if (response.data) {
        // Si no tiene estructura success/data, usar directamente
        const configuracionCompleta = {
          ...response.data,
          pageStatus: response.data.pageStatus || 'ACTIVA'
        };
        
        setConfiguracion(configuracionCompleta);
        console.log('✅ Configuración cargada (formato alternativo):', configuracionCompleta);
      } else {
        console.warn('⚠️ Respuesta inesperada de configuración:', response.data);
        
        // 🆕 CONFIGURACIÓN POR DEFECTO
        const configuracionPorDefecto = {
          storeName: '',
          storeAddress: '',
          storePhone: '',
          storeDescription: '',
          storeInstagram: '',
          storeEmail: '',
          storeDeliveryBase: '0',
          storeDeliveryKm: '0',
          iva: '0',
          pageStatus: 'ACTIVA' // ← DEFAULT
        };
        
        setConfiguracion(configuracionPorDefecto);
      }
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      toast.error('Error al cargar la configuración');
      
      // 🆕 CONFIGURACIÓN DE FALLBACK
      const configuracionPorDefecto = {
        storeName: '',
        storeAddress: '',
        storePhone: '',
        storeDescription: '',
        storeInstagram: '',
        storeEmail: '',
        storeDeliveryBase: '0',
        storeDeliveryKm: '0',
        iva: '0',
        pageStatus: 'ACTIVA' // ← DEFAULT
      };
      
      setConfiguracion(configuracionPorDefecto);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para guardar configuración
  const guardarConfiguracion = useCallback(async (nuevaConfiguracion) => {
    if (!nuevaConfiguracion) {
      toast.error('No hay configuración para guardar');
      return false;
    }

    setGuardando(true);
    
    try {
      console.log('🔄 Guardando configuración...', nuevaConfiguracion);
      
      const response = await axiosAuth.post('/admin/saveConfig', nuevaConfiguracion);
      
      // 🆕 FIX: Validar respuesta correctamente
      if (response.data && (response.data.success || response.data.message)) {
        // 🆕 ASEGURAR pageStatus en la configuración guardada
        const configGuardada = {
          ...configuracion,
          ...nuevaConfiguracion,
          pageStatus: nuevaConfiguracion.pageStatus || 'ACTIVA'
        };
        
        setConfiguracion(configGuardada);
        console.log('✅ Configuración guardada exitosamente');
        toast.success('Configuración guardada correctamente');
        return true;
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      
      if (error.response?.status === 400) {
        toast.error('Datos de configuración inválidos');
      } else if (error.response?.status === 500) {
        toast.error('Error interno del servidor');
      } else {
        toast.error('Error al guardar la configuración');
      }
      return false;
    } finally {
      setGuardando(false);
    }
  }, [configuracion]);

  // Función para actualizar un campo específico
  const actualizarCampo = useCallback((campo, valor) => {
    setConfiguracion(prev => {
      if (!prev) {
        // 🆕 Si prev es null, crear objeto con el campo
        return {
          storeName: '',
          storeAddress: '',
          storePhone: '',
          storeDescription: '',
          storeInstagram: '',
          storeEmail: '',
          storeDeliveryBase: '0',
          storeDeliveryKm: '0',
          iva: '0',
          pageStatus: 'ACTIVA',
          [campo]: valor
        };
      }
      
      return {
        ...prev,
        [campo]: valor
      };
    });
  }, []);

  // Función para validar configuración
  const validarConfiguracion = useCallback((config) => {
    const errores = [];
    
    if (!config || typeof config !== 'object') {
      errores.push('Configuración inválida');
      return { esValido: false, errores };
    }
    
    if (!config.storeName || config.storeName.trim().length === 0) {
      errores.push('Nombre de la tienda es requerido');
    }
    
    if (!config.storeAddress || config.storeAddress.trim().length === 0) {
      errores.push('Dirección de la tienda es requerida');
    }
    
    if (!config.storePhone || config.storePhone.trim().length === 0) {
      errores.push('Teléfono de la tienda es requerido');
    }
    
    if (!config.storeEmail || config.storeEmail.trim().length === 0) {
      errores.push('Email de la tienda es requerido');
    } else if (!/\S+@\S+\.\S+/.test(config.storeEmail)) {
      errores.push('Email de la tienda no es válido');
    }
    
    if (config.storeDeliveryBase && isNaN(parseFloat(config.storeDeliveryBase))) {
      errores.push('Costo base de envío debe ser un número válido');
    }
    
    if (config.storeDeliveryKm && isNaN(parseFloat(config.storeDeliveryKm))) {
      errores.push('Costo por kilómetro debe ser un número válido');
    }
    
    if (config.iva && (isNaN(parseInt(config.iva)) || parseInt(config.iva) < 0 || parseInt(config.iva) > 4)) {
      errores.push('Nivel de IVA debe ser un número entre 0 y 4');
    }
    
    return {
      esValido: errores.length === 0,
      errores
    };
  }, []);

  // Función para obtener variables de entorno (solo lectura)
  const obtenerVariablesEnv = useCallback(async () => {
    try {
      console.log('🔄 Obteniendo variables de entorno...');
      
      const response = await axiosAuth.get('/admin/variablesenv');
      
      if (response.data) {
        console.log('✅ Variables de entorno obtenidas');
        return response.data;
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('❌ Error obteniendo variables de entorno:', error);
      toast.error('Error al obtener variables del sistema');
      return null;
    }
  }, []);

  // Función para resetear configuración a valores por defecto
  const resetearConfiguracion = useCallback(() => {
    const configuracionPorDefecto = {
      storeName: '',
      storeAddress: '',
      storePhone: '',
      storeDescription: '',
      storeInstagram: '',
      storeEmail: '',
      storeDeliveryBase: '0',
      storeDeliveryKm: '0',
      mercadoPagoToken: '',
      iva: '0',
      pageStatus: 'ACTIVA' // ← DEFAULT
    };
    
    setConfiguracion(configuracionPorDefecto);
    toast.info('Configuración reseteada a valores por defecto');
  }, []);

  return {
    // Estados
    configuracion,
    loading,
    guardando,
    
    // Funciones principales
    cargarConfiguracion,
    guardarConfiguracion,
    actualizarCampo,
    
    // Utilidades
    validarConfiguracion,
    obtenerVariablesEnv,
    resetearConfiguracion
  };
};