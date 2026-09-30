import crypto from "crypto";

export const COOKIE = "sp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  // Cadangan kalau SESSION_SECRET lupa diisi: turunan dari secret key Supabase
  // (tidak pernah ada di repo), supaya cookie tidak bisa dipalsukan.
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (k) return crypto.createHash("sha256").update(`sipintar:${k}`).digest("hex");
  return "sipintar-dev-lokal-saja";
}

const b64 = (s) => Buffer.from(s).toString("base64url");
const sign = (v) => crypto.createHmac("sha256", secret()).update(v).digest("base64url");

/** Payload: { role: 'siswa'|'ortu'|'guru', schoolId, slug, studentId?, adminId? } */
export function encodeSession(payload) {
  const body = b64(JSON.stringify({ ...payload, iat: Date.now() }));
  return `${body}.${sign(body)}`;
}

export function decodeSession(value) {
  if (!value || !value.includes(".")) return null;
  const [body, sig] = value.split(".");
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (Date.now() - data.iat > MAX_AGE * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export function readSession(req) {
  return decodeSession(req.cookies.get(COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
