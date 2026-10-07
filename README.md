# 📷 QR Camera - Virtual Webcam Bypass Browser Extension

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](#)
[![Browser Support](https://img.shields.io/badge/Browsers-Opera%20%7C%20Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Firefox-blue.svg)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20APIs-orange.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

**QR Camera** adalah ekstensi browser cerdas berbasis **Manifest V3** untuk **Opera, Opera GX, Google Chrome, Microsoft Edge, Brave, dan Mozilla Firefox**.

Tools ini berfungsi melakukan **bypass webcam feed laptop/komputer menjadi virtual video stream QR Code secara instan**. Dibuat khusus untuk kebutuhan **Quality Assurance (QA) & Software Engineering** agar pengujian fitur scanner barcode/QR pada aplikasi web dapat dilakukan tanpa perlu mencetak barcode fisik, tanpa menggunakan HP, atau mengarahkan kamera fisik.

---

## 🌟 Mengapa Menggunakan QR Camera?

- 🚫 **Tanpa Kamera Tambahan / HP**: Tidak perlu lagi repot men-generate barcode di web lain, men-download gambar, mengirim ke handphone, lalu mengarahkan kamera laptop ke layar HP.
- ⚡ **Real-time Live Stream Switch**: Mengubah input teks di popup ekstensi akan **langsung mengubah QR Code pada stream video kamera secara real-time** tanpa perlu me-reload tab atau membuka ulang kamera!
- 🎯 **Presisi & Deteksi Instan**: Mengalirkan canvas video HD (1280x720 @ 30 FPS) dengan kontras tinggi sehingga scanner web (seperti ZXing, `vue-qrcode-reader`, `html5-qrcode`, QuaggaJS, jsQR) langsung mendeteksi dalam hitungan milidetik.
- 🛡️ **100% Aman & Lokal**: Berjalan sepenuhnya di sisi klien (browser) tanpa request data ke server pihak ketiga.

---

## 🚀 Fitur Utama

1. **Webcam Stream Interception (`getUserMedia` Hook)**:
   - Mengintersepsi panggilan `navigator.mediaDevices.getUserMedia()`, `MediaDevices.prototype.getUserMedia`, dan `enumerateDevices()` secara otomatis dan transparan.
2. **Master Switch Toggle (ON / OFF)**:
   - Tombol saklar instan pada header popup. Saat **OFF**, akses kamera laptop kembali 100% normal ke webcam fisik asli.
3. **Preset Cepat & Riwayat (Quick Switch)**:
   - Menyediakan preset cepat (Item Code, URL, Ticket ID, Random String).
   - Menyimpan hingga 10 riwayat QR Code terakhir untuk berganti barcode hanya dengan 1 klik.
4. **Customizable Stream Effects**:
   - Pilihan efek garis laser bergerak (*Laser Scanline Effect*).
   - Informasi teks overlay / watermark yang dapat diaktifkan/dinonaktifkan.
   - Opsi *Auto Refresh Active Tab* saat aktivasi.
5. **Ekspor & Salin Gambar**:
   - Salin gambar QR langsung ke Clipboard atau unduh sebagai file `.png`.
6. **Built-in Test Scanner**:
   - Dilengkapi halaman simulator pengujian mandiri untuk memverifikasi scanner secara langsung.

---

## 🛠️ Tata Cara Instalasi

### 1. Download / Clone Repository
Clone repository ini atau download sebagai ZIP lalu ekstrak ke folder komputer Anda:

```bash
git clone https://github.com/MasterPandaa/QR-Camera.git
```

---

### 2. Pemasangan di Browser

#### 🔴 Opera / Opera GX
1. Buka browser Opera / Opera GX.
2. Ketik di address bar: `opera://extensions` lalu tekan **Enter**.
3. Aktifkan saklar **"Developer mode"** di pojok kanan atas.
4. Klik tombol **"Load unpacked"** (Muat yang belum dibongkar).
5. Pilih folder hasil clone/ekstrak ekstensi ini.
6. Ekstensi **QR Camera** akan langsung aktif dan siap digunakan.

---

#### 🟢 Google Chrome / Brave Browser
1. Buka Google Chrome atau Brave.
2. Ketik di address bar: `chrome://extensions` lalu tekan **Enter**.
3. Aktifkan toggle **"Developer mode"** di pojok kanan atas.
4. Klik tombol **"Load unpacked"**.
5. Pilih folder root ekstensi ini.
6. Ekstensi berhasil terpasang! Sematkan (*Pin*) icon pada toolbar browser Anda.

---

#### 🔵 Microsoft Edge
1. Buka Microsoft Edge.
2. Ketik di address bar: `edge://extensions` lalu tekan **Enter**.
3. Aktifkan toggle **"Developer mode"** di panel menu sebelah kiri.
4. Klik tombol **"Load unpacked"** di barisan atas.
5. Pilih folder root ekstensi ini.

---

#### 🦊 Mozilla Firefox
1. Buka Firefox.
2. Ketik di address bar: `about:debugging#/runtime/this-firefox` lalu tekan **Enter**.
3. Klik tombol **"Load Temporary Add-on..."**.
4. Masuk ke folder ekstensi dan pilih file `manifest.json`.

---

## 📖 Panduan Penggunaan

1. **Buka Popup Ekstensi**: Klik icon **QR Camera** pada toolbar browser.
2. **Masukkan Data**: Masukkan teks, kode barcode, URL, atau gunakan tombol **Preset**.
3. **Generate & Aktifkan**:
   - Klik tombol **"⚡ Generate & Aktifkan"** atau nyalakan toggle master switch.
   - Badge ekstensi pada toolbar akan berubah menjadi hijau **"ON"**.
4. **Buka Website Target**:
   - Buka aplikasi web atau sistem yang memiliki fitur pemindaian kamera barcode/QR.
   - Izinkan izin kamera jika diminta.
   - Kamera web akan langsung menerima feed video QR Code virtual dan scanner akan langsung mendeteksi kode secara otomatis!
5. **Ganti Barcode Secara Live**:
   - Untuk menguji barcode lain, cukup buka popup ekstensi kembali, pilih riwayat atau ketik teks baru. Stream video di website target akan langsung berubah seketika tanpa reload.

---

## 🧪 Menguji dengan Built-in Test Scanner

Untuk memastikan ekstensi berfungsi dengan baik pada browser Anda:
1. Buka popup **QR Camera**.
2. Buka menu akordeon **"Pengaturan & Bantuan"**.
3. Klik tombol **"🎥 Buka Halaman Test Scanner"**.
4. Klik **"▶ Buka Kamera"** pada halaman pengujian.
5. Kamera virtual akan langsung memindai QR Code dan menampilkan hasil deteksi beserta log aktivitasnya.

---

## 📦 Struktur Project

```text
QR-Camera/
├── manifest.json              # Ekstensi Manifest V3 (Chrome, Opera, Firefox)
├── popup/
│   ├── popup.html             # Antarmuka UI Popup modern
│   ├── popup.css              # Dark mode styling & animasi
│   ├── popup.js               # State management, local storage & event handler
│   └── qrcode.min.js          # Standalone offline QR code generator library
├── content/
│   ├── isolated.js            # Isolated bridge content script
│   └── inject.js              # MediaDevices hook & HD canvas stream interceptor
├── background/
│   └── service-worker.js      # Background service worker & badge manager
├── icons/
│   ├── icon16.png             # Icon 16x16
│   ├── icon48.png             # Icon 48x48
│   └── icon128.png            # Icon 128x128
├── test/
│   ├── test-scanner.html      # Halaman verifikasi test scanner internal
│   └── test-scanner.js        # Controller barcode detector tester
└── README.md                  # Dokumentasi & panduan instalasi
```

---

## 🔒 Privasi & Keamanan

- **Zero External Connection**: Ekstensi ini tidak mengirimkan data input apa pun ke internet atau server pihak ketiga. Semua proses rendering canvas dan generator QR dijalankan 100% lokal pada memori browser.
- **Controlled Scope**: Intersepsi kamera hanya aktif saat saklar toggle dinyalakan oleh pengguna.

---

## 📄 Lisensi

Didistribusikan di bawah lisensi [MIT](LICENSE). Silakan gunakan, modifikasi, dan integrasikan untuk kebutuhan pengujian QA maupun pengembangan software Anda.
