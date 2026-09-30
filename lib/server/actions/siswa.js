import { db, run, AppError } from "../db";
import { dateStr, weekKey, addDays } from "../../time";
import { evaluateClass, pointSummary, runAll } from "../engine";
import { schoolById } from "./auth";
import { borrowCore, findCopy, activeLoanOfCopy, lateDays } from "./circulation";

async function me(session) {
  const st = await run(db().from("students").select("id,nisn,nama,kelas,status,pinned_badges").eq("id", session.studentId).maybeSingle());
  if (!st || st.status !== "aktif") throw new AppError("Sesi tidak valid, silakan login ulang", 401);
  return st;
}

/** Semua yang dibutuhkan beranda siswa, tantangan, dan dashboard orang tua */
async function overview(session) {
  const student = await me(session);
  const school = await schoolById(session.schoolId);
  const { ctx, computed, cls } = await evaluateClass(session.schoolId, student.kelas);
  const r = computed.get(student.id);
  const sum = pointSummary(ctx.events, student.id);
  const earned = new Set(sum.badges.map((b) => b.id));
  const pinnedIds = (student.pinned_badges || []).filter((id) => earned.has(id));
  const pinned = (pinnedIds.length ? pinnedIds.map((id) => sum.badges.find((b) => b.id === id)) : sum.badges.slice(0, 3)).filter(Boolean);

  const today = dateStr();
  const my = ctx.loans.filter((l) => l.student_id === student.id);
  const active = my
    .filter((l) => l.status === "dipinjam")
    .map((l) => ({ id: l.id, judul: l.book?.judul, cover_url: l.book?.cover_url, borrowed_at: l.borrowed_at, due_date: l.due_date, late: lateDays(l.due_date, today) }));

  // peringkat kelas bulan ini
  const board = ctx.students
    .map((s) => ({ id: s.id, month: pointSummary(ctx.events, s.id).month }))
    .sort((a, b) => b.month - a.month);
  const rank = board.findIndex((b) => b.id === student.id) + 1;

  // aktivitas 8 minggu terakhir (untuk grafik orang tua)
  const wk = weekKey();
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const w = addDays(wk, -7 * i);
    weeks.push({ week: w, pinjam: my.filter((l) => weekKey(l.borrowed_at) === w).length });
  }

  const returned = my.filter((l) => l.status === "kembali");
  const onTimeCount = returned.filter((l) => l.returned_at && dateStr(l.returned_at) <= l.due_date).length;

  return {
    student: { id: student.id, nisn: student.nisn, nama: student.nama, kelas: student.kelas },
    school: { name: school.name, short_name: school.short_name, max_books: school.max_books, loan_days: school.loan_days, is_demo: school.is_demo },
    points: { total: sum.total, month: sum.month },
    level: sum.level,
    badges: sum.badges,
    pinned,
    active,
    weekly: r.weekly,
    guru: r.guru,
    tiers: r.tiers,
    classChallenge: cls ? { ...cls, mine: cls.contrib[student.id] || 0, contrib: undefined } : null,
    rank,
    classSize: ctx.students.length,
    stats: { totalPinjam: my.length, kembali: returned.length, tepatWaktu: onTimeCount, judulBerbeda: new Set(my.map((l) => l.book_id)).size },
    weeks,
    recentPoints: ctx.events
      .filter((e) => e.student_id === student.id && !e.cancelled)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, 8),
  };
}

