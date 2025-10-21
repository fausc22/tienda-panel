import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificacionNuevoPedido = ({ 
  mostrar, 
  pedido, 
  onCerrar, 
  onVerPedido,
  detenerSonido
}) => {
  
  // Logging para debug
  useEffect(() => {
    console.log('🔔 NotificacionNuevoPedido - Estado:', {
      mostrar,
      tienePedido: !!pedido,
      tieneDetenerSonido: typeof detenerSonido === 'function'
    });
  }, [mostrar, pedido, detenerSonido]);

  // Función mejorada para cerrar modal
 // SOLO LA PARTE DEL HANDLER - El resto del componente queda igual
const handleCerrar = () => {
  console.log('🔇 CERRANDO MODAL - Ejecutando acciones...');
  
  // ✅ 1. Detener sonido INMEDIATAMENTE
  if (typeof detenerSonido === 'function') {
    console.log('⏹️ Deteniendo sonido...');
    detenerSonido();
  }
  
  // ✅ 2. Ejecutar función de cierre (recargará la página)
  if (typeof onCerrar === 'function') {
    console.log('🔄 Ejecutando onCerrar (recarga de página)...');
    onCerrar();
  }
};

  // Función para ver pedido
  const handleVerPedido = () => {
    console.log('👁️ Abriendo pedido desde notificación...');
    
    // 1. Detener sonido
    if (typeof detenerSonido === 'function') {
      detenerSonido();
    }
    
    // 2. Ver pedido si existe la función
    if (typeof onVerPedido === 'function' && pedido) {
      onVerPedido(pedido);
    }
    
    // 3. Cerrar modal (que recargará la página)
    if (typeof onCerrar === 'function') {
      onCerrar();
    }
  };

  // No renderizar si no debe mostrar o no hay pedido
  if (!mostrar || !pedido) {
    console.log('🚫 No renderizando modal:', { mostrar, tienePedido: !!pedido });
    return null;
  }

  console.log('✅ Renderizando NotificacionNuevoPedido con pedido:', pedido);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center p-4"
        style={{ zIndex: 9999 }} // Asegurar que esté encima de todo
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // NO cerrar al hacer click en el fondo - forzar uso de botones
        }}
      >
        {/* Modal con animación de bounce y parpadeo MÁS LLAMATIVO */}
        <motion.div
          key="modal-content"
          initial={{ scale: 0, rotateZ: -10 }}
          animate={{ 
            scale: 1, 
            rotateZ: 0,
            boxShadow: [
              "0 0 0px rgba(239, 68, 68, 0.5)",
              "0 0 80px rgba(239, 68, 68, 1)", 
              "0 0 0px rgba(239, 68, 68, 0.5)"
            ]
          }}
          exit={{ scale: 0, rotateZ: 10 }}
          transition={{ 
            type: "spring", 
            stiffness: 400,
            damping: 15,
            boxShadow: { repeat: Infinity, duration: 0.8 }
          }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-red-500 relative"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Header con animación de parpadeo MÁS INTENSA */}
          <motion.div
            animate={{
              backgroundColor: [
                "rgb(239, 68, 68)",   // red-500
                "rgb(249, 115, 22)",  // orange-500  
                "rgb(239, 68, 68)",   // red-500
                "rgb(220, 38, 38)",   // red-600
                "rgb(248, 113, 113)", // red-400
              ]
            }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="p-6 text-white text-center relative"
          >
            {/* Botón X para cerrar - MÁS VISIBLE */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCerrar();
              }}
              className="absolute top-3 right-3 w-10 h-10 bg-black bg-opacity-30 hover:bg-opacity-60 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all transform hover:scale-110"
              title="Cerrar notificación"
            >
              ✕
            </button>

            <motion.h2 
              animate={{ 
                scale: [1, 1.15, 1],
                textShadow: [
                  "0 0 0px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,1)",
                  "0 0 0px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-3xl font-black mb-2 drop-shadow-lg"
            >
              🚨 NUEVO PEDIDO 🚨
            </motion.h2>
            
            <motion.p 
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-xl font-bold opacity-90"
            >
              ¡ATENCIÓN REQUERIDA!
            </motion.p>
            
            {/* Ondas de notificación MÁS VISIBLES Y RÁPIDAS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute border-4 border-white rounded-full"
                    animate={{
                      scale: [0, 3, 6],
                      opacity: [1, 0.6, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      marginLeft: '-20px',
                      marginTop: '-20px'
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contenido del pedido */}
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="text-center mb-6">
              <motion.div 
                className="text-8xl mb-4"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                📋
              </motion.div>
              
              <div className="space-y-3">
                <motion.div 
                  className="bg-white rounded-lg p-4 shadow-lg border-2 border-red-200"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <h3 className="text-2xl font-black text-red-700 mb-3">
                    Pedido #{pedido.id_pedido}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold">Cliente:</span>
                      <span className="font-bold text-blue-700 text-lg">
                        {pedido.cliente || 'Cliente no especificado'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold">Total:</span>
                      <span className="font-black text-green-600 text-xl">
                        ${Number(pedido.monto_total || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold">Productos:</span>
                      <span className="font-bold text-purple-600 text-lg">
                        {pedido.cantidad_productos || 0} items
                      </span>
                    </div>
                    
                    {pedido.telefono_cliente && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-semibold">Teléfono:</span>
                        <span className="font-bold text-gray-800">
                          {pedido.telefono_cliente}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Botones de acción - MÁS GRANDES Y LLAMATIVOS */}
            <div className="flex flex-col gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleVerPedido();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-xl transition-all text-lg flex items-center justify-center shadow-lg"
              >
                👁️ VER PEDIDO COMPLETO
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(107, 114, 128, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCerrar();
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-black py-4 px-8 rounded-xl transition-all text-lg flex items-center justify-center shadow-lg"
              >
                ✅ ENTENDIDO - CERRAR
              </motion.button>
            </div>

            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                🔔 Pedido recibido: {new Date().toLocaleTimeString()}
              </p>
              
              {/* Indicador de audio activo - MÁS VISIBLE */}
              <motion.div
                animate={{ 
                  backgroundColor: [
                    "rgba(239, 68, 68, 0.1)",
                    "rgba(239, 68, 68, 0.3)", 
                    "rgba(239, 68, 68, 0.1)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="p-3 rounded-lg border border-red-200"
              >
                <span className="text-sm text-red-700 font-bold flex items-center justify-center">
                  🔊 SONANDO HASTA CERRAR ESTA VENTANA
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};