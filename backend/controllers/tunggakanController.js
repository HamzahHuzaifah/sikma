const { Lembaga, Kelas, Santri, Tagihan, Transaksi, sequelize } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');
const autoBilling = require('../utils/autoBilling');

module.exports = {
  getTunggakanPage: async (req, res) => {
    try {
      // 1. Jalankan Auto Billing SPP
      await autoBilling.generateMonthlySPP();

      const lembagas = await Lembaga.findAll();
      const kelasList = await Kelas.findAll({ include: [{ model: Lembaga, as: 'lembaga' }] });
      
      const search = req.query.search || '';

      // Pagination & Filter params
      const limit = 10;
      const page = parseInt(req.query.page) || 1;
      
      // Filter extraction
      const filters = {
        kelas: [],
        lembaga: [],
        searchNama: search.toLowerCase(),
        searchTagihan: ''
      };
      
      const order = [];

      Object.keys(req.query).forEach(key => {
        const val = req.query[key];
        if (!val) return;

        if (key.startsWith('filter_')) {
          const col = key.replace('filter_', '');
          if (col === 'kelas') filters.kelas = val.split(',');
          if (col === 'lembaga') filters.lembaga = val.split(',');
          if (col === 'source') filters.source = val.split(',');
        } else if (key.startsWith('search_')) {
          const col = key.replace('search_', '');
          if (col === 'santrinama') filters.searchNama = val.toLowerCase();
          if (col === 'tagihannama') filters.searchTagihan = val.toLowerCase();
        } else if (key.startsWith('sort_')) {
          const col = key.replace('sort_', '');
          order.push({ col, dir: val.toUpperCase() });
        }
      });

      // 2. Tarik Tunggakan Eksternal (SPMB)
      let dataSpmb = [];
      try {
        const response = await axios.get('http://localhost:5000/api/tunggakan', { timeout: 3000 });
        if (response.data && Array.isArray(response.data)) {
          dataSpmb = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          dataSpmb = response.data.data;
        }
      } catch (err) {
        console.warn('[SPMB API] Gagal mengambil data tunggakan SPMB:', err.message);
      }

      // 3. Kalkulasi Tunggakan Internal (SIKMA)
      const santris = await Santri.findAll({
        include: [
          { model: Kelas, as: 'kelas' },
          { model: Lembaga, as: 'lembaga' }
        ]
      });

      const tagihans = await Tagihan.findAll();
      
      const transaksis = await Transaksi.findAll({
        where: {
          jenis: 'Pemasukan',
          tagihanId: { [Op.not]: null }
        },
        attributes: ['santriId', 'tagihanId', [sequelize.fn('SUM', sequelize.col('nominal')), 'total_bayar']],
        group: ['santriId', 'tagihanId']
      });

      const bayarMap = {};
      transaksis.forEach(t => {
        const key = `${t.santriId}_${t.tagihanId}`;
        bayarMap[key] = parseFloat(t.getDataValue('total_bayar'));
      });

      // Rangkai Laporan
      let laporanTunggakan = [];

      for (const santri of santris) {
        const applicableTagihans = tagihans.filter(tg => tg.lembagaId === santri.lembagaId);
        for (const tagihan of applicableTagihans) {
          const totalBayar = bayarMap[`${santri.id}_${tagihan.id}`] || 0;
          const sisaTunggakan = parseFloat(tagihan.nominal) - totalBayar;
          if (sisaTunggakan > 0) {
            laporanTunggakan.push({
              source: 'SIKMA',
              santriNama: santri.nama,
              kelasNama: santri.kelas ? santri.kelas.nama : '-',
              lembagaNama: santri.lembaga ? santri.lembaga.nama : '-',
              tagihanNama: tagihan.nama,
              nominalTagihan: parseFloat(tagihan.nominal),
              sudahDibayar: totalBayar,
              sisaTunggakan: sisaTunggakan
            });
          }
        }
      }

      // Gabungkan Tunggakan SPMB
      for (const spmb of dataSpmb) {
        if (parseFloat(spmb.sisa || 0) > 0) {
          laporanTunggakan.push({
            source: 'SPMB',
            santriNama: spmb.nama || 'Tanpa Nama',
            kelasNama: spmb.kelas || 'Calon Santri',
            lembagaNama: spmb.lembaga || 'SPMB',
            tagihanNama: spmb.nama_tagihan || 'Tagihan Pendaftaran SPMB',
            nominalTagihan: parseFloat(spmb.total || spmb.sisa || 0),
            sudahDibayar: parseFloat(spmb.dibayar || 0),
            sisaTunggakan: parseFloat(spmb.sisa || 0)
          });
        }
      }

      // 4. Proses Filter Manual (Karena data gabungan dari API & DB)
      if (filters.kelas.length > 0) {
        laporanTunggakan = laporanTunggakan.filter(t => filters.kelas.includes(t.kelasNama));
      }
      if (filters.lembaga.length > 0) {
        laporanTunggakan = laporanTunggakan.filter(t => filters.lembaga.includes(t.lembagaNama));
      }
      if (filters.source && filters.source.length > 0) {
        laporanTunggakan = laporanTunggakan.filter(t => filters.source.includes(t.source));
      }
      if (filters.searchNama) {
        laporanTunggakan = laporanTunggakan.filter(t => t.santriNama.toLowerCase().includes(filters.searchNama));
      }
      if (filters.searchTagihan) {
        laporanTunggakan = laporanTunggakan.filter(t => t.tagihanNama.toLowerCase().includes(filters.searchTagihan));
      }

      // 5. Proses Sorting
      if (order.length > 0) {
        const { col, dir } = order[0]; // Hanya ambil sort pertama
        laporanTunggakan.sort((a, b) => {
          let valA = a[col];
          let valB = b[col];
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          
          if (valA < valB) return dir === 'ASC' ? -1 : 1;
          if (valA > valB) return dir === 'ASC' ? 1 : -1;
          return 0;
        });
      } else {
        laporanTunggakan.sort((a, b) => b.sisaTunggakan - a.sisaTunggakan); // Default sort
      }

      // 6. Pagination Manual
      const totalItems = laporanTunggakan.length;
      const totalPages = Math.ceil(totalItems / limit);
      const offset = (page - 1) * limit;
      const paginatedData = laporanTunggakan.slice(offset, offset + limit);

      // Render
      res.render('tunggakan', {
        username: req.session.username,
        laporanTunggakan: paginatedData,
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        queryParams: req.query,
        search,
        filterOptions: {
          kelas: [...new Set(laporanTunggakan.map(t => t.kelasNama))],
          lembaga: [...new Set(laporanTunggakan.map(t => t.lembagaNama))],
          source: ['SIKMA', 'SPMB']
        }
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan pada server saat memuat laporan tunggakan.');
    }
  }
};
