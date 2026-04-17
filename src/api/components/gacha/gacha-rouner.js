/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();
const gachaController = require('../controllers/gacha.controller');

// --- ENDPOINT UTAMA ---

/**
 * @route   POST /api/gacha/draw
 * @desc    Mengeksekusi gacha, mengecek limit harian (max 5x),
 * dan mencatat ke database MongoDB[cite: 12, 13, 18].
 */
router.post('/draw', gachaController.drawGacha);

// --- ENDPOINT BONUS POINT ---

/**
 * @route   GET /api/gacha/history/:user_id
 * @desc    Mengambil histori gacha user berdasarkan user_id.
 */
router.get('/history/:user_id', gachaController.getUserHistory);

/**
 * @route   GET /api/gacha/prizes
 * @desc    Menampilkan daftar hadiah dan sisa kuota (kuota_total - jumlah_pemenang).
 */
router.get('/prizes', gachaController.getPrizeStats);

/**
 * @route   GET /api/gacha/winners
 * @desc    Menampilkan daftar user pemenang dengan nama yang sudah disamarkan
 * (menggunakan field nama_samaran di Schema) .
 */
router.get('/winners', gachaController.getWinnersList);

module.exports = router;
