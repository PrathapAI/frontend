import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((req) => {
  let token = '';
  try {
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
      token = localStorage.getItem('token');
    }
  } catch (e) {
    token = '';
  }
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
