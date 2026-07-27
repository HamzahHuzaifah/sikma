const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const transactionController = require('../controllers/transactionController');
const importController = require('../controllers/importController');
const tagihanController = require('../controllers/tagihanController');
const userController = require('../controllers/userController');

// Halaman Login & Logout (tanpa middleware auth)
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// Halaman-halaman Admin (Wajib Login)
router.use(authController.authMiddleware);

// Dashboard
router.get('/', dashboardController.getDashboard);
router.get('/lembaga/:slug', (req, res) => res.redirect(`/lembaga/${req.params.slug}/dashboard`));
router.get('/lembaga/:slug/dashboard', dashboardController.getLembagaDashboard);

// Portal Lembaga Lainnya
router.get('/lembaga/:slug/laporan', transactionController.getLembagaLaporan);
router.get('/lembaga/:slug/input', transactionController.getLembagaInput);
router.get('/lembaga/:slug/santri', importController.getLembagaSantri);
router.get('/lembaga/:slug/kwitansi/:transaksiId', transactionController.getLembagaKwitansi);
router.get('/lembaga/:slug/tabungan-kwitansi/:transaksiId', transactionController.getTabunganKwitansi);
router.get('/lembaga/:slug/infak-kwitansi/:transaksiId', transactionController.getInfakKwitansi);
router.post('/lembaga/:slug/kwitansi-edit/:transaksiId', transactionController.postEditKwitansi);
router.post('/lembaga/:slug/tabungan-kwitansi-edit/:transaksiId', transactionController.postEditTabunganKwitansi);
router.post('/lembaga/:slug/infak-kwitansi-edit/:transaksiId', transactionController.postEditInfakKwitansi);

// Form Transaksi
router.get('/transaksi/baru', transactionController.getFormTransaksi);
router.post('/transaksi', transactionController.postTransaksi);
router.get('/transaksi/edit/:id', transactionController.getEditTransaksi);
router.post('/transaksi/edit/:id', transactionController.postEditTransaksi);
router.post('/transaksi/delete/:id', transactionController.postDeleteTransaksi);

// Laporan Keuangan
router.get('/laporan', transactionController.getLaporan);
router.get('/laporan/cetak', transactionController.getCetakLaporan);

// Tabungan & Infak Harian
router.get('/tabungan', transactionController.getTabunganLaporan);
router.get('/tabungan/cetak', transactionController.getCetakTabungan);
router.post('/tabungan/delete/:id', transactionController.postDeleteTabungan);
router.get('/infak', transactionController.getInfakLaporan);
router.get('/infak/cetak', transactionController.getCetakInfak);
router.post('/infak/delete/:id', transactionController.postDeleteInfak);

// Import Santri & CRUD Santri
router.get('/import', importController.getImportPage);
router.get('/santri/edit/:id', importController.getEditSantri);
router.post('/santri/edit/:id', importController.postEditSantri);
router.post('/santri/delete/:id', importController.postDeleteSantri);

// Kelola Tagihan
router.get('/tagihan', tagihanController.getTagihanPage);
router.post('/tagihan', tagihanController.postTagihan);
router.get('/tagihan/edit/:id', tagihanController.getEditTagihan);
router.post('/tagihan/edit/:id', tagihanController.postEditTagihan);
router.post('/tagihan/delete/:id', tagihanController.deleteTagihan);

// Kelola Pengguna (User Management)
router.get('/users', userController.getUsers);
router.get('/users/create', userController.getCreateUser);
router.post('/users/create', userController.postCreateUser);
router.get('/users/edit/:id', userController.getEditUser);
router.post('/users/edit/:id', userController.postEditUser);
router.post('/users/delete/:id', userController.postDeleteUser);

module.exports = router;