export const siswaActions = {
  "siswa.overview": { roles: ["siswa", "ortu"], fn: ({ session }) => overview(session) },

  "siswa.leaderboard": {
    roles: ["siswa", "ortu"],
    fn: async ({ session }) => {
      const student = await me(session);
      const { ctx } = await evaluateClass(session.schoolId, student.kelas);
      const rows = ctx.students
        .map((s) => {
          const p = pointSummary(ctx.events, s.id);
          const top = [...p.badges].sort((a, b) => b.rank - a.rank)[0] || null;
          return { id: s.id, nama: s.nama, month: p.month, total: p.total, level: p.level.level, levelEmoji: p.level.emoji, badge: top, isMe: s.id === student.id };
        })
        .sort((a, b) => b.month - a.month || b.total - a.total || a.nama.localeCompare(b.nama))
        .map((r, i) => ({ ...r, rank: i + 1 }));
      return { kelas: student.kelas, rows };
    },
  },

  "siswa.setPinned": {
    roles: ["siswa"],
    fn: async ({ payload, session }) => {
      const student = await me(session);
      const ids = Array.isArray(payload.badges) ? payload.badges.slice(0, 3).map(String) : [];
      const earned = await run(
        db().from("point_events").select("ref_key").eq("student_id", student.id).eq("cancelled", false).like("ref_key", "tier:%")
      );
      const ok = new Set(earned.map((e) => e.ref_key.replace("tier:", "").replace(":", "-")));
      const valid = ids.filter((id) => ok.has(id));
      await run(db().from("students").update({ pinned_badges: valid }).eq("id", student.id));
      return { pinned: valid };
    },
  },

  "siswa.loans": {
    roles: ["siswa", "ortu"],
    fn: async ({ session }) => {
      const student = await me(session);
      const rows = await run(
        db()
          .from("loans")
          .select("id,borrowed_at,due_date,returned_at,status,return_condition,book:books(id,judul,cover_url,penulis)")
          .eq("student_id", student.id)
          .order("borrowed_at", { ascending: false })
          .limit(100)
      );
      const today = dateStr();
      return rows.map((l) => ({
        ...l,
        late: l.status === "dipinjam" ? lateDays(l.due_date, today) : l.returned_at ? Math.max(0, lateDays(l.due_date, dateStr(l.returned_at))) : 0,
      }));
    },
  },

  "books.catalog": {
    roles: ["siswa", "ortu", "guru"],
    fn: async ({ payload, session }) => {
      const sb = db();
      let q = sb
        .from("books")
        .select("id,judul,penulis,cover_url,category_id,category:categories(kode,nama,emoji,color),copies:book_copies(status)")
        .eq("school_id", session.schoolId)
        .order("judul")
        .limit(400);
      if (payload.q) q = q.or(`judul.ilike.%${String(payload.q).replace(/[%,()]/g, " ")}%,penulis.ilike.%${String(payload.q).replace(/[%,()]/g, " ")}%`);
      if (payload.categoryId) q = q.eq("category_id", payload.categoryId);
      const [books, categories] = await Promise.all([
        run(q),
        run(sb.from("categories").select("id,kode,nama,emoji,color").eq("school_id", session.schoolId).order("kode")),
      ]);
      return {
        categories,
        books: books.map(({ copies, ...b }) => ({
          ...b,
          total: copies.filter((c) => c.status !== "hilang").length,
          tersedia: copies.filter((c) => c.status === "tersedia").length,
        })),
      };
    },
  },

  "books.detail": {
    roles: ["siswa", "ortu", "guru"],
    fn: async ({ payload, session }) => {
      const b = await run(
        db()
          .from("books")
          .select("*,category:categories(nama,emoji,color),shelf:shelves(kode,nama),copies:book_copies(qr_code,status)")
          .eq("school_id", session.schoolId)
          .eq("id", payload.id)
          .maybeSingle()
      );
      if (!b) throw new AppError("Buku tidak ditemukan", 404);
      const school = await schoolById(session.schoolId);
      const free = b.copies.filter((c) => c.status === "tersedia");
      const { copies, ...rest } = b;
      return {
        ...rest,
        total: copies.filter((c) => c.status !== "hilang").length,
        tersedia: free.length,
        // di mode demo, tampilkan kode contoh agar pengunjung bisa mencoba meminjam tanpa stiker QR
        sampleCode: school.is_demo && free[0] ? free[0].qr_code : null,
      };
    },
  },

  "loan.preview": {
    roles: ["siswa", "guru"],
    fn: async ({ payload, session }) => {
      const copy = await findCopy(session.schoolId, payload.code);
      if (!copy) throw new AppError("Kode belum terdaftar di perpustakaan", 404);
      let borrower = null;
      if (copy.status === "dipinjam") {
        const l = await activeLoanOfCopy(copy.id);
        borrower = l ? (session.role === "guru" ? { nama: l.student?.nama, kelas: l.student?.kelas, since: l.borrowed_at } : { self: l.student?.id === session.studentId }) : null;
      }
      return { code: copy.qr_code, status: copy.status, kondisi: copy.kondisi, book: copy.book, borrower };
    },
  },

  "loan.borrowSelf": {
    roles: ["siswa"],
    fn: async ({ payload, session }) => {
      const student = await me(session);
      const school = await schoolById(session.schoolId);
      const out = await borrowCore(school, student, [payload.code], "siswa");
      if (!out.results[0]?.ok) throw new AppError(out.results[0]?.error || "Gagal meminjam");
      return out;
    },
  },
};

export { runAll };
