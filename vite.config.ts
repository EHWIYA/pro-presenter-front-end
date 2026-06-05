import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

const DEV_API_PROXY_PATH = '/api';

function resolveDevProxyTarget(apiBaseUrl: string | undefined): string {
  const trimmed = apiBaseUrl?.trim().replace(/\/$/, '') ?? '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return 'https://pro-api.iwhya.kr';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devProxyTarget = resolveDevProxyTarget(env.VITE_API_BASE_URL);

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Pro Presenter',
        short_name: 'ProApp',
        description: '성경 구절 빌드 및 ProPresenter 송출',
        theme_color: '#2e4b3e',
        background_color: '#f5f6f4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    // pro-api CORS는 pro-app만 허용 — 로컬은 동일 출처 /api 로 우회
    proxy: {
      [DEV_API_PROXY_PATH]: {
        target: devProxyTarget,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(new RegExp(`^${DEV_API_PROXY_PATH}`), ''),
      },
    },
  },
  };
});
