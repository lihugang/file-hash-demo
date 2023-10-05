import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';

export default defineConfig({
    plugins: [
        vue(),
        electron({
            entry: ['electron/index.ts', 'electron/preload/index.ts'],
            vite: {
                build: {
                    rollupOptions: {
                        external: [
                            'node-gyp',
                            'sqlite3',
                            'node-pty'
                        ],
                    },
                },
            },
        }),
    ],
    build: {
        emptyOutDir: false,
    },
    base: './'
});