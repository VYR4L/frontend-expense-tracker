import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (env.DOCKER) {
    return {
      plugins: [react()],
      define: {
        '__BACKEND_URL__': JSON.stringify('BACKEND_URL_PLACEHOLDER__')
      },
      build: {
        sourcemap: mode !== 'production'
      }
    };
  }

  return {
    plugins: [react()],
    define: {
      '__BACKEND_URL__': mode === 'production'
        ? JSON.stringify(env.BACKEND_URL)
        //? JSON.stringify('BACKEND_URL_PLACEHOLDER__') //TODO: ajustar 'BACKEND_URL_PLACEHOLDER__'
        : JSON.stringify(env.BACKEND_URL || 'http://localhost:3001')
    },
    build: {
      sourcemap: mode !== 'production'
    }
  };
});
