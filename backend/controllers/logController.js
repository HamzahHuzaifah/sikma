const { LogAktivitas, User } = require('../models');

module.exports = {
  getLogs: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await LogAktivitas.findAndCountAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['nama_lengkap', 'username']
        }],
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset
      });

      res.json({
        data: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      });
    } catch (error) {
      console.error('[LogController] Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
