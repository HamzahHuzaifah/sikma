const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAktivitas = sequelize.define('LogAktivitas', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true // True just in case system logs something
  },
  aksi: {
    type: DataTypes.STRING,
    allowNull: false // e.g. 'INPUT', 'EDIT', 'HAPUS'
  },
  modul: {
    type: DataTypes.STRING,
    allowNull: false // e.g. 'Transaksi', 'Tabungan', 'Santri', 'Tagihan'
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'log_aktivitas',
  timestamps: true // adds createdAt, updatedAt
});

module.exports = LogAktivitas;
