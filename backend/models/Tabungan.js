const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { generateNomorKwitansi } = require('../utils/receiptGenerator');

const Tabungan = sequelize.define('Tabungan', {
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
  tipe: {
    type: DataTypes.ENUM('Setor', 'Tarik'),
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
    allowNull: false,
    references: {
      model: 'Lembaga',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  kelasId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Kelas',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  santriId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Santri',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'SET NULL'
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

Tabungan.beforeCreate(async (tabungan, options) => {
  const kodeJenis = tabungan.tipe === 'Setor' ? 'TAB-IN' : 'TAB-OUT';
  await generateNomorKwitansi(Tabungan, tabungan, kodeJenis);
});

module.exports = Tabungan;
