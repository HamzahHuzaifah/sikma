const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Santri = sequelize.define('Santri', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  kelasId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Kelas',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  lembagaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Lembaga',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
});

module.exports = Santri;
