// QR Camera - Background Service Worker

const DEFAULT_STATE = {
  enabled: false,
  text: "SAMPLE-QR-001",
  qrDataUrl: "",
  history: [
    "SAMPLE-QR-001",
    "https://example.com",
    "ITEM-CODE-884920",
    "BATCH-2026-X01"
  ],
  showWatermark: true,
  scanEffect: "clean", // "clean" or "laser"
  autoReload: true
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(null);
  const toInit = {};
  for (const [key, value] of Object.entries(DEFAULT_STATE)) {
    if (existing[key] === undefined) {
      toInit[key] = value;
    }
  }
  if (Object.keys(toInit).length > 0) {
    await chrome.storage.local.set(toInit);
  }
  await updateBadge(existing.enabled ?? DEFAULT_STATE.enabled);
});

// Update badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const { enabled = false } = await chrome.storage.local.get('enabled');
  await updateBadge(enabled);
});

// Listen to storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.enabled !== undefined) {
    updateBadge(changes.enabled.newValue);
  }
});

async function updateBadge(isEnabled) {
  try {
    if (isEnabled) {
      await chrome.action.setBadgeText({ text: "ON" });
      await chrome.action.setBadgeBackgroundColor({ color: "#16a34a" }); // Emerald Green
    } else {
      await chrome.action.setBadgeText({ text: "OFF" });
      await chrome.action.setBadgeBackgroundColor({ color: "#64748b" }); // Slate
    }
  } catch (err) {
    console.warn("[QR Camera SW] Badge update error:", err);
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_TEST_PAGE") {
    chrome.tabs.create({ url: chrome.runtime.getURL("test/test-scanner.html") });
    sendResponse({ success: true });
    return true;
  }
  return true;
});
