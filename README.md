<p align="center">
  <img src="assets/banner.svg" alt="QR-Camera Injector Banner" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Standard-Manifest_V3-10B981?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Browsers-Chrome_|_Edge_|_Brave_|_Opera_|_Firefox-06B6D4?style=flat-square" alt="Browsers">
  <img src="https://img.shields.io/badge/Interception-WebRTC_getUserMedia-4F46E5?style=flat-square" alt="WebRTC">
  <img src="https://img.shields.io/badge/Dependencies-Zero_External_APIs-orange?style=flat-square" alt="Zero Dependencies">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-gray?style=flat-square" alt="License"></a>
</p>

## Overview

Testing browser-based barcode and QR scanners in automated end-to-end test suites is notoriously cumbersome, requiring physical cameras, printed paper codes, or fragile external video loopback software. 

QR-Camera is a **Manifest V3** browser extension that intercepts browser `navigator.mediaDevices.getUserMedia` calls, injecting a synthetic high-contrast 720p virtual video stream directly into target web applications. QA engineers and SDETs can automate QR scanner verification instantly without external hardware or camera permissions.

---

## Architecture Flow

```text
Target Web Page (Scanner App)
       │
       ▼ calls navigator.mediaDevices.getUserMedia({ video: true })
       │
QR-Camera Interceptor Hook (inject.js)
       │
       ▼ generates synthetic HTML5 Canvas Stream (captureStream(30))
       │
In-Memory QR Code Matrix (qrcode.min.js) ──► Payload updated in real time via Extension Popup
       │
       ▼ delivers MediaStreamTrack
Direct Ingestion by Scanning Libraries (ZXing, html5-qrcode, QuaggaJS, jsQR)
```

---

## Core Capabilities

- **Transparent API Interception**: Overrides `getUserMedia()`, `MediaDevices.prototype.getUserMedia`, and `enumerateDevices()` across web tabs.
- **Zero-Reload Dynamic Updates**: Modify payloads, URLs, ticket codes, or UUIDs in the extension popup with immediate frame updates.
- **High-Contrast 720p Canvas**: Streams a 1280x720 canvas at 30 FPS, optimized for instant recognition by client scanning engines.
- **One-Click Master Bypass Toggle**: Switch between native hardware camera feeds and virtual QR streams instantly.
- **Built-in Scanner Verification Page**: Includes a self-contained test scanner tab to verify capture and decoding without third-party services.
- **100% Client-Side Privacy**: Runs completely in the browser sandbox with zero telemetry or external network transmission.

---

## Installation & Browser Setup

### Chrome, Edge, Brave, and Opera

1. Clone or download this repository:
   ```bash
   git clone https://github.com/MasterPandaa/QR-Camera.git
   ```
2. Navigate to `chrome://extensions` (or `edge://extensions`, `opera://extensions`).
3. Enable **Developer mode** via the top-right toggle.
4. Click **Load unpacked** and select the cloned `QR-Camera` directory.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Select `manifest.json` from the `QR-Camera` directory.

---

## Repository Structure

```text
QR-Camera/
├── manifest.json           # Manifest V3 extension configuration
├── popup.html              # Extension toolbar controls and preset menu
├── popup.js                # State management and payload history
├── content.js              # Content script injecting the stream interceptor
├── inject.js               # Page-level hook overriding getUserMedia
├── qrcode.min.js           # QR code matrix generation engine
├── test-scanner.html       # Standalone verification scanner interface
└── icons/                  # Extension icons (16px, 48px, 128px)
```

---

## License

This project is licensed under the [MIT License](LICENSE).
