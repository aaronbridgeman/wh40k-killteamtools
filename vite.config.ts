import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Plugin to create .nojekyll file for GitHub Pages
function createNoJekyllPlugin() {
  return {
    name: 'create-nojekyll',
    closeBundle() {
      const outDir = 'docs';
      const nojekyllPath = path.resolve(__dirname, outDir, '.nojekyll');
      fs.writeFileSync(nojekyllPath, '');
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), createNoJekyllPlugin()],
  base: '/wh40k-killteamtools/',
  build: {
    outDir: 'docs',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
