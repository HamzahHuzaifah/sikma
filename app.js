const passengerPort = process.env.PORT;
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { 
  sequelize, 
  Lembaga, 
  Kategori, 
  Kelas, 
  Santri, 
  Transaksi,
  Tabungan,
  InfakHarian,
  User
} = require('./backend/models');

const app = express();
// PENTING: Trust Proxy agar rate-limit/session bisa membaca IP asli di balik reverse proxy cPanel
app.set('trust proxy', 1);
const PORT = passengerPort || process.env.PORT || 3000;

// Set EJS sebagai Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'backend', 'public')));

// Konfigurasi Session untuk Autentikasi Admin
app.use(session({
  secret: process.env.SESSION_SECRET || 'sikma_secret_key_default',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000 // 1 Hari
  }
}));

// Route Mapping
const webRoutes = require('./backend/routes/web');
const apiRoutes = require('./backend/routes/api');

app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Fungsi Seeding Data Awal (Demo) jika Database Kosong
async function seedInitialData() {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('[Database] Menginisialisasi akun admin pertama...');
      await User.create({
        username: 'admin',
        password: 'password', // akan di-hash oleh hook di model
        nama_lengkap: 'Super Admin',
        role: 'Admin'
      });
      console.log('[Database] Akun admin (username: admin, password: password) berhasil dibuat.');
    }

    const lembagaCount = await Lembaga.count();
    if (lembagaCount > 0) {
      console.log('[Database] Data awal sudah ada. Seeding dilewati.');
      return;
    }

    console.log('[Database] Menginisialisasi data awal (seeding)...');

    // 1. Seed Lembaga
    const madrasah = await Lembaga.create({ nama: 'Madrasah' });
    const paudqu = await Lembaga.create({ nama: 'PAUDQu' });
    const tpq = await Lembaga.create({ nama: 'TPQ' });
    const mdt = await Lembaga.create({ nama: 'MDT' });

    // 2. Seed Kategori Keuangan
    const kats = [
      { nama: 'SPP', lembagaId: madrasah.id },
      { nama: 'Uang Gedung', lembagaId: madrasah.id },
      { nama: 'Gaji Guru', lembagaId: madrasah.id },
      { nama: 'Operasional', lembagaId: madrasah.id },

      { nama: 'SPP', lembagaId: paudqu.id },
      { nama: 'Uang Seragam', lembagaId: paudqu.id },
      { nama: 'Gaji Guru', lembagaId: paudqu.id },

      { nama: 'SPP', lembagaId: tpq.id },
      { nama: 'Gaji Guru', lembagaId: tpq.id },
      { nama: 'Listrik & Air', lembagaId: tpq.id },

      { nama: 'SPP', lembagaId: mdt.id },
      { nama: 'Uang Kitab', lembagaId: mdt.id },
      { nama: 'Gaji Guru', lembagaId: mdt.id }
    ];
    await Kategori.bulkCreate(kats);

    // 3. Seed Kelas
    const klsMadrasah1 = await Kelas.create({ nama: 'Kelas 1A', lembagaId: madrasah.id });
    const klsMadrasah2 = await Kelas.create({ nama: 'Kelas 2', lembagaId: madrasah.id });
    const klsPaud1 = await Kelas.create({ nama: 'Mawar A', lembagaId: paudqu.id });
    const klsTpq1 = await Kelas.create({ nama: 'Jilid 1', lembagaId: tpq.id });
    const klsMdt1 = await Kelas.create({ nama: 'Kelas Awwal', lembagaId: mdt.id });

    // 4. Seed Santri
    const santri1 = await Santri.create({ nama: 'Muhammad Farhan', kelasId: klsMadrasah1.id, lembagaId: madrasah.id });
    const santri2 = await Santri.create({ nama: 'Siti Aminah', kelasId: klsMadrasah1.id, lembagaId: madrasah.id });
    const santri3 = await Santri.create({ nama: 'Budi Santoso', kelasId: klsMadrasah2.id, lembagaId: madrasah.id });
    const santri4 = await Santri.create({ nama: 'Rani Wijaya', kelasId: klsPaud1.id, lembagaId: paudqu.id });
    const santri5 = await Santri.create({ nama: 'Ahmad Fauzi', kelasId: klsTpq1.id, lembagaId: tpq.id });

    // 5. Seed Transaksi (Demo Pemasukan & Pengeluaran)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const katSppMadrasah = await Kategori.findOne({ where: { nama: 'SPP', lembagaId: madrasah.id } });
    const katGajiMadrasah = await Kategori.findOne({ where: { nama: 'Gaji Guru', lembagaId: madrasah.id } });
    const katSppPaud = await Kategori.findOne({ where: { nama: 'SPP', lembagaId: paudqu.id } });
    const katGajiTpq = await Kategori.findOne({ where: { nama: 'Gaji Guru', lembagaId: tpq.id } });

    await Transaksi.bulkCreate([
      {
        tanggal: yesterday,
        jenis: 'Pemasukan',
        nominal: 250000,
        keterangan: 'Pembayaran SPP Bulan Juli',
        lembagaId: madrasah.id,
        kategoriId: katSppMadrasah.id,
        kelasId: klsMadrasah1.id,
        santriId: santri1.id
      },
      {
        tanggal: yesterday,
        jenis: 'Pemasukan',
        nominal: 250000,
        keterangan: 'Pembayaran SPP Bulan Juli',
        lembagaId: madrasah.id,
        kategoriId: katSppMadrasah.id,
        kelasId: klsMadrasah1.id,
        santriId: santri2.id
      },
      {
        // Pengeluaran Umum (Tanpa kelas & santri)
        tanggal: yesterday,
        jenis: 'Pengeluaran',
        nominal: 1500000,
        keterangan: 'Gaji Guru Madrasah Bulan Juni',
        lembagaId: madrasah.id,
        kategoriId: katGajiMadrasah.id,
        kelasId: null,
        santriId: null
      },
      {
        tanggal: today,
        jenis: 'Pemasukan',
        nominal: 180000,
        keterangan: 'Pembayaran SPP',
        lembagaId: paudqu.id,
        kategoriId: katSppPaud.id,
        kelasId: klsPaud1.id,
        santriId: santri4.id
      },
      {
        tanggal: today,
        jenis: 'Pengeluaran',
        nominal: 500000,
        keterangan: 'Insentif Guru TPQ',
        lembagaId: tpq.id,
        kategoriId: katGajiTpq.id,
        kelasId: null,
        santriId: null
      }
    ]);

    console.log('[Database] Inisialisasi data seeder selesai!');
  } catch (err) {
    console.error('[Database] Seeding gagal:', err);
  }
}

