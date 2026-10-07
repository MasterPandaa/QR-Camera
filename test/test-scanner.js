// QR Camera - Test Scanner Logic

(async function () {
  const video = document.getElementById('videoElement');
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const cameraSelect = document.getElementById('cameraSelect');
  const resultText = document.getElementById('resultText');
  const logBox = document.getElementById('logBox');
  const scanCount = document.getElementById('scanCount');

  let currentStream = null;
  let detector = null;
  let scanInterval = null;
  let detections = 0;
  let lastScannedText = '';

  function log(msg) {
    const time = new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.textContent = `[${time}] ${msg}`;
    logBox.prepend(item);
  }

  // Sync config from extension storage into page context
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const stored = await chrome.storage.local.get(null);
      if (stored) {
        document.documentElement.setAttribute('data-qr-camera-config', JSON.stringify(stored));
        window.dispatchEvent(new CustomEvent('__QR_CAMERA_CONFIG__', { detail: stored }));
        log(`Config disinkronkan: ${stored.text} (${stored.enabled ? 'AKTIF' : 'NONAKTIF'})`);
      }
    } catch (e) {}
  }

  // Populate Cameras
  async function loadCameras() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        log('navigator.mediaDevices tidak didukung di browser ini.');
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      cameraSelect.innerHTML = '';

      if (videoDevices.length === 0) {
        const opt = document.createElement('option');
        opt.text = 'Kamera Default (Auto)';
        cameraSelect.appendChild(opt);
      } else {
        videoDevices.forEach((dev, idx) => {
          const opt = document.createElement('option');
          opt.value = dev.deviceId;
          opt.text = dev.label || `Kamera ${idx + 1}`;
          if (dev.deviceId === 'qr-camera-virtual-id') {
            opt.selected = true;
          }
          cameraSelect.appendChild(opt);
        });
      }
      log(`Ditemukan ${videoDevices.length} perangkat video.`);
    } catch (e) {
      log('Gagal mendeteksi daftar kamera: ' + e.message);
    }
  }

  await loadCameras();

  // Initialize Barcode Detector if available
  if ('BarcodeDetector' in window) {
    try {
      detector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13'] });
      log('Native BarcodeDetector API aktif.');
    } catch (e) {
      log('Native BarcodeDetector tidak dapat diinisialisasi.');
    }
  } else {
    log('Browser tidak memiliki native BarcodeDetector API, scanner aktif dalam mode stream.');
  }

  // Start Camera
  btnStart.addEventListener('click', async () => {
    try {
      btnStart.disabled = true;
      const deviceId = cameraSelect.value;
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false
      };

      log('Meminta akses kamera via getUserMedia()...');
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = currentStream;
      await video.play();

      btnStop.disabled = false;
      log('Kamera aktif! Memulai loop pembacaan barcode...');
      resultText.textContent = 'Mendeteksi... Arahkan QR Code';

      startScanning();
    } catch (err) {
      log('Gagal membuka kamera: ' + err.message);
      btnStart.disabled = false;
    }
  });

  // Stop Camera
  btnStop.addEventListener('click', () => {
    stopScanning();
    if (currentStream) {
      currentStream.getTracks().forEach((t) => t.stop());
      currentStream = null;
    }
    video.srcObject = null;
    btnStart.disabled = false;
    btnStop.disabled = true;
    resultText.textContent = 'Kamera dihentikan.';
    log('Kamera dihentikan.');
  });

  function startScanning() {
    if (scanInterval) clearInterval(scanInterval);

    scanInterval = setInterval(async () => {
      if (!video.videoWidth || !video.videoHeight || video.paused) return;

      if (detector) {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            if (raw) {
              handleDetected(raw, barcodes[0].format);
            }
          }
        } catch (e) {
          // Frame decode skip
        }
      } else {
        // Fallback display
        resultText.textContent = 'Stream video aktif. (Silakan uji di web scanner target)';
      }
    }, 200);
  }

  function stopScanning() {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
  }

  function handleDetected(code, format) {
    if (code !== lastScannedText) {
      lastScannedText = code;
      detections++;
      scanCount.textContent = `Total Terdeteksi: ${detections}`;
      resultText.textContent = `[${format}] ${code}`;
      log(`🎯 BERHASIL SCAN: "${code}" (${format})`);
    }
  }
})();
