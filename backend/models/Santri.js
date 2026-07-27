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
    allowNull: false
  },
  lembagaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Santri;
