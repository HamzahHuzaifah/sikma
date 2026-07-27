#!/bin/bash
echo "=== Memulai Update & Restart SIKMA App ==="

# 1. Masuk ke folder repositories SIKMA
cd /home/mjir4837/repositories/sikma || exit

# 2. Masuk ke Virtual Environment Node.js
source /home/mjir4837/nodevenv/repositories/sikma/22/bin/activate

# 3. Tarik kode terbaru dari GitHub
echo "[1/3] Menarik kode terbaru dari GitHub..."
git pull origin main

# 4. Install dependencies jika ada paket baru
echo "[2/3] Memeriksa & menginstall dependencies..."
npm install --production

# 5. Memicu restart otomatis via Passenger cPanel
echo "[3/3] Memicu restart server Passenger..."
mkdir -p tmp
touch tmp/restart.txt

echo "=== SUCCESS: Server SIKMA berhasil di-restart dan aktif 24/7! ==="
