/* eslint-disable prettier/prettier */
/* eslint-disable consistent-return */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line prettier/prettier
/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
const { Prize, GachaLog } = require('../models/GachaSchema');
// eslint-disable-next-line import/no-unresolved
const { maskName } = require('../utils/GachaLogic');

// --- 1. ENDPOINT UTAMA: DRAW GACHA ---
exports.drawGacha = async (req, res) => {
  try {
    const { user_id, nama_user } = req.body;

    // A. Validasi Kuota Harian (Maksimal 5x dalam 1 hari)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayAttempts = await GachaLog.countDocuments({
      // eslint-disable-next-line object-shorthand
      user_id: user_id,
      tanggal_gacha: { $gte: startOfDay },
    });

    if (todayAttempts >= 5) {
      return res.status(403).json({
        message: 'Error: Kuota gacha harian habis (Maksimal 5x).',
      });
    }

    // B. Ambil daftar hadiah yang kuotanya masih tersedia
    const availablePrizes = await Prize.find({
      $expr: { $lt: ['$jumlah_pemenang', '$kuota_total'] },
    });

    let prizeWon = null;
    let isWinner = false;

    // C. Logika Penentuan Hadiah (Contoh: Peluang Menang 30%)
    if (availablePrizes.length > 0 && Math.random() < 0.3) {
      const randomIndex = Math.floor(Math.random() * availablePrizes.length);
      const selectedPrize = availablePrizes[randomIndex];

      prizeWon = selectedPrize.nama_hadiah;
      isWinner = true;

      // Update jumlah pemenang di database
      await Prize.findByIdAndUpdate(selectedPrize._id, {
        $inc: { jumlah_pemenang: 1 },
      });
    }

    // D. Catat semua request ke MongoDB
    const newLog = new GachaLog({
      user_id,
      nama_user,
      nama_samaran: maskName(nama_user), // Bonus Point 3
      hadiah_won: prizeWon,
      is_winner: isWinner,
    });
    await newLog.save();

    return res.status(200).json({
      message: isWinner ? 'Selamat! Anda menang!' : 'Maaf, coba lagi.',
      hadiah: prizeWon,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// --- 2. BONUS POINT 1: HISTORI GACHA USER ---
exports.getUserHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    const history = await GachaLog.find({ user_id }).sort({
      tanggal_gacha: -1,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error', error });
  }
};

// --- 3. BONUS POINT 2: DAFTAR HADIAH & SISA KUOTA ---
exports.getPrizeStats = async (req, res) => {
  try {
    const prizes = await Prize.find();
    const stats = prizes.map((p) => ({
      hadiah: p.nama_hadiah,
      sisa_kuota: p.kuota_total - p.jumlah_pemenang,
    }));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error', error });
  }
};
// --- 4. BONUS POINT 3: DAFTAR PEMENANG (NAMA DISAMARKAN) ---
exports.getWinnersList = async (req, res) => {
  try {
    const winners = await GachaLog.find({ is_winner: true }).select(
      'nama_samaran hadiah_won tanggal_gacha'
    );
    res.json(winners);
  } catch (error) {
    res.status(500).json({ message: 'Error', error });
  }
};
