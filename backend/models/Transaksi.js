const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { generateNomorKwitansi } = require('../utils/receiptGenerator');

const Transaksi = sequelize.define('Transaksi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nomor_kwitansi: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  jenis: {
    type: DataTypes.ENUM('Pemasukan', 'Pengeluaran'),
    allowNull: false
  },
  nominal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lembagaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kategoriId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tagihanId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  kelasId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  santriId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Kwitansi Layout Parameters
  docTitle: { type: DataTypes.STRING, allowNull: true },
  dibayarkanKepadaSign: { type: DataTypes.STRING, allowNull: true },
  diterimaDariPembayaran: { type: DataTypes.STRING, allowNull: true },
  namaPemberi: { type: DataTypes.STRING, allowNull: true },
  layoutMarginTop: { type: DataTypes.STRING, allowNull: true },
  layoutMarginLeft: { type: DataTypes.STRING, allowNull: true },
  ttdVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
  ttdWidth: { type: DataTypes.STRING, allowNull: true },
  ttdX: { type: DataTypes.INTEGER, defaultValue: 0 },
  ttdY: { type: DataTypes.INTEGER, defaultValue: 0 },
  rowOrder: { type: DataTypes.TEXT, allowNull: true },
  rincianNames: { type: DataTypes.TEXT, allowNull: true }
});

Transaksi.beforeCreate(async (transaksi, options) => {
  const kodeJenis = transaksi.jenis === 'Pemasukan' ? 'IN' : 'OUT';
  await generateNomorKwitansi(Transaksi, transaksi, kodeJenis);
});

module.exports = Transaksi;
