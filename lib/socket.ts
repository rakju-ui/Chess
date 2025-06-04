
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    // For Replit environment, use the external port 5000
    let serverUrl;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('.replit.dev')) {
        // In Replit, use the external port directly
        serverUrl = `${window.location.protocol}//${hostname}:5000`;
      } else {
        // Local development
        serverUrl = `${window.location.protocol}//${hostname}:5000`;
      }
    } else {
      serverUrl = 'http://localhost:5000';
    }
    
    console.log('Connecting to socket server at:', serverUrl);
    
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from socket server:', reason);
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
