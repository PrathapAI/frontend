import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL;

export function getSocket() {
  let token = '';
  try {
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
      token = localStorage.getItem('token');
    }
  } catch (e) {
    token = '';
  }
  return io(SOCKET_URL, {
    auth: { token }
  });
}
