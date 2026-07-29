const { Op } = require('sequelize');
const { Lembaga, Tagihan } = require('../models');
const { catatLog } = require('../utils/logger');

module.exports = {
  // Render Halaman Kelola Tagihan
  getTagihanPage: async (req, res) => {
    try {
      const lembagas = await Lembaga.findAll();
      
      // Pagination & Search parameters
      const limit = 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      const whereClause = {};
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
          if (col === 'lembaga') {
            whereClause['$lembaga.nama$'] = { [Op.in]: val.split(',') };
          }
        } else if (key.startsWith('search_')) {
          const col = key.replace('search_', '');
          if (col === 'nama' || col === 'nominal') {
            whereClause[col] = { [Op.like]: `%${val}%` };
          } else if (col === 'lembaga') {
            whereClause['$lembaga.nama$'] = { [Op.like]: `%${val}%` };
          }
        } else if (key.startsWith('sort_')) {
          const col = key.replace('sort_', '');
          const direction = val.toUpperCase();
          if (direction === 'ASC' || direction === 'DESC') {
            if (col === 'nama' || col === 'nominal') {
              order.push([col, direction]);
            } else if (col === 'lembaga') {
              order.push([{ model: Lembaga, as: 'lembaga' }, 'nama', direction]);
            }
          }
        }
      });

      if (order.length === 0) {
        order.push(['createdAt', 'DESC']);
      }

      const { count: totalItems, rows: tagihans } = await Tagihan.findAndCountAll({
        where: whereClause,
        include: [
          { model: Lembaga, as: 'lembaga' }
        ],
        order: order,
        limit,
        offset,
        subQuery: false
      });

      const totalPages = Math.ceil(totalItems / limit);

      res.render('tagihan', {
        lembagas,
        tagihans,
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        search,
        queryParams: req.query,
        filterOptions: {
          lembaga: [...new Set(lembagas.map(l => l.nama))]
        },
        username: req.session.username,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Simpan Tagihan baru
  postTagihan: async (req, res) => {
    const { nama, nominal, lembagaId, keterangan } = req.body;
    try {
      if (!nama || !nominal || !lembagaId) {
        return res.redirect('/admin/tagihan?error=Harap mengisi semua field wajib!');
      }

      await Tagihan.create({
        nama,
        nominal,
        lembagaId,
        keterangan: keterangan || ''
      });

      await catatLog(req.session.userId, 'INPUT', 'Data Tagihan', `Membuat tagihan baru: ${nama} (Rp ${nominal})`);

      res.redirect('/admin/tagihan?success=Tagihan baru berhasil dibuat!');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/tagihan?error=Gagal membuat tagihan: ' + encodeURIComponent(error.message));
    }
  },

  // Hapus Tagihan
  deleteTagihan: async (req, res) => {
    const { id } = req.params;
    try {
      const tagihan = await Tagihan.findByPk(id);
      if (!tagihan) {
        return res.redirect('/admin/tagihan?error=Tagihan tidak ditemukan!');
      }

      const nama = tagihan.nama;
      await tagihan.destroy();
      
      await catatLog(req.session.userId, 'HAPUS', 'Data Tagihan', `Menghapus tagihan: ${nama}`);
      
      res.redirect('/admin/tagihan?success=Tagihan berhasil dihapus!');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/tagihan?error=Gagal menghapus tagihan: ' + encodeURIComponent(error.message));
    }
  },

  // API - Ambil daftar tagihan berdasarkan lembagaId
  apiGetTagihan: async (req, res) => {
    try {
      const { lembagaId } = req.params;
      const tagihans = await Tagihan.findAll({
        where: { lembagaId }
      });
      res.json(tagihans);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // API - Ambil daftar tagihan yang BELUM DIBAYAR LUNAS oleh santri tertentu
  apiGetUnpaidTagihan: async (req, res) => {
    try {
      const { lembagaId, santriId } = req.params;
      
      const tagihans = await Tagihan.findAll({
        where: { lembagaId }
      });
      
      const { Transaksi } = require('../models');
      const paidTransactions = await Transaksi.findAll({
        where: {
          santriId,
          jenis: 'Pemasukan',
          tagihanId: {
            [Op.ne]: null
          }
        },
        attributes: ['tagihanId', 'nominal']
      });

      // Calculate total terbayar for each tagihan
      const paidMap = {};
      paidTransactions.forEach(t => {
        if (!paidMap[t.tagihanId]) {
          paidMap[t.tagihanId] = 0;
        }
        paidMap[t.tagihanId] += Number(t.nominal);
      });

      // Filter only tagihans that have remaining balance (sisa > 0)
      const unpaidTagihans = tagihans.map(t => {
        const terbayar = paidMap[t.id] || 0;
        const sisa = Number(t.nominal) - terbayar;
        return {
          ...t.toJSON(),
          terbayar,
          sisa
        };
      }).filter(t => t.sisa > 0);
      
      res.json(unpaidTagihans);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getEditTagihan: async (req, res) => {
    try {
      const { id } = req.params;
      const tagihan = await Tagihan.findByPk(id, {
        include: [{ model: Lembaga, as: 'lembaga' }]
      });
      if (!tagihan) return res.status(404).send('Tagihan tidak ditemukan');

      const lembagas = await Lembaga.findAll();

      res.render('tagihan_edit', {
        tagihan,
        lembagas,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postEditTagihan: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama, nominal, lembagaId, keterangan } = req.body;
      const tagihan = await Tagihan.findByPk(id);
      if (!tagihan) return res.status(404).send('Tagihan tidak ditemukan');

      await tagihan.update({
        nama,
        nominal,
        lembagaId,
        keterangan: keterangan || ''
      });

      await catatLog(req.session.userId, 'EDIT', 'Data Tagihan', `Mengubah tagihan: ${nama} (Rp ${nominal})`);

      res.redirect('/admin/tagihan?success=Aturan tagihan berhasil diperbarui!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
};
