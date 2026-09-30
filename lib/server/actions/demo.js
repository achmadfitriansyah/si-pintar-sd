import { db, run, AppError } from "../db";
import { runAll } from "../engine";
import { schoolBySlug, verifyAdmin } from "./auth";

// Urutan penting: tabel induk disisipkan dulu, dihapus terakhir
const TABLES = ["students", "books", "book_copies", "loans", "point_events", "challenges"];
const KEEP = 5;

async function guard(payload) {
  const school = await schoolBySlug(payload.slug);
  if (!school.is_demo) throw new AppError("Checkpoint hanya untuk mode demo", 403);
  const admin = await verifyAdmin(school.id, payload.username, payload.password);
  if (!admin) throw new AppError("Username atau password salah", 401);
  return school;
}

async function list(schoolId) {
  return run(db().from("demo_checkpoints").select("id,label,created_at").eq("school_id", schoolId).order("created_at", { ascending: false }));
}

export const demoActions = {
  "checkpoint.list": {
    fn: async ({ payload }) => {
      const school = await guard(payload);
      return list(school.id);
    },
  },

  "checkpoint.save": {
    fn: async ({ payload }) => {
      const school = await guard(payload);
      const sb = db();
      const data = { school: { name: school.name, short_name: school.short_name, logo_url: school.logo_url, max_books: school.max_books, loan_days: school.loan_days } };
      for (const t of TABLES) data[t] = await runAll(() => sb.from(t).select("*").eq("school_id", school.id).order("id"));
      const label = String(payload.label || "").trim().slice(0, 60) || null;
      await run(sb.from("demo_checkpoints").insert({ school_id: school.id, label, data }));
      const all = await list(school.id);
      const old = all.slice(KEEP).map((c) => c.id);
      if (old.length) await run(sb.from("demo_checkpoints").delete().in("id", old));
      return list(school.id);
    },
  },

  "checkpoint.restore": {
    fn: async ({ payload }) => {
      const school = await guard(payload);
      const sb = db();
      const cp = await run(sb.from("demo_checkpoints").select("data").eq("school_id", school.id).eq("id", payload.id).maybeSingle());
      if (!cp) throw new AppError("Checkpoint tidak ditemukan", 404);
      // hapus semua data demo sekarang (dari tabel anak ke induk)
      for (const t of [...TABLES].reverse()) await run(sb.from(t).delete().eq("school_id", school.id));
      // kembalikan isi checkpoint
      for (const t of TABLES) {
        const rows = cp.data[t] || [];
        for (let i = 0; i < rows.length; i += 500) await run(sb.from(t).insert(rows.slice(i, i + 500)), `Gagal mengembalikan ${t}`);
      }
      if (cp.data.school) await run(sb.from("schools").update(cp.data.school).eq("id", school.id));
      return { ok: true, counts: Object.fromEntries(TABLES.map((t) => [t, (cp.data[t] || []).length])) };
    },
  },
};
