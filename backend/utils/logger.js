const { LogAktivitas, User } = require('../models');

/**
 * Mencatat aktivitas admin ke dalam database
 * @param {string} userId - ID User yang melakukan aksi
 * @param {string} aksi - Jenis aksi: 'INPUT', 'EDIT', 'HAPUS'
 * @param {string} modul - Nama modul: 'Transaksi', 'Tabungan', 'Santri', dll
 * @param {string} keterangan - Keterangan detail (opsional)
 */
async function catatLog(userId, aksi, modul, keterangan = '') {
  try {
    if (!userId) return; // Ignore jika tidak ada user context
    
    await LogAktivitas.create({
      userId,
      aksi,
      modul,
      keterangan
    });
  } catch (error) {
    console.error(`[Logger] Gagal mencatat log aktivitas:`, error.message);
  }
}

module.exports = {
  catatLog
};
