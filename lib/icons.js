// Ikon kategori: dipilih guru (kolom icon). Kategori lama tanpa icon → "semua".
export const KATEGORI_ICONS = [
  "kategori/cerpen", "kategori/pengetahuan", "kategori/fiksi", "kategori/komik", "kategori/pelajaran",
  "kategori/cerita-rakyat", "kategori/agama", "kategori/hobi", "kategori/semua",
];
export const catIcon = (cat) => (cat && cat.icon) || "kategori/semua";
