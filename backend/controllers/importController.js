const xlsx = require('xlsx');
const axios = require('axios');
const { Op } = require('sequelize');
const { Lembaga, Kelas, Santri } = require('../models');

module.exports = {
  // Render Halaman Import
  getImportPage: async (req, res) => {
    try {
      const lembagas = await Lembaga.findAll();
      const kelasList = await Kelas.findAll({ include: [{ model: Lembaga, as: 'lembaga' }] });
      
      res.render('santri_import', {
        lembagas,
        kelasList,
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
        return res.redirect('/import?error=Harap pilih file Excel/CSV terlebih dahulu!');
      }

      // Membaca file dari memory buffer
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        return res.redirect('/import?error=File Excel kosong atau format tidak sesuai!');
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
        const namaSantri = row['Nama Santri'] || row['Nama'] || row['nama'];
        const namaKelas = row['Kelas'] || row['kelas'];
        const namaLembaga = row['Lembaga'] || row['lembaga'];

        if (!namaSantri || !namaKelas || !namaLembaga) continue;

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

      res.redirect(`/import?success=Berhasil mengimpor ${importedCount} data santri dari file Excel!`);
    } catch (error) {
      console.error(error);
      res.redirect('/import?error=Gagal mengimpor file: ' + error.message);
    }
  },

  // Tarik Data dari spmb.mjic.sch.id via API
  pullFromSpmb: async (req, res) => {
    const apiUrl = req.body.apiUrl || 'https://spmb.mjic.sch.id/api/santri-baru';
    
    try {
      let dataSantri = [];
      let isSimulated = false;

      // Ambil lembaga untuk mapping
      const lembagas = await Lembaga.findAll();
      if (lembagas.length === 0) {
        return res.redirect('/import?error=Data lembaga belum diinisialisasi!');
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
        // Fallback Simulasi jika API offline / error CORS / local offline dev
        console.log(`[API SPMB Fallback] Koneksi ke ${apiUrl} gagal. Menggunakan simulasi data.`);
        isSimulated = true;
        
        // Buat dummy data registrasi dari spmb.mjic.sch.id
        dataSantri = [
          { nama: 'Achmad Dani', kelas: 'Kelas 1', lembaga: 'Madrasah' },
          { nama: 'Siti Sarah Nurhaliza', kelas: 'Kelas 2', lembaga: 'Madrasah' },
          { nama: 'Muhammad Rizky', kelas: 'Arafah (A)', lembaga: 'PAUDQu' },
          { nama: 'Fatimah Az-Zahra', kelas: 'Jilid 1', lembaga: 'TPQ' },
          { nama: 'Zulkifli Hasan', kelas: 'Jilid 2', lembaga: 'TPQ' },
          { nama: 'Ali bin Abi Thalib', kelas: 'Kelas Awwal', lembaga: 'MDT' },
          { nama: 'Utsman bin Affan', kelas: 'Kelas Awwal', lembaga: 'MDT' }
        ];
      }

      let pulledCount = 0;
      const lembagaMap = {};
      lembagas.forEach(l => {
        lembagaMap[l.nama.toLowerCase()] = l.id;
      });

      for (const item of dataSantri) {
        const namaSantri = item.nama;
        const namaKelas = item.kelas;
        const namaLembaga = item.lembaga;

        if (!namaSantri || !namaKelas || !namaLembaga) continue;

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
        }
      }

      const statusMsg = isSimulated 
        ? `simulated=true&success=Koneksi ke SPMB Offline/Simulasi. Berhasil menarik ${pulledCount} data baru secara otomatis.`
        : `success=Berhasil menarik ${pulledCount} data santri baru dari API SPMB secara real-time!`;

      res.redirect(`/import?${statusMsg}`);
    } catch (error) {
      console.error(error);
      res.redirect('/import?error=Gagal menarik data dari SPMB: ' + error.message);
    }
  },

  // Input Santri Manual
  inputManual: async (req, res) => {
    try {
      const { nama, lembagaId, kelas } = req.body;

      if (!nama || !lembagaId || !kelas) {
        return res.redirect('/import?error=Semua kolom input manual harus diisi!');
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
        return res.redirect(`/import?error=Santri dengan nama ${nama} sudah terdaftar di kelas tersebut!`);
      }

      // Simpan Santri baru
      await Santri.create({
        nama: nama.trim(),
        kelasId: kelasObj.id,
        lembagaId: lembagaId
      });

      res.redirect(`/import?success=Berhasil menambahkan santri ${nama} secara manual!`);
    } catch (error) {
      console.error(error);
      res.redirect('/import?error=Gagal menambahkan santri: ' + error.message);
    }
  },

  // Get Data Santri per Lembaga
  getLembagaSantri: async (req, res) => {
    try {
      const { slug } = req.params;

      const slugMap = {
        'mjic': { nama: 'Madrasah', title: 'Data Santri MJIC (Madrasah)', folder: 'mjic' },
        'paudqu': { nama: 'PAUDQu', title: 'Data Santri PAUDQu JIC', folder: 'paudqu.jic' },
        'tpq': { nama: 'TPQ', title: 'Data Santri TPQ JIC', folder: 'tpq.jic' },
        'mdt': { nama: 'MDT', title: 'Data Santri MDT JIC', folder: 'mdt.jic' }
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

      // Jika slug adalah mjic (Madrasah), tampilkan semua santri (karena Madrasah menampung semua lembaga)
      const isMjic = slug.toLowerCase() === 'mjic';
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

      await santri.update({
        nama,
        kelasId: kelasId || null,
        lembagaId
      });

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

      res.redirect(`/lembaga/${slug}/santri?success=Data santri berhasil diperbarui!`);
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

      await santri.destroy();
      
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
      
      res.redirect(`/lembaga/${slug}/santri?success=Santri berhasil dihapus!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
};
