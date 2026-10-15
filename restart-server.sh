#!/bin/bash
echo "=== Memulai Update & Restart SIKMA App ==="

# 1. Masuk ke folder repositories SIKMA
cd /home/mjir4837/repositories/sikma || exit

# 2. Matikan proses node lama TERLEBIH DAHULU agar slot proses (NPROC) & RAM di cPanel bebas
echo "[1/3] Menghentikan proses lama untuk membebaskan limit proses (NPROC)..."
fuser -k 5001/tcp 2>/dev/null || true
pkill -9 -f "node app.js" 2>/dev/null || true
sleep 1

# 3. Tarik kode terbaru dari GitHub
echo "[2/3] Menarik kode terbaru dari GitHub..."
git fetch origin main
git reset --hard origin/main

# 4. Jalankan proses Node.js baru di port 5001 di background
echo "[3/3] Menjalankan server via Port 5001..."
PORT=5001 nohup node app.js > app.log 2>&1 & disown

# Touch restart.txt sebagai penanda untuk Passenger
mkdir -p tmp
touch tmp/restart.txt

echo "=== SUCCESS: Server SIKMA berhasil di-restart secara otomatis & aman! ==="

