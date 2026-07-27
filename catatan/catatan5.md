# Catatan Progres 5: Integrasi Kalender Select2, Pembersihan Aset, & Fitur Tabungan / Infak Harian

Dokumen ini mencatat pembaruan besar terkait integrasi desain kalender premium, pemisahan berkas kode aset (CSS/JS) dari *views*, serta implementasi modul pencatatan **Tabungan Santri** dan **Infak Harian**.

---

## 1. Perbaikan Desain Kalender SIKMA (Mirip SPMB)
- **Masalah**: Kalender Flatpickr bawaan Google di SIKMA tidak responsif, tidak bisa diisi manual dengan cepat, dropdown bulan tertutup, dan pilihan tahun kustom menjadi kosong/blank.
- **Penyebab**: Terjadi bentrok *rendering* di mana komponen otomatis `TailwindSelect` (dari `tailwind-components.js`) mendeteksi dan merombak tag `<select>` bulan dan tahun kustom milik Flatpickr saat kalender dimuat, merusak fungsionalitas Select2 yang dipasang pada elemen tersebut.
- **Solusi**: 
  - Memperbarui [tailwind-components.js](file:///d:/sikma/backend/public/js/tailwind-components.js) agar *Mutation Observer* mengabaikan elemen `<select>` yang berada di dalam kontainer `.flatpickr-calendar` atau yang memiliki class khusus Flatpickr.
  - Sekarang dropdown bulan dan tahun kustom berbasis **Select2** serta input manual tanggal format Indonesia (`DD/MM/YYYY`) berjalan lancar dan terlihat premium persis seperti kalender di web SPMB.

## 2. Pembersihan Kode Javascript dari Views
- **Deskripsi**: Menjaga integritas berkas EJS (*views*) agar murni hanya berisi struktur HTML presentasi data tanpa tercampur tag `<script>` logika frontend.
- **Solusi**: 
  - Memindahkan seluruh kode inisialisasi Flatpickr & Select2 dari [footer.ejs](file:///d:/sikma/views/partials/footer.ejs) ke dalam file statis eksternal [footer.js](file:///d:/sikma/backend/public/js/footer.js).
  - Menyelaraskan urutan pemuatan skrip pada `footer.ejs` agar pustaka Flatpickr diload sebelum berkas statis `footer.js` dieksekusi.

## 3. Pembersihan Kode CSS dari Views
- **Deskripsi**: Menghapus tag `<style>` inline yang sangat panjang agar sejalan dengan penggunaan utilitas Tailwind CSS.
- **Solusi**:
  - Membuat berkas CSS statis baru di [app.css](file:///d:/sikma/backend/public/css/app.css) untuk menampung seluruh gaya kustom Select2, Flatpickr, dan scrollbar.
  - Menghapus tag `<style>` inline di [header.ejs](file:///d:/sikma/views/partials/header.ejs) dan menggantinya dengan memanggil berkas CSS statis tersebut (`/css/app.css`).

## 4. Implementasi Fitur Tabungan Santri & Infak Harian
- **Struktur Database (Sequelize)**:
  - Membuat model database terpisah [Tabungan.js](file:///d:/sikma/backend/models/Tabungan.js) (kolom: `tanggal`, `tipe` (Setor/Tarik), `nominal`, `keterangan`, `santriId`, `kelasId`, `lembagaId`).
  - Membuat model database terpisah [InfakHarian.js](file:///d:/sikma/backend/models/InfakHarian.js) (kolom: `tanggal`, `nominal`, `keterangan`, `lembagaId`).
  - Hal ini menjamin saldo operasional utama Madrasah JIC (PAUDQu, TPQ, MDT) tidak tercampur dengan dana titipan tabungan atau infak global seluruh lembaga.
- **Backend API & Controller**:
  - Memperbarui `postTransaksi` di [transactionController.js](file:///d:/sikma/backend/controllers/transactionController.js) agar data otomatis dialokasikan ke tabelnya masing-masing berdasarkan jenis transaksi yang dipilih.
  - Menambahkan pengontrol laporan (`getTabunganLaporan`, `getInfakLaporan`) beserta fitur hapus data.
- **Antarmuka (UI) Form & Laporan**:
  - Menambahkan menu pilihan **Setor Tabungan**, **Tarik Tabungan**, dan **Infak Harian** di halaman **Input Umum**. Form akan menampilkan kolom dinamis sesuai jenis transaksi yang dipilih (pilihan Kelas & Santri interaktif dengan cascading API).
  - Membuat halaman laporan khusus mutasi tabungan [tabungan_laporan.ejs](file:///d:/sikma/views/tabungan_laporan.ejs) (dengan rekap Total Setor, Total Tarik, dan Saldo) serta laporan infak [infak_laporan.ejs](file:///d:/sikma/views/infak_laporan.ejs).
  - Menambahkan tautan menu laporan baru di sidebar utama beserta penanda aktif otomatis.

---
**Tugas / Pertimbangan Selanjutnya**:
- Uji coba penginputan mutasi tabungan dan infak harian di menu SIKMA.
- Memastikan laporan dan saldo mutasi tabungan terhitung secara akurat per lembaga dan per santri.
