import { NextResponse } from "next/server";
import { actions } from "@/lib/server/actions";
import { readSession, encodeSession, COOKIE, cookieOptions } from "@/lib/server/session";

export const dynamic = "force-dynamic";

// Satu pintu untuk semua aksi aplikasi: POST { action, payload }
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }
  const def = actions[body?.action];
  if (!def) return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 404 });

  const session = readSession(req);
  if (def.roles && (!session || !def.roles.includes(session.role))) {
    return NextResponse.json({ error: "Sesi habis, silakan login ulang" }, { status: 401 });
  }

  const res = { setSession: null, clearSession: false };
  try {
    const result = await def.fn({ payload: body.payload || {}, session, res, req });
    const out = NextResponse.json({ result: result ?? null });
    if (res.setSession) out.cookies.set(COOKIE, encodeSession(res.setSession), cookieOptions);
    if (res.clearSession) out.cookies.set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return out;
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500) console.error(`[rpc ${body.action}]`, e);
    return NextResponse.json({ error: e.message || "Terjadi kesalahan" }, { status });
  }
}
