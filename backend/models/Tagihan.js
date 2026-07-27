const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tagihan = sequelize.define('Tagihan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nominal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  lembagaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  freezeTableName: true // Agar nama tabel tetap 'Tagihan'
});

module.exports = Tagihan;
