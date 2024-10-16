import {Manager} from "socket.io-client";
import { SOCKET_BASE_URL } from '../constants';

console.log("SOCKET_BASE_URL ", SOCKET_BASE_URL)
const manager = new Manager(`${SOCKET_BASE_URL}`, {
  transports: ['websocket'],
  autoConnect: true,
  withCredentials: false,
  reconnectionAttempts: 10,
})

export const socketClient = manager.socket('/')
// export const socketClient = io(`${SOCKET_BASE_URL}/ws/vehicle_count_group`, {
//   transports: ['websocket'],
//   autoConnect: true,
//   withCredentials: false,
//   reconnectionAttempts: 10,
// });

socketClient.on('connect', () => {
  console.log('Connected to WebSocket server');
});
