import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mushroom-icon.svg'],
      manifest: {
        name: '皮克敏蘑菇時間紀錄器',
        short_name: '蘑菇紀錄器',
        description: '專為皮克敏 Bloom 設計之 OLED 省電蘑菇出現與重生時間追蹤器',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'mushroom-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'mushroom-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'mushroom-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ]
});
