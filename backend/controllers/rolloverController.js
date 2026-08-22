const { Lembaga, Kelas, Santri, LogAktivitas } = require('../models');
const { catatLog } = require('../utils/logger');
const { Op } = require('sequelize');

module.exports = {
  getRolloverPage: async (req, res) => {
    try {
      const lembagas = await Lembaga.findAll({ order: [['nama', 'ASC']] });
      res.render('super-admin/rollover', {
        username: req.session.username,
        path: '/super-admin/rollover',
        lembagas
      });
    } catch (error) {
      console.error('[Rollover] Error:', error);
      res.status(500).send('Terjadi kesalahan pada server');
    }
  },

  getKelasByLembaga: async (req, res) => {
    try {
      const { lembagaId } = req.params;
      const kelasList = await Kelas.findAll({
        where: { lembagaId },
        order: [['nama', 'ASC']]
      });
      res.json({ success: true, data: kelasList });
    } catch (error) {
      console.error('[Rollover API] Error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data kelas' });
    }
  },

  postRolloverExecute: async (req, res) => {
    try {
      const { lembagaId, mapping } = req.body;
      // mapping is expected to be an object: { "oldKelasId": "newKelasId" | "LULUS" }
      // example: { "1": "2", "2": "3", "3": "LULUS" }
      
      if (!lembagaId || !mapping || Object.keys(mapping).length === 0) {
        return res.status(400).json({ success: false, message: 'Data mapping kelas tidak lengkap.' });
      }

      const lembaga = await Lembaga.findByPk(lembagaId);
      if (!lembaga) {
        return res.status(404).json({ success: false, message: 'Lembaga tidak ditemukan.' });
      }

      // Check if any mapping targets "LULUS". If so, ensure an "Alumni" class exists.
      let alumniClassId = null;
      const hasLulus = Object.values(mapping).includes("LULUS");
      if (hasLulus) {
        let [alumniClass] = await Kelas.findOrCreate({
          where: { nama: 'Alumni', lembagaId: lembagaId }
        });
        alumniClassId = alumniClass.id;
      }

      // Fetch all santri in this lembaga to update them safely in memory first (prevents cascading promotion)
      const santris = await Santri.findAll({
        where: { lembagaId }
      });

      let updatedCount = 0;

      for (const santri of santris) {
        const oldIdStr = santri.kelasId.toString();
        
        // If this santri's current class is in the mapping
        if (mapping[oldIdStr]) {
          const target = mapping[oldIdStr];
          let newKelasId = null;

          if (target === "LULUS") {
            newKelasId = alumniClassId;
          } else {
            newKelasId = parseInt(target);
          }

          if (newKelasId && santri.kelasId !== newKelasId) {
            santri.kelasId = newKelasId;
            await santri.save();
            updatedCount++;
          }
        }
      }

      // Record Activity Log
      await catatLog(req.session.userId, 'EDIT', 'Kenaikan Kelas (Roll-over)', `Menaikkan kelas secara massal untuk ${updatedCount} santri di ${lembaga.nama}`);

      res.json({ 
        success: true, 
        message: `Kenaikan kelas massal berhasil dieksekusi. Sebanyak ${updatedCount} santri telah dipindahkan.` 
      });

    } catch (error) {
      console.error('[Rollover Execute] Error:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat mengeksekusi roll-over: ' + error.message });
    }
  }
};
