-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 27, 2026 at 06:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_sikma`
--

-- --------------------------------------------------------

--
-- Table structure for table `infakharian`
--

CREATE TABLE `infakharian` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `lembagaId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `docTitle` varchar(255) DEFAULT NULL,
  `dibayarkanKepadaSign` varchar(255) DEFAULT NULL,
  `diterimaDariPembayaran` varchar(255) DEFAULT NULL,
  `namaPemberi` varchar(255) DEFAULT NULL,
  `layoutMarginTop` varchar(255) DEFAULT NULL,
  `layoutMarginLeft` varchar(255) DEFAULT NULL,
  `ttdVisible` tinyint(1) DEFAULT 1,
  `ttdWidth` varchar(255) DEFAULT NULL,
  `ttdX` int(11) DEFAULT 0,
  `ttdY` int(11) DEFAULT 0,
  `rowOrder` text DEFAULT NULL,
  `rincianNames` text DEFAULT NULL,
  `nomor_kwitansi` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `infakharian`
--

INSERT INTO `infakharian` (`id`, `tanggal`, `nominal`, `keterangan`, `lembagaId`, `createdAt`, `updatedAt`, `userId`, `docTitle`, `dibayarkanKepadaSign`, `diterimaDariPembayaran`, `namaPemberi`, `layoutMarginTop`, `layoutMarginLeft`, `ttdVisible`, `ttdWidth`, `ttdX`, `ttdY`, `rowOrder`, `rincianNames`, `nomor_kwitansi`) VALUES
(1, '2026-07-24', 18000.00, 'Catatan: Infaq Harian', 1, '2026-07-24 09:40:59', '2026-07-24 09:40:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `lembagaId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id`, `nama`, `lembagaId`, `createdAt`, `updatedAt`) VALUES
(1, 'SPP', 1, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(2, 'Uang Gedung', 1, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(3, 'Gaji Guru', 1, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(4, 'Operasional', 1, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(5, 'SPP', 2, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(6, 'Uang Seragam', 2, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(7, 'Gaji Guru', 2, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(8, 'SPP', 3, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(9, 'Gaji Guru', 3, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(10, 'Listrik & Air', 3, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(11, 'SPP', 4, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(12, 'Uang Kitab', 4, '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(13, 'Gaji Guru', 4, '2026-07-05 14:24:38', '2026-07-05 14:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `lembagaId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id`, `nama`, `lembagaId`, `createdAt`, `updatedAt`) VALUES
(13, 'Kelas A1', 2, '2026-07-24 07:55:29', '2026-07-24 07:55:29'),
(14, 'Kelas A2', 2, '2026-07-24 07:55:34', '2026-07-24 07:55:34'),
(15, 'Kelas A3', 2, '2026-07-24 07:55:39', '2026-07-24 07:55:39'),
(16, 'Kelas B1', 2, '2026-07-24 07:55:45', '2026-07-24 07:55:45'),
(17, 'Kelas B2', 2, '2026-07-24 07:55:49', '2026-07-24 07:55:49'),
(19, 'Kelas 1', 4, '2026-07-24 07:56:03', '2026-07-24 07:56:03'),
(20, 'Kelas 2', 4, '2026-07-24 07:56:09', '2026-07-24 07:56:09'),
(21, 'Kelas 3', 4, '2026-07-24 07:56:14', '2026-07-24 07:56:14'),
(22, 'Kelas 4', 4, '2026-07-24 07:56:23', '2026-07-24 07:56:23'),
(23, 'Kelas A', 3, '2026-07-24 07:56:30', '2026-07-24 07:56:30'),
(24, 'Kelas B', 3, '2026-07-24 07:56:35', '2026-07-24 07:56:35');

-- --------------------------------------------------------

--
-- Table structure for table `lembaga`
--

CREATE TABLE `lembaga` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lembaga`
--

INSERT INTO `lembaga` (`id`, `nama`, `createdAt`, `updatedAt`) VALUES
(1, 'Madrasah', '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(2, 'PAUDQu', '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(3, 'TPQ', '2026-07-05 14:24:38', '2026-07-05 14:24:38'),
(4, 'MDT', '2026-07-05 14:24:38', '2026-07-05 14:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `santri`
--

CREATE TABLE `santri` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `kelasId` int(11) NOT NULL,
  `lembagaId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `santri`
--

INSERT INTO `santri` (`id`, `nama`, `kelasId`, `lembagaId`, `createdAt`, `updatedAt`) VALUES
(19, 'Budi Santoso 28', 13, 2, '2026-07-24 07:55:29', '2026-07-24 07:55:29'),
(20, 'Citra Kirana 66', 14, 2, '2026-07-24 07:55:34', '2026-07-24 07:55:34'),
(21, 'Dewi Lestari 868', 15, 2, '2026-07-24 07:55:39', '2026-07-24 07:55:39'),
(22, 'Ahmad Fauzi 825', 16, 2, '2026-07-24 07:55:45', '2026-07-24 07:55:45'),
(23, 'Dewi Lestari 313', 17, 2, '2026-07-24 07:55:49', '2026-07-24 07:55:49'),
(24, 'Citra Kirana 827', 15, 2, '2026-07-24 07:55:54', '2026-07-24 08:26:18'),
(25, 'Dewi Lestari 517', 19, 4, '2026-07-24 07:56:03', '2026-07-24 07:56:03'),
(26, 'Eko Prasetyo 433', 20, 4, '2026-07-24 07:56:09', '2026-07-24 07:56:09'),
(27, 'Dewi Lestari 903', 21, 4, '2026-07-24 07:56:14', '2026-07-24 07:56:14'),
(28, 'Eko Prasetyo 828', 21, 4, '2026-07-24 07:56:18', '2026-07-24 07:56:18'),
(29, 'Citra Kirana 442', 22, 4, '2026-07-24 07:56:23', '2026-07-24 07:56:23'),
(30, 'Dewi Lestari 97', 23, 3, '2026-07-24 07:56:30', '2026-07-24 07:56:30'),
(31, 'Budi Santoso 298', 24, 3, '2026-07-24 07:56:35', '2026-07-24 07:56:35'),
(32, 'Dewi Lestari 69', 13, 2, '2026-07-24 09:31:49', '2026-07-24 09:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `tabungan`
--

CREATE TABLE `tabungan` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `tipe` enum('Setor','Tarik') NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `lembagaId` int(11) NOT NULL,
  `kelasId` int(11) DEFAULT NULL,
  `santriId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `docTitle` varchar(255) DEFAULT NULL,
  `dibayarkanKepadaSign` varchar(255) DEFAULT NULL,
  `diterimaDariPembayaran` varchar(255) DEFAULT NULL,
  `namaPemberi` varchar(255) DEFAULT NULL,
  `layoutMarginTop` varchar(255) DEFAULT NULL,
  `layoutMarginLeft` varchar(255) DEFAULT NULL,
  `ttdVisible` tinyint(1) DEFAULT 1,
  `ttdWidth` varchar(255) DEFAULT NULL,
  `ttdX` int(11) DEFAULT 0,
  `ttdY` int(11) DEFAULT 0,
  `rowOrder` text DEFAULT NULL,
  `rincianNames` text DEFAULT NULL,
  `nomor_kwitansi` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tabungan`
--

INSERT INTO `tabungan` (`id`, `tanggal`, `tipe`, `nominal`, `keterangan`, `lembagaId`, `kelasId`, `santriId`, `createdAt`, `updatedAt`, `userId`, `docTitle`, `dibayarkanKepadaSign`, `diterimaDariPembayaran`, `namaPemberi`, `layoutMarginTop`, `layoutMarginLeft`, `ttdVisible`, `ttdWidth`, `ttdX`, `ttdY`, `rowOrder`, `rincianNames`, `nomor_kwitansi`) VALUES
(1, '2026-07-24', 'Setor', 10000.00, 'Metode: Cash\nCatatan: ', 2, 13, 19, '2026-07-24 09:32:18', '2026-07-24 09:32:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(2, '2026-07-24', 'Setor', 10000.00, 'Metode: Cash\nCatatan: ', 2, 13, 32, '2026-07-24 09:32:18', '2026-07-24 09:32:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(3, '2026-07-24', 'Tarik', 5000.00, 'Metode: Cash\nCatatan: ', 2, 13, 19, '2026-07-24 09:33:01', '2026-07-24 09:33:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(4, '2026-07-24', 'Tarik', 5000.00, 'Metode: Cash\nCatatan: ', 2, 13, 32, '2026-07-24 09:33:01', '2026-07-24 09:33:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(5, '2026-07-25', 'Setor', 5000.00, 'Metode: Cash\nCatatan: ', 3, 23, 30, '2026-07-25 14:54:43', '2026-07-25 17:30:12', 2, 'BUKTI SETORAN TABUNGAN', NULL, 'Orang Tua / Wali Santri', 'Dewi Lestari 97', '6.50cm', '2.50cm', 1, '120px', 0, 0, '[\"diterimaDari\",\"namaSantri\",\"satuanPendidikan\",\"untukPembayaran\",\"terbilangRow\",\"nominalRow\"]', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tagihan`
--

CREATE TABLE `tagihan` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `lembagaId` int(11) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `kelasId` int(11) DEFAULT NULL,
  `kategoriId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tagihan`
--

INSERT INTO `tagihan` (`id`, `nama`, `nominal`, `lembagaId`, `keterangan`, `createdAt`, `updatedAt`, `kelasId`, `kategoriId`) VALUES
(2, 'SPP', 150000.00, 2, 'Pembayaran SPP', '2026-07-11 09:24:52', '2026-07-11 09:24:52', NULL, NULL),
(3, 'SPP', 150000.00, 3, 'Pembayaran SPP', '2026-07-11 09:40:29', '2026-07-11 09:40:29', NULL, NULL),
(4, 'SPP', 150000.00, 4, 'Pembayaran SPP', '2026-07-11 09:40:56', '2026-07-11 09:40:56', NULL, NULL),
(5, 'Kegiatan Berenang', 200000.00, 2, 'Berenang', '2026-07-11 09:53:51', '2026-07-11 09:53:51', NULL, NULL),
(6, 'UTS Ganjil', 120000.00, 3, 'Pembayaran Ujian', '2026-07-16 10:45:10', '2026-07-16 11:49:32', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `jenis` enum('Pemasukan','Pengeluaran') NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `lembagaId` int(11) NOT NULL,
  `kategoriId` int(11) DEFAULT NULL,
  `kelasId` int(11) DEFAULT NULL,
  `santriId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `tagihanId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `docTitle` varchar(255) DEFAULT NULL,
  `dibayarkanKepadaSign` varchar(255) DEFAULT NULL,
  `diterimaDariPembayaran` varchar(255) DEFAULT NULL,
  `namaPemberi` varchar(255) DEFAULT NULL,
  `layoutMarginTop` varchar(255) DEFAULT NULL,
  `layoutMarginLeft` varchar(255) DEFAULT NULL,
  `ttdVisible` tinyint(1) DEFAULT 1,
  `ttdWidth` varchar(255) DEFAULT NULL,
  `ttdX` int(11) DEFAULT 0,
  `ttdY` int(11) DEFAULT 0,
  `rowOrder` text DEFAULT NULL,
  `rincianNames` text DEFAULT NULL,
  `nomor_kwitansi` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`id`, `tanggal`, `jenis`, `nominal`, `keterangan`, `lembagaId`, `kategoriId`, `kelasId`, `santriId`, `createdAt`, `updatedAt`, `tagihanId`, `userId`, `docTitle`, `dibayarkanKepadaSign`, `diterimaDariPembayaran`, `namaPemberi`, `layoutMarginTop`, `layoutMarginLeft`, `ttdVisible`, `ttdWidth`, `ttdX`, `ttdY`, `rowOrder`, `rincianNames`, `nomor_kwitansi`) VALUES
(7, '2026-07-24', 'Pemasukan', 150000.00, 'Pembayaran: SPP - Budi Santoso 28\nMetode: Cash\nCatatan: ', 2, NULL, 13, 19, '2026-07-24 08:25:33', '2026-07-24 08:25:33', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(8, '2026-07-24', 'Pemasukan', 150000.00, 'Pembayaran: SPP - Dewi Lestari 97\nMetode: Cash\nCatatan: ', 3, NULL, 23, 30, '2026-07-24 08:27:01', '2026-07-24 08:27:01', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(9, '2026-07-24', 'Pemasukan', 150000.00, 'Pembayaran: SPP - Dewi Lestari 517\nMetode: Cash\nCatatan: ', 4, NULL, 19, 25, '2026-07-24 08:27:09', '2026-07-24 08:27:09', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(10, '2026-07-24', 'Pemasukan', 200000.00, 'Pembayaran: Kegiatan Berenang - Budi Santoso 28\nMetode: Cash\nCatatan: ', 2, NULL, 13, 19, '2026-07-24 08:27:25', '2026-07-24 08:27:25', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(11, '2026-07-25', 'Pemasukan', 150000.00, 'Pembayaran: SPP - Dewi Lestari 313\nMetode: Cash\nCatatan: ', 2, NULL, 17, 23, '2026-07-25 14:46:32', '2026-07-25 14:46:32', 2, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, NULL),
(12, '2026-07-25', 'Pemasukan', 150000.00, 'Pembayaran: SPP - Budi Santoso 28\nMetode: Cash\nCatatan: ', 2, NULL, 13, 19, '2026-07-25 17:44:07', '2026-07-25 17:44:07', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, 'PAUDQU-IN-202607-0001'),
(16, '2026-07-26', 'Pemasukan', 200000.00, 'Pembayaran: Kegiatan Berenang - Citra Kirana 66\nMetode: Transfer\nCatatan: ', 2, NULL, 14, 20, '2026-07-26 09:26:51', '2026-07-26 09:26:51', 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 0, 0, NULL, NULL, 'PAUDQU-IN-072026-0001');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `role` enum('Admin','Staf') DEFAULT 'Staf',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2b$10$QcKB0dp3RoYPana002gqJOmiBZKoKrj5KQOeunS35aXq/8AX4cdzq', 'Super Admin', 'Admin', '2026-07-25 14:23:37', '2026-07-25 14:35:51'),
(2, 'henny.mjic', '$2b$10$qg.lBiBxPzg.F8Z9bOdQzuFOmPIz2tICpxgstBIzSgp5eWAGzLxKm', 'Henny Maulida', 'Staf', '2026-07-25 14:34:57', '2026-07-25 14:36:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `infakharian`
--
ALTER TABLE `infakharian`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_kwitansi` (`nomor_kwitansi`),
  ADD KEY `lembagaId` (`lembagaId`),
  ADD KEY `fk_infak_user` (`userId`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lembagaId` (`lembagaId`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lembagaId` (`lembagaId`);

--
-- Indexes for table `lembaga`
--
ALTER TABLE `lembaga`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indexes for table `santri`
--
ALTER TABLE `santri`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kelasId` (`kelasId`),
  ADD KEY `lembagaId` (`lembagaId`);

--
-- Indexes for table `tabungan`
--
ALTER TABLE `tabungan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_kwitansi` (`nomor_kwitansi`),
  ADD KEY `lembagaId` (`lembagaId`),
  ADD KEY `kelasId` (`kelasId`),
  ADD KEY `santriId` (`santriId`),
  ADD KEY `fk_tabungan_user` (`userId`);

--
-- Indexes for table `tagihan`
--
ALTER TABLE `tagihan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lembagaId` (`lembagaId`),
  ADD KEY `kelasId` (`kelasId`),
  ADD KEY `kategoriId` (`kategoriId`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_kwitansi` (`nomor_kwitansi`),
  ADD KEY `lembagaId` (`lembagaId`),
  ADD KEY `kategoriId` (`kategoriId`),
  ADD KEY `kelasId` (`kelasId`),
  ADD KEY `santriId` (`santriId`),
  ADD KEY `fk_transaksi_tagihan` (`tagihanId`),
  ADD KEY `fk_transaksi_user` (`userId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `infakharian`
--
ALTER TABLE `infakharian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `lembaga`
--
ALTER TABLE `lembaga`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `santri`
--
ALTER TABLE `santri`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `tabungan`
--
ALTER TABLE `tabungan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tagihan`
--
ALTER TABLE `tagihan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `infakharian`
--
ALTER TABLE `infakharian`
  ADD CONSTRAINT `fk_infak_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `infakharian_ibfk_1` FOREIGN KEY (`lembagaId`) REFERENCES `lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kategori`
--
ALTER TABLE `kategori`
  ADD CONSTRAINT `kategori_ibfk_1` FOREIGN KEY (`lembagaId`) REFERENCES `lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kelas`
--
ALTER TABLE `kelas`
  ADD CONSTRAINT `kelas_ibfk_1` FOREIGN KEY (`lembagaId`) REFERENCES `lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `santri`
--
ALTER TABLE `santri`
  ADD CONSTRAINT `santri_ibfk_1` FOREIGN KEY (`kelasId`) REFERENCES `kelas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `santri_ibfk_2` FOREIGN KEY (`lembagaId`) REFERENCES `lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tabungan`
--
ALTER TABLE `tabungan`
  ADD CONSTRAINT `fk_tabungan_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tabungan_ibfk_1` FOREIGN KEY (`lembagaId`) REFERENCES `lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tabungan_ibfk_2` FOREIGN KEY (`kelasId`) REFERENCES `kelas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tabungan_ibfk_3` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tagihan`
--
ALTER TABLE `tagihan`
  ADD CONSTRAINT `tagihan_ibfk_1` FOREIGN KEY (`lembagaId`) REFERENCES `lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tagihan_ibfk_2` FOREIGN KEY (`kelasId`) REFERENCES `kelas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tagihan_ibfk_3` FOREIGN KEY (`kategoriId`) REFERENCES `kategori` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_transaksi_tagihan` FOREIGN KEY (`tagihanId`) REFERENCES `tagihan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transaksi_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`lembagaId`) REFERENCES `lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_ibfk_2` FOREIGN KEY (`kategoriId`) REFERENCES `kategori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_ibfk_3` FOREIGN KEY (`kelasId`) REFERENCES `kelas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_ibfk_4` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
