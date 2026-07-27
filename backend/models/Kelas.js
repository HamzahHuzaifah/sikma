const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kelas = sequelize.define('Kelas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
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

module.exports = Kelas;
