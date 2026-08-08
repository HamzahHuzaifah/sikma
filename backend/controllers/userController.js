const { User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/images/signatures');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'TTD_' + Date.now() + ext);
  }
});
const upload = multer({ storage });

module.exports = {
  upload,

  // Render User List
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'nama_lengkap', 'role', 'ttdPath']
      });
      res.render('users', {
        users,
        username: req.session.username,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Render Form Create User
  getCreateUser: (req, res) => {
    res.render('users_form', {
      user: null,
      username: req.session.username
    });
  },

  // Handle Create User
  postCreateUser: async (req, res) => {
    try {
      const { username, password, nama_lengkap, role } = req.body;
      
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.redirect('/super-admin/users?error=Username sudah digunakan!');
      }

      let ttdPath = null;
      if (req.file) {
        ttdPath = '/images/signatures/' + req.file.filename;
      }

      await User.create({
        username,
        password,
        nama_lengkap,
        role: role || 'Staf',
        ttdPath
      });

      res.redirect('/super-admin/users?success=Akun berhasil dibuat!');
    } catch (error) {
      console.error(error);
      res.redirect('/super-admin/users?error=Gagal membuat akun!');
    }
  },

  // Render Form Edit User
  getEditUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'nama_lengkap', 'role']
      });

      if (!user) {
        return res.redirect('/super-admin/users?error=Akun tidak ditemukan!');
      }

      res.render('users_form', {
        user,
        username: req.session.username
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Handle Edit User
  postEditUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, nama_lengkap, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.redirect('/super-admin/users?error=Akun tidak ditemukan!');
      }

      // Check if username is changed and already exists
      if (username !== user.username) {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          return res.redirect(`/super-admin/users?error=Username sudah digunakan!`);
        }
      }

      user.username = username;
      user.nama_lengkap = nama_lengkap;
      user.role = role || 'Staf';
      
      if (req.file) {
        user.ttdPath = '/images/signatures/' + req.file.filename;
      }
      
      if (password) {
        user.password = password; // Will be hashed by hook
      }

      await user.save();

      res.redirect('/super-admin/users?success=Akun berhasil diperbarui!');
    } catch (error) {
      console.error(error);
      res.redirect('/super-admin/users?error=Gagal memperbarui akun!');
    }
  },

  // Handle Delete User
  postDeleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.redirect('/super-admin/users?error=Akun tidak ditemukan!');
      }

      // Prevent deleting self
      if (req.session.userId === user.id) {
         return res.redirect('/super-admin/users?error=Tidak dapat menghapus akun Anda sendiri!');
      }

      await user.destroy();
      res.redirect('/super-admin/users?success=Akun berhasil dihapus!');
    } catch (error) {
      console.error(error);
      res.redirect('/super-admin/users?error=Gagal menghapus akun!');
    }
  }
};
