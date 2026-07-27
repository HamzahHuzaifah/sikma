const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lembaga = sequelize.define('Lembaga', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = Lembaga;
