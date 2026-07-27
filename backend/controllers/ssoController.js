const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const SSO_SECRET = process.env.SSO_SECRET_KEY || 'sikma_spmb_secret_sso_key_2026';
const SPMB_URL = process.env.SPMB_URL || 'http://localhost:5000';

module.exports = {
  // Dipanggil saat Admin SIKMA klik tombol "Buka SPMB"
  goSpmb: (req, res) => {
    // Pastikan user SIKMA sudah login
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    // Buat token SSO
    const token = jwt.sign(
      { username: req.session.username, role: req.session.role, source: 'SIKMA' },
      SSO_SECRET,
      { expiresIn: '30s' } // Kadaluarsa dalam 30 detik untuk keamanan
    );

    // Redirect ke SPMB endpoint penerima token
    res.redirect(`${SPMB_URL}/api/sso/login?token=${token}`);
  },

  // Dipanggil saat mendapat token dari SPMB
  loginFromSpmb: async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send('SSO Token tidak ditemukan.');
    }

    try {
      const decoded = jwt.verify(token, SSO_SECRET);
      
      // Pastikan token asalnya dari SPMB
      if (decoded.source !== 'SPMB') {
        return res.status(403).send('Sumber token tidak valid.');
      }

      // Cari user di database SIKMA berdasarkan username dari token
      const user = await User.findOne({ where: { username: decoded.username } });
      
      if (!user) {
        return res.status(404).send('Akun admin tidak ditemukan di database SIKMA.');
      }

      // Buat session SIKMA
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.nama_lengkap = user.nama_lengkap;

      // Redirect ke Dashboard SIKMA
      res.redirect('/admin');
    } catch (error) {
      console.error('SSO Login Error:', error.message);
      return res.status(401).send('SSO Token tidak valid atau sudah kadaluarsa.');
    }
  }
};
