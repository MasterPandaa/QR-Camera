# QR-Camera — Virtual Webcam Stream Bypass for QA Testing

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](#)
[![Browser Support](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Opera%20%7C%20Firefox-blue.svg)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20APIs-orange.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

A browser extension built with **Manifest V3** that overrides browser webcam feeds with a virtual, customizable QR Code video stream. Designed specifically for **Quality Assurance (QA) engineers and web developers** to test QR and barcode scanner functionality in web apps without needing physical cameras, printed paper codes, or secondary mobile devices.

---

## Overview

Testing webcam-based barcode scanners typically involves printing physical codes, holding smartphones in front of laptop webcams, or dealing with lighting and glare issues. 

QR-Camera eliminates these friction points by directly intercepting the browser's media API (`navigator.mediaDevices.getUserMedia`) and injecting an in-memory HD HTML5 canvas video stream rendering the specified payload directly into the target web application.

---

## Features

- **Media Stream Interception**: Hooks into `navigator.mediaDevices.getUserMedia()`, `MediaDevices.prototype.getUserMedia`, and `enumerateDevices()` transparently across target web pages.
- **Real-Time Payload Switching**: Modifying the text input or preset in the popup immediately updates the QR Code on the live webcam stream without requiring tab reloads.
- **High-Contrast 720p Canvas**: Streams a 1280x720 canvas at 30 FPS, ensuring near-instant barcode detection by web libraries (ZXing, `html5-qrcode`, `vue-qrcode-reader`, QuaggaJS, jsQR).
- **Master Toggle**: Instantly activate or deactivate the virtual camera stream from the extension toolbar. When OFF, native camera access functions normally.
- **Testing Presets & History**: Quick-fill options for URLs, ticket identifiers, SKU codes, and UUIDs, with a 10-item recent history.
- **Visual Effects & Customization**: Optional animated laser scanline, customizable overlay text, and direct PNG export.
- **Client-Side Only**: Executes entirely inside the browser environment without external network requests or third-party telemetry.

---

## Installation

### 1. Clone or Download

```bash
git clone https://github.com/MasterPandaa/QR-Camera.git
```

### 2. Load into Your Browser

| Browser Family | Installation Steps |
| :--- | :--- |
| **Chrome / Brave / Edge / Opera** | 1. Navigate to `chrome://extensions` (or `edge://extensions`, `opera://extensions`).<br>2. Enable **Developer mode** (toggle in upper right).<br>3. Click **Load unpacked** and select the cloned `QR-Camera` directory. |
| **Firefox** | 1. Navigate to `about:debugging#/runtime/this-firefox`.<br>2. Click **Load Temporary Add-on...**<br>3. Select `manifest.json` from the `QR-Camera` directory. |

---

## Testing with Built-in Scanner

The extension includes a standalone test scanner page to verify functionality immediately:

1. Click the QR-Camera icon in your browser toolbar.
2. Click **Test Scanner** (or open `test-scanner.html` in your browser).
3. Click **Start Scanner**.
4. Change the text in the QR-Camera popup to observe immediate detection and decoding in the scanner console.

---

## Project Structure

```text
QR-Camera/
├── manifest.json           # Manifest V3 extension configuration
├── popup.html              # Extension toolbar popup interface
├── popup.js                # UI state management, presets, and history
├── content.js              # Content script injecting the stream interceptor
├── inject.js               # In-page hook overriding getUserMedia
├── qrcode.min.js           # QR code matrix generation engine
├── test-scanner.html       # Standalone verification scanner page
└── icons/                  # Extension icons (16px, 48px, 128px)
```

---

## License

This project is licensed under the [MIT License](LICENSE).
