const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Menyimpan daftar admin yang online/aktif secara realtime
const activeUsers = {};

module.exports = {
  getLogin: (req, res) => {
    if (req.session.userId) {
      if (req.session.role === 'Super Admin') {
        return res.redirect('/super-admin');
      }
      return res.redirect('/admin');
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
      
      if (user.role === 'Super Admin') {
        res.redirect('/super-admin');
      } else {
        res.redirect('/admin');
      }
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
  },

  // Middleware khusus Super Admin
  isSuperAdmin: (req, res, next) => {
    if (req.session.userId && req.session.role === 'Super Admin') {
      return next();
    }
    // Jika bukan Super Admin, arahkan ke dashboard biasa dengan pesan error atau cukup redirect
    res.redirect('/admin');
  },

  // Heartbeat endpoint untuk tracking user online
  postHeartbeat: (req, res) => {
    // Membutuhkan authMiddleware sebelumnya
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const now = Date.now();
    activeUsers[req.session.username] = {
      id: req.session.userId,
      nama: req.session.nama_lengkap,
      username: req.session.username,
      lastActive: now
    };

    // Bersihkan user yang tidak kirim heartbeat lebih dari 15 detik
    const threshold = now - 15000;
    const onlineUsers = [];
    for (const username in activeUsers) {
      if (activeUsers[username].lastActive > threshold) {
        onlineUsers.push({
          id: activeUsers[username].id,
          nama: activeUsers[username].nama,
          username: activeUsers[username].username
        });
      } else {
        delete activeUsers[username];
      }
    }

    return res.json({ success: true, onlineUsers });
  }
};
