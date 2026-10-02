import dns from "node:dns/promises";
import net from "node:net";

/**
 * Mengambil gambar dari link yang ditempel guru, dengan pengaman:
 * hanya https (port 443), tidak boleh ke alamat internal/privat, redirect diperiksa ulang,
 * ukuran dibatasi, dan isi harus benar-benar gambar (JPEG/PNG/WebP/GIF, bukan SVG).
 */

const MAX_BYTES = 6 * 1024 * 1024;
const MAX_REDIRECTS = 3;

export class UnsafeUrl extends Error {}

/** true bila alamat IP termasuk jaringan privat, loopback, link-local, dsb. */
export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b, c] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // CGNAT
      (a === 169 && b === 254) || // link-local, termasuk metadata cloud
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && c === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224 // multicast & reserved
    );
  }
  if (net.isIPv6(ip)) {
    const x = ip.toLowerCase();
    if (x === "::" || x === "::1") return true;
    const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    if (/^::ffff:[0-9a-f]+:[0-9a-f]+$/.test(x)) return true; // bentuk hex v4-mapped: tolak saja
    return /^f[cd]/.test(x) || /^fe[89ab]/.test(x) || x.startsWith("ff") || x.startsWith("64:ff9b");
  }
  return true;
}

/** Periksa satu URL: skema, port, kredensial, lalu semua alamat IP hasil DNS harus publik */
export async function assertPublicUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new UnsafeUrl("Link tidak valid");
  }
  if (u.protocol !== "https:") throw new UnsafeUrl("Link harus diawali https://");
  if (u.username || u.password) throw new UnsafeUrl("Link tidak boleh memuat nama pengguna atau password");
  if (u.port && u.port !== "443") throw new UnsafeUrl("Link tidak diizinkan");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
    throw new UnsafeUrl("Link tidak diizinkan");
  }
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new UnsafeUrl("Link tidak diizinkan");
    return u;
  }
  let addrs;
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch {
    throw new UnsafeUrl("Alamat link tidak ditemukan");
  }
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new UnsafeUrl("Link tidak diizinkan");
  return u;
}

/** Jenis gambar dari isi file (bukan dari header yang dikirim server luar) */
export function sniffImage(buf) {
  const b = new Uint8Array(buf.slice(0, 16));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "image/gif";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

async function readLimited(res) {
  const len = Number(res.headers.get("content-length") || 0);
  if (len > MAX_BYTES) throw new UnsafeUrl("Gambar terlalu besar");
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      reader.cancel().catch(() => {});
      throw new UnsafeUrl("Gambar terlalu besar");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

/** @returns {Promise<{ buf: Buffer, type: string }>} */
export async function fetchImageSafely(raw) {
  let url = raw;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const u = await assertPublicUrl(url);
    const res = await fetch(u, {
      headers: { "User-Agent": "Mozilla/5.0 (SI-PINTAR SD)", Accept: "image/jpeg,image/png,image/webp,image/gif" },
      signal: AbortSignal.timeout(8000),
      redirect: "manual",
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new UnsafeUrl("Link tidak bisa dibuka");
      url = new URL(loc, u).toString();
      continue;
    }
    if (!res.ok) throw new UnsafeUrl("Link tidak bisa dibuka");
    const buf = await readLimited(res);
    const type = sniffImage(buf);
    if (!type) throw new UnsafeUrl("Link itu bukan gambar (JPEG, PNG, WebP, atau GIF)");
    return { buf, type };
  }
  throw new UnsafeUrl("Link terlalu banyak dialihkan");
}
