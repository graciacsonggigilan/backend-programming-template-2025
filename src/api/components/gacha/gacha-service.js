/* eslint-disable prettier/prettier */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-return-await */
/* eslint-disable prettier/prettier */
const gachaRepository = require('../repositories/gacha.repository');

class GachaService {
  /**
   * LOGIKA UTAMA: Play Gacha
   * Menghubungkan langsung ke Gacha Schema & Repository
   */
  async playGacha(userId, userName) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // 1. VALIDASI LIMIT HARIAN (Requirement 1) [cite: 12]
    // Menghitung data di GachaLogSchema berdasarkan user_id dan tanggal hari ini
    const attemptsToday = await gachaRepository.countUserAttemptsToday(
      userId,
      startOfDay
    );
    if (attemptsToday >= 5) {
      throw new Error(
        'Batas gacha harian tercapai (Maksimal 5 kali per hari) [cite: 13]'
      );
    }

    // 2. CEK STOK HADIAH (Requirement 2) [cite: 15]
    // Mengambil data dari PrizeSchema yang 'jumlah_pemenang' < 'kuota_total' [cite: 16]
    const availablePrizes = await gachaRepository.getAvailablePrizes();

    let selectedPrizeName = 'Zonk'; // Default jika tidak memenangkan hadiah apapun [cite: 10]
    let isWinner = false;

    // 3. LOGIKA PENENTUAN HADIAH
    // Memastikan jumlah pemenang tidak melebihi kuota hadiah
    if (availablePrizes.length > 0 && Math.random() < 0.2) {
      const prize =
        availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

      selectedPrizeName = prize.nama_hadiah;
      isWinner = true;

      // Update field 'jumlah_pemenang' di PrizeSchema [cite: 16]
      await gachaRepository.incrementWinnerCount(prize._id);
    }

    // 4. MASKING NAMA (Bonus Point 3) [cite: 23]
    const maskedName = this.generateMaskedName(userName);

    // 5. SIMPAN KE MONGODB (Requirement 3) [cite: 18]
    // Mencatat semua request dan hasil hadiah ke GachaLogSchema
    const logData = {
      user_id: userId,
      nama_asli: userName,
      nama_samaran: maskedName, // Hasil masking untuk tampilan publik [cite: 24]
      hadiah_won: selectedPrizeName,
      is_winner: isWinner,
      tanggal_gacha: new Date(),
    };

    return await gachaRepository.createLog(logData);
  }

  /**
   * FUNGSI MASKING (Bonus Point 3) [cite: 23]
   * Mengubah "Jane Doe" menjadi "J****oe" sesuai contoh soal [cite: 24]
   */
  generateMaskedName(name) {
    if (!name) return 'Anonym';
    const parts = name.split(' ');
    return parts
      .map((part) => {
        if (part.length <= 2) return part;
        // Format masking: J****oe (Huruf pertama + bintang + 2 huruf terakhir) [cite: 24]
        return part[0] + '*'.repeat(part.length - 3) + part.slice(-2);
      })
      .join(' ');
  }

  // BONUS POINT 1: Get Histori User dari GachaLog [cite: 20]
  async getUserHistory(userId) {
    return await gachaRepository.getHistoryByUserId(userId);
  }

  // BONUS POINT 2: Sisa Kuota dari Prize Schema [cite: 21]
  async getPrizeStats() {
    const prizes = await gachaRepository.getAllPrizes();
    return prizes.map((p) => ({
      hadiah: p.nama_hadiah,
      kuota_awal: p.kuota_total,
      pemenang_saat_ini: p.jumlah_pemenang,
      sisa_kuota: p.kuota_total - p.jumlah_pemenang,
    }));
  }

  // BONUS POINT 3: Daftar Pemenang (Public) [cite: 22]
  async getPublicWinners() {
    return await gachaRepository.getAllWinners();
  }
}

module.exports = new GachaService();
