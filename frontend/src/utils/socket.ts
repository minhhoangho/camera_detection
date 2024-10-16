import {io} from "socket.io-client";
import { SOCKET_BASE_URL } from '../constants';

export const socketClient = io(`${SOCKET_BASE_URL}/ws/vehicle_count_group`, {
  transports: ['websocket'],
  autoConnect: true,
  withCredentials: false,
  reconnectionAttempts: 10,
});

socketClient.on('connect', () => {
  console.log('Connected to WebSocket server');
});
