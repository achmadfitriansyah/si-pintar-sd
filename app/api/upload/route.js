import { NextResponse } from "next/server";
import crypto from "crypto";
import { readSession } from "@/lib/server/session";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// Unggah cover buku / logo yang SUDAH distandarkan di browser (JPEG kecil)
export async function POST(req) {
  const session = readSession(req);
  if (!session || session.role !== "guru") return NextResponse.json({ error: "Hanya guru yang bisa mengunggah" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = form.get("kind") === "logo" ? "logo" : "cover";
    if (!file || typeof file === "string") return NextResponse.json({ error: "File kosong" }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "Format gambar tidak didukung" }, { status: 400 });
    if (file.size > 1.5 * 1024 * 1024) return NextResponse.json({ error: "Gambar terlalu besar" }, { status: 400 });
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${session.slug}/${kind}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await db().storage.from("covers").upload(path, buf, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) return NextResponse.json({ error: "Gagal mengunggah: " + error.message }, { status: 500 });
    const { data } = db().storage.from("covers").getPublicUrl(path);
    return NextResponse.json({ result: { url: data.publicUrl } });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Gagal mengunggah" }, { status: e.status || 500 });
  }
}
