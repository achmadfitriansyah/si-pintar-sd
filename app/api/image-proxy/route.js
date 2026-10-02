import { readSession } from "@/lib/server/session";
import { fetchImageSafely, UnsafeUrl } from "@/lib/server/safeFetch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Mengambil gambar dari link yang ditempel guru supaya bisa diproses di browser
// (browser menolak memproses gambar lintas situs secara langsung). Pengamannya ada di safeFetch.
export async function GET(req) {
  const session = readSession(req);
  if (!session || session.role !== "guru") return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url).searchParams.get("url") || "";
  try {
    const { buf, type } = await fetchImageSafely(url);
    return new Response(buf, {
      headers: {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    if (e instanceof UnsafeUrl) return new Response(e.message, { status: 400 });
    return new Response("Gagal mengambil gambar dari link itu", { status: 502 });
  }
}
