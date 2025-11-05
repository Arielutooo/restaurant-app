import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

/**
 * Hook para conectar con WebSocket y suscribirse a eventos de una orden
 * @param {string} orderId - ID de la orden a escuchar
 * @param {function} onOrderUpdated - Callback cuando la orden se actualiza
 * @param {function} onItemAdded - Callback cuando se agrega un item
 * @param {function} onItemStatusUpdated - Callback cuando cambia estado de item
 * @returns {object} { socket, isConnected }
 */
export const useOrderChannel = (orderId, onOrderUpdated, onItemAdded, onItemStatusUpdated) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    // Crear conexión
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      setIsConnected(true);
      
      // Unirse a la sala de la orden
      socket.emit('join:order', orderId);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
      setIsConnected(false);
    });

    // Escuchar eventos de orden
    socket.on('order:updated', (data) => {
      console.log('📡 order:updated recibido:', data);
      if (onOrderUpdated) {
        onOrderUpdated(data);
      }
    });

    socket.on('order:item_added', (data) => {
      console.log('📡 order:item_added recibido:', data);
      if (onItemAdded) {
        onItemAdded(data);
      }
    });

    socket.on('order:item_status', (data) => {
      console.log('📡 order:item_status recibido:', data);
      if (onItemStatusUpdated) {
        onItemStatusUpdated(data);
      }
    });

    // Cleanup
    return () => {
      console.log('🔌 Cerrando WebSocket');
      socket.disconnect();
    };
  }, [orderId, onOrderUpdated, onItemAdded, onItemStatusUpdated]);

  return { socket: socketRef.current, isConnected };
};

/**
 * Hook para que el staff se suscriba a eventos generales
 * @param {string} role - Rol del staff ('kitchen' | 'waiter')
 * @param {function} onEvent - Callback para eventos
 * @returns {object} { socket, isConnected }
 */
export const useStaffChannel = (role, onEvent) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!role) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`🔌 Staff WebSocket conectado (${role})`);
      setIsConnected(true);
      socket.emit('join:staff', role);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Staff WebSocket desconectado');
      setIsConnected(false);
    });

    // Escuchar todos los eventos y delegar al callback
    socket.onAny((eventName, data) => {
      console.log(`📡 ${eventName} recibido:`, data);
      if (onEvent) {
        onEvent(eventName, data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [role, onEvent]);

  return { socket: socketRef.current, isConnected };
};

/**
 * Hook para escuchar mesas abiertas (para garzón)
 * @param {function} onTableUpdated - Callback cuando una mesa se actualiza
 * @returns {object} { socket, isConnected }
 */
export const useOpenTablesChannel = (onTableUpdated) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Open Tables WebSocket conectado');
      setIsConnected(true);
      socket.emit('join:open_tables');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('table:updated', (data) => {
      console.log('📡 table:updated recibido:', data);
      if (onTableUpdated) {
        onTableUpdated(data);
      }
    });

    // También escuchar eventos de orden para actualizar
    socket.on('order:updated', (data) => {
      console.log('📡 order:updated recibido (open_tables):', data);
      if (onTableUpdated) {
        onTableUpdated({ type: 'order_updated', ...data });
      }
    });

    socket.on('order:item_added', (data) => {
      console.log('📡 order:item_added recibido (open_tables):', data);
      if (onTableUpdated) {
        onTableUpdated({ type: 'item_added', ...data });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [onTableUpdated]);

  return { socket: socketRef.current, isConnected };
};

