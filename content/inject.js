// QR Camera - Main World Injection Script
// Intercepts MediaDevices.prototype.getUserMedia & navigator.mediaDevices.getUserMedia

(function () {
  'use strict';

  if (window.__QR_CAMERA_HOOKED__) {
    // If already hooked, just read latest config from DOM if available
    readConfigFromDOM();
    return;
  }
  window.__QR_CAMERA_HOOKED__ = true;

  // Active Configuration
  let config = {
    enabled: true, // Default to true if active
    text: 'SAMPLE-QR-001',
    qrDataUrl: '',
    showWatermark: true,
    scanEffect: 'clean'
  };

  // Attempt to read config from DOM attribute synchronously
  function readConfigFromDOM() {
    try {
      if (document.documentElement) {
        const domCfg = document.documentElement.getAttribute('data-qr-camera-config');
        if (domCfg) {
          const parsed = JSON.parse(domCfg);
          config = { ...config, ...parsed };
          sessionStorage.setItem('__qr_camera_cache__', JSON.stringify(config));
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // Attempt to restore synchronous cache from sessionStorage
  try {
    const cached = sessionStorage.getItem('__qr_camera_cache__');
    if (cached) {
      const parsed = JSON.parse(cached);
      config = { ...config, ...parsed };
    }
  } catch (e) {}

  readConfigFromDOM();

  // Listen for custom event from isolated content script
  window.addEventListener('__QR_CAMERA_CONFIG__', (event) => {
    if (event.detail) {
      config = { ...config, ...event.detail };
      try {
        sessionStorage.setItem('__qr_camera_cache__', JSON.stringify(config));
      } catch (e) {}
      updateQRCodeImage();
      updateOnScreenBadge();
    }
  });

  // Listen for window postMessage
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;
    if (event.data.source === 'QR_CAMERA_EXTENSION' && event.data.type === 'UPDATE_CONFIG') {
      const newCfg = event.data.config;
      if (newCfg) {
        config = { ...config, ...newCfg };
        try {
          sessionStorage.setItem('__qr_camera_cache__', JSON.stringify(config));
        } catch (e) {}
        updateQRCodeImage();
        updateOnScreenBadge();
      }
    }
  });

  // Request fresh config
  window.postMessage({ source: 'QR_CAMERA_PAGE', type: 'REQUEST_CONFIG' }, '*');

  // Virtual Canvas Setup (Standard 720p HD Webcam stream)
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.style.display = 'none';
  const ctx = canvas.getContext('2d', { alpha: false });

  let qrImage = new Image();
  let isImageLoaded = false;
  let laserY = 0;
  let laserDirection = 1;
  let frameCounter = 0;
  let animationTimer = null;
  let activeStream = null;

  function updateQRCodeImage() {
    if (config.qrDataUrl) {
      qrImage.onload = () => {
        isImageLoaded = true;
        renderFrame();
      };
      qrImage.src = config.qrDataUrl;
    } else {
      isImageLoaded = false;
      renderFrame();
    }
  }

  if (config.qrDataUrl) {
    updateQRCodeImage();
  }

  // Render a frame of the virtual camera stream
  function renderFrame() {
    frameCounter++;

    // 1. Background (Pure Crisp White for highest scanner contrast)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Card Container
    const cardSize = 580;
    const cardX = (CANVAS_WIDTH - cardSize) / 2;
    const cardY = (CANVAS_HEIGHT - cardSize) / 2 - 20;

    ctx.fillStyle = '#FAFAFA';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cardX - 20, cardY - 20, cardSize + 40, cardSize + 40, 16);
    ctx.fill();
    ctx.stroke();

    // 3. Draw QR Code
    if (isImageLoaded && qrImage.complete && qrImage.naturalWidth > 0) {
      ctx.drawImage(qrImage, cardX, cardY, cardSize, cardSize);

      // Optional Animated Laser Scanline effect
      if (config.scanEffect === 'laser') {
        laserY += 4 * laserDirection;
        if (laserY > cardSize) {
          laserY = cardSize;
          laserDirection = -1;
        } else if (laserY < 0) {
          laserY = 0;
          laserDirection = 1;
        }

        ctx.save();
        const beamY = cardY + laserY;
        const grad = ctx.createLinearGradient(0, beamY - 8, 0, beamY + 8);
        grad.addColorStop(0, 'rgba(225, 6, 0, 0)');
        grad.addColorStop(0.5, 'rgba(225, 6, 0, 0.45)');
        grad.addColorStop(1, 'rgba(225, 6, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(cardX, beamY - 8, cardSize, 16);

        ctx.strokeStyle = 'rgba(225, 6, 0, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX, beamY);
        ctx.lineTo(cardX + cardSize, beamY);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Fallback placeholder
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR CAMERA BYPASS ACTIVE', CANVAS_WIDTH / 2, cardY + cardSize / 2 - 30);

      ctx.fillStyle = '#64748B';
      ctx.font = '20px sans-serif';
      ctx.fillText('Buka Ekstensi untuk Generate QR Code', CANVAS_WIDTH / 2, cardY + cardSize / 2 + 10);

      ctx.fillStyle = '#E10600';
      ctx.font = '16px monospace';
      ctx.fillText(`Text: "${config.text}"`, CANVAS_WIDTH / 2, cardY + cardSize / 2 + 50);
    }

    // 4. Status Watermark
    if (config.showWatermark) {
      // Top status badge
      ctx.save();
      const badgeText = '● QR CAMERA VIRTUAL BYPASS';
      ctx.font = 'bold 16px sans-serif';
      const textWidth = ctx.measureText(badgeText).width;
      const bX = (CANVAS_WIDTH - textWidth - 40) / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(bX, 16, textWidth + 40, 34, 17);
      ctx.fill();

      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(bX + 18, 33, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText(badgeText.replace('● ', ''), bX + 28, 39);
      ctx.restore();

      // Bottom info caption
      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      const displayStr = config.text ? (config.text.length > 50 ? config.text.substring(0, 47) + '...' : config.text) : 'EMPTY';
      ctx.fillText(`DATA: ${displayStr}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 32);
      ctx.restore();
    }

    // 5. Corner modulation pixel at (0, 0)
    // Ensures canvas.captureStream(30) generates real video frames at 30fps
    const modVal = frameCounter % 2 === 0 ? 255 : 254;
    ctx.fillStyle = `rgb(${modVal}, ${modVal}, ${modVal})`;
    ctx.fillRect(0, 0, 2, 2);
  }

  function startAnimationLoop() {
    if (!animationTimer) {
      animationTimer = setInterval(renderFrame, 1000 / 30);
    }
  }

  function stopAnimationLoop() {
    if (animationTimer && (!activeStream || !activeStream.active)) {
      clearInterval(animationTimer);
      animationTimer = null;
    }
  }

  // Floating On-Screen Notification Pill
  let badgeEl = null;
  function updateOnScreenBadge() {
    if (!config.enabled) {
      if (badgeEl) badgeEl.remove();
      badgeEl = null;
      return;
    }
    if (!document.body) return;

    if (!badgeEl) {
      badgeEl = document.createElement('div');
      badgeEl.id = 'qr-camera-live-pill';
      badgeEl.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 2147483647;
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid rgba(225, 6, 0, 0.6);
        border-radius: 20px;
        padding: 6px 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        pointer-events: auto;
        cursor: default;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(badgeEl);
    }

    const shortText = config.text ? (config.text.length > 20 ? config.text.substring(0, 18) + '...' : config.text) : 'None';
    badgeEl.innerHTML = `
      <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 6px #22c55e;"></span>
      <span>QR Camera: <b style="color: #ff6b66;">${shortText}</b></span>
    `;
  }

  // Core Interceptor Handler
  async function handleGetUserMedia(targetContext, constraints, origMethod) {
    readConfigFromDOM();

    if (!config.enabled) {
      console.info('[QR Camera] Bypass is OFF. Using native laptop webcam.');
      return origMethod.call(targetContext, constraints);
    }

    console.info('%c[QR Camera] 🎥 CAMERA BYPASS ACTIVE!', 'background: #e10600; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
    console.info('[QR Camera] Feeding virtual QR Code stream for text:', config.text);

    // Initial render
    renderFrame();
    startAnimationLoop();

    // Capture MediaStream from canvas at 30fps
    const stream = canvas.captureStream(30);
    activeStream = stream;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = true;

      const origGetSettings = videoTrack.getSettings ? videoTrack.getSettings.bind(videoTrack) : () => ({});
      videoTrack.getSettings = function () {
        return {
          ...origGetSettings(),
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          frameRate: 30,
          aspectRatio: CANVAS_WIDTH / CANVAS_HEIGHT,
          facingMode: 'environment',
          deviceId: 'qr-camera-virtual-id',
          groupId: 'qr-camera-group'
        };
      };

      videoTrack.getCapabilities = function () {
        return {
          width: { min: 320, max: 1920 },
          height: { min: 240, max: 1080 },
          frameRate: { min: 1, max: 60 },
          aspectRatio: { min: 1, max: 2 },
          facingMode: ['environment', 'user'],
          deviceId: 'qr-camera-virtual-id',
          groupId: 'qr-camera-group'
        };
      };

      videoTrack.applyConstraints = async function () {
        return Promise.resolve();
      };

      videoTrack.addEventListener('ended', () => {
        stopAnimationLoop();
      });
    }

    // Audio fallback if site requests audio
    if (constraints && constraints.audio && origMethod) {
      try {
        const audioStream = await origMethod.call(targetContext, { audio: constraints.audio, video: false });
        const audioTrack = audioStream.getAudioTracks()[0];
        if (audioTrack) {
          stream.addTrack(audioTrack);
        }
      } catch (e) {}
    }

    // Show on-screen pill
    setTimeout(updateOnScreenBadge, 100);

    return stream;
  }

  // 1. Hook MediaDevices.prototype.getUserMedia (Catches ALL MediaDevices instances including Vue/Nuxt)
  if (typeof MediaDevices !== 'undefined' && MediaDevices.prototype && MediaDevices.prototype.getUserMedia) {
    const origProtoGetUserMedia = MediaDevices.prototype.getUserMedia;
    MediaDevices.prototype.getUserMedia = function (constraints) {
      return handleGetUserMedia(this, constraints, origProtoGetUserMedia);
    };
  }

  // 2. Hook navigator.mediaDevices.getUserMedia directly
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const origNavGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function (constraints) {
      return handleGetUserMedia(navigator.mediaDevices, constraints, origNavGetUserMedia);
    };
  }

  // 3. Hook MediaDevices.prototype.enumerateDevices
  if (typeof MediaDevices !== 'undefined' && MediaDevices.prototype && MediaDevices.prototype.enumerateDevices) {
    const origProtoEnumerateDevices = MediaDevices.prototype.enumerateDevices;
    MediaDevices.prototype.enumerateDevices = async function () {
      readConfigFromDOM();
      const devices = await origProtoEnumerateDevices.call(this);
      if (config.enabled) {
        const virtualDevice = {
          deviceId: 'qr-camera-virtual-id',
          groupId: 'qr-camera-group',
          kind: 'videoinput',
          label: 'QR Camera (Virtual Webcam)',
          toJSON: function () { return this; }
        };
        return [virtualDevice, ...devices.filter((d) => d.deviceId !== 'qr-camera-virtual-id')];
      }
      return devices;
    };
  }

  // 4. Hook navigator.mediaDevices.enumerateDevices directly
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    const origNavEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = async function () {
      readConfigFromDOM();
      const devices = await origNavEnumerateDevices();
      if (config.enabled) {
        const virtualDevice = {
          deviceId: 'qr-camera-virtual-id',
          groupId: 'qr-camera-group',
          kind: 'videoinput',
          label: 'QR Camera (Virtual Webcam)',
          toJSON: function () { return this; }
        };
        return [virtualDevice, ...devices.filter((d) => d.deviceId !== 'qr-camera-virtual-id')];
      }
      return devices;
    };
  }

  // 5. Legacy navigator.getUserMedia fallbacks
  const legacyGetUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  if (legacyGetUserMedia) {
    const origLegacy = legacyGetUserMedia.bind(navigator);
    const hookedLegacy = function (constraints, successCallback, errorCallback) {
      readConfigFromDOM();
      if (config.enabled && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(successCallback)
          .catch(errorCallback);
      } else {
        origLegacy(constraints, successCallback, errorCallback);
      }
    };

    navigator.getUserMedia = hookedLegacy;
    if (navigator.webkitGetUserMedia) navigator.webkitGetUserMedia = hookedLegacy;
    if (navigator.mozGetUserMedia) navigator.mozGetUserMedia = hookedLegacy;
  }

  console.info('[QR Camera] Engine hooked to MediaDevices prototype successfully.');
})();
