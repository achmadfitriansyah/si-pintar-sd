import { readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

// Mengambil gambar dari link luar / Google Books supaya bisa diproses di browser
// (browser menolak memproses gambar lintas situs secara langsung)
export async function GET(req) {
  const session = readSession(req);
  if (!session || session.role !== "guru") return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url).searchParams.get("url") || "";
  if (!/^https?:\/\//i.test(url)) return new Response("Link tidak valid", { status: 400 });
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (SI-PINTAR SD)" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !type.startsWith("image/")) return new Response("Link bukan gambar", { status: 400 });
    const buf = await r.arrayBuffer();
    if (buf.byteLength > 8 * 1024 * 1024) return new Response("Gambar terlalu besar", { status: 400 });
    return new Response(buf, { headers: { "Content-Type": type, "Cache-Control": "private, max-age=300" } });
  } catch {
    return new Response("Gagal mengambil gambar", { status: 502 });
  }
}
