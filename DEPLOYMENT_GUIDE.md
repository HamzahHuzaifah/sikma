# Panduan Deployment SIKMA di cPanel (LiteSpeed)

Dokumen ini berisi rangkuman langkah-langkah, trik, dan catatan penting untuk men-deploy aplikasi **SIKMA (Sistem Informasi Keuangan Madrasah)** yang dibangun dengan Express.js ke shared hosting cPanel yang menggunakan web server **LiteSpeed**.

---

## 1. Masalah Utama: LiteSpeed Passenger & Express.js (Error 404)
Pada server LiteSpeed, fitur bawaan **Setup Node.js App (Phusion Passenger)** seringkali mengalami *bug* dalam membaca *routing* internal Express.js. Hal ini menyebabkan halaman selain *homepage* (seperti `/login` atau `/laporan`) mengembalikan error **404 Not Found**.

### Solusi: Teknik "Hybrid" Reverse Proxy & Passenger
Untuk mengakalinya, kita harus membajak *traffic* menggunakan **Reverse Proxy** ke port khusus (misal: `5001`), namun **tetap mempertahankan deklarasi Passenger** di `.htaccess` agar hosting tidak mematikan paksa (*kill*) proses *background* kita.

File `.htaccess` di folder domain/`public_html` harus persis seperti ini:

```apache
# 1. Mematikan paksa fitur "Index of"
Options -Indexes

# 2. Mengalihkan semua pengunjung langsung ke mesin Node.js (Port 5001)
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:5001/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:5001/$1 [P,L]

# 3. DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/username_cpanel/repositories/sikma"
PassengerBaseURI "/"
PassengerNodejs "/home/username_cpanel/nodevenv/repositories/sikma/22/bin/node"
PassengerAppType node
PassengerStartupFile app.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

---

## 2. Cara Menjalankan Server 24/7 (restart-server.sh)
Karena *traffic* dibelokkan langsung ke port 5001, maka Passenger tidak lagi otomatis menyalakan `app.js`. Kita harus menyalakannya secara manual menggunakan perintah `nohup`.

**Langkah Restart/Update SIKMA di Terminal cPanel:**
1. Masuk ke Virtual Environment Node.js
   ```bash
   source /home/mjir4837/nodevenv/repositories/sikma/22/bin/activate
   ```
2. Jalankan script eksekusi:
   ```bash
   ./restart-server.sh
   ```

**Isi wajib dari `restart-server.sh`:**
- Melakukan `git pull origin main`
- Menjalankan `npm install --production`
- **Mencari dan mematikan (kill)** proses Node.js yang lama di port 5001.
- Menghidupkan proses baru: `nohup node app.js > app.log 2>&1 & disown`

---

## 3. Bahaya File `.env` & Error 503 (Service Unavailable)
Jika pengunjung melihat error **503 Service Unavailable**, artinya proses Node.js SIKMA **mati (crash)** sehingga port 5001 kosong. 
Penyebab paling umum adalah gagal terkoneksi ke Database.

### Aturan Emas Database:
- Jangan pernah men-track file `.env` ke Git (`.gitignore` harus berisi `.env`).
- Hati-hati saat menggunakan perintah `git reset --hard` di cPanel, karena dapat menimpa file `.env` produksi kembali ke *default* bawaan, sehingga password database menjadi salah.
- Jika database gagal koneksi (Access Denied), Node.js akan langsung *crash*.
- Pastikan `.env` selalu memiliki kredensial cPanel yang benar (`DB_USER`, `DB_PASS`, `DB_NAME`).

---

## 4. Masalah Migrasi Database (Error 121 Foreign Key)
Saat `sequelize.sync()` berjalan di *shared hosting* (MariaDB), pembuatan tabel baru sering gagal dengan pesan `errno 121 (Duplicate key on write or update)`.

- **Penyebab:** Hosting MariaDB membagikan penamaan *Constraint Foreign Key* secara global antar database. Jika database lain (seperti SPMB) sudah punya Foreign Key bernama `lembagaId_ibfk_1`, SIKMA tidak boleh membuatnya lagi.
- **Solusi yang diterapkan:** SIKMA **TIDAK** menggunakan *Foreign Key constraints* pada level struktur tabel database (dihapus atribut `references` pada file model). Relasi antar tabel murni dijaga di level aplikasi JavaScript (Sequelize).

---

## 5. UI/UX: Membuang "Global Loader" Antar Halaman
Sebelumnya website terasa sangat lambat karena menggunakan layar "Memproses..." setiap kali link di-klik (Event `beforeunload`). 
**Catatan:** Untuk website jenis *Multi-Page Application* tradisional, **jangan gunakan custom loading screen saat navigasi link biasa**, biarkan browser menggunakan indikator loading bawaannya agar transisi terasa cepat dan instan. Loader hanya dipakai saat proses *Submit Form* / *Import Data*.

---

### Cheatsheet Perintah Terminal cPanel Darurat
Jika SIKMA macet/error port bentrok, jalankan perintah ini di Terminal:
```bash
# Mematikan paksa seluruh aplikasi Node.js yang berjalan
killall node

# Cek log aplikasi yang sedang berjalan
cat app.log
```
