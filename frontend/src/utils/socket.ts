import {io} from "socket.io-client";
import { SOCKET_BASE_URL } from '../constants';

export const socket = io(`${SOCKET_BASE_URL}/vehicle_count_group`, {
  // transports: ['websocket'],
  transports: ["polling"],
  autoConnect: false,
  withCredentials: true,
  reconnectionAttempts: 10,
});
