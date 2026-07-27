const { Lembaga, Kategori, Kelas, Santri, Transaksi } = require('../models');

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const dataLembaga = await Lembaga.findAll();
      const rekap = [];
      
      // Hitung total keseluruhan langsung dari database (ini mewakili Madrasah sebagai Yayasan)
      const totalPemasukanAll = await Transaksi.sum('nominal', { where: { jenis: 'Pemasukan' } }) || 0;
      const totalPengeluaranAll = await Transaksi.sum('nominal', { where: { jenis: 'Pengeluaran' } }) || 0;
      const totalSaldoAll = totalPemasukanAll - totalPengeluaranAll;

      for (let lem of dataLembaga) {
        const pemasukan = await Transaksi.sum('nominal', { 
          where: { lembagaId: lem.id, jenis: 'Pemasukan' } 
        }) || 0;
        
        const pengeluaran = await Transaksi.sum('nominal', { 
          where: { lembagaId: lem.id, jenis: 'Pengeluaran' } 
        }) || 0;

        rekap.push({
          id: lem.id,
          nama: lem.nama,
          pemasukan: parseFloat(pemasukan),
          pengeluaran: parseFloat(pengeluaran),
          saldo: parseFloat(pemasukan) - parseFloat(pengeluaran)
        });
      }

      res.render('dashboard', {
        rekap,
        totalPemasukanAll,
        totalPengeluaranAll,
        totalSaldoAll,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getLembagaDashboard: async (req, res) => {
    res.redirect('/');
  }
};
