# Catatan 8: Dokumentasi Sistem Integrasi & Deployment SIKMA-SPMB

Dokumen ini merangkum alur kerja, pemecahan masalah (troubleshooting), dan konsep sistem yang telah dibangun terkait integrasi SPMB ke SIKMA serta kendala deployment di cPanel.

## 1. Sistem Deteksi Lingkungan Otomatis (Dynamic Environment Routing)
SIKMA telah dilengkapi dengan deteksi cerdas untuk membaca API SPMB.
- **Saat di Lokal (Laptop):** SIKMA otomatis menembak `http://localhost:5000` (SPMB Lokal).
- **Saat di cPanel (Produksi):** SIKMA otomatis beralih menembak `https://spmb.mjic.sch.id`.
- **Kesimpulan:** Tidak perlu mengubah 1 baris kode pun saat *deploy* ke cPanel. Semuanya menyesuaikan otomatis.

## 2. SOP "Tutup Buku Paripurna" SPMB
Tutup Buku dirancang sebagai **2 Langkah Terpisah** demi keamanan (mencegah *human error*):
1. **Kunci Pintu (SPMB):** Admin SPMB wajib mematikan saklar pendaftaran di web SPMB agar tidak ada lagi walimurid/admin yang bisa menginput data baru.
2. **Sedot Brankas (SIKMA):** Setelah SPMB terkunci rapat, barulah kasir Madrasah menekan tombol merah **"Eksekusi Tutup Buku Paripurna"** di SIKMA. SIKMA akan menarik Saldo Fisik, Data Santri, dan Data Tunggakan secara final.

## 3. Sistem Keamanan Ganda (Anti Duplikasi)
Tombol Tutup Buku dirancang sangat aman (*Idempotent*). Jika kasir iseng atau tidak sengaja memencet tombol lebih dari 1 kali:
- **Saldo SPMB:** Tidak akan ganda. Sistem mengecek apakah bulan ini sudah ada pemasukan bernama "Pelimpahan Saldo Kas Fisik...". Jika sudah, sistem akan menolak memasukkan uang lagi.
- **Data Santri & Tunggakan:** Tidak akan ganda. Sistem menggunakan metode `findOrCreate` (Cari, jika belum ada baru buat).

## 4. Kustomisasi Pop-up Konfirmasi (Tailwind Modal)
Fungsi `confirm()` bawaan browser di SIKMA telah di-*upgrade* agar bisa menerima teks kustom untuk tombol konfirmasi.
- **Cara Pakai:** Tambahkan simbol pipa (`|`) diikuti teks tombol yang diinginkan.
- **Contoh:** `onsubmit="return confirm('Apakah Anda yakin?|Ya, Eksekusi!');"`
- Hal ini mencegah kebingungan kasir (yang sebelumnya selalu melihat tombol "Hapus" pada aksi yang bukan penghapusan).

## 5. Logika Tanda Tangan (TTD) Kasir
Sistem TTD di SIKMA (untuk cetak Kwitansi/Laporan) bersifat dinamis.
- SIKMA mengikat setiap transaksi dengan `userId` dari akun yang sedang **Login** (`req.session.userId`).
- Jika "Siti" yang menekan tombol Tutup Buku, maka transaksi tersebut tercatat atas nama Siti, dan Kwitansi akan mencetak TTD Siti secara otomatis.

## 6. Solusi Troubleshooting Deployment di cPanel (Linux)

### A. Gagal Login (Terjadi Kesalahan Server)
- **Penyebab:** Kode SIKMA (Model `User.js`) sudah diperbarui dengan kolom baru (`role`, `ttdPath`), namun struktur tabel MySQL di cPanel belum diperbarui.
- **Solusi:** Eksekusi SQL di phpMyAdmin cPanel untuk menambahkan kolom yang kurang:
  ```sql
  ALTER TABLE `Users` ADD COLUMN `ttdPath` VARCHAR(255) NULL;
  ```

### B. Tabel Database Beranak / Ganda (Kapital vs Huruf Kecil)
- **Penyebab:** Windows (XAMPP) bersifat *case-insensitive* (tidak membedakan huruf besar/kecil), sedangkan Linux (cPanel) sangat ketat (*case-sensitive*). Saat SIKMA dijalankan di cPanel, Sequelize menyangka tabel belum ada (karena beda huruf), lalu otomatis membuat tabel kosong baru dengan awalan Kapital (misal: `Santri`, `Lembaga`).
- **Solusi:** Tabel yang aktif dan menyimpan data terbaru sejak dideploy adalah tabel yang **Kapital**. Maka, tabel huruf kecil yang lama (`santri`, `lembaga`, dll) harus dihapus.
- **Kendala Penghapusan (Foreign Key Constraint):** MySQL menolak menghapus tabel yang saling terikat relasi. Solusinya, matikan pengecekan *foreign key* sementara saat menghapus:
  ```sql
  SET FOREIGN_KEY_CHECKS = 0;
  DROP TABLE IF EXISTS `kategori`, `kelas`, `lembaga`, `santri`, `tagihan`;
  SET FOREIGN_KEY_CHECKS = 1;
  ```

## 7. Isu Terbuka (Open Issue): Tunggakan SPMB di Layar SIKMA
- **Situasi Saat Ini:** Data tagihan berlabel biru "SPMB" ditarik secara *live* dari API SPMB. Jika kita mengubah tombol "Bayar" mengarah ke SIKMA, kasir akan membayarnya di SIKMA. SIKMA mencatat lunas, namun API SPMB akan tetap berteriak bahwa anak tersebut masih menunggak (karena SIKMA tidak melapor balik ke SPMB).
- **Tindak Lanjut yang Dibutuhkan:** Perlu dirumuskan strategi apakah (1) SIKMA harus menembak API pelunasan ke SPMB, atau (2) SIKMA berhenti menyedot data dari API SPMB seketika setelah tombol "Tutup Buku Paripurna" ditekan (mengandalkan murni data Tagihan internal SIKMA saja).
