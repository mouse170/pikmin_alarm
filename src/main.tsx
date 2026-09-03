import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// 註冊 Service Worker 實現離線使用與快取
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('應用程式有新版本可用');
  },
  onOfflineReady() {
    console.log('皮克敏蘑菇追蹤器已準備好離線使用');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
