#!/bin/bash
echo "=== Memulai Update & Restart SIKMA App ==="

# 1. Masuk ke folder repositories SIKMA
cd /home/mjir4837/repositories/sikma || exit

# 2. Masuk ke Virtual Environment Node.js
source /home/mjir4837/nodevenv/repositories/sikma/22/bin/activate

# 3. Tarik kode terbaru dari GitHub
echo "[1/4] Menarik kode terbaru dari GitHub..."
git reset --hard
git pull origin main

# 4. Install dependencies jika ada paket baru
echo "[2/4] Memeriksa & menginstall dependencies..."
npm install --production

# 5. Cari dan matikan proses Node.js SIKMA lama
echo "[3/4] Mematikan proses Node.js lama..."
PID=$(ps aux | grep "node app.js" | grep -v grep | awk '{print $2}')
if [ ! -z "$PID" ]; then
    echo "Mematikan PID: $PID"
    kill -9 $PID
fi

# 6. Jalankan ulang server di background
echo "[4/4] Menyalakan server SIKMA..."
nohup node app.js > app.log 2>&1 &

echo "=== SUCCESS: Server SIKMA berhasil di-restart! ==="
