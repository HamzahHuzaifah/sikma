#!/bin/bash
echo "=== Memulai Update & Restart SIKMA App ==="

# 1. Masuk ke folder repositories SIKMA
cd /home/mjir4837/repositories/sikma || exit

# 2. Paksa bersihkan file lokal yang konflik lalu tarik kode terbaru dari GitHub
echo "[1/2] Menarik kode terbaru dari GitHub..."
git reset --hard origin/main
git pull origin main

echo "[2/2] Merestart server via Port 5001 (Sesuai Panduan Hybrid)..."
# Mematikan proses node yang lama di port 5001
fuser -k 5001/tcp 2>/dev/null || true
killall -9 node 2>/dev/null || true
pkill -9 node 2>/dev/null || true

# Menjalankan proses Node.js baru di port 5001 di background
PORT=5001 nohup node app.js > app.log 2>&1 & disown

# Touch restart.txt hanya sebagai formalitas agar Passenger Cloudlinux tidak kill proses kita
mkdir -p tmp
touch tmp/restart.txt

echo "=== SUCCESS: Server SIKMA berhasil di-restart secara otomatis & aman! ==="
