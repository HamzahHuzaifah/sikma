#!/bin/bash
echo "=== Memulai Update & Restart SIKMA App ==="

# 1. Masuk ke folder repositories SIKMA
cd /home/mjir4837/repositories/sikma || exit

# 2. Paksa bersihkan file lokal yang konflik lalu tarik kode terbaru dari GitHub
echo "[1/2] Menarik kode terbaru dari GitHub..."
git reset --hard origin/main
git pull origin main

# 3. Trigger Phusion Passenger untuk merestart app secara graceful tanpa mengganggu app lain
echo "[2/2] Merestart server via Passenger (tmp/restart.txt)..."
mkdir -p tmp
touch tmp/restart.txt

echo "=== SUCCESS: Server SIKMA berhasil di-restart secara otomatis & aman! ==="
