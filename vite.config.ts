import { defineConfig } from 'vite';
export default defineConfig({ base: './', test: { environment: 'node' }, esbuild: { jsx: 'automatic' } });
