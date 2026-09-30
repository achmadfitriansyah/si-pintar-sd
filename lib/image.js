"use client";
// ═══════════════════════════════════════════════════════════════════
//  PENGOLAH GAMBAR COVER (berjalan di browser, tanpa server)
//  1. Luruskan: 4 sudut buku → persegi panjang rata (seperti hasil scan)
//  2. Rapikan cahaya: hapus bayangan/gradasi gelap tanpa merusak warna desain
//  3. Standar: 600×900 px, JPEG ± 80 KB
// ═══════════════════════════════════════════════════════════════════

export const COVER_W = 600;
export const COVER_H = 900;
const MAX_BYTES = 110 * 1024;

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gambar tidak bisa dibuka"));
    img.src = src;
  });
}

/** Ambil gambar dari link luar lewat server (menghindari blokir lintas situs) */
export async function fetchViaProxy(url) {
  const r = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
  if (!r.ok) throw new Error((await r.text()) || "Gambar tidak bisa diambil dari link itu");
  return r.blob();
}

/** Kanvas kerja dengan sisi terpanjang ≤ maxSide (hemat memori HP) */
export function toCanvas(img, maxSide = 1600) {
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const c = document.createElement("canvas");
  c.width = Math.round((img.naturalWidth || img.width) * s);
  c.height = Math.round((img.naturalHeight || img.height) * s);
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

// ---------- homografi (transformasi perspektif) ----------
function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let max = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[max][i])) max = r;
    [A[i], A[max]] = [A[max], A[i]];
    [b[i], b[max]] = [b[max], b[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}

/** Matriks yang memetakan titik `from` ke titik `to` */
function homography(from, to) {
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = from[i];
    const [u, v] = to[i];
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }
  return solve(A, b);
}

/** Luruskan area 4 titik (urutan: kiri-atas, kanan-atas, kanan-bawah, kiri-bawah) jadi W×H */
export function warp(src, quad, W = COVER_W, H = COVER_H) {
  const sctx = src.getContext("2d");
  const sw = src.width;
  const sh = src.height;
  const sd = sctx.getImageData(0, 0, sw, sh).data;
  const [a, b, c, d, e, f, g, h] = homography(
    [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ],
    quad
  );
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const octx = out.getContext("2d");
  const od = octx.createImageData(W, H);
  const o = od.data;
  for (let y = 0; y < H; y++) {
    const yy = y + 0.5;
    for (let x = 0; x < W; x++) {
      const xx = x + 0.5;
      const den = g * xx + h * yy + 1;
      let sx = (a * xx + b * yy + c) / den - 0.5;
      let sy = (d * xx + e * yy + f) / den - 0.5;
      sx = Math.max(0, Math.min(sw - 1.001, sx));
      sy = Math.max(0, Math.min(sh - 1.001, sy));
      const x0 = sx | 0;
      const y0 = sy | 0;
      const fx = sx - x0;
      const fy = sy - y0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = i00 + 4;
      const i01 = i00 + sw * 4;
      const i11 = i01 + 4;
      const oi = (y * W + x) * 4;
      for (let k = 0; k < 3; k++) {
        const top = sd[i00 + k] + (sd[i10 + k] - sd[i00 + k]) * fx;
        const bot = sd[i01 + k] + (sd[i11 + k] - sd[i01 + k]) * fx;
        o[oi + k] = top + (bot - top) * fy;
      }
      o[oi + 3] = 255;
    }
  }
  octx.putImageData(od, 0, 0);
  return out;
}

/**
 * Rapikan cahaya: cocokkan permukaan halus (polinom derajat 2) ke kecerahan gambar.
 * Permukaan halus itu = bayangan/gradasi lampu. Desain cover (blok gelap/terang)
 * tidak ikut terhapus karena tidak bisa diwakili permukaan sehalus itu.
 */
