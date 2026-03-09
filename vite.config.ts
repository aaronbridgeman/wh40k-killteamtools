import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
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
  plugins: [
    react(),
    createNoJekyllPlugin('docs'),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icons/*.png'],
      manifest: {
        name: 'Kill Team Dataslate',
        short_name: 'KT Dataslate',
        description: 'A reference tool for Warhammer 40K Kill Team gameplay assistance',
        theme_color: '#1a1a2e',
        background_color: '#0f0f1e',
        display: 'standalone',
        scope: '/wh40k-killteamtools/',
        start_url: '/wh40k-killteamtools/',
        orientation: 'portrait',
        icons: [
          {
            src: '/wh40k-killteamtools/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/wh40k-killteamtools/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/wh40k-killteamtools/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/wh40k-killteamtools/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['games', 'utilities'],
        shortcuts: [
          {
            name: 'View Factions',
            short_name: 'Factions',
            description: 'Browse available Kill Team factions',
            url: '/wh40k-killteamtools/',
            icons: [{ src: '/wh40k-killteamtools/icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Nurgle Quick Play',
            short_name: 'Quick Play',
            description: 'Plague Marines Quick Play Event tracker',
            url: '/wh40k-killteamtools/?view=quick-play-event',
            icons: [{ src: '/wh40k-killteamtools/icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
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
