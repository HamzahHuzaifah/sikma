const { LogAktivitas, User } = require('../models');

module.exports = {
  getLogs: async (req, res) => {
    try {
      const logs = await LogAktivitas.findAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['nama_lengkap', 'username']
        }],
        order: [['createdAt', 'DESC']],
        limit: 100 // Tampilkan 100 log terakhir saja untuk optimasi
      });
      res.json(logs);
    } catch (error) {
      console.error('[LogController] Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
