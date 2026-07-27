# Catatan Pekerjaan 3 - SIKMA (Pembaruan UI & Paginasi)

Catatan ini merangkum pembaruan fitur yang telah diselesaikan untuk mengoptimalkan performa dan fungsionalitas sistem.

## 1. Opsi Input Manual Data Santri
- **Deskripsi**: Menambahkan opsi agar admin dapat memasukkan data santri secara manual satu per satu tanpa harus selalu menarik data dari API SPMB atau mengunggah file Excel.
- **Perubahan Kode**:
  - `views/santri_import.ejs`: Menambahkan Card/form UI untuk Input Manual.
  - `backend/routes/api.js`: Menambahkan rute baru `POST /import/manual`.
  - `backend/controllers/importController.js`: Membuat controller `inputManual` untuk memproses dan menyimpan data santri beserta relasi Kelas dan Lembaga.

## 2. Fitur Paginasi (Pagination) di Seluruh Sistem
- **Deskripsi**: Membatasi tampilan data yang memanjang (long list) menjadi maksimal **10 baris data per halaman**. Hal ini bertujuan agar *loading* halaman (waktu muat) tetap cepat dan ringan walau data mencapai ribuan.
- **Lokasi Paginasi**:
  1. **Halaman Data Santri (`/lembaga/:slug/santri`)**: Membatasi daftar santri.
  2. **Halaman Laporan Transaksi (`/laporan`)**: Membatasi daftar riwayat pemasukan dan pengeluaran.
     - *Catatan Penting*: Kalkulasi Total Pemasukan, Total Pengeluaran, dan Saldo pada *Dashboard Laporan* tetap menghitung dari **keseluruhan data berdasarkan filter**, bukan hanya menghitung dari 10 baris di halaman aktif. Filter (`startDate`, `endDate`, `lembagaId`) tidak hilang saat berpindah halaman.
  3. **Halaman Kelola Tagihan (`/tagihan`)**: Membatasi daftar master tagihan.
- **Implementasi Backend**: Mengganti fungsi `findAll` Sequelize menjadi `findAndCountAll` disertai perhitungan *limit* (10) dan *offset*.
- **Implementasi Frontend (EJS)**: Menambahkan komponen antarmuka navigasi berupa tombol "Sebelumnya" (Prev) dan "Selanjutnya" (Next) beserta indikator halaman saat ini di bawah setiap tabel.

## 3. Fitur Filter & Sortir ala Spreadsheet (Server-Side)
- **Deskripsi**: Menambahkan filter interaktif di setiap kolom tabel (`<th>`) yang menyerupai spreadsheet. Fitur ini meliputi:
  1. **Sortir**: Urutkan A ke Z dan Urut Z ke A (bekerja dinamis secara server-side bahkan untuk kolom relasi/include).
  2. **Pencarian Kolom**: Kolom input pencarian spesifik untuk memfilter data per kolom.
  3. **Pilihan Checkbox (Multiselect)**: Memilih opsi spesifik (seperti jenis transaksi, lembaga, tagihan, kelas, atau nama santri) secara dinamis dari database.
- **Lokasi Penerapan**:
  - Halaman Laporan Transaksi (`transaksi_laporan.ejs` & `transactionController.js`).
  - Halaman Data Santri (`santri.ejs` & `importController.js`).
  - Halaman Kelola Tagihan (`tagihan.ejs` & `tagihanController.js`).
  - Tabel Transaksi Terbaru di Halaman Input Transaksi (`transaksi_form.ejs` & `transactionController.js`).
- **Implementasi Frontend**: Menggunakan script Tailwind CSS murni di `table-filter.js` untuk membuat UI dropdown filter yang terisolasi dan memiliki performa optimal (z-index tinggi, posisi pintar yang menghindari overflow luar layar).
- **Implementasi Backend**: Membaca parameter dinamis `sort_*`, `filter_*`, dan `search_*` di backend menggunakan operator Sequelize (`Op.like`, `Op.in`, `Op.or`) serta mendukung sorting relasi bertingkat. Menggunakan `subQuery: false` agar kueri relasi tetap presisi.

---
**Tugas / Saran Selanjutnya yang tertunda**:
- Membuat tombol *Testing/Auto-fill Data* untuk mempermudah proses percobaan input manual santri di form santri_import.
- Uji coba (Testing) aliran keuangan secara menyeluruh di Dashboard Gabungan.
