// Dummy data untuk demo — semua konten dipush dari sini
// Nanti bisa diganti dengan fetch() ke Apps Script API

export const currentUser = {
  siswa: {
    nama: "Arga Pramudita",
    kelas: "2A",
    avatar: "👦",
    poin: 1250,
    level: 4,
    levelLabel: "Pembaca Ulung",
  },
  guru: {
    nama: "Bu Rina Wulandari",
    kelas: "Wali Kelas 2A",
    avatar: "👩‍🏫",
  },
  ortu: {
    nama: "Ibu Sari Pramudita",
    anak: {
      nama: "Arga",
      kelas: "2A",
      avatar: "👦",
    },
  },
};

export const books = [
  {
    id: 1,
    judul: "Petualangan Si Kancil",
    penulis: "Tim Cerita Nusantara",
    kategori: "Cerpen",
    rating: 4.8,
    stok: 3,
    cover_url:
      "https://placehold.co/300x450/16A34A/FFFFFF/png?text=Si+Kancil&font=montserrat",
    kode_qr: "PPB.01.0001",
    badge: "Populer",
  },
  {
    id: 2,
    judul: "Sahabat Hutan",
    penulis: "Ratna Dewi",
    kategori: "Pengetahuan",
    rating: 4.6,
    stok: 2,
    cover_url:
      "https://placehold.co/300x450/059669/FFFFFF/png?text=Sahabat+Hutan&font=montserrat",
    kode_qr: "PPB.02.0001",
  },
  {
    id: 3,
    judul: "Si Cerdas & Anak Rajin",
    penulis: "Bagus Priyanto",
    kategori: "Cerpen",
    rating: 4.5,
    stok: 4,
    cover_url:
      "https://placehold.co/300x450/EA580C/FFFFFF/png?text=Si+Cerdas&font=montserrat",
    kode_qr: "PPB.01.0002",
  },
  {
    id: 4,
    judul: "Keberanian Bima",
    penulis: "Anisa Putri",
    kategori: "Fiksi",
    rating: 4.7,
    stok: 3,
    cover_url:
      "https://placehold.co/300x450/DC2626/FFFFFF/png?text=Bima&font=montserrat",
    kode_qr: "PPB.03.0001",
    badge: "Baru",
  },
  {
    id: 5,
    judul: "Malin Kundang",
    penulis: "Tim Cerita Nusantara",
    kategori: "Cerita Rakyat",
    rating: 4.4,
    stok: 5,
    cover_url:
      "https://placehold.co/300x450/2563EB/FFFFFF/png?text=Malin&font=montserrat",
    kode_qr: "PPB.06.0001",
  },
  {
    id: 6,
    judul: "Timun Mas",
    penulis: "Tim Cerita Nusantara",
    kategori: "Cerita Rakyat",
    rating: 4.5,
    stok: 4,
    cover_url:
      "https://placehold.co/300x450/CA8A04/FFFFFF/png?text=Timun+Mas&font=montserrat",
    kode_qr: "PPB.06.0002",
  },
  {
    id: 7,
    judul: "Ensiklopedia Hewan",
    penulis: "Tim DK Indonesia",
    kategori: "Pengetahuan",
    rating: 4.9,
    stok: 2,
    cover_url:
      "https://placehold.co/300x450/0891B2/FFFFFF/png?text=Ensiklopedia&font=montserrat",
    kode_qr: "PPB.02.0002",
  },
  {
    id: 8,
    judul: "Cerita Nabi Yusuf",
    penulis: "Ust. Yusuf Mansur",
    kategori: "Agama",
    rating: 4.8,
    stok: 3,
    cover_url:
      "https://placehold.co/300x450/7C3AED/FFFFFF/png?text=Nabi+Yusuf&font=montserrat",
    kode_qr: "PPB.07.0001",
  },
];

export const kategoriList = [
  { id: "all", label: "Semua", emoji: "📚" },
  { id: "cerpen", label: "Cerpen", emoji: "📖" },
  { id: "pengetahuan", label: "Pengetahuan", emoji: "🔬" },
  { id: "fiksi", label: "Fiksi", emoji: "✨" },
  { id: "cerita-rakyat", label: "Cerita Rakyat", emoji: "🏛️" },
  { id: "agama", label: "Agama", emoji: "🕌" },
];

export const readingChallenge = {
  judul: "Petualangan Mingguan",
  deskripsi: "Baca 3 buku minggu ini",
  target: 3,
  progress: 2,
  hadiah: "200 Poin + Badge Rajin",
  deadline: "Minggu, 31 Agustus",
};

