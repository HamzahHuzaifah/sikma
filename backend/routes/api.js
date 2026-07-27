const express = require('express');
const router = express.Router();
const multer = require('multer');
const transactionController = require('../controllers/transactionController');
const importController = require('../controllers/importController');
const authController = require('../controllers/authController');
const tagihanController = require('../controllers/tagihanController');

// Inisialisasi multer dengan memory storage untuk upload file
const upload = multer({ storage: multer.memoryStorage() });

// Middleware Pengaman API (Hanya Admin yang bisa panggil)
router.use(authController.authMiddleware);

// Cascading Dropdown API
router.get('/kategori/:lembagaId', transactionController.apiGetKategori);
router.get('/kelas/:lembagaId', transactionController.apiGetKelas);
router.get('/santri/:kelasId', transactionController.apiGetSantri);
router.get('/tagihan/lembaga/:lembagaId', tagihanController.apiGetTagihan);

// API Impor Data
router.post('/import/excel', upload.single('excelFile'), importController.importExcel);
router.post('/import/spmb', importController.pullFromSpmb);
router.post('/import/manual', importController.inputManual);

module.exports = router;
