/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

// --- SCHEMA 1: PRIZE (Daftar Hadiah & Kuota) ---
const PrizeSchema = new mongoose.Schema({
  nama_hadiah: { type: String, required: true },
  kuota_total: { type: Number, required: true },
  jumlah_pemenang: { type: Number, default: 0 },
});

// --- SCHEMA 2: GACHA LOG (Riwayat & Limit 5x) ---
const GachaLogSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  nama_user: { type: String, required: true },
  nama_samaran: { type: String },
  hadiah_won: { type: String, default: 'Zonk' },
  is_winner: { type: Boolean, default: false },
  tanggal_gacha: { type: Date, default: Date.now },
});

const Prize = mongoose.model('Prize', PrizeSchema);
const GachaLog = mongoose.model('GachaLog', GachaLogSchema);

/**
 * FUNGSI SEEDING DATA (WAJIB ADA AGAR TIDAK KOSONG)
 * Data ini persis sesuai tabel di halaman 2 soal PDF kamu.
 */
const seedDatabase = async () => {
  try {
    const count = await Prize.countDocuments();
    if (count === 0) {
      const initialPrizes = [
        { nama_hadiah: 'Emas 10 gram', kuota_total: 1 },
        { nama_hadiah: 'Smartphone X', kuota_total: 5 },
        { nama_hadiah: 'Smartwatch Y', kuota_total: 10 },
        { nama_hadiah: 'Voucher Rp100.000', kuota_total: 100 },
        { nama_hadiah: 'Pulsa Rp50.000', kuota_total: 500 },
      ];
      await Prize.insertMany(initialPrizes);
      console.log('Database Hadiah berhasil diisi sesuai soal!');
    }
  } catch (err) {
    console.error('Gagal mengisi data awal:', err);
  }
};

// Jalankan seeding saat file ini di-load
seedDatabase();

module.exports = { Prize, GachaLog };
