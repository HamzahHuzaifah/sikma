# Dokumentasi Pembaruan Sistem (Catatan 6)

Berikut adalah rekapitulasi penambahan fitur, perbaikan *bug*, dan perombakan struktur (refaktor) yang telah diselesaikan pada sesi ini untuk Sistem Informasi Keuangan Madrasah (SIKMA).

## 1. Pembaruan Logika Tanda Tangan Kwitansi
Sistem kini mendukung penyesuaian tanda tangan bendahara secara dinamis pada saat pratinjau dan cetak kwitansi, dengan aturan sebagai berikut:
- **PAUDQu:** Otomatis menggunakan TTD Bendahara **Dian Puput Tiara, S.Pd.** beserta stempel gambar tanda tangannya (`TTD Bendahara Puput.webp`).
- **TPQ & MDT:** Otomatis menggunakan TTD Bendahara **Henny Maulida Putri, S.Pd.** beserta stempel gambar tanda tangannya (`TTD Bendahara Henny.webp`).
- **Madrasah (JIC/Global):** Menampilkan opsi pilihan (dropdown/tombol) di antarmuka pratinjau kwitansi sehingga pengguna bisa memilih bendahara mana yang bertugas untuk tanda tangan sebelum dicetak.

## 2. Refaktor Komponen Tampilan (EJS Components & Props)
- Merapikan ulang folder `views/components` agar potongan-potongan tampilan (*UI snippets*) seperti *Page Header*, *Form Actions*, *Empty State*, dan *Pagination* menjadi komponen *reusable* yang rapi.
- Mengubah gaya pemanggilan EJS `<%- include(...) %>` agar melempar parameter (props) dengan lebih terstruktur dan menghindari bentrokan sintaks (*SyntaxError*) dari EJS ketika digabungkan dengan *template literals* JavaScript.

## 3. Validasi Saldo (Pencegahan Saldo Minus) & Fitur Setor Madrasah
- Menambahkan validasi keras di sisi *backend* (`transactionController.js`) pada saat admin mencoba menambahkan pengeluaran (Transaksi Umum) atau penarikan (Tabungan). Sistem akan langsung menolak dan membatalkan simpan data jika nominal uang yang dikeluarkan lebih besar dari sisa saldo kas yang dimiliki oleh lembaga tersebut, sehingga mencegah terjadinya saldo minus (negatif).
- Menambahkan kemampuan pencatatan "Setor Uang ke Madrasah" sebagai salah satu fitur penting perpindahan dana antar lembaga.

## 4. Perombakan Antarmuka Laporan (Gaya Buku Besar ala SPMB)
Mengubah total tata letak (layout) dari ketiga halaman laporan (Keuangan Umum, Tabungan Santri, dan Infak Harian) agar mengusung gaya desain *modern ledger* yang sejalan dengan SPMB JIC, meliputi:
- **Filter Horizontal:** Memadatkan pilihan filter (Tanggal, Lembaga, Kelas, Santri) menjadi sejajar horisontal menyerupai *toolbar*, sangat hemat ruang vertikal.
- **Tabel Kronologis dengan Running Balance:** Tabel laporan kini diurutkan dari transaksi paling lama ke baru. Sistem juga otomatis memunculkan baris **"Saldo Kas/Tabungan/Infak Sebelumnya"** sebagai hitungan dasar sebelum transaksi pertama.
- **Perhitungan Saldo per Baris:** Menambahkan perhitungan *Saldo Akhir* atau *Akumulasi* secara *real-time* di setiap baris tabel berdasarkan tipe pemasukan/pengeluarannya (Layaknya buku rekening).
- **Penghapusan Kartu Ringkasan:** Menghilangkan *Summary Cards* (Total Pemasukan/Pengeluaran berukuran raksasa di atas tabel) untuk digabungkan langsung secara elegan ke dalam tabel buku besar.
- **Hover Actions:** Menyembunyikan tombol Edit, Hapus, dan Print Kwitansi ke dalam sebuah menu *overlay* kecil yang hanya muncul saat kolom *Uraian* disorot menggunakan *mouse* (hover), menjadikan tabel sangat minim distraksi visual.

## 5. Fitur Pratinjau Laporan (Modal Iframe F4)
- Menghapus kebiasaan membuka tab browser baru saat menekan tombol "Cetak Laporan F4".
- Sebagai gantinya, membangun sistem **Modal Iframe (Popup)** layar penuh di halaman yang sama, sehingga *preview* dokumen cetak langsung muncul di atas tabel dan dapat ditutup kembali dengan cepat, meningkatkan produktivitas serta menjaga kerapian navigasi tab browser pengguna.