export const activeChallenges = [
  {
    id: 1,
    judul: "Baca 3 buku minggu ini",
    kategori: "Mingguan",
    progress: 2,
    target: 3,
    hadiah: 200,
    icon: "📚",
    color: "red",
  },
  {
    id: 2,
    judul: "Selesaikan buku Cerita Rakyat",
    kategori: "Kategori",
    progress: 1,
    target: 2,
    hadiah: 150,
    icon: "🏛️",
    color: "yellow",
  },
  {
    id: 3,
    judul: "Baca 20 menit setiap hari",
    kategori: "Kebiasaan",
    progress: 5,
    target: 7,
    hadiah: 100,
    icon: "⏰",
    color: "sky",
  },
];

export const poinHistory = [
  { id: 1, aktivitas: "Selesai baca 'Petualangan Si Kancil'", poin: 100, tanggal: "23 Agu" },
  { id: 2, aktivitas: "Review buku 'Sahabat Hutan'", poin: 25, tanggal: "22 Agu" },
  { id: 3, aktivitas: "Baca 20 menit hari ini", poin: 15, tanggal: "22 Agu" },
  { id: 4, aktivitas: "Selesai tantangan 'Baca Cerpen'", poin: 150, tanggal: "20 Agu" },
  { id: 5, aktivitas: "Selesai baca 'Malin Kundang'", poin: 100, tanggal: "19 Agu" },
];

export const rewardKatalog = [
  { id: 1, nama: "Stiker Pahlawan Literasi", poin: 200, emoji: "🌟", stock: 12 },
  { id: 2, nama: "Pembatas Buku Eksklusif", poin: 500, emoji: "🔖", stock: 8 },
  { id: 3, nama: "Piagam Pembaca Terbaik", poin: 1000, emoji: "📜", stock: 5 },
  { id: 4, nama: "Buku Cerita Baru (Pilihan)", poin: 2500, emoji: "📚", stock: 3 },
];

export const leaderboard = [
  { rank: 1, nama: "Aisyah Ramadhani", kelas: "2A", poin: 2450, avatar: "👧", trend: "up" },
  { rank: 2, nama: "Arga Pramudita", kelas: "2A", poin: 1250, avatar: "👦", trend: "up", isMe: true },
  { rank: 3, nama: "Budi Santoso", kelas: "2B", poin: 1180, avatar: "👦", trend: "same" },
  { rank: 4, nama: "Citra Lestari", kelas: "2A", poin: 980, avatar: "👧", trend: "up" },
  { rank: 5, nama: "Dimas Prasetyo", kelas: "2B", poin: 850, avatar: "👦", trend: "down" },
  { rank: 6, nama: "Elina Wulandari", kelas: "2A", poin: 720, avatar: "👧", trend: "up" },
];

// ============ ORTU DASHBOARD DATA ============

export const anakStats = {
  buku_dibaca: 12,
  hari_aktif: 15,
  menit_baca_minggu: 145,
  poin_total: 1250,
  streak: 5,
};

export const aktivitasMingguan = [
  { hari: "Sen", menit: 25, buku: 1 },
  { hari: "Sel", menit: 40, buku: 1 },
  { hari: "Rab", menit: 15, buku: 0 },
  { hari: "Kam", menit: 35, buku: 1 },
  { hari: "Jum", menit: 30, buku: 1 },
  { hari: "Sab", menit: 0, buku: 0 },
  { hari: "Min", menit: 0, buku: 0 },
];

export const bukuTerakhirDibaca = [
  { judul: "Petualangan Si Kancil", tanggal: "Hari ini", durasi: "25 menit", selesai: true },
  { judul: "Sahabat Hutan", tanggal: "Kemarin", durasi: "40 menit", selesai: false },
  { judul: "Timun Mas", tanggal: "3 hari lalu", durasi: "30 menit", selesai: true },
];

// ============ GURU DASHBOARD DATA ============

export const kelasStats = {
  total_siswa: 28,
  siswa_aktif_minggu_ini: 24,
  total_pinjam_minggu_ini: 47,
  rata_buku_per_siswa: 2.3,
};

export const siswaAktif = [
  { nama: "Aisyah Ramadhani", buku_dibaca: 8, poin: 2450, status: "aktif", streak: 12 },
  { nama: "Arga Pramudita", buku_dibaca: 5, poin: 1250, status: "aktif", streak: 5 },
  { nama: "Citra Lestari", buku_dibaca: 4, poin: 980, status: "aktif", streak: 3 },
  { nama: "Elina Wulandari", buku_dibaca: 3, poin: 720, status: "aktif", streak: 2 },
  { nama: "Farhan Hidayat", buku_dibaca: 2, poin: 340, status: "kurang", streak: 0 },
  { nama: "Gita Permata", buku_dibaca: 1, poin: 120, status: "kurang", streak: 0 },
];

export const kategoriPopuler = [
  { kategori: "Cerpen", jumlah: 18, warna: "#EF4444" },
  { kategori: "Pengetahuan", jumlah: 12, warna: "#0D9488" },
  { kategori: "Fiksi", jumlah: 9, warna: "#7C3AED" },
  { kategori: "Cerita Rakyat", jumlah: 8, warna: "#F59E0B" },
];
