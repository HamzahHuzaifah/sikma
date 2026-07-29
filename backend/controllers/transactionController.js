const { Op } = require('sequelize');
const { Lembaga, Kategori, Kelas, Santri, Transaksi, Tagihan, Tabungan, InfakHarian, User } = require('../models');
const { catatLog } = require('../utils/logger');

module.exports = {
  // Render Form Input Transaksi
  getFormTransaksi: async (req, res) => {
    try {
      const lembagas = await Lembaga.findAll();
      const tagihans = await Tagihan.findAll({
        include: [{ model: Lembaga, as: 'lembaga' }]
      });

      // Filter settings
      const filter = {};
      const order = [];

      Object.keys(req.query).forEach(key => {
        const val = req.query[key];
        if (!val) return;

        if (key.startsWith('filter_')) {
          const col = key.replace('filter_', '');
          if (col === 'jenis') {
            filter[col] = { [Op.in]: val.split(',') };
          } else if (col === 'lembaga') {
            filter['$lembaga.nama$'] = { [Op.in]: val.split(',') };
          } else if (col === 'santri') {
            filter[Op.or] = [
              { '$santri.nama$': { [Op.in]: val.split(',') } },
              { '$tagihan.nama$': { [Op.in]: val.split(',') } },
              { '$kategori.nama$': { [Op.in]: val.split(',') } }
            ];
          }
        } else if (key.startsWith('search_')) {
          const col = key.replace('search_', '');
          if (col === 'nominal' || col === 'tanggal' || col === 'jenis') {
            filter[col] = { [Op.like]: `%${val}%` };
          } else if (col === 'lembaga') {
            filter['$lembaga.nama$'] = { [Op.like]: `%${val}%` };
          } else if (col === 'santri') {
            filter[Op.or] = [
              { '$santri.nama$': { [Op.like]: `%${val}%` } },
              { '$kategori.nama$': { [Op.like]: `%${val}%` } },
              { keterangan: { [Op.like]: `%${val}%` } }
            ];
          }
        } else if (key.startsWith('sort_')) {
          const col = key.replace('sort_', '');
          const direction = val.toUpperCase();
          if (direction === 'ASC' || direction === 'DESC') {
            if (col === 'nominal' || col === 'tanggal' || col === 'jenis') {
              order.push([col, direction]);
            } else if (col === 'lembaga') {
              order.push([{ model: Lembaga, as: 'lembaga' }, 'nama', direction]);
            } else if (col === 'santri') {
              order.push([{ model: Santri, as: 'santri' }, 'nama', direction]);
            }
          }
        }
      });

      if (order.length === 0) {
        order.push(['tanggal', 'DESC']);
        order.push(['createdAt', 'DESC']);
      }

      const transactions = await Transaksi.findAll({
        where: filter,
        limit: 10,
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Kategori, as: 'kategori' },
          { model: Kelas, as: 'kelas' },
          { model: Santri, as: 'santri' },
          { model: Tagihan, as: 'tagihan' },
          { model: User, as: 'user', attributes: ['nama_lengkap'] }
        ],
        order: order,
        subQuery: false
      });

      // Fetch dynamic options for santri column filter
      const allSantris = await Santri.findAll({ attributes: ['nama'] });
      const allTagihans = await Tagihan.findAll({ attributes: ['nama'] });
      const allKategoris = await Kategori.findAll({ attributes: ['nama'] });

      const santriFilterOptions = [
        ...new Set([
          ...allSantris.map(s => s.nama),
          ...allTagihans.map(t => t.nama),
          ...allKategoris.map(k => k.nama)
        ])
      ];

      res.render('transaksi_form', { 
        lembagas,
        tagihans,
        transactions,
        defaultLembagaId: req.query.lembagaId || null,
        username: req.session.username,
        success: req.query.success || null,
        error: req.query.error || null,
        queryParams: req.query,
        filterOptions: {
          lembaga: [...new Set(lembagas.map(l => l.nama))],
          santri: santriFilterOptions
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Helper untuk membersihkan ID tunggal dari req.body (mencegah array/koma)
  parseSingleId: (val) => {
    if (!val) return null;
    if (Array.isArray(val)) {
      const found = val.find(v => v !== null && v !== undefined && String(v).trim() !== '');
      return found ? parseInt(found, 10) : null;
    }
    if (typeof val === 'string') {
      const clean = val.split(',')[0].trim();
      return clean ? parseInt(clean, 10) : null;
    }
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  },

  // Simpan Transaksi baru
  postTransaksi: async (req, res) => {
    const parseSingleId = module.exports.parseSingleId;
    const { 
      tanggal, 
      jenisTransaksi, 
      nominal, 
      redirectUrl,
      // Tagihan fields
      kelasId_tagihan,
      santriId_tagihan,
      metode_tagihan,
      catatan_tagihan,
      // Pemasukan lain fields
      uraianPemasukan,
      diterimaDari,
      pemberi,
      metode_pemasukan,
      catatan_pemasukan,
      // Pengeluaran fields
      uraianPengeluaran,
      dibayarkanKepada,
      metode_pengeluaran,
      catatan_pengeluaran,
      // Tabungan fields
      kelasId_tabungan,
      santriId_tabungan,
      lembagaId_global
    } = req.body;
    
    const kelasId = parseSingleId(kelasId_tagihan || kelasId_tabungan || req.body.kelasId);
    const santriId = parseSingleId(santriId_tagihan || santriId_tabungan || req.body.santriId);
    const globalLembagaId = parseSingleId(lembagaId_global);

    const defaultRedirect = '/admin/transaksi/baru';
    const redirectBase = redirectUrl || defaultRedirect;
    const separator = redirectBase.includes('?') ? '&' : '?';

    try {
      const isTabungan = jenisTransaksi === 'tabungan_setor' || jenisTransaksi === 'tabungan_tarik';
      if (!tanggal || !jenisTransaksi || (!nominal && !isTabungan)) {
        return res.redirect(`${redirectBase}${separator}error=Harap mengisi semua field wajib!`);
      }

      let insertData = {
        tanggal,
        nominal,
        kategoriId: null,
        userId: req.session.userId
      };

      if (jenisTransaksi === 'pembayaran_tagihan') {
        const tagihanId = parseInt(req.body.tagihanId_tagihan);
        const tagihan = await Tagihan.findByPk(tagihanId);
        if (!tagihan) {
          return res.redirect(`${redirectBase}${separator}error=Tagihan tidak ditemukan!`);
        }
        if (!kelasId || !santriId) {
          return res.redirect(`${redirectBase}${separator}error=Untuk pembayaran tagihan, Kelas dan Nama Santri wajib diisi!`);
        }
        
        insertData.jenis = 'Pemasukan';
        insertData.tagihanId = tagihanId;
        insertData.lembagaId = tagihan.lembagaId;
        insertData.kelasId = kelasId;
        insertData.santriId = santriId;
        
        const santri = await Santri.findByPk(santriId);
        const santriName = santri ? santri.nama : '';
        insertData.keterangan = `Pembayaran: ${tagihan.nama}${santriName ? ' - ' + santriName : ''}\nMetode: ${metode_tagihan || 'Cash'}\nCatatan: ${catatan_tagihan || ''}`;

      } else if (jenisTransaksi === 'pemasukan_lain') {
        if (!uraianPemasukan || !diterimaDari || !pemberi || !globalLembagaId) {
          return res.redirect(`${redirectBase}${separator}error=Harap lengkapi semua field data Pemasukan!`);
        }
        
        insertData.jenis = 'Pemasukan';
        insertData.lembagaId = globalLembagaId;
        insertData.keterangan = `Uraian: ${uraianPemasukan}\nDiterima Dari: ${diterimaDari}\nPemberi: ${pemberi}\nMetode: ${metode_pemasukan || 'Cash'}\nCatatan: ${catatan_pemasukan || ''}`;

      } else if (jenisTransaksi === 'pengeluaran') {
        if (!uraianPengeluaran || !dibayarkanKepada || !globalLembagaId) {
          return res.redirect(`${redirectBase}${separator}error=Harap lengkapi semua field data Pengeluaran!`);
        }

        // Validasi Saldo Lembaga
        const totalPemasukanLembaga = await Transaksi.sum('nominal', { where: { jenis: 'Pemasukan', lembagaId: globalLembagaId } }) || 0;
        const totalPengeluaranLembaga = await Transaksi.sum('nominal', { where: { jenis: 'Pengeluaran', lembagaId: globalLembagaId } }) || 0;
        const currentBalanceLembaga = totalPemasukanLembaga - totalPengeluaranLembaga;

        if (nominal > currentBalanceLembaga) {
          return res.redirect(`${redirectBase}${separator}error=Saldo Lembaga tidak mencukupi untuk melakukan transaksi pengeluaran ini. (Saldo: Rp ${currentBalanceLembaga.toLocaleString('id-ID')})`);
        }

        insertData.jenis = 'Pengeluaran';
        insertData.lembagaId = globalLembagaId;
        insertData.keterangan = `Uraian: ${uraianPengeluaran}\nDibayarkan Kepada: ${dibayarkanKepada}\nMetode: ${metode_pengeluaran || 'Cash'}\nCatatan: ${catatan_pengeluaran || ''}`;

      } else if (jenisTransaksi === 'setor_madrasah') {
        const { uraian_setoran, metode_setoran, catatan_setoran } = req.body;
        if (!globalLembagaId || !nominal) {
          return res.redirect(`${redirectBase}${separator}error=Harap lengkapi field nominal dan lembaga!`);
        }

        // Validasi Saldo Lembaga
        const totalPemasukanLembaga = await Transaksi.sum('nominal', { where: { jenis: 'Pemasukan', lembagaId: globalLembagaId } }) || 0;
        const totalPengeluaranLembaga = await Transaksi.sum('nominal', { where: { jenis: 'Pengeluaran', lembagaId: globalLembagaId } }) || 0;
        const currentBalanceLembaga = totalPemasukanLembaga - totalPengeluaranLembaga;

        if (nominal > currentBalanceLembaga) {
          return res.redirect(`${redirectBase}${separator}error=Saldo Lembaga tidak mencukupi untuk melakukan setor ke madrasah. (Saldo: Rp ${currentBalanceLembaga.toLocaleString('id-ID')})`);
        }
        
        const allLembaga = await Lembaga.findAll();
        const madrasah = allLembaga.find(l => l.nama.toLowerCase().includes('madrasah'));
        if (!madrasah) {
          return res.redirect(`${redirectBase}${separator}error=Lembaga Madrasah tidak ditemukan di database!`);
        }
        const lembagaAsal = allLembaga.find(l => l.id == globalLembagaId);

        // 1. Catat Pengeluaran di lembaga asal
        const pengeluaranData = {
          tanggal,
          nominal,
          jenis: 'Pengeluaran',
          lembagaId: globalLembagaId,
          kategoriId: null,
          userId: req.session.userId,
          keterangan: `Uraian: ${uraian_setoran || 'Setoran ke Madrasah'}\nDibayarkan Kepada: Kas Madrasah\nMetode: ${metode_setoran || 'Cash'}\nCatatan: ${catatan_setoran || ''}`
        };

        // 2. Catat Pemasukan di Madrasah
        const pemasukanData = {
          tanggal,
          nominal,
          jenis: 'Pemasukan',
          lembagaId: madrasah.id,
          kategoriId: null,
          userId: req.session.userId,
          keterangan: `Uraian: Penerimaan Setoran (${uraian_setoran || 'Setoran Rutin'})\nDiterima Dari: ${lembagaAsal ? lembagaAsal.nama : 'Lembaga Unit'}\nPemberi: Bendahara ${lembagaAsal ? lembagaAsal.nama : 'Lembaga Unit'}\nMetode: ${metode_setoran || 'Cash'}\nCatatan: ${catatan_setoran || ''}`
        };

        await Transaksi.create(pengeluaranData);
        await Transaksi.create(pemasukanData);
        
        await catatLog(req.session.userId, 'INPUT', 'Transaksi', `Setor Uang ke Madrasah sebesar Rp ${nominal}`);

        return res.redirect(`${redirectBase}${separator}success=Transaksi setor uang ke Madrasah berhasil disimpan!`);

      } else if (isTabungan) {
        if (!kelasId || !globalLembagaId) {
          return res.redirect(`${redirectBase}${separator}error=Lembaga dan Kelas wajib diisi untuk transaksi Tabungan!`);
        }

        const tipe = jenisTransaksi === 'tabungan_setor' ? 'Setor' : 'Tarik';
        
        let santriIds = req.body.santriId_tabungan;
        let nominals = req.body.nominal_tabungan;

        // Ensure arrays
        if (!Array.isArray(santriIds)) santriIds = santriIds ? [santriIds] : [];
        if (!Array.isArray(nominals)) nominals = nominals ? [nominals] : [];

        if (santriIds.length === 0) {
          return res.redirect(`${redirectBase}${separator}error=Tidak ada santri yang dipilih untuk transaksi Tabungan!`);
        }

        let createdCount = 0;
        for (let i = 0; i < santriIds.length; i++) {
          const sId = parseInt(santriIds[i], 10);
          const sNominal = parseInt(nominals[i], 10);

          // Only process if nominal is provided and greater than 0
          if (sId && sNominal && sNominal > 0) {
            if (tipe === 'Tarik') {
              const totalSetor = await Tabungan.sum('nominal', { where: { santriId: sId, tipe: 'Setor' } }) || 0;
              const totalTarik = await Tabungan.sum('nominal', { where: { santriId: sId, tipe: 'Tarik' } }) || 0;
              const saldoTabungan = totalSetor - totalTarik;
              
              if (sNominal > saldoTabungan) {
                const santri = await Santri.findByPk(sId);
                const santriName = santri ? santri.nama : 'Santri';
                return res.redirect(`${redirectBase}${separator}error=Penarikan ditolak! Saldo tabungan ${santriName} tidak mencukupi (Saldo: Rp ${saldoTabungan.toLocaleString('id-ID')}, Ditarik: Rp ${sNominal.toLocaleString('id-ID')}).`);
              }
            }

            await Tabungan.create({
              tanggal,
              tipe,
              nominal: sNominal,
              lembagaId: globalLembagaId,
              kelasId,
              santriId: sId,
              userId: req.session.userId,
              keterangan: `Metode: ${req.body.metode_tabungan || 'Cash'}\nCatatan: ${req.body.catatan_tabungan || ''}`
            });
            createdCount++;
          }
        }

        if (createdCount === 0) {
           return res.redirect(`${redirectBase}${separator}error=Tidak ada nominal tabungan yang diisi!`);
        }

        await catatLog(req.session.userId, 'INPUT', 'Tabungan', `Input Tabungan Massal untuk ${createdCount} santri (Tipe: ${tipe})`);

        return res.redirect(`${redirectBase}${separator}success=Transaksi Tabungan massal berhasil disimpan!`);
      } else if (jenisTransaksi === 'infak_harian') {
        if (!globalLembagaId) {
          return res.redirect(`${redirectBase}${separator}error=Lembaga wajib diisi untuk transaksi Infak Harian!`);
        }
        await InfakHarian.create({
          tanggal,
          nominal,
          lembagaId: globalLembagaId,
          userId: req.session.userId,
          keterangan: `Catatan: ${req.body.catatan_infak || ''}`
        });

        await catatLog(req.session.userId, 'INPUT', 'Infak Harian', `Input Infak Harian sebesar Rp ${nominal}`);

        return res.redirect(`${redirectBase}${separator}success=Transaksi Infak Harian berhasil disimpan!`);
      } else {
        return res.redirect(`${redirectBase}${separator}error=Jenis Transaksi tidak valid!`);
      }

      await Transaksi.create(insertData);

      await catatLog(req.session.userId, 'INPUT', 'Transaksi', `Input Transaksi (Jenis: ${insertData.jenis}) sebesar Rp ${nominal}`);

      res.redirect(`${redirectBase}${separator}success=Transaksi berhasil disimpan!`);
    } catch (error) {
      console.error(error);
      res.redirect(`${redirectBase}${separator}error=Gagal menyimpan transaksi: ` + encodeURIComponent(error.message));
    }
  },

  // Render Laporan & Rekapitulasi Keuangan
  getLaporan: async (req, res) => {
    try {
      let { startDate, endDate, lembagaId, bulan, tahun } = req.query;
      if (tahun) {
        if (bulan) {
          startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
          endDate = `${tahun}-${bulan.padStart(2, '0')}-${new Date(tahun, bulan, 0).getDate()}`;
        } else {
          startDate = `${tahun}-01-01`;
          endDate = `${tahun}-12-31`;
        }
      }
      const lembagas = await Lembaga.findAll();

      // Setup filter default / query
      const filter = {};
      
      if (startDate && endDate) {
        filter.tanggal = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        filter.tanggal = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        filter.tanggal = {
          [Op.lte]: endDate
        };
      }

      if (lembagaId) {
        filter.lembagaId = lembagaId;
      }

      // Pagination & Global Search parameters
      const limit = 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      if (search) {
        filter.keterangan = {
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
          if (col === 'jenis') {
            filter[col] = { [Op.in]: val.split(',') };
          } else if (col === 'lembaga') {
            filter['$lembaga.nama$'] = { [Op.in]: val.split(',') };
          } else if (col === 'tagihan') {
            filter[Op.or] = [
              { '$tagihan.nama$': { [Op.in]: val.split(',') } },
              { '$kategori.nama$': { [Op.in]: val.split(',') } }
            ];
          } else if (col === 'kelas') {
            filter['$kelas.nama$'] = { [Op.in]: val.split(',') };
          } else if (col === 'santri') {
            filter['$santri.nama$'] = { [Op.in]: val.split(',') };
          }
        } else if (key.startsWith('search_')) {
          const col = key.replace('search_', '');
          if (col === 'nominal' || col === 'tanggal' || col === 'jenis') {
            filter[col] = { [Op.like]: `%${val}%` };
          } else if (col === 'lembaga') {
            filter['$lembaga.nama$'] = { [Op.like]: `%${val}%` };
          } else if (col === 'santri') {
            filter['$santri.nama$'] = { [Op.like]: `%${val}%` };
          } else if (col === 'tagihan') {
            filter['$tagihan.nama$'] = { [Op.like]: `%${val}%` };
          } else if (col === 'kelas') {
            filter['$kelas.nama$'] = { [Op.like]: `%${val}%` };
          }
        } else if (key.startsWith('sort_')) {
          const col = key.replace('sort_', '');
          const direction = val.toUpperCase();
          if (direction === 'ASC' || direction === 'DESC') {
            if (col === 'nominal' || col === 'tanggal' || col === 'jenis') {
              order.push([col, direction]);
            } else if (col === 'lembaga') {
              order.push([{ model: Lembaga, as: 'lembaga' }, 'nama', direction]);
            } else if (col === 'santri') {
              order.push([{ model: Santri, as: 'santri' }, 'nama', direction]);
            } else if (col === 'kelas') {
              order.push([{ model: Kelas, as: 'kelas' }, 'nama', direction]);
            } else if (col === 'tagihan') {
              order.push([{ model: Tagihan, as: 'tagihan' }, 'nama', direction]);
            }
          }
        }
      });

      // Default order if none specified
      if (order.length === 0) {
        order.push(['tanggal', 'DESC']);
        order.push(['createdAt', 'DESC']);
      }

      // Hitung total keseluruhan dan saldo untuk paginasi (Di memory)
      const allTransactions = await Transaksi.findAll({
        where: filter,
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Kategori, as: 'kategori' },
          { model: Kelas, as: 'kelas' },
          { model: Santri, as: 'santri' },
          { model: Tagihan, as: 'tagihan' },
          { model: User, as: 'user', attributes: ['nama_lengkap'] }
        ],
        order: [['tanggal', 'ASC'], ['createdAt', 'ASC']]
      });

      // Hitung Saldo Awal sebelum startDate
      let saldoAwal = 0;
      if (startDate) {
        const filterSebelum = {};
        if (lembagaId) filterSebelum.lembagaId = lembagaId;
        filterSebelum.tanggal = { [Op.lt]: startDate };
        const totalPemAwal = await Transaksi.sum('nominal', { where: { ...filterSebelum, jenis: 'Pemasukan' } }) || 0;
        const totalPengAwal = await Transaksi.sum('nominal', { where: { ...filterSebelum, jenis: 'Pengeluaran' } }) || 0;
        saldoAwal = totalPemAwal - totalPengAwal;
      }

      let currentSaldo = saldoAwal;
      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      allTransactions.forEach(t => {
        if (t.jenis === 'Pemasukan') {
          currentSaldo += parseFloat(t.nominal);
          totalPemasukan += parseFloat(t.nominal);
        } else if (t.jenis === 'Pengeluaran') {
          currentSaldo -= parseFloat(t.nominal);
          totalPengeluaran += parseFloat(t.nominal);
        }
        t.dataValues.saldoAkhir = currentSaldo;
        t.saldoAkhir = currentSaldo;
      });

      // Manual Pagination
      const totalItems = allTransactions.length;
      const totalPages = Math.ceil(totalItems / limit);
      const transactions = allTransactions.slice(offset, offset + limit);

      // Fetch options for dropdown filters
      const allTagihans = await Tagihan.findAll({ attributes: ['nama'] });
      const allKategoris = await Kategori.findAll({ attributes: ['nama'] });
      const allKelas = await Kelas.findAll({ attributes: ['nama'] });
      const allSantris = await Santri.findAll({ attributes: ['nama'] });

      const tagihanKategoriOptions = [
        ...new Set([
          ...allTagihans.map(t => t.nama),
          ...allKategoris.map(k => k.nama)
        ])
      ];
      const kelasOptions = [...new Set(allKelas.map(k => k.nama))];
      const santriOptions = [...new Set(allSantris.map(s => s.nama))];

      res.render('transaksi_laporan', {
        transactions,
        lembagas,
        saldoAwal,
        totalPemasukan,
        totalPengeluaran,
        saldo: totalPemasukan - totalPengeluaran,
        filters: { startDate, endDate, lembagaId },
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        search,
        queryParams: req.query,
        filterOptions: {
          tagihan: tagihanKategoriOptions,
          kelas: kelasOptions,
          santri: santriOptions
        },
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // API - Get Kategori berdasarkan Lembaga
  apiGetKategori: async (req, res) => {
    try {
      const { lembagaId } = req.params;
      const kategori = await Kategori.findAll({ where: { lembagaId } });
      res.json(kategori);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // API - Get Kelas berdasarkan Lembaga
  apiGetKelas: async (req, res) => {
    try {
      const { lembagaId } = req.params;
      const { hasSantri } = req.query;
      
      const queryOptions = { where: { lembagaId } };
      
      if (hasSantri === 'true') {
        queryOptions.include = [{
          model: Santri,
          as: 'santri',
          attributes: ['id']
        }];
      }
      
      const kelas = await Kelas.findAll(queryOptions);
      
      if (hasSantri === 'true') {
        const kelasAktif = kelas.filter(k => k.santri && k.santri.length > 0);
        return res.json(kelasAktif);
      }
      
      res.json(kelas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // API - Get Santri berdasarkan Kelas
  apiGetSantri: async (req, res) => {
    try {
      const { kelasId } = req.params;
      const santri = await Santri.findAll({ where: { kelasId } });
      res.json(santri);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 1. Get Laporan Lembaga Mandiri
  getLembagaLaporan: async (req, res) => {
    try {
      const { slug } = req.params;
      const { startDate, endDate } = req.query;

      const slugMap = {
        'mjic': { nama: 'Madrasah' },
        'paudqu': { nama: 'PAUDQu' },
        'tpq': { nama: 'TPQ' },
        'mdt': { nama: 'MDT' }
      };

      const mapping = slugMap[slug.toLowerCase()];
      if (!mapping) return res.redirect('/');

      const lembaga = await Lembaga.findOne({ where: { nama: mapping.nama } });
      if (!lembaga) return res.redirect('/');

      let queryStr = `?lembagaId=${lembaga.id}`;
      if (startDate) queryStr += `&startDate=${startDate}`;
      if (endDate) queryStr += `&endDate=${endDate}`;

      res.redirect(`/admin/laporan${queryStr}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // 2. Get Form Input Lembaga Mandiri
  getLembagaInput: async (req, res) => {
    try {
      const { slug } = req.params;
      
      const slugMap = {
        'mjic': { nama: 'Madrasah' },
        'paudqu': { nama: 'PAUDQu' },
        'tpq': { nama: 'TPQ' },
        'mdt': { nama: 'MDT' }
      };

      const mapping = slugMap[slug.toLowerCase()];
      if (!mapping) return res.redirect('/');

      const lembaga = await Lembaga.findOne({ where: { nama: mapping.nama } });
      if (!lembaga) return res.redirect('/');

      res.redirect(`/admin/transaksi/baru?lembagaId=${lembaga.id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getEditTransaksi: async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await Transaksi.findByPk(id, {
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Kategori, as: 'kategori' },
          { model: Kelas, as: 'kelas' },
          { model: Santri, as: 'santri' },
          { model: Tagihan, as: 'tagihan' }
        ]
      });
      if (!transaction) return res.status(404).send('Transaksi tidak ditemukan');

      const lembagas = await Lembaga.findAll();
      
      // Parse details from keterangan
      const lines = transaction.keterangan ? transaction.keterangan.split('\n') : [];
      let parsed = {
        metode: 'Cash',
        catatan: '',
        uraian: '',
        diterimaDari: '',
        pemberi: '',
        dibayarkanKepada: ''
      };

      lines.forEach(l => {
        if (l.startsWith('Metode:')) parsed.metode = l.replace('Metode:', '').trim();
        else if (l.startsWith('Catatan:')) parsed.catatan = l.replace('Catatan:', '').trim();
        else if (l.startsWith('Uraian:')) parsed.uraian = l.replace('Uraian:', '').trim();
        else if (l.startsWith('Diterima Dari:')) parsed.diterimaDari = l.replace('Diterima Dari:', '').trim();
        else if (l.startsWith('Pemberi:')) parsed.pemberi = l.replace('Pemberi:', '').trim();
        else if (l.startsWith('Dibayarkan Kepada:')) parsed.dibayarkanKepada = l.replace('Dibayarkan Kepada:', '').trim();
      });

      let tagihans = [];
      let kelasList = [];
      let santriList = [];

      if (transaction.tagihanId) {
        tagihans = await Tagihan.findAll({ where: { lembagaId: transaction.lembagaId } });
        kelasList = await Kelas.findAll({ where: { lembagaId: transaction.lembagaId } });
        if (transaction.kelasId) {
          santriList = await Santri.findAll({ where: { kelasId: transaction.kelasId } });
        }
      }

      res.render('transaksi_edit', {
        transaction,
        lembagas,
        tagihans,
        kelasList,
        santriList,
        parsed,
        queryParams: req.query,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postEditTransaksi: async (req, res) => {
    try {
      const parseSingleId = module.exports.parseSingleId;
      const { id } = req.params;
      const transaction = await Transaksi.findByPk(id);
      if (!transaction) return res.status(404).send('Transaksi tidak ditemukan');

      const {
        tanggal,
        nominal,
        kelasId_tagihan,
        santriId_tagihan,
        kelasId_tabungan,
        santriId_tabungan,
        tagihanId,
        metode_tagihan,
        catatan_tagihan,
        uraianPemasukan,
        diterimaDari,
        pemberi,
        metode_pemasukan,
        catatan_pemasukan,
        uraianPengeluaran,
        dibayarkanKepada,
        metode_pengeluaran,
        catatan_pengeluaran,
        lembagaId_global,
        redirectUrl
      } = req.body;

      const kelasId = parseSingleId(kelasId_tagihan || kelasId_tabungan || req.body.kelasId);
      const santriId = parseSingleId(santriId_tagihan || santriId_tabungan || req.body.santriId);
      const cleanTagihanId = parseSingleId(tagihanId);
      const globalLembagaId = parseSingleId(lembagaId_global);

      let updateData = {
        tanggal,
        nominal: parseFloat(nominal)
      };

      if (transaction.tagihanId) {
        updateData.kelasId = kelasId || null;
        updateData.santriId = santriId || null;
        updateData.tagihanId = cleanTagihanId || transaction.tagihanId || null;
        
        const tagihan = await Tagihan.findByPk(updateData.tagihanId);
        const santri = await Santri.findByPk(santriId);
        const santriName = santri ? santri.nama : '';
        const tagihanName = tagihan ? tagihan.nama : '';
        updateData.keterangan = `Pembayaran: ${tagihanName}${santriName ? ' - ' + santriName : ''}\nMetode: ${metode_tagihan || 'Cash'}\nCatatan: ${catatan_tagihan || ''}`;
      } else if (transaction.jenis === 'Pemasukan') {
        updateData.lembagaId = globalLembagaId;
        updateData.keterangan = `Uraian: ${uraianPemasukan}\nDiterima Dari: ${diterimaDari}\nPemberi: ${pemberi}\nMetode: ${metode_pemasukan || 'Cash'}\nCatatan: ${catatan_pemasukan || ''}`;
      } else if (transaction.jenis === 'Pengeluaran') {
        updateData.lembagaId = globalLembagaId;
        updateData.keterangan = `Uraian: ${uraianPengeluaran}\nDibayarkan Kepada: ${dibayarkanKepada}\nMetode: ${metode_pengeluaran || 'Cash'}\nCatatan: ${catatan_pengeluaran || ''}`;
      }

      await transaction.update(updateData);
      
      await catatLog(req.session.userId, 'EDIT', 'Transaksi', `Mengubah transaksi ID ${transaction.id} (Jenis: ${transaction.jenis})`);

      const defaultRedirect = '/admin/laporan';
      const redirectBase = redirectUrl || defaultRedirect;
      const separator = redirectBase.includes('?') ? '&' : '?';
      res.redirect(`${redirectBase}${separator}success=Transaksi berhasil diperbarui!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postDeleteTransaksi: async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await Transaksi.findByPk(id);
      if (!transaction) return res.status(404).send('Transaksi tidak ditemukan');

      const jenis = transaction.jenis;
      const nominal = transaction.nominal;
      await transaction.destroy();
      
      await catatLog(req.session.userId, 'HAPUS', 'Transaksi', `Menghapus transaksi (Jenis: ${jenis}, Nominal: Rp ${nominal})`);

      const redirectUrl = req.body.redirectUrl || '/admin/laporan';
      const separator = redirectUrl.includes('?') ? '&' : '?';
      res.redirect(`${redirectUrl}${separator}success=Transaksi berhasil dihapus!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // 3. Get Cetak Kwitansi
  getLembagaKwitansi: async (req, res) => {
    try {
      const { slug, transaksiId } = req.params;

      const slugMap = {
        'mjic': { nama: 'Madrasah', folder: 'mjic' },
        'paudqu': { nama: 'PAUDQu', folder: 'paudqu.jic' },
        'tpq': { nama: 'TPQ', folder: 'tpq.jic' },
        'mdt': { nama: 'MDT', folder: 'mdt.jic' }
      };

      const mapping = slugMap[slug.toLowerCase()];
      if (!mapping) return res.redirect('/');

      const transaction = await Transaksi.findOne({
        where: { id: transaksiId },
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Kategori, as: 'kategori' },
          { model: Kelas, as: 'kelas' },
          { model: Santri, as: 'santri' },
          { model: Tagihan, as: 'tagihan' }
        ]
      });

      if (!transaction || transaction.lembaga.nama !== mapping.nama) {
        return res.status(404).send('Transaksi tidak ditemukan.');
      }

      // Hitung nominal terbilang
      const nominalTerbilang = helperTerbilang(transaction.nominal) + " Rupiah";

      res.render('kwitansi', {
        slug,
        transaction,
        nominalTerbilang,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getTabunganKwitansi: async (req, res) => {
    try {
      const { slug, transaksiId } = req.params;
      const slugMap = { 'mjic': 'Madrasah', 'paudqu': 'PAUDQu', 'tpq': 'TPQ', 'mdt': 'MDT' };
      const mapping = slugMap[slug.toLowerCase()];
      if (!mapping) return res.redirect('/tabungan');

      const transaction = await Tabungan.findOne({
        where: { id: transaksiId },
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Kelas, as: 'kelas' },
          { model: Santri, as: 'santri' }
        ]
      });

      if (!transaction || transaction.lembaga.nama !== mapping) {
        return res.status(404).send('Transaksi tabungan tidak ditemukan.');
      }

      const nominalTerbilang = helperTerbilang(transaction.nominal) + " Rupiah";

      res.render('tabungan_kwitansi', {
        slug,
        transaction,
        nominalTerbilang,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getInfakKwitansi: async (req, res) => {
    try {
      const { slug, transaksiId } = req.params;
      const slugMap = { 'mjic': 'Madrasah', 'paudqu': 'PAUDQu', 'tpq': 'TPQ', 'mdt': 'MDT' };
      const mapping = slugMap[slug.toLowerCase()];
      if (!mapping) return res.redirect('/infak');

      const transaction = await InfakHarian.findOne({
        where: { id: transaksiId },
        include: [{ model: Lembaga, as: 'lembaga' }]
      });

      if (!transaction || transaction.lembaga.nama !== mapping) {
        return res.status(404).send('Transaksi infak tidak ditemukan.');
      }

      const nominalTerbilang = helperTerbilang(transaction.nominal) + " Rupiah";

      res.render('infak_kwitansi', {
        slug,
        transaction,
        nominalTerbilang,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postEditKwitansi: async (req, res) => {
    try {
      const { transaksiId } = req.params;
      const trx = await Transaksi.findByPk(transaksiId);
      if (!trx) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

      const fields = ['docTitle', 'dibayarkanKepadaSign', 'diterimaDariPembayaran', 'namaPemberi', 'layoutMarginTop', 'layoutMarginLeft', 'ttdWidth', 'ttdX', 'ttdY', 'rowOrder', 'rincianNames'];
      fields.forEach(f => {
        if (req.body[f] !== undefined) trx[f] = req.body[f];
      });
      if (req.body.ttdVisible !== undefined) trx.ttdVisible = req.body.ttdVisible;

      await trx.save();
      res.json({ success: true, message: 'Layout Kwitansi Transaksi berhasil disimpan!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  postEditTabunganKwitansi: async (req, res) => {
    try {
      const { transaksiId } = req.params;
      const trx = await Tabungan.findByPk(transaksiId);
      if (!trx) return res.status(404).json({ success: false, message: 'Transaksi Tabungan tidak ditemukan' });

      const fields = ['docTitle', 'dibayarkanKepadaSign', 'diterimaDariPembayaran', 'namaPemberi', 'layoutMarginTop', 'layoutMarginLeft', 'ttdWidth', 'ttdX', 'ttdY', 'rowOrder', 'rincianNames'];
      fields.forEach(f => {
        if (req.body[f] !== undefined) trx[f] = req.body[f];
      });
      if (req.body.ttdVisible !== undefined) trx.ttdVisible = req.body.ttdVisible;

      await trx.save();
      res.json({ success: true, message: 'Layout Kwitansi Tabungan berhasil disimpan!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  postEditInfakKwitansi: async (req, res) => {
    try {
      const { transaksiId } = req.params;
      const trx = await InfakHarian.findByPk(transaksiId);
      if (!trx) return res.status(404).json({ success: false, message: 'Transaksi Infak tidak ditemukan' });

      const fields = ['docTitle', 'dibayarkanKepadaSign', 'diterimaDariPembayaran', 'namaPemberi', 'layoutMarginTop', 'layoutMarginLeft', 'ttdWidth', 'ttdX', 'ttdY', 'rowOrder', 'rincianNames'];
      fields.forEach(f => {
        if (req.body[f] !== undefined) trx[f] = req.body[f];
      });
      if (req.body.ttdVisible !== undefined) trx.ttdVisible = req.body.ttdVisible;

      await trx.save();
      res.json({ success: true, message: 'Layout Kwitansi Infak berhasil disimpan!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // Render Laporan & Rekapitulasi Tabungan
  getTabunganLaporan: async (req, res) => {
    try {
      let { startDate, endDate, lembagaId, kelasId, santriId, bulan, tahun } = req.query;
      if (tahun) {
        if (bulan) {
          startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
          endDate = `${tahun}-${bulan.padStart(2, '0')}-${new Date(tahun, bulan, 0).getDate()}`;
        } else {
          startDate = `${tahun}-01-01`;
          endDate = `${tahun}-12-31`;
        }
      }
      const lembagas = await Lembaga.findAll();
      const filter = {};

      if (startDate && endDate) {
        filter.tanggal = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        filter.tanggal = { [Op.gte]: startDate };
      } else if (endDate) {
        filter.tanggal = { [Op.lte]: endDate };
      }

      if (lembagaId) filter.lembagaId = lembagaId;
      if (kelasId) filter.kelasId = kelasId;
      if (santriId) filter.santriId = santriId;

      const limit = 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      if (search) {
        filter[Op.or] = [
          { keterangan: { [Op.like]: `%${search}%` } },
          { '$santri.nama$': { [Op.like]: `%${search}%` } }
        ];
      }

      // Calculate totals and pagination in memory
      const allTabungan = await Tabungan.findAll({
        where: filter,
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Kelas, as: 'kelas' },
          { model: Santri, as: 'santri' },
          { model: User, as: 'user', attributes: ['nama_lengkap'] }
        ],
        order: [['tanggal', 'ASC'], ['createdAt', 'ASC']]
      });

      // Hitung Saldo Awal sebelum startDate
      let saldoAwal = 0;
      if (startDate) {
        const filterSebelum = {};
        if (lembagaId) filterSebelum.lembagaId = lembagaId;
        if (kelasId) filterSebelum.kelasId = kelasId;
        if (santriId) filterSebelum.santriId = santriId;
        filterSebelum.tanggal = { [Op.lt]: startDate };
        const totalSetorAwal = await Tabungan.sum('nominal', { where: { ...filterSebelum, tipe: 'Setor' } }) || 0;
        const totalTarikAwal = await Tabungan.sum('nominal', { where: { ...filterSebelum, tipe: 'Tarik' } }) || 0;
        saldoAwal = totalSetorAwal - totalTarikAwal;
      }

      let currentSaldo = saldoAwal;
      let totalSetor = 0;
      let totalTarik = 0;

      allTabungan.forEach(t => {
        if (t.tipe === 'Setor') {
          currentSaldo += parseFloat(t.nominal);
          totalSetor += parseFloat(t.nominal);
        } else if (t.tipe === 'Tarik') {
          currentSaldo -= parseFloat(t.nominal);
          totalTarik += parseFloat(t.nominal);
        }
        t.dataValues.saldoAkhir = currentSaldo;
        t.saldoAkhir = currentSaldo;
      });

      // Group consecutive items by tanggal, kelas, tipe for Massal UI
      const groupedTabungan = [];
      let currentGroup = null;

      allTabungan.forEach(t => {
        const isGroupable = currentGroup 
          && currentGroup.tanggal === t.tanggal 
          && currentGroup.kelasId === t.kelasId 
          && currentGroup.tipe === t.tipe 
          && currentGroup.lembagaId === t.lembagaId
          && Math.abs(new Date(t.createdAt).getTime() - new Date(currentGroup.lastCreatedAt).getTime()) < 60000;

        if (isGroupable) {
          currentGroup.items.push(t);
          currentGroup.totalNominal += parseFloat(t.nominal);
          currentGroup.saldoAkhir = t.saldoAkhir;
          currentGroup.lastCreatedAt = t.createdAt;
        } else {
          currentGroup = {
            isGroup: true,
            tanggal: t.tanggal,
            kelasId: t.kelasId,
            tipe: t.tipe,
            lembagaId: t.lembagaId,
            lembaga: t.lembaga,
            kelas: t.kelas,
            totalNominal: parseFloat(t.nominal),
            saldoAkhir: t.saldoAkhir,
            lastCreatedAt: t.createdAt,
            items: [t]
          };
          groupedTabungan.push(currentGroup);
        }
      });

      // Manual Pagination based on Groups
      const totalItems = groupedTabungan.length;
      const totalPages = Math.ceil(totalItems / limit);
      const tabunganList = groupedTabungan.slice(offset, offset + limit);

      res.render('tabungan_laporan', {
        tabunganList,
        saldoAwal,
        lembagas,
        totalSetor,
        totalTarik,
        saldo: totalSetor - totalTarik,
        filters: { startDate, endDate, lembagaId, kelasId, santriId },
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        search,
        queryParams: req.query,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postDeleteTabungan: async (req, res) => {
    try {
      const { id } = req.params;
      const tabungan = await Tabungan.findByPk(id);
      if (!tabungan) return res.status(404).send('Data Tabungan tidak ditemukan');

      const nominal = tabungan.nominal;
      const tipe = tabungan.tipe;
      await tabungan.destroy();

      await catatLog(req.session.userId, 'HAPUS', 'Tabungan', `Menghapus data Tabungan (${tipe}) sebesar Rp ${nominal}`);

      const redirectUrl = req.body.redirectUrl || '/tabungan';
      const separator = redirectUrl.includes('?') ? '&' : '?';
      res.redirect(`${redirectUrl}${separator}success=Transaksi Tabungan berhasil dihapus!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Render Laporan & Rekapitulasi Infak Harian
  getInfakLaporan: async (req, res) => {
    try {
      let { startDate, endDate, lembagaId, bulan, tahun } = req.query;
      if (tahun) {
        if (bulan) {
          startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
          endDate = `${tahun}-${bulan.padStart(2, '0')}-${new Date(tahun, bulan, 0).getDate()}`;
        } else {
          startDate = `${tahun}-01-01`;
          endDate = `${tahun}-12-31`;
        }
      }
      const lembagas = await Lembaga.findAll();
      const filter = {};

      if (startDate && endDate) {
        filter.tanggal = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        filter.tanggal = { [Op.gte]: startDate };
      } else if (endDate) {
        filter.tanggal = { [Op.lte]: endDate };
      }

      if (lembagaId) filter.lembagaId = lembagaId;

      const limit = 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      if (search) {
        filter.keterangan = { [Op.like]: `%${search}%` };
      }

      const allInfak = await InfakHarian.findAll({
        where: filter,
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: User, as: 'user', attributes: ['nama_lengkap'] }
        ],
        order: [['tanggal', 'ASC'], ['createdAt', 'ASC']]
      });

      // Hitung Saldo Awal sebelum startDate
      let saldoAwal = 0;
      if (startDate) {
        const filterSebelum = {};
        if (lembagaId) filterSebelum.lembagaId = lembagaId;
        filterSebelum.tanggal = { [Op.lt]: startDate };
        saldoAwal = await InfakHarian.sum('nominal', { where: filterSebelum }) || 0;
      }

      let currentSaldo = saldoAwal;
      let totalInfak = 0;

      allInfak.forEach(i => {
        currentSaldo += parseFloat(i.nominal);
        totalInfak += parseFloat(i.nominal);
        i.dataValues.saldoAkhir = currentSaldo;
        i.saldoAkhir = currentSaldo;
      });

      // Manual Pagination
      const totalItems = allInfak.length;
      const totalPages = Math.ceil(totalItems / limit);
      const infakList = allInfak.slice(offset, offset + limit);

      res.render('infak_laporan', {
        infakList,
        saldoAwal,
        lembagas,
        totalInfak,
        filters: { startDate, endDate, lembagaId },
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        search,
        queryParams: req.query,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  postDeleteInfak: async (req, res) => {
    try {
      const { id } = req.params;
      const infak = await InfakHarian.findByPk(id);
      if (!infak) return res.status(404).send('Data Infak tidak ditemukan');

      const nominal = infak.nominal;
      await infak.destroy();

      await catatLog(req.session.userId, 'HAPUS', 'Infak Harian', `Menghapus data Infak Harian sebesar Rp ${nominal}`);

      const redirectUrl = req.body.redirectUrl || '/infak';
      const separator = redirectUrl.includes('?') ? '&' : '?';
      res.redirect(`${redirectUrl}${separator}success=Transaksi Infak Harian berhasil dihapus!`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // ==========================================
  // RENDER CETAK LAPORAN F4 (TRANSAKSI UMUM)
  // ==========================================
  getCetakLaporan: async (req, res) => {
    try {
      let { startDate, endDate, lembagaId, bulan, tahun } = req.query;
      if (tahun) {
        if (bulan) {
          startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
          endDate = `${tahun}-${bulan.padStart(2, '0')}-${new Date(tahun, bulan, 0).getDate()}`;
        } else {
          startDate = `${tahun}-01-01`;
          endDate = `${tahun}-12-31`;
        }
      }

      const filter = {};
      if (startDate && endDate) {
        filter.tanggal = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        filter.tanggal = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        filter.tanggal = {
          [Op.lte]: endDate
        };
      }

      if (lembagaId) {
        filter.lembagaId = lembagaId;
      }

      // Ambil data lembaga untuk judul & template
      let lembagaSingkatan = 'SEMUA';
      let lembagaNama = 'SEMUA LEMBAGA';
      let bgImage = 'Template Laporan dan Kwintasi.webp';

      if (lembagaId) {
        const lem = await Lembaga.findByPk(lembagaId);
        if (lem) {
          lembagaNama = lem.nama;
          const lowerName = lem.nama.toLowerCase();
          if (lowerName.includes('paudqu')) {
            lembagaSingkatan = 'PAUDQU';
            bgImage = 'Template Laporan dan Kwintasi PAUDQU.webp';
          } else if (lowerName.includes('tpq')) {
            lembagaSingkatan = 'TPQ';
            bgImage = 'Template Laporan dan Kwintasi TPQ.webp';
          } else if (lowerName.includes('mdt')) {
            lembagaSingkatan = 'MDT';
            bgImage = 'Template Laporan dan Kwintasi MDT.webp';
          } else if (lowerName.includes('madrasah')) {
            lembagaSingkatan = 'MADRASAH';
            bgImage = 'Template Laporan dan Kwintasi Madrasah.webp';
          }
        }
      }

      // Saldo Awal (Pemasukan - Pengeluaran) sebelum startDate
      let saldoAwal = 0;
      if (startDate) {
        const filterSebelum = {};
        if (lembagaId) filterSebelum.lembagaId = lembagaId;
        filterSebelum.tanggal = { [Op.lt]: startDate };
        
        const totalPemSebelum = await Transaksi.sum('nominal', { where: { ...filterSebelum, jenis: 'Pemasukan' } }) || 0;
        const totalPengSebelum = await Transaksi.sum('nominal', { where: { ...filterSebelum, jenis: 'Pengeluaran' } }) || 0;
        saldoAwal = totalPemSebelum - totalPengSebelum;
      }

      // Ambil semua transaksi sesuai filter (tanpa limit/pagination)
      const transactions = await Transaksi.findAll({
        where: filter,
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Santri, as: 'santri' }
        ],
        order: [['tanggal', 'ASC'], ['createdAt', 'ASC']]
      });

      res.render('laporan_cetak_f4', {
        title: 'Cetak Laporan',
        transactions,
        saldoAwal,
        startDate,
        endDate,
        lembagaSingkatan,
        lembagaNama,
        bgImage,
        user: req.user
      });

    } catch (error) {
      console.error(error);
      res.send('Terjadi kesalahan saat mencetak laporan.');
    }
  },

  // ==========================================
  // RENDER CETAK LAPORAN F4 (TABUNGAN)
  // ==========================================
  getCetakTabungan: async (req, res) => {
    try {
      let { startDate, endDate, lembagaId, kelasId, bulan, tahun } = req.query;
      if (tahun) {
        if (bulan) {
          startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
          endDate = `${tahun}-${bulan.padStart(2, '0')}-${new Date(tahun, bulan, 0).getDate()}`;
        } else {
          startDate = `${tahun}-01-01`;
          endDate = `${tahun}-12-31`;
        }
      }

      const filter = {};
      if (startDate && endDate) {
        filter.tanggal = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        filter.tanggal = { [Op.gte]: startDate };
      } else if (endDate) {
        filter.tanggal = { [Op.lte]: endDate };
      }

      if (lembagaId) filter.lembagaId = lembagaId;
      if (kelasId) filter.kelasId = kelasId;

      let lembagaSingkatan = 'SEMUA';
      let lembagaNama = 'SEMUA LEMBAGA';
      let bgImage = 'Template Laporan dan Kwintasi.webp';

      if (lembagaId) {
        const lem = await Lembaga.findByPk(lembagaId);
        if (lem) {
          lembagaNama = lem.nama;
          const lowerName = lem.nama.toLowerCase();
          if (lowerName.includes('paudqu')) {
            lembagaSingkatan = 'PAUDQU';
            bgImage = 'Template Laporan dan Kwintasi PAUDQU.webp';
          } else if (lowerName.includes('tpq')) {
            lembagaSingkatan = 'TPQ';
            bgImage = 'Template Laporan dan Kwintasi TPQ.webp';
          } else if (lowerName.includes('mdt')) {
            lembagaSingkatan = 'MDT';
            bgImage = 'Template Laporan dan Kwintasi MDT.webp';
          } else if (lowerName.includes('madrasah')) {
            lembagaSingkatan = 'MADRASAH';
            bgImage = 'Template Laporan dan Kwintasi Madrasah.webp';
          }
        }
      }

      // Saldo Awal Tabungan (Setor - Tarik) sebelum startDate
      let saldoAwal = 0;
      if (startDate) {
        const filterSebelum = {};
        if (lembagaId) filterSebelum.lembagaId = lembagaId;
        if (kelasId) filterSebelum.kelasId = kelasId;
        filterSebelum.tanggal = { [Op.lt]: startDate };
        
        const totalSetorSebelum = await Tabungan.sum('nominal', { where: { ...filterSebelum, tipe: 'Setor' } }) || 0;
        const totalTarikSebelum = await Tabungan.sum('nominal', { where: { ...filterSebelum, tipe: 'Tarik' } }) || 0;
        saldoAwal = totalSetorSebelum - totalTarikSebelum;
      }

      const transactions = await Tabungan.findAll({
        where: filter,
        include: [
          { model: Lembaga, as: 'lembaga' },
          { model: Santri, as: 'santri' }
        ],
        order: [['tanggal', 'ASC'], ['createdAt', 'ASC']]
      });

      res.render('tabungan_laporan_cetak_f4', {
        title: 'Cetak Laporan Tabungan',
        transactions,
        saldoAwal,
        startDate,
        endDate,
        lembagaSingkatan,
        lembagaNama,
        bgImage,
        user: req.user
      });

    } catch (error) {
      console.error(error);
      res.send('Terjadi kesalahan saat mencetak laporan tabungan.');
    }
  },

  // ==========================================
  // RENDER CETAK LAPORAN F4 (INFAK)
  // ==========================================
  getCetakInfak: async (req, res) => {
    try {
      let { startDate, endDate, lembagaId, bulan, tahun } = req.query;
      if (tahun) {
        if (bulan) {
          startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
          endDate = `${tahun}-${bulan.padStart(2, '0')}-${new Date(tahun, bulan, 0).getDate()}`;
        } else {
          startDate = `${tahun}-01-01`;
          endDate = `${tahun}-12-31`;
        }
      }

      const filter = {};
      if (startDate && endDate) {
        filter.tanggal = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        filter.tanggal = { [Op.gte]: startDate };
      } else if (endDate) {
        filter.tanggal = { [Op.lte]: endDate };
      }

      if (lembagaId) filter.lembagaId = lembagaId;

      let lembagaSingkatan = 'SEMUA';
      let lembagaNama = 'SEMUA LEMBAGA';
      let bgImage = 'Template Laporan dan Kwintasi.webp';

      if (lembagaId) {
        const lem = await Lembaga.findByPk(lembagaId);
        if (lem) {
          lembagaNama = lem.nama;
          const lowerName = lem.nama.toLowerCase();
          if (lowerName.includes('paudqu')) {
            lembagaSingkatan = 'PAUDQU';
            bgImage = 'Template Laporan dan Kwintasi PAUDQU.webp';
          } else if (lowerName.includes('tpq')) {
            lembagaSingkatan = 'TPQ';
            bgImage = 'Template Laporan dan Kwintasi TPQ.webp';
          } else if (lowerName.includes('mdt')) {
            lembagaSingkatan = 'MDT';
            bgImage = 'Template Laporan dan Kwintasi MDT.webp';
          } else if (lowerName.includes('madrasah')) {
            lembagaSingkatan = 'MADRASAH';
            bgImage = 'Template Laporan dan Kwintasi Madrasah.webp';
          }
        }
      }

      let saldoAwal = 0;
      if (startDate) {
        const filterSebelum = {};
        if (lembagaId) filterSebelum.lembagaId = lembagaId;
        filterSebelum.tanggal = { [Op.lt]: startDate };
        saldoAwal = await InfakHarian.sum('nominal', { where: filterSebelum }) || 0;
      }

      const transactions = await InfakHarian.findAll({
        where: filter,
        include: [
          { model: Lembaga, as: 'lembaga' }
        ],
        order: [['tanggal', 'ASC'], ['createdAt', 'ASC']]
      });

      res.render('infak_laporan_cetak_f4', {
        title: 'Cetak Laporan Infak',
        transactions,
        saldoAwal,
        startDate,
        endDate,
        lembagaSingkatan,
        lembagaNama,
        bgImage,
        user: req.user
      });

    } catch (error) {
      console.error(error);
      res.send('Terjadi kesalahan saat mencetak laporan infak.');
    }
  }
};

// Helper Fungsi Terbilang Bahasa Indonesia
function helperTerbilang(angka) {
  const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let temp = "";
  angka = Math.floor(angka);
  if (angka < 12) {
    temp = " " + bil[angka];
  } else if (angka < 20) {
    temp = helperTerbilang(angka - 10) + " Belas";
  } else if (angka < 100) {
    temp = helperTerbilang(angka / 10) + " Puluh" + helperTerbilang(angka % 10);
  } else if (angka < 200) {
    temp = " Seratus" + helperTerbilang(angka - 100);
  } else if (angka < 1000) {
    temp = helperTerbilang(angka / 100) + " Ratus" + helperTerbilang(angka % 100);
  } else if (angka < 2000) {
    temp = " Seribu" + helperTerbilang(angka - 1000);
  } else if (angka < 1000000) {
    temp = helperTerbilang(angka / 1000) + " Ribu" + helperTerbilang(angka % 1000);
  } else if (angka < 1000000000) {
    temp = helperTerbilang(angka / 1000000) + " Juta" + helperTerbilang(angka % 1000000);
  } else if (angka < 1000000000000) {
    temp = helperTerbilang(angka / 1000000000) + " Milyar" + helperTerbilang(angka % 1000000000);
  }
  return temp.trim();
}
