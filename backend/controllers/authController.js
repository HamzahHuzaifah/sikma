const bcrypt = require('bcryptjs');
const { User } = require('../models');

module.exports = {
  getLogin: (req, res) => {
    if (req.session.userId) {
      return res.redirect('/');
    }
    res.render('login', { error: null });
  },

  postLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.render('login', { error: 'Username atau Password salah!' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render('login', { error: 'Username atau Password salah!' });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.nama_lengkap = user.nama_lengkap;
      req.session.role = user.role;
      req.session.isAdmin = true; // For backward compatibility with existing views/routes if needed
      
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.render('login', { error: 'Terjadi kesalahan pada server.' });
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) console.log(err);
      res.redirect('/login');
    });
  },

  // Middleware Auth
  authMiddleware: (req, res, next) => {
    if (req.session.userId) {
      res.locals.user = {
        id: req.session.userId,
        username: req.session.username,
        nama_lengkap: req.session.nama_lengkap,
        role: req.session.role
      };
      return next();
    }
    res.redirect('/login');
  }
};
