# Catatan Pembaruan Sistem Transaksi & Tagihan

Berikut adalah rekapitulasi perubahan dan perbaikan yang telah kita lakukan pada sistem SIKMA (Sistem Informasi Keuangan Madrasah), khususnya terkait pengelolaan Tagihan dan Transaksi Keuangan.

## 1. Penghapusan Entitas "Kategori Keuangan"
- Penggunaan `Kategori Keuangan` telah dihapus sepenuhnya karena fungsinya sudah diwakili oleh `Jenis Transaksi` (yang merujuk pada `Tagihan` spesifik atau tipe umum).
- Model Database `Transaksi` telah diperbarui sehingga `kategoriId` tidak lagi diwajibkan (boleh `NULL`).

## 2. Relasi Baru: Tagihan & Transaksi
- Menambahkan relasi (Asosiasi) antara tabel `Tagihan` dan `Transaksi` di database, sehingga setiap transaksi pembayaran tagihan santri terhubung langsung dengan ID Tagihan spesifik.

## 3. Perombakan Alur UI "Input Transaksi Keuangan" (`transaksi_form.ejs`)
- **Satuan Pendidikan sebagai Filter Utama**: Kolom `Satuan Pendidikan` (Lembaga) dipindah ke bagian paling atas. Admin kini diwajibkan memilih Lembaga terlebih dahulu sebelum dapat melanjutkan.
- **Jenis Transaksi Dinamis**: Dropdown `Jenis Transaksi` disembunyikan secara bawaan dan baru akan muncul setelah `Satuan Pendidikan` dipilih.
- **Penyaringan Tagihan Otomatis**: Pilihan tagihan di dalam `Jenis Transaksi` disaring (difilter) secara otomatis menggunakan JavaScript berdasarkan `Satuan Pendidikan` yang dipilih. Admin tidak akan lagi melihat tagihan dari lembaga lain.
- **Penyederhanaan Form Detail**: Karena `Satuan Pendidikan` sudah dipilih di atas, form detail rincian untuk Pemasukan Umum dan Pengeluaran tidak perlu lagi menanyakan ulang pilihan Lembaga tersebut.

## 4. Penyesuaian Backend (`transactionController.js`)
- Controller transaksi telah diperbarui agar menerima variabel global `lembagaId_global` dari UI.
- Logika validasi dan penyimpanan database untuk `Pemasukan Umum` dan `Pengeluaran` telah disesuaikan untuk menggunakan ID Lembaga global ini, menggantikan mekanisme lama yang menggunakan input terpisah (`lembagaId_pemasukan` dan `lembagaId_pengeluaran`).

Dengan perubahan ini, sistem kini jauh lebih terstruktur dan mengurangi kemungkinan salah input (human error) oleh admin ketika mencatat transaksi keuangan santri.
