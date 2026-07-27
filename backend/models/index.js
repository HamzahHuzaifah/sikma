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

// CATATAN: constraints: false digunakan agar Sequelize TIDAK membuat foreign key constraint
// di level database MariaDB. Ini mencegah error "errno: 121 Duplicate key" di shared hosting cPanel
// karena MariaDB menyimpan nama constraint secara global lintas semua database.
// Hubungan/asosiasi tetap berfungsi sempurna di level aplikasi JavaScript.

// Asosiasi Lembaga
Lembaga.hasMany(Kategori, { foreignKey: 'lembagaId', as: 'kategori', constraints: false });
Kategori.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga', constraints: false });

Lembaga.hasMany(Kelas, { foreignKey: 'lembagaId', as: 'kelas', constraints: false });
Kelas.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga', constraints: false });

Lembaga.hasMany(Santri, { foreignKey: 'lembagaId', as: 'santri', constraints: false });
Santri.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga', constraints: false });

Lembaga.hasMany(Transaksi, { foreignKey: 'lembagaId', as: 'transaksi', constraints: false });
Transaksi.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga', constraints: false });

Lembaga.hasMany(Tabungan, { foreignKey: 'lembagaId', as: 'tabungan', constraints: false });
Tabungan.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga', constraints: false });

Lembaga.hasMany(InfakHarian, { foreignKey: 'lembagaId', as: 'infakHarian', constraints: false });
InfakHarian.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga', constraints: false });

// Asosiasi Kelas
Kelas.hasMany(Santri, { foreignKey: 'kelasId', as: 'santri', constraints: false });
Santri.belongsTo(Kelas, { foreignKey: 'kelasId', as: 'kelas', constraints: false });

Kelas.hasMany(Transaksi, { foreignKey: 'kelasId', as: 'transaksi', constraints: false });
Transaksi.belongsTo(Kelas, { foreignKey: 'kelasId', as: 'kelas', constraints: false });

Kelas.hasMany(Tabungan, { foreignKey: 'kelasId', as: 'tabungan', constraints: false });
Tabungan.belongsTo(Kelas, { foreignKey: 'kelasId', as: 'kelas', constraints: false });

// Asosiasi Santri
Santri.hasMany(Transaksi, { foreignKey: 'santriId', as: 'transaksi', constraints: false });
Transaksi.belongsTo(Santri, { foreignKey: 'santriId', as: 'santri', constraints: false });

Santri.hasMany(Tabungan, { foreignKey: 'santriId', as: 'tabungan', constraints: false });
Tabungan.belongsTo(Santri, { foreignKey: 'santriId', as: 'santri', constraints: false });

// Asosiasi Kategori
Kategori.hasMany(Transaksi, { foreignKey: 'kategoriId', as: 'transaksi', constraints: false });
Transaksi.belongsTo(Kategori, { foreignKey: 'kategoriId', as: 'kategori', constraints: false });

// Asosiasi Tagihan
Lembaga.hasMany(Tagihan, { foreignKey: 'lembagaId', as: 'tagihan', constraints: false });
Tagihan.belongsTo(Lembaga, { foreignKey: 'lembagaId', as: 'lembaga', constraints: false });

// Asosiasi Tagihan & Transaksi
Tagihan.hasMany(Transaksi, { foreignKey: 'tagihanId', as: 'transaksi', constraints: false });
Transaksi.belongsTo(Tagihan, { foreignKey: 'tagihanId', as: 'tagihan', constraints: false });

// Asosiasi User dengan Pencatatan (Audit Trail)
User.hasMany(Transaksi, { foreignKey: 'userId', as: 'transaksi', constraints: false });
Transaksi.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

User.hasMany(Tabungan, { foreignKey: 'userId', as: 'tabungan', constraints: false });
Tabungan.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

User.hasMany(InfakHarian, { foreignKey: 'userId', as: 'infakHarian', constraints: false });
InfakHarian.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

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
