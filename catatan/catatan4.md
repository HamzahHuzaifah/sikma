# Catatan Progres 4: Perbaikan Bug & Peningkatan UX (User Experience)

Dokumen ini berisi rangkuman pembaruan, perbaikan bug, dan penambahan fitur kecil yang dilakukan untuk memastikan aplikasi SIKMA berjalan dengan lancar dan memiliki antarmuka yang nyaman bagi pengguna.

## 1. Perbaikan Bug CRUD Transaksi (ReferenceError)
- **Masalah**: Saat menekan tombol "Edit" pada tabel riwayat transaksi (baik di halaman **Input Transaksi** maupun **Laporan**), muncul halaman *error* `ReferenceError: queryParams is not defined`.
- **Penyebab**: *View* halaman edit (`transaksi_edit.ejs`) mencoba mengakses dan membaca variabel parameter URL (`queryParams`), namun *controller* belum mengirimkan variabel tersebut ke halaman.
- **Solusi**: Memperbarui fungsi `getEditTransaksi` pada `transactionController.js` dengan menambahkan `queryParams: req.query` pada objek data yang dirender.

## 2. Perbaikan Bug Redirect pada CRUD Data Santri
- **Masalah**: Saat melakukan pengubahan (Edit) atau penghapusan (Delete) data santri dari lembaga non-Madrasah (misal: PAUDQu), sistem malah melakukan *redirect* (pengalihan halaman) secara paksa ke halaman data santri Madrasah (MJIC).
- **Solusi**: Memperbarui logika `postEditSantri` dan `postDeleteSantri` di `importController.js`. Sekarang *redirect* disesuaikan secara otomatis membaca `lembagaId` dari santri tersebut, sehingga pengguna akan dikembalikan ke halaman lembaga yang tepat sesuai data asalnya.

## 3. Penyesuaian Lebar Kontainer (Layout) Halaman Laporan
- **Masalah**: Halaman **Laporan & Rekapitulasi Keuangan** meregang terlalu jauh ke kanan (*full-width*), membuatnya tidak simetris dan berbeda estetikanya dengan halaman Input Transaksi.
- **Solusi**: Mengubah kelas pembungkus utama di file `transaksi_laporan.ejs` dari `<div class="max-w-7xl mx-auto">` menjadi `<div class="max-w-5xl mx-auto">`. Lebar ini sekarang persis sama dengan form input, memastikan tabel beserta filter terlihat proporsional dan terpusat di tengah layar.

## 4. Penambahan Global Loading Animation (Spinner)
- **Deskripsi**: Menambahkan animasi proses memuat (*loading*) saat pengguna berpindah halaman untuk mengatasi kebingungan saat koneksi lambat atau proses *server* berat (misalnya saat menyimpan data atau menarik data API).
- **Implementasi**:
  - **HTML & CSS (`header.ejs`)**: Menyisipkan elemen *overlay* transparan dengan motif *glassmorphism* dan ikon *spinner* (*loading*).
  - **JavaScript (`footer.ejs`)**: Menggunakan *event listener* `beforeunload` bawaan browser untuk memunculkan animasi saat navigasi halaman dimulai, dan `pageshow` untuk mematikannya.
  - **Fallback**: Ditambahkan batas *timeout* 8 detik berjaga-jaga jika proses batal atau berupa unduhan dokumen agar web tidak *freeze* atau terkunci.

---
**Tugas / Pertimbangan Selanjutnya**:
- Uji coba (Testing) aliran keuangan secara menyeluruh di Dashboard Gabungan.
- Mempertimbangkan validasi tambahan di sisi klien (frontend) untuk mencegah kesalahan input pengguna secara langsung (misal: form nominal tidak boleh nol atau negatif).
