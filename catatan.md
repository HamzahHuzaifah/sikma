# 📋 Catatan Perubahan SIKMA — Sesi 27-28 Juli 2026

---

## 1. 🧹 Pembersihan Data Dummy
- Menghapus data kelas dummy yang tidak sesuai dengan data santri sesungguhnya di berbagai file view (seperti contoh tabel di `santri_import.ejs`).

---

## 2. 💰 Sistem Tagihan — Tagihan yang Sudah Dibayar
- **Rencana:** Jika santri sudah membayar tagihan (SPP/Kegiatan), maka tagihan tersebut tidak lagi muncul pada pilihan "Pilih Tagihan" saat input transaksi.
- **Status:** Belum dimulai (masih dalam rencana implementasi).

---

## 3. 🧾 Perbaikan Halaman Kwitansi
- Memperbaiki error `Cannot GET /lembaga/paudqu/kwitansi/18` yang terjadi karena perubahan sistem URL sebelumnya.
- Seluruh URL kwitansi (transaksi, tabungan, infak) disesuaikan agar konsisten dengan struktur route `/admin/lembaga/:slug/...`.

---

## 4. 🔗 Analisis Dampak Perubahan Sistem URL
- Mengidentifikasi dan memperbaiki semua halaman dan redirect yang terdampak akibat perubahan pola URL dari format lama ke format baru `/admin/lembaga/:slug/...`.

---

## 5. 🏦 Perbaikan Bug Input Tabungan
- Memperbaiki bug saat input setor tabungan massal: dari 3 anak yang diinput, hanya 1 yang tersimpan.
- Penyebab: kesalahan pada proses penyimpanan *batch* — diperbaiki agar semua data tersimpan dengan benar.

---

## 6. 📊 Optimasi Tampilan Laporan Tabungan
- Menerapkan sistem **grouping/accordion** untuk setoran massal agar tabel laporan tidak terlalu panjang.
- Satu baris *header* per setoran massal, dengan tombol expand untuk melihat detail per santri.

---

## 7. 👤 Kolom Operator di Laporan
- Menambahkan kolom **Operator** pada:
  - Laporan Tabungan
  - Laporan Infak Harian
- Berguna untuk mengetahui siapa yang melakukan input data.

---

## 8. 🖨️ Perbaikan Cetak Laporan
- Memperbaiki error `Cannot GET /laporan/cetak` pada seluruh halaman laporan.
- Membuat komponen modal cetak terpusat di `views/components/laporan_modal.ejs` dan `public/js/laporan-modal.js`.

---

## 9. 🔧 Refactoring Front-End (Modularisasi)

### a. Komponen Modal Laporan
- **Baru:** `views/components/laporan_modal.ejs` — komponen iframe popup cetak laporan.
- **Baru:** `backend/public/js/laporan-modal.js` — fungsi JS `openModalLaporan`.
- **Diubah:** `transaksi_laporan.ejs`, `tabungan_laporan.ejs`, `infak_laporan.ejs` — mengganti kode inline dengan `<%- include('components/laporan_modal') %>`.

### b. Script Admin Online (Heartbeat)
- **Baru:** `backend/public/js/admin-online.js` — memindahkan logika polling admin online dari `header.ejs`.
- **Diubah:** `views/partials/header.ejs` — script inline dihapus, diganti pemanggilan file JS eksternal.

### c. Sentralisasi Tailwind Config
- **Baru:** `backend/public/js/tailwind-config.js` — konfigurasi tema Tailwind (warna brand, font Inter) terpusat.
- **Diubah:** Menghapus inline `tailwind.config` dari:
  - `views/public/index.ejs`
  - `views/public/cek-tagihan.ejs`
  - `views/login.ejs`
  - `views/partials/header.ejs`

### d. Filter Kelas (Tabungan)
- **Baru:** `backend/public/js/filter-kelas.js` — logika AJAX untuk load kelas & santri berdasarkan lembaga.
- **Diubah:** `views/tabungan_laporan.ejs` — inline script dihapus, diganti file eksternal + data attributes (`data-selected-kelas`, `data-selected-santri`).

---

## 10. 👤 Perbaikan Redirect Kelola Pengguna (User Management)
- **Bug:** Setelah membuat/mengedit/menghapus akun, muncul error `Cannot GET /users`.
- **Penyebab:** Redirect di `userController.js` masih menggunakan `/users?...` padahal route yang benar adalah `/super-admin/users?...`.
- **File diubah:** `backend/controllers/userController.js` — semua redirect diperbaiki ke `/super-admin/users?...`.

---

## 11. 📂 Perbaikan Menu "Data Santri"
- **Bug:** Saat klik menu "Data Santri" di sidebar, diarahkan ke halaman Home (Dashboard) alih-alih tabel santri.
- **Penyebab:** Sidebar mengarah ke `/admin/lembaga/madrasah/santri` tapi `slugMap` di controller hanya mengenali `mjic`, bukan `madrasah`.
- **File diubah:** `backend/controllers/importController.js` — menambahkan slug `'madrasah'` ke `slugMap` dan memperbarui logika `isMjic`.

---

## 12. 🖼️ Favicon (Ikon Tab Browser)
- Menambahkan logo Madrasah sebagai favicon di seluruh halaman:
  - `views/partials/header.ejs` (Dashboard Admin & semua halaman)
  - `views/login.ejs`
  - `views/public/index.ejs` (Portal Walisantri)
  - `views/public/cek-tagihan.ejs`
- File ikon: `/images/logo-madrasah.webp`

---

## 13. 🔄 Update `restart-server.sh`
- Menambahkan perintah `touch tmp/restart.txt` agar Phusion Passenger (cPanel) melakukan restart aplikasi saat script dijalankan.

---

## 14. 🔗 Update URL SSO (Single Sign-On)
- **SIKMA → SPMB:** `ssoController.js` diubah dari `http://localhost:5000` ke `https://spmb.mjic.sch.id`.
- **SPMB → SIKMA:** `ssoController.js` (di proyek SPMB) diubah dari `http://localhost:3000` ke `https://sikma.mjic.sch.id`.

---

## 📝 Catatan Penting

- **Akses Kelola Pengguna:** Hanya akun dengan role **Super Admin** yang bisa mengakses menu "Kelola Pengguna". Jika akun `admin.mjic` tidak bisa mengakses menu ini, ubah role-nya menjadi Super Admin melalui database:
  ```sql
  UPDATE Users SET role = 'Super Admin' WHERE username = 'admin.mjic';
  ```

- **Setelah deploy:** Selalu lakukan **Hard Refresh (Ctrl + Shift + R)** di browser agar file JS/CSS terbaru termuat (tidak menggunakan cache lama).

---

## 📁 File-File Baru yang Dibuat
| File | Keterangan |
|------|------------|
| `views/components/laporan_modal.ejs` | Komponen modal cetak laporan |
| `backend/public/js/laporan-modal.js` | Fungsi JS modal cetak |
| `backend/public/js/admin-online.js` | Script heartbeat admin online |
| `backend/public/js/tailwind-config.js` | Konfigurasi tema Tailwind terpusat |
| `backend/public/js/filter-kelas.js` | Script filter kelas & santri |
| `backend/public/images/logo-madrasah.webp` | Favicon logo Madrasah |
