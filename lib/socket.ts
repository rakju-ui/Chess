
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    // For Replit environment, construct the correct URL
    let serverUrl;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Check if we're in a Replit environment
      if (hostname.includes('.replit.dev')) {
        // Replace the port number in the hostname for Replit
        serverUrl = `${window.location.protocol}//${hostname.replace(/^\d+/, '5000')}`;
      } else {
        // Local development
        serverUrl = `${window.location.protocol}//${hostname}:5000`;
      }
    } else {
      serverUrl = 'http://localhost:5000';
    }
    
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
