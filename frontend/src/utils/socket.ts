import {Manager} from "socket.io-client";
import { SOCKET_BASE_URL } from '../constants';

const manager = new Manager(`${SOCKET_BASE_URL}`, {
  transports: ['websocket'],
  autoConnect: false,
  withCredentials: false,
  reconnectionAttempts: 10,
  tryAllTransports: true,
  timeout:5000
})

export const socketClient = manager.socket('/')

const socketClient = new WebSocket(`${SOCKET_BASE_URL}/socket.io`)

// console.log("socketClient.connected: ", socketClient.connected)
// export const socketClient = io(`${SOCKET_BASE_URL}/ws/vehicle_count_group`, {
//   transports: ['websocket'],
//   autoConnect: true,
//   withCredentials: false,
//   reconnectionAttempts: 10,
// });

// console.log("socketClient.connected: ", socketClient.connected)
//
// socketClient.on('connection', (socket) => {
//   console.log("Socket onnn ")
// })
