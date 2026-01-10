/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true, // Use global describe/it if preferred, but we imported them so it's fine.
        setupFiles: ['./src/setupTests.ts']
    },
});