export function enhance(canvas) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d");
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const lum = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

  // 1) sampel log-kecerahan di grid kasar
  const gw = 30;
  const gh = 45;
  const rows = [];
  const vals = [];
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const x = Math.floor(((gx + 0.5) / gw) * W);
      const y = Math.floor(((gy + 0.5) / gh) * H);
      const L = Math.max(4, lum((y * W + x) * 4));
      const u = x / W - 0.5;
      const v = y / H - 0.5;
      rows.push([1, u, v, u * u, v * v, u * v]);
      vals.push(Math.log(L));
    }
  }
  // 2) kuadrat terkecil → 6 koefisien
  const N = Array.from({ length: 6 }, () => new Array(6).fill(0));
  const t = new Array(6).fill(0);
  rows.forEach((r, k) => {
    for (let i = 0; i < 6; i++) {
      t[i] += r[i] * vals[k];
      for (let j = 0; j < 6; j++) N[i][j] += r[i] * r[j];
    }
  });
  const co = solve(N, t);
  const mean = co[0] + co[3] / 12 + co[4] / 12; // rata-rata permukaan di seluruh area
  // 3) terapkan koreksi + kumpulkan histogram
  const hist = new Uint32Array(256);
  for (let y = 0; y < H; y++) {
    const v = y / H - 0.5;
    for (let x = 0; x < W; x++) {
      const u = x / W - 0.5;
      const fit = co[0] + co[1] * u + co[2] * v + co[3] * u * u + co[4] * v * v + co[5] * u * v;
      const gain = Math.min(1.6, Math.max(0.8, Math.exp(mean - fit)));
      const i = (y * W + x) * 4;
      d[i] = Math.min(255, d[i] * gain);
      d[i + 1] = Math.min(255, d[i + 1] * gain);
      d[i + 2] = Math.min(255, d[i + 2] * gain);
      hist[Math.round(lum(i))]++;
    }
  }
  // 4) regangkan kontras (0,5% tergelap → hitam, 0,5% terterang → putih), dibatasi
  const total = W * H;
  let acc = 0;
  let lo = 0;
  let hi = 255;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc > total * 0.005) {
      lo = i;
      break;
    }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += hist[i];
    if (acc > total * 0.005) {
      hi = i;
      break;
    }
  }
  const scale = Math.min(1.6, 255 / Math.max(40, hi - lo));
  for (let i = 0; i < d.length; i += 4) {
    const L = lum(i);
    for (let k = 0; k < 3; k++) {
      let c = (d[i + k] - lo) * scale;
      c = L + (c - L) * 1.08; // sedikit lebih segar warnanya
      d[i + k] = c < 0 ? 0 : c > 255 ? 255 : c;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Potong tengah rasio 2:3 lalu ubah ke 600×900 (tanpa meluruskan) */
export function coverFit(src) {
  const sw = src.naturalWidth || src.width;
  const sh = src.naturalHeight || src.height;
  const target = COVER_W / COVER_H;
  let cw = sw;
  let ch = sh;
  if (sw / sh > target) cw = sh * target;
  else ch = sw / target;
  const c = document.createElement("canvas");
  c.width = COVER_W;
  c.height = COVER_H;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, COVER_W, COVER_H);
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, COVER_W, COVER_H);
  return c;
}

/** Simpan ke JPEG, turunkan kualitas sampai ≤ ±110 KB */
export async function toJpeg(canvas) {
  const blob = (q) => new Promise((r) => canvas.toBlob(r, "image/jpeg", q));
  let q = 0.86;
  let b = await blob(q);
  while (b && b.size > MAX_BYTES && q > 0.5) {
    q -= 0.08;
    b = await blob(q);
  }
  return b;
}

/** Logo sekolah: persegi 512×512, latar transparan dipertahankan */
export async function logoBlob(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const S = 512;
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    const s = Math.min(S / img.naturalWidth, S / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
    const png = await new Promise((r) => c.toBlob(r, "image/png"));
    return png && png.size < 900 * 1024 ? png : new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}
