const sequelize = require('../config/database');
const User = require('./User');
const Lembaga = require('./Lembaga');
const Kategori = require('./Kategori');
const Kelas = require('./Kelas');
const Santri = require('./Santri');
const Transaksi = require('./Transaksi');
const Tagihan = require('./Tagihan');
const Tabungan = require('./Tabungan');
const InfakHarian = require('./InfakHarian');

// Asosiasi Lembaga
Lembaga.hasMany(Kategori, { foreignKey: 'lembagaId', as: 'kategori' });
Kategori.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga' });

Lembaga.hasMany(Kelas, { foreignKey: 'lembagaId', as: 'kelas' });
Kelas.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga' });

Lembaga.hasMany(Santri, { foreignKey: 'lembagaId', as: 'santri' });
Santri.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga' });

Lembaga.hasMany(Transaksi, { foreignKey: 'lembagaId', as: 'transaksi' });
Transaksi.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga' });

Lembaga.hasMany(Tabungan, { foreignKey: 'lembagaId', as: 'tabungan' });
Tabungan.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga' });

Lembaga.hasMany(InfakHarian, { foreignKey: 'lembagaId', as: 'infakHarian' });
InfakHarian.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga' });

// Asosiasi Kelas
Kelas.hasMany(Santri, { foreignKey: 'kelasId', as: 'santri' });
Santri.belongsTo(Kelas, { foreignKey: 'kelasId', as: 'kelas' });

Kelas.hasMany(Transaksi, { foreignKey: 'kelasId', as: 'transaksi' });
Transaksi.belongsTo(Kelas, { foreignKey: 'kelasId', as: 'kelas' });

Kelas.hasMany(Tabungan, { foreignKey: 'kelasId', as: 'tabungan' });
Tabungan.belongsTo(Kelas, { foreignKey: 'kelasId', as: 'kelas' });

// Asosiasi Santri
Santri.hasMany(Transaksi, { foreignKey: 'santriId', as: 'transaksi' });
Transaksi.belongsTo(Santri, { foreignKey: 'santriId', as: 'santri' });

Santri.hasMany(Tabungan, { foreignKey: 'santriId', as: 'tabungan' });
Tabungan.belongsTo(Santri, { foreignKey: 'santriId', as: 'santri' });

// Asosiasi Kategori
Kategori.hasMany(Transaksi, { foreignKey: 'kategoriId', as: 'transaksi' });
Transaksi.belongsTo(Kategori, { foreignKey: 'kategoriId', as: 'kategori' });

// Asosiasi Tagihan
Lembaga.hasMany(Tagihan, { foreignKey: 'lembagaId', as: 'tagihan' });
Tagihan.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga' });

// Asosiasi Tagihan & Transaksi
Tagihan.hasMany(Transaksi, { foreignKey: 'tagihanId', as: 'transaksi' });
Transaksi.belongsTo(Tagihan, { foreignKey: 'tagihanId', as: 'tagihan' });

// Asosiasi User dengan Pencatatan (Audit Trail)
User.hasMany(Transaksi, { foreignKey: 'userId', as: 'transaksi' });
Transaksi.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Tabungan, { foreignKey: 'userId', as: 'tabungan' });
Tabungan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(InfakHarian, { foreignKey: 'userId', as: 'infakHarian' });
InfakHarian.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Lembaga,
  Kategori,
  Kelas,
  Santri,
  Transaksi,
  Tagihan,
  Tabungan,
  InfakHarian
};
