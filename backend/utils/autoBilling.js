const { Lembaga, Tagihan } = require('../models');
const { Op } = require('sequelize');

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

module.exports = {
  generateMonthlySPP: async () => {
    try {
      const currentDate = new Date();
      const currentMonthIndex = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const monthName = monthNames[currentMonthIndex];
      
      const expectedName = `SPP ${monthName} ${currentYear}`;
      
      const lembagas = await Lembaga.findAll();
      
      for (const lembaga of lembagas) {
        // Cek apakah tagihan SPP bulan ini sudah ada
        const existingTagihan = await Tagihan.findOne({
          where: {
            nama: expectedName,
            lembagaId: lembaga.id
          }
        });
        
        if (!existingTagihan) {
          // Cari tagihan SPP sebelumnya di lembaga ini untuk mengambil nominal referensi
          const previousSPP = await Tagihan.findOne({
            where: {
              nama: {
                [Op.like]: 'SPP%'
              },
              lembagaId: lembaga.id
            },
            order: [['createdAt', 'DESC']]
          });
          
          const nominal = previousSPP ? previousSPP.nominal : 0;
          
          await Tagihan.create({
            nama: expectedName,
            nominal: nominal,
            lembagaId: lembaga.id,
            keterangan: `Tagihan otomatis dibuat sistem`
          });
          console.log(`[AutoBilling] Tagihan '${expectedName}' berhasil dibuat untuk ${lembaga.nama} dengan nominal ${nominal}`);
        }
      }
    } catch (error) {
      console.error('[AutoBilling] Error saat men-generate SPP bulanan:', error.message);
    }
  }
};
