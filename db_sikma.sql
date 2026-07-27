-- SQL Schema untuk Sistem Informasi Keuangan Madrasah (SIKMA)
-- Database: db_sikma
-- Anda dapat mengimpor file ini langsung di phpMyAdmin (Menu Import) atau menyalin isinya ke tab SQL.

CREATE DATABASE IF NOT EXISTS `db_sikma` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_sikma`;

-- --------------------------------------------------------
-- 1. Tabel Lembaga
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Lembaga` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL UNIQUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 2. Tabel Kategori Keuangan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Kategori` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `lembagaId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`lembagaId`) REFERENCES `Lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 3. Tabel Kelas
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Kelas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `lembagaId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`lembagaId`) REFERENCES `Lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 4. Tabel Santri
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Santri` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `kelasId` INT NOT NULL,
  `lembagaId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`kelasId`) REFERENCES `Kelas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`lembagaId`) REFERENCES `Lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 5. Tabel Transaksi Keuangan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Transaksi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tanggal` DATE NOT NULL,
  `jenis` ENUM('Pemasukan', 'Pengeluaran') NOT NULL,
  `nominal` DECIMAL(15, 2) NOT NULL,
  `keterangan` TEXT DEFAULT NULL,
  `lembagaId` INT NOT NULL,
  `kategoriId` INT NOT NULL,
  `kelasId` INT DEFAULT NULL,
  `santriId` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`lembagaId`) REFERENCES `Lembaga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`kategoriId`) REFERENCES `Kategori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`kelasId`) REFERENCES `Kelas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`santriId`) REFERENCES `Santri` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- SEED DATA AWAL (Demo)
-- --------------------------------------------------------

-- Seed Lembaga
INSERT INTO `Lembaga` (`id`, `nama`) VALUES
(1, 'Madrasah'),
(2, 'PAUDQu'),
(3, 'TPQ'),
(4, 'MDT')
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`);

-- Seed Kategori Keuangan
INSERT INTO `Kategori` (`id`, `nama`, `lembagaId`) VALUES
(1, 'SPP', 1),
(2, 'Uang Gedung', 1),
(3, 'Gaji Guru', 1),
(4, 'Operasional', 1),
(5, 'SPP', 2),
(6, 'Uang Seragam', 2),
(7, 'Gaji Guru', 2),
(8, 'SPP', 3),
(9, 'Gaji Guru', 3),
(10, 'Listrik & Air', 3),
(11, 'SPP', 4),
(12, 'Uang Kitab', 4),
(13, 'Gaji Guru', 4)
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`), `lembagaId`=VALUES(`lembagaId`);

-- Seed Kelas
INSERT INTO `Kelas` (`id`, `nama`, `lembagaId`) VALUES
(1, 'Kelas 1A', 1),
(2, 'Kelas 2', 1),
(3, 'Mawar A', 2),
(4, 'Jilid 1', 3),
(5, 'Kelas Awwal', 4)
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`), `lembagaId`=VALUES(`lembagaId`);

-- Seed Santri
INSERT INTO `Santri` (`id`, `nama`, `kelasId`, `lembagaId`) VALUES
(1, 'Muhammad Farhan', 1, 1),
(2, 'Siti Aminah', 1, 1),
(3, 'Budi Santoso', 2, 1),
(4, 'Rani Wijaya', 3, 2),
(5, 'Ahmad Fauzi', 4, 3)
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`), `kelasId`=VALUES(`kelasId`), `lembagaId`=VALUES(`lembagaId`);

-- Seed Transaksi Keuangan
INSERT INTO `Transaksi` (`id`, `tanggal`, `jenis`, `nominal`, `keterangan`, `lembagaId`, `kategoriId`, `kelasId`, `santriId`) VALUES
(1, CURDATE() - INTERVAL 1 DAY, 'Pemasukan', 250000.00, 'Pembayaran SPP Bulan Juli', 1, 1, 1, 1),
(2, CURDATE() - INTERVAL 1 DAY, 'Pemasukan', 250000.00, 'Pembayaran SPP Bulan Juli', 1, 1, 1, 2),
(3, CURDATE() - INTERVAL 1 DAY, 'Pengeluaran', 1500000.00, 'Gaji Guru Madrasah Bulan Juni', 1, 3, NULL, NULL),
(4, CURDATE(), 'Pemasukan', 180000.00, 'Pembayaran SPP', 2, 5, 3, 4),
(5, CURDATE(), 'Pengeluaran', 500000.00, 'Insentif Guru TPQ', 3, 9, NULL, NULL)
ON DUPLICATE KEY UPDATE `tanggal`=VALUES(`tanggal`), `jenis`=VALUES(`jenis`), `nominal`=VALUES(`nominal`), `keterangan`=VALUES(`keterangan`), `lembagaId`=VALUES(`lembagaId`), `kategoriId`=VALUES(`kategoriId`), `kelasId`=VALUES(`kelasId`), `santriId`=VALUES(`santriId`);
