// ═══════════════════════════════════════════════════════════════════
//  ATURAN POIN, LEVEL, LENCANA & TANTANGAN — dipakai server dan tampilan
//  Ubah angka di sini kalau mau menyesuaikan aturan.
// ═══════════════════════════════════════════════════════════════════

export const POIN = {
  TEPAT_WAKTU: 10, // kembalikan tepat waktu
  JUDUL_BARU: 5, // bonus judul yang belum pernah dia pinjam
  BATAS_MINGGUAN: 5, // maksimal buku yang dapat poin dasar per minggu
  KELAS: 20, // hadiah tantangan kelas untuk semua anggota
};

export const LEVELS = [
  { level: 1, min: 0, name: "Pembaca Pemula", emoji: "🌱" },
  { level: 2, min: 100, name: "Pembaca Cilik", emoji: "📗" },
  { level: 3, min: 250, name: "Sahabat Buku", emoji: "🤝" },
  { level: 4, min: 500, name: "Pembaca Hebat", emoji: "🚀" },
  { level: 5, min: 1000, name: "Jagoan Literasi", emoji: "🦸" },
  { level: 6, min: 2000, name: "Bintang Perpustakaan", emoji: "🌟" },
];

export function levelInfo(total) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (total >= l.min) cur = l;
  const next = LEVELS.find((l) => l.min > total) || null;
  const pct = next ? Math.round(((total - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { ...cur, next, pct, toNext: next ? next.min - total : 0 };
}

// Tantangan mingguan dari sistem — 3 dipilih acak tiap Senin (sama untuk semua siswa)
export const WEEKLY_POOL = [
  { id: "kembali2", title: "Kembalikan 2 buku tepat waktu minggu ini", points: 20, emoji: "⏰", kind: "returnOnTime", target: 2 },
  { id: "katbaru", title: "Pinjam 1 buku dari kategori yang belum pernah kamu coba", points: 20, emoji: "🧭", kind: "newCategory", target: 1 },
  { id: "rakyat", title: "Pinjam buku Cerita Rakyat", points: 15, emoji: "🏛️", kind: "borrowCategory", kode: "06", target: 1 },
  { id: "pengetahuan", title: "Pinjam buku Pengetahuan", points: 15, emoji: "🔬", kind: "borrowCategory", kode: "02", target: 1 },
  { id: "langka", title: "Pinjam buku yang belum dipinjam siapa pun bulan ini", points: 25, emoji: "💎", kind: "rareBook", target: 1 },
  { id: "semuatepat", title: "Kembalikan semua pinjamanmu tepat waktu minggu ini", points: 15, emoji: "✅", kind: "allOnTime", target: 1 },
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickWeekly(wk) {
  const arr = [...WEEKLY_POOL];
  let seed = hash("sipintar-" + wk);
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

// Tantangan berjenjang — selesai 1 tingkat, tingkat berikutnya terbuka
export const TIERS = [
  { id: "setia", name: "Pembaca Setia", emoji: "📚", unit: "judul berbeda", levels: [[5, 30], [15, 60], [30, 100], [50, 150]] },
  { id: "jelajah", name: "Penjelajah Kategori", emoji: "🧭", unit: "kategori", levels: [[3, 30], [5, 50], [8, 100]] },
  { id: "tepat", name: "Si Tepat Waktu", emoji: "⏰", unit: "kali tepat waktu", levels: [[5, 25], [15, 50], [30, 100]] },
  { id: "rajin", name: "Rajin ke Perpus", emoji: "🔥", unit: "minggu beruntun", levels: [[2, 20], [4, 40], [8, 80]] },
];

export const TIER_NAMES = ["Perunggu", "Perak", "Emas", "Berlian"];
export const TIER_COLORS = ["#CD7F32", "#94A3B8", "#F59E0B", "#38BDF8"];

/** Semua lencana yang mungkin: id 'setia-1' dst */
export function badgeInfo(id) {
  const [tid, lv] = id.split("-");
  const t = TIERS.find((x) => x.id === tid);
  if (!t) return null;
  const i = Number(lv) - 1;
  return { id, emoji: t.emoji, name: `${t.name} ${TIER_NAMES[i]}`, color: TIER_COLORS[i], rank: i, tier: t.name };
}

export function classTarget(size) {
  return Math.max(5, Math.ceil(size * 1.5));
}

export const KONDISI = {
  baik: { label: "Baik", color: "bg-emerald-100 text-emerald-700" },
  rusak_ringan: { label: "Rusak ringan", color: "bg-amber-100 text-amber-700" },
  rusak_berat: { label: "Rusak berat", color: "bg-red-100 text-red-700" },
};

export const STATUS_COPY = {
  tersedia: { label: "Tersedia", color: "bg-emerald-100 text-emerald-700" },
  dipinjam: { label: "Dipinjam", color: "bg-sky-100 text-sky-700" },
  hilang: { label: "Hilang", color: "bg-slate-200 text-slate-600" },
};
