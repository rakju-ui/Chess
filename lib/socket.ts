
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    // For Replit environment, use the current domain with port 5000
    const serverUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.hostname.replace(/^\d+-/, '5000-')}`
      : 'http://localhost:5000';
    
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
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
