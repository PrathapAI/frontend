import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default {
  server: {
    proxy: {
      '/api': '//https://backend-293l.onrender.com'
    }
  }
}
