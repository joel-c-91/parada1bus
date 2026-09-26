import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// target del proxy hacia el backend.
//
// Por defecto apunta a localhost:8000, que es el caso normal cuando el backend
// corre directo en la maquina con `python manage.py runserver`.
//
// Dentro de Docker NO funciona: el container de Vite tiene su propio loopback,
// asi que "localhost:8000" seria el mismo container de Vite. Docker Compose lo
// resuelve con VITE_PROXY_TARGET=http://backend:8000 (el nombre del service).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_PROXY_TARGET || 'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': { target, changeOrigin: true },
        '/media': { target, changeOrigin: true },
      },
    },
  }
})