// Koneksi ke Database & Sinkronisasi
sequelize.authenticate()
  .then(() => {
    console.log('[Database] Koneksi MySQL terhubung dengan sukses.');
    // Sinkronisasi Tabel (Force: false agar tidak menghapus data jika restart)
    return sequelize.sync({ force: false });
  })
  .then(async () => {
    console.log('[Database] Tabel-tabel berhasil disinkronisasi.');
    
    // Pastikan kategoriId di Transaksi bisa NULL
    try {
      await sequelize.query("ALTER TABLE Transaksi MODIFY COLUMN kategoriId INT NULL;");
      console.log('[Database] Berhasil menyesuaikan kolom kategoriId menjadi NULL.');
    } catch (err) {
      console.warn('[Database] Peringatan: Gagal memodifikasi kategoriId:', err.message);
    }
    
    // Tambahkan kolom nomor_kwitansi jika belum ada
    try {
      await sequelize.query("ALTER TABLE transaksi ADD COLUMN nomor_kwitansi VARCHAR(255) NULL UNIQUE;");
      console.log('[Database] Berhasil menambahkan kolom nomor_kwitansi di tabel transaksi.');
    } catch (err) {}
    
    try {
      await sequelize.query("ALTER TABLE tabungan ADD COLUMN nomor_kwitansi VARCHAR(255) NULL UNIQUE;");
      console.log('[Database] Berhasil menambahkan kolom nomor_kwitansi di tabel tabungan.');
    } catch (err) {}
    
    try {
      await sequelize.query("ALTER TABLE infakharian ADD COLUMN nomor_kwitansi VARCHAR(255) NULL UNIQUE;");
      console.log('[Database] Berhasil menambahkan kolom nomor_kwitansi di tabel infakharian.');
    } catch (err) {}
    
    // Pastikan tagihanId ada di Transaksi
    try {
      await sequelize.query("ALTER TABLE Transaksi ADD COLUMN tagihanId INT NULL;");
      console.log('[Database] Berhasil menambahkan kolom tagihanId.');
    } catch (err) {
      // Abaikan jika kolom sudah ada
    }

    try {
      await sequelize.query("ALTER TABLE Transaksi ADD CONSTRAINT fk_transaksi_tagihan FOREIGN KEY (tagihanId) REFERENCES Tagihan(id) ON DELETE SET NULL ON UPDATE CASCADE;");
      console.log('[Database] Berhasil menambahkan foreign key fk_transaksi_tagihan.');
    } catch (err) {
      // Abaikan jika constraint sudah ada
    }

    // Pastikan userId ada di Transaksi, Tabungan, InfakHarian
    try {
      await sequelize.query("ALTER TABLE Transaksi ADD COLUMN userId INT NULL;");
      await sequelize.query("ALTER TABLE Transaksi ADD CONSTRAINT fk_transaksi_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE;");
      console.log('[Database] Berhasil menambahkan kolom userId di Transaksi.');
    } catch (err) { }
    
    try {
      await sequelize.query("ALTER TABLE Tabungan ADD COLUMN userId INT NULL;");
      await sequelize.query("ALTER TABLE Tabungan ADD CONSTRAINT fk_tabungan_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE;");
      console.log('[Database] Berhasil menambahkan kolom userId di Tabungan.');
    } catch (err) { }
    
    try {
      await sequelize.query("ALTER TABLE InfakHarian ADD COLUMN userId INT NULL;");
      await sequelize.query("ALTER TABLE InfakHarian ADD CONSTRAINT fk_infak_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE;");
      console.log('[Database] Berhasil menambahkan kolom userId di InfakHarian.');
    } catch (err) { }

    // Pastikan kolom role di Users mencakup 'Super Admin'
    try {
      await sequelize.query("ALTER TABLE Users MODIFY COLUMN role ENUM('Super Admin', 'Admin', 'Staf') DEFAULT 'Staf';");
      console.log('[Database] Berhasil memperbarui ENUM role di tabel Users.');
      
      // Update akun admin bawaan agar langsung menjadi Super Admin
      await User.update({ role: 'Super Admin' }, { where: { username: 'admin' } });
    } catch (err) {
      console.warn('[Database] Peringatan: Gagal memodifikasi role di Users:', err.message);
    }

    // Jalankan seeding data awal
    await seedInitialData();
    
    // Jalankan Server Express
    app.listen(PORT, () => {
      console.log(`[Server] SIKMA berjalan lancar di http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[Database] Gagal menghubungkan ke MySQL. Pastikan MySQL XAMPP/Laragon aktif dan database di .env sudah dibuat.', err);
  });
