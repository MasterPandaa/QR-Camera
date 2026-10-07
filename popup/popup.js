// QR Camera - Popup Logic

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const toggleBypass = document.getElementById('toggleBypass');
  const statusLabel = document.getElementById('statusLabel');
  const qrTextInput = document.getElementById('qrTextInput');
  const btnClear = document.getElementById('btnClear');
  const btnGenerate = document.getElementById('btnGenerate');
  const qrContainer = document.getElementById('qrContainer');
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  const streamIndicator = document.getElementById('streamIndicator');
  const charCount = document.getElementById('charCount');
  const btnCopy = document.getElementById('btnCopy');
  const btnDownload = document.getElementById('btnDownload');
  const historyList = document.getElementById('historyList');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const chkWatermark = document.getElementById('chkWatermark');
  const chkAutoReload = document.getElementById('chkAutoReload');
  const chkLaser = document.getElementById('chkLaser');
  const btnOpenTest = document.getElementById('btnOpenTest');
  const toast = document.getElementById('toast');
  const presetChips = document.querySelectorAll('.chip');

  let currentQrDataUrl = '';
  let activeHistoryText = '';

  // Show Toast
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // Update Character Count
  function updateCharCount() {
    const len = qrTextInput.value.length;
    charCount.textContent = `${len} karakter`;
  }
  qrTextInput.addEventListener('input', updateCharCount);

  // Update Status UI
  function updateStatusUI(isEnabled) {
    toggleBypass.checked = isEnabled;
    if (isEnabled) {
      statusLabel.textContent = 'AKTIF';
      statusLabel.className = 'status-badge status-on';
      streamIndicator.classList.remove('hidden');
    } else {
      statusLabel.textContent = 'OFF';
      statusLabel.className = 'status-badge status-off';
      streamIndicator.classList.add('hidden');
    }
  }

  // Generate QR Code as Data URL using QRCode library
  function createQrDataUrl(text) {
    return new Promise((resolve, reject) => {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        // Generate QR code with high error correction (H)
        const qrcode = new QRCode(tempDiv, {
          text: text,
          width: 512,
          height: 512,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });

        // Wait a tick for canvas rendering
        setTimeout(() => {
          const canvas = tempDiv.querySelector('canvas');
          if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            document.body.removeChild(tempDiv);
            resolve(dataUrl);
          } else {
            const img = tempDiv.querySelector('img');
            if (img && img.src) {
              const dataUrl = img.src;
              document.body.removeChild(tempDiv);
              resolve(dataUrl);
            } else {
              document.body.removeChild(tempDiv);
              reject(new Error('Canvas/Img not found'));
            }
          }
        }, 30);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Render QR Code in Preview Card
  function displayQrImage(dataUrl) {
    currentQrDataUrl = dataUrl;
    qrContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'QR Code Preview';
    qrContainer.appendChild(img);
  }

  // Render History List
  function renderHistory(items) {
    historyList.innerHTML = '';
    if (!items || items.length === 0) {
      historyList.innerHTML = '<div style="color:var(--text-muted); font-size:11px; text-align:center; padding:6px;">Belum ada riwayat</div>';
      return;
    }

    items.forEach((itemText) => {
      const itemEl = document.createElement('div');
      itemEl.className = `history-item ${itemText === activeHistoryText ? 'active' : ''}`;

      const textSpan = document.createElement('span');
      textSpan.className = 'history-text';
      textSpan.textContent = itemText;
      itemEl.appendChild(textSpan);

      if (itemText === activeHistoryText) {
        const tag = document.createElement('span');
        tag.className = 'history-tag';
        tag.textContent = 'AKTIF';
        itemEl.appendChild(tag);
      }

      itemEl.addEventListener('click', async () => {
        qrTextInput.value = itemText;
        updateCharCount();
        await activateText(itemText);
      });

      historyList.appendChild(itemEl);
    });
  }

  // Core function: Generate QR, activate bypass, save to storage
  async function activateText(textToActivate) {
    const text = (textToActivate !== undefined ? textToActivate : qrTextInput.value).trim();
    if (!text) {
      showToast('⚠️ Masukkan teks terlebih dahulu!');
      qrTextInput.focus();
      return;
    }

    try {
      const dataUrl = await createQrDataUrl(text);
      displayQrImage(dataUrl);
      activeHistoryText = text;

      // Update history list (max 10 items)
      const data = await chrome.storage.local.get(['history', 'scanEffect', 'showWatermark']);
      let history = data.history || [];
      history = [text, ...history.filter((h) => h !== text)].slice(0, 10);

      const newConfig = {
        enabled: true,
        text: text,
        qrDataUrl: dataUrl,
        history: history,
        showWatermark: chkWatermark.checked,
        scanEffect: chkLaser.checked ? 'laser' : 'clean',
        autoReload: chkAutoReload.checked
      };

      // Save state and activate
      await chrome.storage.local.set(newConfig);

      updateStatusUI(true);
      renderHistory(history);

      // Direct sync with active tab (and auto-refresh if enabled)
      const didReload = await syncActiveTab(newConfig, chkAutoReload.checked);
      if (didReload) {
        showToast('🔄 Halaman Direfresh & QR Aktif!');
      } else {
        showToast('✅ QR Aktif & Kamera Siap!');
      }
    } catch (err) {
      console.error('[QR Camera] Generate error:', err);
      showToast('❌ Gagal generate QR Code');
    }
  }

  // Push config directly to active tab and auto-reload if requested
  async function syncActiveTab(cfg, shouldReload = false) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('opera://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('about:')) {
        if (shouldReload) {
          await chrome.tabs.reload(tab.id);
          return true;
        }

        // Try messaging
        chrome.tabs.sendMessage(tab.id, { action: 'UPDATE_CONFIG', config: cfg }, (res) => {
          if (chrome.runtime.lastError || !res) {
            // Content script not loaded yet on this tab, inject into main world
            if (chrome.scripting) {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content/inject.js'],
                world: 'MAIN'
              }).catch(() => {});
            }
          }
        });
      }
    } catch (e) {}
    return false;
  }

  // Initialize from chrome.storage
  const stored = await chrome.storage.local.get([
    'enabled',
    'text',
    'qrDataUrl',
    'history',
    'showWatermark',
    'scanEffect',
    'autoReload'
  ]);

  const isEnabled = stored.enabled ?? true;
  const initialText = stored.text || 'SAMPLE-QR-001';
  qrTextInput.value = initialText;
  updateCharCount();
  updateStatusUI(isEnabled);

  chkWatermark.checked = stored.showWatermark ?? true;
  chkAutoReload.checked = stored.autoReload ?? true;
  chkLaser.checked = stored.scanEffect === 'laser';

  activeHistoryText = initialText;
  renderHistory(stored.history || [initialText]);

  if (stored.qrDataUrl) {
    displayQrImage(stored.qrDataUrl);
  } else {
    // Generate initial QR preview
    createQrDataUrl(initialText).then((url) => {
      displayQrImage(url);
      chrome.storage.local.set({ qrDataUrl: url, enabled: true });
    });
  }

  // Event: Master Toggle Switch
  toggleBypass.addEventListener('change', async () => {
    const newState = toggleBypass.checked;
    await chrome.storage.local.set({ enabled: newState });
    updateStatusUI(newState);
    
    // Sync with active tab (and reload if autoReload is enabled)
    const cfg = await chrome.storage.local.get(null);
    const didReload = await syncActiveTab(cfg, chkAutoReload.checked);

    if (newState) {
      showToast(didReload ? '🔄 Halaman Direfresh & Bypass ON' : '🟢 Bypass Kamera DIAKTIFKAN');
    } else {
      showToast(didReload ? '🔄 Halaman Direfresh & Bypass OFF' : '⚪ Bypass Kamera DINONAKTIFKAN');
    }
  });

  // Event: Generate & Aktifkan Button
  btnGenerate.addEventListener('click', async () => {
    await activateText();
  });

  // Event: Preset Chips
  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      let val = chip.dataset.preset;
      if (val === 'random-uuid') {
        const rand = Math.floor(1000 + Math.random() * 9000);
        val = `QR-${Date.now().toString(36).toUpperCase()}-${rand}`;
      }
      qrTextInput.value = val;
      updateCharCount();
      activateText(val);
    });
  });

  // Event: Clear Text
  btnClear.addEventListener('click', () => {
    qrTextInput.value = '';
    updateCharCount();
    qrTextInput.focus();
  });

  // Event: Clear History
  btnClearHistory.addEventListener('click', async () => {
    await chrome.storage.local.set({ history: [] });
    renderHistory([]);
    showToast('Riwayat dibersihkan');
  });

  // Event: Options Checkboxes
  chkWatermark.addEventListener('change', async () => {
    await chrome.storage.local.set({ showWatermark: chkWatermark.checked });
  });

  chkAutoReload.addEventListener('change', async () => {
    await chrome.storage.local.set({ autoReload: chkAutoReload.checked });
  });

  chkLaser.addEventListener('change', async () => {
    await chrome.storage.local.set({ scanEffect: chkLaser.checked ? 'laser' : 'clean' });
  });

  // Event: Copy QR Image
  btnCopy.addEventListener('click', async () => {
    if (!currentQrDataUrl) {
      showToast('Belum ada gambar QR');
      return;
    }
    try {
      const res = await fetch(currentQrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('📋 Gambar QR disalin ke Clipboard!');
    } catch (err) {
      console.warn('Clipboard write error:', err);
      showToast('Gagal menyalin gambar');
    }
  });

  // Event: Download QR Image
  btnDownload.addEventListener('click', () => {
    if (!currentQrDataUrl) {
      showToast('Belum ada gambar QR');
      return;
    }
    const cleanName = (qrTextInput.value || 'qrcode')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 24);
    const a = document.createElement('a');
    a.href = currentQrDataUrl;
    a.download = `QR_${cleanName}.png`;
    a.click();
    showToast('💾 Gambar QR diunduh');
  });

  // Event: Open Built-in Test Scanner Page
  btnOpenTest.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('test/test-scanner.html') });
  });
});
