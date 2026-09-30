// Peta kode kategori buku → ikon. Kategori lain memakai ikon "semua".
const KATEGORI = {
  "01": "kategori/cerpen",
  "02": "kategori/pengetahuan",
  "03": "kategori/fiksi",
  "04": "kategori/komik",
  "05": "kategori/pelajaran",
  "06": "kategori/cerita-rakyat",
  "07": "kategori/agama",
  "08": "kategori/hobi",
};
export const catIcon = (kode) => KATEGORI[kode] || "kategori/semua";
