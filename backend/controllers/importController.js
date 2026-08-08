const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const axios = require('axios');
const { Op } = require('sequelize');
const { catatLog } = require('../utils/logger');
const { Lembaga, Kelas, Santri, Transaksi, Tagihan } = require('../models');

module.exports = {
  // Render Halaman Import
  getImportPage: async (req, res) => {
    try {
      const spmbBaseUrl = (req.hostname === 'localhost' || req.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://spmb.mjic.sch.id';

      const lembagas = await Lembaga.findAll();
      const kelasList = await Kelas.findAll({ include: [{ model: Lembaga, as: 'lembaga' }] });
      
      res.render('santri_import', {
        lembagas,
        kelasList,
        spmbBaseUrl: spmbBaseUrl,
        username: req.session.username,
        success: req.query.success || null,
        error: req.query.error || null,
        simulated: req.query.simulated || null
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Import lewat Excel/CSV
  importExcel: async (req, res) => {
    try {
      if (!req.file) {
        return res.redirect('/admin/import?error=Harap pilih file Excel/CSV terlebih dahulu!');
      }

      // Membaca file dari memory buffer
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        return res.redirect('/admin/import?error=File Excel kosong atau format tidak sesuai!');
      }

      let importedCount = 0;
      
      // Ambil seluruh lembaga untuk mapping cepat
      const lembagas = await Lembaga.findAll();
      const lembagaMap = {};
      lembagas.forEach(l => {
        lembagaMap[l.nama.toLowerCase()] = l.id;
      });

      for (const row of rows) {
        // Kolom standard: "Nama Santri", "Kelas", "Lembaga"
        let namaSantri = row['Nama Santri'] || row['Nama'] || row['nama'];
        const namaKelas = row['Kelas'] || row['kelas'];
        const namaLembaga = row['Lembaga'] || row['lembaga'];

        if (!namaSantri || !namaKelas || !namaLembaga) continue;
        
        namaSantri = namaSantri.toUpperCase();

        // Cari Lembaga ID
        const lemId = lembagaMap[namaLembaga.trim().toLowerCase()];
        if (!lemId) continue; // Lewati jika lembaga tidak valid (Madrasah, PAUDQu, TPQ, MDT)

        // Cari atau buat Kelas untuk Lembaga tersebut
        const [kelasObj] = await Kelas.findOrCreate({
          where: { 
            nama: namaKelas.trim(),
            lembagaId: lemId
          }
        });

        // Simpan Santri baru
        await Santri.create({
          nama: namaSantri.trim(),
          kelasId: kelasObj.id,
          lembagaId: lemId
        });

        importedCount++;
      }

      res.redirect(`/admin/import?success=Berhasil mengimpor ${importedCount} data santri dari file Excel!`);
    } catch (error) {
      console.error(error);
      res.redirect('/admin/import?error=Gagal mengimpor file: ' + error.message);
    }
  },

  // Tarik Data dari spmb.mjic.sch.id via API
  pullFromSpmb: async (req, res) => {
    const defaultSpmbUrl = (req.hostname === 'localhost' || req.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api/santri-baru'
        : 'https://spmb.mjic.sch.id/api/santri-baru';
        
    const apiUrl = req.body.apiUrl || defaultSpmbUrl;
    
    try {
      let dataSantri = [];

      // Ambil lembaga untuk mapping
      const lembagas = await Lembaga.findAll();
      if (lembagas.length === 0) {
        return res.redirect('/admin/import?error=Data lembaga belum diinisialisasi!');
      }

      try {
        // Lakukan request ke API SPMB yang sesungguhnya
        const response = await axios.get(apiUrl, { timeout: 3000 });
        if (response.data && Array.isArray(response.data)) {
          dataSantri = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          dataSantri = response.data.data;
        }
      } catch (err) {
        console.error(`[API SPMB Error] Koneksi ke ${apiUrl} gagal:`, err.message);
        return res.redirect('/admin/import?error=Gagal terhubung ke server SPMB. Pastikan API URL benar dan server SPMB sedang online.');
      }

      let pulledCount = 0;
      const lembagaMap = {};
      lembagas.forEach(l => {
        lembagaMap[l.nama.toLowerCase()] = l.id;
      });

      for (const item of dataSantri) {
        let namaSantri = item.nama;
        const namaKelas = item.kelas;
        const namaLembaga = item.lembaga;

        if (!namaSantri || !namaKelas || !namaLembaga) continue;
        
        namaSantri = namaSantri.toUpperCase();

        const lemId = lembagaMap[namaLembaga.trim().toLowerCase()];
        if (!lemId) continue;

        // Cari atau buat Kelas
        const [kelasObj] = await Kelas.findOrCreate({
          where: { 
            nama: namaKelas.trim(),
            lembagaId: lemId
          }
        });

        // Cek apakah santri sudah ada (biar tidak duplikat)
        const santriExists = await Santri.findOne({
          where: {
            nama: namaSantri.trim(),
            kelasId: kelasObj.id,
            lembagaId: lemId
          }
        });

        if (!santriExists) {
          await Santri.create({
            nama: namaSantri.trim(),
            kelasId: kelasObj.id,
            lembagaId: lemId
          });
          pulledCount++;
        } else {
          if (santriExists.nama !== namaSantri.trim()) {
            santriExists.nama = namaSantri.trim();
            await santriExists.save();
          }
        }
      }

      // -- TAMBAHAN: Tarik Data Tunggakan untuk Backup --
      let dataTunggakan = [];
      try {
        const urlTunggakan = apiUrl.replace('santri-baru', 'tunggakan');
        const respTunggakan = await axios.get(urlTunggakan, { timeout: 3000 });
        if (respTunggakan.data && Array.isArray(respTunggakan.data)) {
            dataTunggakan = respTunggakan.data;
        } else if (respTunggakan.data && Array.isArray(respTunggakan.data.data)) {
            dataTunggakan = respTunggakan.data.data;
        }
      } catch (err) {
        console.warn('Gagal menarik data tunggakan untuk backup:', err.message);
      }

      // Simpan backup ke JSON
      const backupDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(path.join(backupDir, 'spmb_santri_backup.json'), JSON.stringify(dataSantri, null, 2));
      fs.writeFileSync(path.join(backupDir, 'spmb_tunggakan_backup.json'), JSON.stringify(dataTunggakan, null, 2));

      const statusMsg = `success=Berhasil menarik ${pulledCount} data santri baru dari API SPMB secara real-time! Backup tunggakan juga berhasil disimpan.`;

      res.redirect(`/admin/import?${statusMsg}`);
    } catch (error) {
      console.error(error);
      res.redirect('/admin/import?error=Gagal menarik data dari SPMB: ' + error.message);
    }
  },

  // Input Santri Manual
  inputManual: async (req, res) => {
    try {
      const { nama, lembagaId, kelas } = req.body;

      if (!nama || !lembagaId || !kelas) {
        return res.redirect('/admin/import?error=Semua kolom input manual harus diisi!');
      }

      // Cari atau buat Kelas
      const [kelasObj] = await Kelas.findOrCreate({
        where: { 
          nama: kelas.trim(),
          lembagaId: lembagaId
        }
      });

      // Cek apakah santri sudah ada (biar tidak duplikat)
      const santriExists = await Santri.findOne({
        where: {
          nama: nama.trim(),
          kelasId: kelasObj.id,
          lembagaId: lembagaId
        }
      });

      if (santriExists) {
        return res.redirect(`/admin/import?error=Santri dengan nama ${nama} sudah terdaftar di kelas tersebut!`);
      }

      // Simpan Santri baru
      await Santri.create({
        nama: nama.trim(),
        kelasId: kelasObj.id,
        lembagaId: lembagaId
      });

      res.redirect(`/admin/import?success=Berhasil menambahkan santri ${nama} secara manual!`);
    } catch (error) {
      console.error(error);
      res.redirect('/admin/import?error=Gagal menambahkan santri: ' + error.message);
    }
  },

  // Get Data Santri per Lembaga
  getLembagaSantri: async (req, res) => {
    try {
      const { slug } = req.params;

      const slugMap = {
        'mjic': { nama: 'Madrasah', title: 'Data Santri Keseluruhan', folder: 'mjic' },
        'madrasah': { nama: 'Madrasah', title: 'Data Santri Keseluruhan', folder: 'mjic' },
        'paudqu': { nama: 'PAUDQu', title: 'Data Santri PAUDQu', folder: 'paudqu.jic' },
        'tpq': { nama: 'TPQ', title: 'Data Santri TPQ', folder: 'tpq.jic' },
        'mdt': { nama: 'MDT', title: 'Data Santri MDT', folder: 'mdt.jic' }
      };

      const mapping = slugMap[slug.toLowerCase()];
      if (!mapping) return res.redirect('/');

      const lembaga = await Lembaga.findOne({ where: { nama: mapping.nama } });
      if (!lembaga) return res.redirect('/');

      // Pagination & Search parameters
      const limit = 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      // Jika slug adalah mjic (Madrasah) atau madrasah, tampilkan semua santri
      const isMjic = slug.toLowerCase() === 'mjic' || slug.toLowerCase() === 'madrasah';
      const whereClause = isMjic ? {} : { lembagaId: lembaga.id };
      
      if (search) {
        whereClause.nama = {
          [Op.like]: `%${search}%`
        };
      }

      // Dynamic Table Header Filters (Spreadsheet-like)
      const order = [];
      Object.keys(req.query).forEach(key => {
        const val = req.query[key];
        if (!val) return;

        if (key.startsWith('filter_')) {
          const col = key.replace('filter_', '');
          if (col === 'kelas') {
            whereClause['$kelas.nama$'] = { [Op.in]: val.split(',') };
          } else if (col === 'lembaga') {
            whereClause['$lembaga.nama$'] = { [Op.in]: val.split(',') };
          }
        } else if (key.startsWith('search_')) {
          const col = key.replace('search_', '');
          if (col === 'nama') {
            whereClause.nama = { [Op.like]: `%${val}%` };
          } else if (col === 'kelas') {
            whereClause['$kelas.nama$'] = { [Op.like]: `%${val}%` };
          } else if (col === 'lembaga') {
            whereClause['$lembaga.nama$'] = { [Op.like]: `%${val}%` };
          }
        } else if (key.startsWith('sort_')) {
          const col = key.replace('sort_', '');
          const direction = val.toUpperCase();
          if (direction === 'ASC' || direction === 'DESC') {
            if (col === 'nama') {
              order.push([col, direction]);
            } else if (col === 'kelas') {
              order.push([{ model: Kelas, as: 'kelas' }, 'nama', direction]);
            } else if (col === 'lembaga') {
              order.push([{ model: Lembaga, as: 'lembaga' }, 'nama', direction]);
            }
          }
        }
      });

      if (order.length === 0) {
        order.push(['nama', 'ASC']);
      }

      // Ambil daftar santri beserta kelas dan lembaganya dengan pagination
      const { count: totalItems, rows: santriList } = await Santri.findAndCountAll({
        where: whereClause,
        include: [
          { model: Kelas, as: 'kelas' },
          { model: Lembaga, as: 'lembaga' }
        ],
        order: order,
        limit,
        offset,
        subQuery: false
      });

      const totalPages = Math.ceil(totalItems / limit);

      res.render('santri', {
        slug,
        title: mapping.title,
        lembaga,
        santriList,
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        search,
        queryParams: req.query,
        filterOptions: {
          kelas: [...new Set((await Kelas.findAll({ attributes: ['nama'] })).map(k => k.nama))],
          lembaga: [...new Set((await Lembaga.findAll({ attributes: ['nama'] })).map(l => l.nama))]
        },
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getEditSantri: async (req, res) => {
    try {
      const { id } = req.params;
      const santri = await Santri.findByPk(id, {
        include: [
          { model: Kelas, as: 'kelas' },
          { model: Lembaga, as: 'lembaga' }
        ]
      });
      if (!santri) return res.status(404).send('Santri tidak ditemukan');

      const lembagas = await Lembaga.findAll();
      const kelasList = await Kelas.findAll({ where: { lembagaId: santri.lembagaId } });

      res.render('santri_edit', {
        santri,
        lembagas,
        kelasList,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postEditSantri: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama, kelasId, lembagaId } = req.body;
      const santri = await Santri.findByPk(id, {
        include: [{ model: Lembaga, as: 'lembaga' }]
      });
      if (!santri) return res.status(404).send('Santri tidak ditemukan');

      const oldKelasId = santri.kelasId;
      const namaLama = santri.nama;

      await santri.update({
        nama,
        kelasId: kelasId || null,
        lembagaId
      });

      await catatLog(req.session.userId, 'EDIT', 'Data Santri', `Mengubah data santri: ${namaLama} menjadi ${nama}`);

      if (oldKelasId && oldKelasId != kelasId) {
        const count = await Santri.count({ where: { kelasId: oldKelasId } });
        if (count === 0) {
          await Kelas.destroy({ where: { id: oldKelasId } });
        }
      }

      // After update, we need to fetch again if lembaga changed to get the new lembaga name
      const updatedSantri = await Santri.findByPk(id, {
        include: [{ model: Lembaga, as: 'lembaga' }]
      });

      const referer = req.get('Referrer');
      if (referer) {
        const url = new URL(referer);
        url.searchParams.set('success', 'Data santri berhasil diperbarui!');
        return res.redirect(url.toString());
      }

      const slugMap = { 'Madrasah': 'mjic', 'PAUDQu': 'paudqu', 'TPQ': 'tpq', 'MDT': 'mdt' };
      const slug = updatedSantri.lembaga ? (slugMap[updatedSantri.lembaga.nama] || 'mjic') : 'mjic';

      res.redirect(`/admin/lembaga/${slug}/santri?success=Data santri berhasil diperbarui!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postDeleteSantri: async (req, res) => {
    try {
      const { id } = req.params;
      const santri = await Santri.findByPk(id, {
        include: [{ model: Lembaga, as: 'lembaga' }]
      });
      if (!santri) return res.status(404).send('Santri tidak ditemukan');

      const slugMap = { 'Madrasah': 'mjic', 'PAUDQu': 'paudqu', 'TPQ': 'tpq', 'MDT': 'mdt' };
      const slug = santri.lembaga ? (slugMap[santri.lembaga.nama] || 'mjic') : 'mjic';

      const kelasId = santri.kelasId;
      const namaSantri = santri.nama;

      await santri.destroy();
      
      await catatLog(req.session.userId, 'HAPUS', 'Data Santri', `Menghapus data santri: ${namaSantri}`);

      if (kelasId) {
        const count = await Santri.count({ where: { kelasId } });
        if (count === 0) {
          await Kelas.destroy({ where: { id: kelasId } });
        }
      }
      
      const referer = req.get('Referrer');
      if (referer) {
        const url = new URL(referer);
        url.searchParams.set('success', 'Santri berhasil dihapus!');
        return res.redirect(url.toString());
      }
      
      res.redirect(`/admin/lembaga/${slug}/santri?success=Santri berhasil dihapus!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Proxy API Tunggakan SPMB
  apiSpmbTunggakan: async (req, res) => {
    try {
        const spmbBaseUrl = (req.hostname === 'localhost' || req.hostname === '127.0.0.1')
          ? 'http://localhost:5000'
          : 'https://spmb.mjic.sch.id';
        const apiUrl = `${spmbBaseUrl}/api/tunggakan`;
        const response = await axios.get(apiUrl, { timeout: 3000 });
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying SPMB Tunggakan:', error.message);
        // Fallback to backup
        try {
            const backupPath = path.join(__dirname, '..', 'data', 'spmb_tunggakan_backup.json');
            if (fs.existsSync(backupPath)) {
                const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                return res.json(data);
            }
        } catch (e) {
            console.error('Error reading backup:', e.message);
        }
        res.status(500).json({ error: 'Gagal mengambil data tunggakan dari SPMB' });
    }
  },

  // Halaman Backup Data Santri SPMB
  getSpmbBackup: async (req, res) => {
    try {
        let dataSantri = [];
        try {
            const spmbBaseUrl = (req.hostname === 'localhost' || req.hostname === '127.0.0.1')
              ? 'http://localhost:5000'
              : 'https://spmb.mjic.sch.id';
            const apiUrl = `${spmbBaseUrl}/api/santri-baru`;
            const response = await axios.get(apiUrl, { timeout: 3000 });
            dataSantri = response.data.data || response.data;
        } catch (err) {
            // Fallback to backup
            const backupPath = path.join(__dirname, '..', 'data', 'spmb_santri_backup.json');
            if (fs.existsSync(backupPath)) {
                dataSantri = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            }
        }
        
        // Filter lembaga
        const filterLembaga = req.query.lembaga || '';
        if (filterLembaga) {
            dataSantri = dataSantri.filter(s => s.lembaga.toLowerCase() === filterLembaga.toLowerCase());
        }

        res.render('spmb_backup', {
            title: 'Data Pendaftar SPMB (Read-Only)',
            santriList: dataSantri,
        filterLembaga,
        username: req.session.username
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
  },

  // Fitur Tutup Buku Paripurna SPMB
  postTutupBukuSpmb: async (req, res) => {
    try {
      const spmbBaseUrl = (req.hostname === 'localhost' || req.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://spmb.mjic.sch.id';

      // 1. Dapatkan Saldo Fisik Panitia
      let saldoPanitia = 0;
      try {
        const saldoResp = await axios.get(`${spmbBaseUrl}/api/saldo-panitia-spmb`, { timeout: 5000 });
        if (saldoResp.data && saldoResp.data.success) {
          saldoPanitia = saldoResp.data.saldo_fisik_panitia;
        }
      } catch (err) {
        console.warn('Gagal menarik saldo SPMB:', err.message);
      }

      let laporanSaldo = 'Saldo fisik SPMB ditarik Rp 0.';
      
      // 2. Jika ada saldo, buat transaksi Pemasukan Madrasah
      if (saldoPanitia > 0) {
        const madrasah = await Lembaga.findOne({ where: { nama: 'Madrasah' } });
        if (madrasah) {
          // Cek apakah bulan/tahun ini sudah ditarik
          const now = new Date();
          const exist = await Transaksi.findOne({
            where: {
              lembagaId: madrasah.id,
              jenis: 'Pemasukan',
              keterangan: 'Pelimpahan Saldo Kas Fisik Tutup Buku Panitia SPMB',
              tanggal: {
                [Op.like]: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}%`
              }
            }
          });

          if (!exist) {
            await Transaksi.create({
              lembagaId: madrasah.id,
              jenis: 'Pemasukan',
              nominal: saldoPanitia,
              keterangan: 'Pelimpahan Saldo Kas Fisik Tutup Buku Panitia SPMB',
              tanggal: now.toISOString().split('T')[0],
              kasir: req.user ? req.user.username : 'admin'
            });
            laporanSaldo = `Berhasil melimpahkan Saldo Fisik SPMB sebesar Rp ${saldoPanitia.toLocaleString('id-ID')}.`;
          } else {
            laporanSaldo = `Saldo fisik SPMB bulan ini sudah ditarik sebelumnya.`;
          }
        }
      }

      // 3. Tarik Santri SPMB (Mencegah data hilang)
      let dataSantri = [];
      try {
        const santriResp = await axios.get(`${spmbBaseUrl}/api/santri-baru`, { timeout: 5000 });
        dataSantri = santriResp.data.data || santriResp.data || [];
      } catch (err) {
        console.warn('Gagal menarik data santri:', err.message);
      }

      const lembagas = await Lembaga.findAll();
      const lembagaMap = {};
      lembagas.forEach(l => { lembagaMap[l.nama.toLowerCase()] = l.id; });

      let santriImported = 0;
      for (const item of dataSantri) {
        let namaSantri = item.nama?.toUpperCase().trim();
        const namaKelas = item.kelas?.trim();
        const namaLembaga = item.lembaga?.trim().toLowerCase();

        if (!namaSantri || !namaKelas || !lembagaMap[namaLembaga]) continue;

        const lemId = lembagaMap[namaLembaga];
        const [kelasObj] = await Kelas.findOrCreate({ where: { nama: namaKelas, lembagaId: lemId } });
        const [santriObj, created] = await Santri.findOrCreate({
          where: { nama: namaSantri, kelasId: kelasObj.id, lembagaId: lemId }
        });
        if (created) santriImported++;
      }

      // 4. Pastikan ada template Tagihan "Tunggakan SPMB Tahun Lalu" di SIKMA
      const madrasah = await Lembaga.findOne({ where: { nama: 'Madrasah' } });
      if (madrasah) {
        const [tagihanSPMB] = await Tagihan.findOrCreate({
          where: { nama: 'Tunggakan SPMB Tahun Lalu', lembagaId: madrasah.id },
          defaults: { nominal: 0, keterangan: 'Migrasi otomatis untuk melunasi hutang pendaftaran tahun lalu' }
        });
      }

      res.redirect(`/admin/import?success=Eksekusi Tutup Buku Paripurna Berhasil! ${laporanSaldo} Serta mengamankan ${santriImported} data santri baru ke database SIKMA.`);
    } catch (error) {
      console.error('Error postTutupBukuSpmb:', error);
      res.redirect('/admin/import?error=Gagal mengeksekusi tutup buku: ' + error.message);
    }
  }
};
