import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        // Garantiza una sola instancia de React (evita "Invalid hook call").
        dedupe: ['react', 'react-dom'],
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
