const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'db_sikma';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || process.env.DB_PASS || '';
const dbHost = process.env.DB_HOST || 'localhost';

// Fungsi untuk memastikan database ada sebelum Sequelize connect
async function ensureDatabaseExists() {
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPass
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`[Database] Database "${dbName}" dipastikan ada.`);
  } catch (error) {
    console.warn('[Database] Gagal memastikan database ada via mysql2. Mencoba melanjutkan langsung...', error.message);
  }
}

// Jalankan pembuatan DB secara asinkron (Sequelize akan me-retry koneksi saat authenticate)
ensureDatabaseExists();

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPass,
  {
    host: dbHost,
    dialect: 'mysql',
    logging: false, // Nonaktifkan log SQL query agar terminal bersih
    define: {
      timestamps: true, // Otomatis buat createdAt dan updatedAt
      freezeTableName: true // Nama tabel sama dengan nama model
    }
  }
);

module.exports = sequelize;
