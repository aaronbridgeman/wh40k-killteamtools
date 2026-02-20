import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Plugin to create .nojekyll file for GitHub Pages
function createNoJekyllPlugin(outDir: string) {
  return {
    name: 'create-nojekyll',
    closeBundle() {
      try {
        const nojekyllPath = path.resolve(__dirname, outDir, '.nojekyll');
        // Ensure the directory exists before writing
        if (fs.existsSync(path.resolve(__dirname, outDir))) {
          fs.writeFileSync(nojekyllPath, '');
        }
      } catch (error) {
        console.warn('Warning: Failed to create .nojekyll file:', error);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), createNoJekyllPlugin('docs')],
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
