# Catatan Proyek SIKMA (Sesi 9)
**Tanggal:** 22 Agustus 2026
**Fokus Utama:** Manajemen Super Admin (Log Aktivitas & Manajemen Tahun Ajaran) serta Perbaikan Bug Git & Render.

## 1. Penyelesaian Isu Git (Tracking Gambar Tanda Tangan)
- **Masalah:** Gambar *upload* tanda tangan masuk secara otomatis ke repositori Git saat melakukan `git push` karena ter-*track* di `backend/public/images/signatures/`.
- **Solusi:** Menambahkan *file* `.gitignore` untuk mengecualikan *folder* tersebut dan menjalankan `git rm --cached` agar Git melupakan *cache* gambar yang sudah telanjur terunggah.

## 2. Perbaikan Rendering Kwitansi (Tag HTML)
- **Masalah:** Pada kolom TTD di kwitansi, tag `<u>` muncul sebagai teks biasa, bukan sebuah garis bawah (*underline*).
- **Solusi:** Mengganti metode *render* EJS di file `kwitansi.ejs`, `tabungan_kwitansi.ejs`, dan `infak_kwitansi.ejs` dari `<%=` (escape HTML) menjadi `<%-` (un-escaped HTML) untuk variabel `ttdName`.

## 3. Fitur Log Aktivitas (Audit Trail) untuk Super Admin
- Melengkapi fungsi keamanan sistem dengan menampilkan jejak aktivitas (*login*, input, edit, hapus) bagi seluruh pengguna.
- Membuat halaman UI di `views/super-admin/logs.ejs` yang mengambil data via *Fetch API*.
- Memperbaiki bug "Gagal Memuat Data Log" dengan menyesuaikan URL API dari `/api/log-history` menjadi `/admin/api/log-history` karena API terlindungi oleh rute grup `/admin`.
- Mengimplementasikan fitur **Hapus Log** permanen khusus untuk *role* Super Admin.

## 4. Fitur Manajemen Tahun Ajaran (Kenaikan Kelas Massal / *Roll-over*)
- **Fungsi:** Menggeser atau menaikkan kelas santri secara serentak dalam satu angkatan tanpa harus mengedit data santri satu per satu.
- **Implementasi *Smart Mapping* UI:**
  - Membuat antarmuka pemilihan asal kelas dan tujuan kelas (`views/super-admin/rollover.ejs`).
  - Dibuat fitur perlindungan keamanan sistem (membaca ke memori terlebih dahulu) untuk mencegah *cascade effect* (efek domino di mana anak berpindah kelas berturut-turut di luar kendali).
- **Penanganan Status LULUS:**
  - Menambahkan opsi **🎓 LULUS / ALUMNI** di *dropdown*.
  - Jika dipilih, sistem akan otomatis membuat/mencari kelas bernama **"Alumni"** lalu menampung data kelulusan santri di sana.
  - Hal ini memecahkan masalah tunggakan: meskipun anak tersebut sudah lulus (berada di kelas "Alumni"), data tunggakannya **tidak hilang** dan tetap ada di menu Tunggakan karena sistem tagihan dikunci berdasarkan `lembagaId` dan nama Santri, bukan berdasarkan kelas. 

---
**Status Saat Ini:** SIKMA sudah semakin matang, terutama dengan kehadiran fungsi *Roll-over* kelas massal ini yang mempermudah staf tata usaha saat transisi pergantian tahun ajaran baru.
