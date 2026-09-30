// Semua perhitungan tanggal memakai WITA (UTC+8, Balikpapan). Tidak ada daylight saving.
const OFFSET = 8 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const shifted = (d) => new Date(new Date(d).getTime() + OFFSET);
const pad = (n) => String(n).padStart(2, "0");

/** 'YYYY-MM-DD' menurut WITA */
export function dateStr(d = new Date()) {
  const s = shifted(d);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`;
}

/** 'YYYY-MM' menurut WITA */
export function monthKey(d = new Date()) {
  return dateStr(d).slice(0, 7);
}

/** Tanggal Senin di minggu tersebut, 'YYYY-MM-DD' (WITA) */
export function weekKey(d = new Date()) {
  const s = shifted(d);
  const diff = (s.getUTCDay() + 6) % 7;
  const mon = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() - diff));
  return `${mon.getUTCFullYear()}-${pad(mon.getUTCMonth() + 1)}-${pad(mon.getUTCDate())}`;
}

/** Tambah n hari ke string 'YYYY-MM-DD' */
export function addDays(str, n) {
  const [y, m, d] = str.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Selisih hari b - a (keduanya 'YYYY-MM-DD') */
export function diffDays(a, b) {
  const pa = Date.UTC(...a.split("-").map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))));
  const pb = Date.UTC(...b.split("-").map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))));
  return Math.round((pb - pa) / DAY);
}

/** Awal bulan WITA sebagai ISO timestamp (UTC) — untuk query database */
export function monthStartISO(mk = monthKey()) {
  const [y, m] = mk.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1) - OFFSET).toISOString();
}

/** Awal hari WITA sebagai ISO timestamp (UTC) */
export function dayStartISO(ds = dateStr()) {
  const [y, m, d] = ds.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - OFFSET).toISOString();
}

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** '12 Sep 2026' */
export function fmtDate(v) {
  if (!v) return "-";
  const ds = v.length === 10 ? v : dateStr(v);
  const [y, m, d] = ds.split("-").map(Number);
  return `${d} ${BLN[m - 1]} ${y}`;
}

/** '12 Sep' */
export function fmtShort(v) {
  if (!v) return "-";
  const ds = v.length === 10 ? v : dateStr(v);
  const [, m, d] = ds.split("-").map(Number);
  return `${d} ${BLN[m - 1]}`;
}

/** 'September 2026' dari 'YYYY-MM' */
export function fmtMonth(mk) {
  const [y, m] = mk.split("-").map(Number);
  return `${BULAN[m - 1]} ${y}`;
}
