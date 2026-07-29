const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const ssoController = require('../controllers/ssoController');
const dashboardController = require('../controllers/dashboardController');
const transactionController = require('../controllers/transactionController');
const importController = require('../controllers/importController');
const tagihanController = require('../controllers/tagihanController');
const userController = require('../controllers/userController');

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/', (req, res) => res.render('public/index'));
router.get('/cek-tagihan', (req, res) => {
  res.render('public/cek-tagihan', {
    lembagaId: req.query.lembagaId || '-',
    namaSantri: req.query.namaSantri || '-'
  });
});
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// ==========================================
// SSO ROUTES
// ==========================================
router.get('/sso/login', ssoController.loginFromSpmb);
router.get('/sso/go-spmb', ssoController.goSpmb);

// ==========================================
// ADMIN ROUTES (Wajib Login, Default Dashboard)
// ==========================================
const adminRouter = express.Router();
adminRouter.use(authController.authMiddleware);

// Dashboard
adminRouter.get('/', dashboardController.getDashboard);
adminRouter.get('/lembaga/:slug', (req, res) => res.redirect(`/admin/lembaga/${req.params.slug}/dashboard`));
adminRouter.get('/lembaga/:slug/dashboard', dashboardController.getLembagaDashboard);

// Heartbeat & Logs
adminRouter.post('/api/admin/heartbeat', authController.postHeartbeat);
const logController = require('../controllers/logController');
adminRouter.get('/api/log-history', logController.getLogs);
adminRouter.delete('/api/log-history/:id', logController.deleteLog);

// Portal Lembaga Lainnya
adminRouter.get('/lembaga/:slug/laporan', transactionController.getLembagaLaporan);
adminRouter.get('/lembaga/:slug/input', transactionController.getLembagaInput);
adminRouter.get('/lembaga/:slug/santri', importController.getLembagaSantri);
adminRouter.get('/lembaga/:slug/kwitansi/:transaksiId', transactionController.getLembagaKwitansi);
adminRouter.get('/lembaga/:slug/tabungan-kwitansi/:transaksiId', transactionController.getTabunganKwitansi);
adminRouter.get('/lembaga/:slug/infak-kwitansi/:transaksiId', transactionController.getInfakKwitansi);
adminRouter.post('/lembaga/:slug/kwitansi-edit/:transaksiId', transactionController.postEditKwitansi);
adminRouter.post('/lembaga/:slug/tabungan-kwitansi-edit/:transaksiId', transactionController.postEditTabunganKwitansi);
adminRouter.post('/lembaga/:slug/infak-kwitansi-edit/:transaksiId', transactionController.postEditInfakKwitansi);

// Form Transaksi
adminRouter.get('/transaksi/baru', transactionController.getFormTransaksi);
adminRouter.post('/transaksi', transactionController.postTransaksi);
adminRouter.get('/transaksi/edit/:id', transactionController.getEditTransaksi);
adminRouter.post('/transaksi/edit/:id', transactionController.postEditTransaksi);
adminRouter.post('/transaksi/delete/:id', transactionController.postDeleteTransaksi);

// Laporan Keuangan
adminRouter.get('/laporan', transactionController.getLaporan);
adminRouter.get('/laporan/cetak', transactionController.getCetakLaporan);

// Tabungan & Infak Harian
adminRouter.get('/tabungan', transactionController.getTabunganLaporan);
adminRouter.get('/tabungan/cetak', transactionController.getCetakTabungan);
adminRouter.post('/tabungan/delete/:id', transactionController.postDeleteTabungan);
adminRouter.get('/infak', transactionController.getInfakLaporan);
adminRouter.get('/infak/cetak', transactionController.getCetakInfak);
adminRouter.post('/infak/delete/:id', transactionController.postDeleteInfak);

// Import Santri & CRUD Santri
adminRouter.get('/import', importController.getImportPage);
adminRouter.get('/santri/edit/:id', importController.getEditSantri);
adminRouter.post('/santri/edit/:id', importController.postEditSantri);
adminRouter.post('/santri/delete/:id', importController.postDeleteSantri);

// Laporan Tunggakan
const tunggakanController = require('../controllers/tunggakanController');
adminRouter.get('/tunggakan', tunggakanController.getTunggakanPage);

// Kelola Tagihan
adminRouter.get('/tagihan', tagihanController.getTagihanPage);
adminRouter.post('/tagihan', tagihanController.postTagihan);
adminRouter.get('/tagihan/edit/:id', tagihanController.getEditTagihan);
adminRouter.post('/tagihan/edit/:id', tagihanController.postEditTagihan);
adminRouter.post('/tagihan/delete/:id', tagihanController.deleteTagihan);

router.use('/admin', adminRouter);

// ==========================================
// SUPER ADMIN ROUTES (Khusus Super Admin)
// ==========================================
const superAdminRouter = express.Router();
superAdminRouter.use(authController.isSuperAdmin);

superAdminRouter.get('/', (req, res) => res.render('super-admin/dashboard'));

// Kelola Pengguna (User Management)
superAdminRouter.get('/users', userController.getUsers);
superAdminRouter.get('/users/create', userController.getCreateUser);
superAdminRouter.post('/users/create', userController.postCreateUser);
superAdminRouter.get('/users/edit/:id', userController.getEditUser);
superAdminRouter.post('/users/edit/:id', userController.postEditUser);
superAdminRouter.post('/users/delete/:id', userController.postDeleteUser);

router.use('/super-admin', superAdminRouter);

module.exports = router;
