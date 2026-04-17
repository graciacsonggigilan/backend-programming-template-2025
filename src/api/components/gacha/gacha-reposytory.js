/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-return-await */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line import/extensions
const { Prize, GachaLog } = require('../models/GachaSchema');

class GachaRepository {
  // 1. Mencari data hadiah berdasarkan nama
  async findPrizeByName(prizeName) {
    return await Prize.findOne({ nama_hadiah: prizeName });
  }

  // 2. Mengambil semua hadiah yang kuotanya masih tersedia (Requirement 2)
  async getAvailablePrizes() {
    // Mencari hadiah yang jumlah_pemenangnya masih di bawah kuota_total [cite: 15, 16]
    return await Prize.find({
      $expr: { $lt: ['$jumlah_pemenang', '$kuota_total'] },
    });
  }

  // 3. Menghitung jumlah gacha user hari ini (Requirement 1: Maks 5x)
  async countUserAttemptsToday(userId, startOfDay) {
    return await GachaLog.countDocuments({
      user_id: userId,
      tanggal_gacha: { $gte: startOfDay },
    });
  }

  // 4. Menyimpan histori gacha (Requirement 3)
  async createLog(logData) {
    const log = new GachaLog(logData);
    return await log.save(); // Mencatat request dan hadiah ke MongoDB
  }

  // 5. Update kuota hadiah saat ada yang menang
  async incrementWinnerCount(prizeId) {
    return await Prize.findByIdAndUpdate(prizeId, {
      $inc: { jumlah_pemenang: 1 },
    });
  }

  // 6. Bonus Point 1: Ambil histori berdasarkan User ID
  async getHistoryByUserId(userId) {
    return await GachaLog.find({ user_id: userId }).sort({ tanggal_gacha: -1 });
  }

  // 7. Bonus Point 2: Ambil semua data hadiah untuk cek sisa kuota
  async getAllPrizes() {
    return await Prize.find();
  }

  // 8. Bonus Point 3: Ambil semua log yang statusnya menang
  // eslint-disable-next-line class-methods-use-this
  async getAllWinners() {
    return await GachaLog.find({ is_winner: true }).select(
      'nama_samaran hadiah_won tanggal_gacha'
    );
  }
}

module.exports = new GachaRepository();
