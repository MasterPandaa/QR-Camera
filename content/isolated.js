// QR Camera - Isolated World Content Script
// Bridges chrome.storage to page context with synchronous DOM attributes and script injection

(async function () {
  'use strict';

  // Read current configuration
  async function getConfig() {
    try {
      const data = await chrome.storage.local.get([
        'enabled',
        'text',
        'qrDataUrl',
        'showWatermark',
        'scanEffect'
      ]);
      return {
        enabled: data.enabled ?? true,
        text: data.text ?? 'SAMPLE-QR-001',
        qrDataUrl: data.qrDataUrl ?? '',
        showWatermark: data.showWatermark ?? true,
        scanEffect: data.scanEffect ?? 'clean'
      };
    } catch (e) {
      return null;
    }
  }

  function broadcastConfig(cfg) {
    if (!cfg) return;
    try {
      if (document.documentElement) {
        document.documentElement.setAttribute('data-qr-camera-config', JSON.stringify(cfg));
        document.documentElement.setAttribute('data-qr-camera-enabled', cfg.enabled ? 'true' : 'false');
      }
      window.dispatchEvent(new CustomEvent('__QR_CAMERA_CONFIG__', { detail: cfg }));
      window.postMessage({ source: 'QR_CAMERA_EXTENSION', type: 'UPDATE_CONFIG', config: cfg }, '*');
    } catch (e) {
      // Ignore context errors
    }
  }

  // Inject main world script tag if not already injected via manifest "world": "MAIN"
  function ensureInjected(initialCfg) {
    if (document.querySelector('script[data-qr-camera-injected="true"]')) return;
    try {
      const s = document.createElement('script');
      s.src = chrome.runtime.getURL('content/inject.js');
      s.dataset.qrCameraInjected = 'true';
      (document.head || document.documentElement || document).appendChild(s);
    } catch (e) {}
  }

  // 1. Initial Broadcast
  const initialConfig = await getConfig();
  if (initialConfig) {
    broadcastConfig(initialConfig);
    ensureInjected(initialConfig);
  }

  // 2. Storage Listener (Live updates from Popup)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      getConfig().then((newConfig) => {
        if (newConfig) {
          broadcastConfig(newConfig);
        }
      });
    }
  });

  // 3. Runtime Message Listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'PING') {
      sendResponse({ status: 'PONG', active: true });
      return true;
    }
    if (message.action === 'UPDATE_CONFIG' && message.config) {
      broadcastConfig(message.config);
      sendResponse({ status: 'OK' });
      return true;
    }
    return true;
  });

  // 4. Page Request Listener
  window.addEventListener('message', async (event) => {
    if (event.source !== window || !event.data) return;
    if (event.data.source === 'QR_CAMERA_PAGE' && event.data.type === 'REQUEST_CONFIG') {
      const cfg = await getConfig();
      if (cfg) broadcastConfig(cfg);
    }
  });
})();
