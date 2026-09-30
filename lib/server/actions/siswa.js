import { db, run, AppError } from "../db";
import { dateStr, weekKey, addDays } from "../../time";
import { evaluateClass, pointSummary, runAll } from "../engine";
import { schoolById } from "./auth";
import { findCopy, activeLoanOfCopy, lateDays } from "./circulation";

async function me(session) {
  const st = await run(db().from("students").select("id,nisn,nama,kelas,status").eq("id", session.studentId).maybeSingle());
  if (!st || st.status !== "aktif") throw new AppError("Sesi tidak valid, silakan login ulang", 401);
  return st;
}

/** Semua yang dibutuhkan beranda siswa, tantangan, dan dashboard orang tua */
async function overview(session) {
  const [student, school] = await Promise.all([me(session), schoolById(session.schoolId)]);
  const { ctx, computed, cls } = await evaluateClass(session.schoolId, student.kelas);
  const r = computed.get(student.id);
  const sum = pointSummary(ctx.events, student.id);

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
    active,
    weekly: r.weekly,
    guru: r.guru,
    streak: r.streak,
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
          return { id: s.id, nama: s.nama, month: p.month, total: p.total, level: p.level.level, levelIcon: p.level.icon, isMe: s.id === student.id };
        })
        .sort((a, b) => b.month - a.month || b.total - a.total || a.nama.localeCompare(b.nama))
        .map((r, i) => ({ ...r, rank: i + 1 }));
      return { kelas: student.kelas, rows };
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
        .select("id,judul,penulis,cover_url,category_id,category:categories(kode,icon,nama,emoji,color),copies:book_copies(status)")
        .eq("school_id", session.schoolId)
        .order("judul")
        .limit(400);
      if (payload.q) q = q.or(`judul.ilike.%${String(payload.q).replace(/[%,()]/g, " ")}%,penulis.ilike.%${String(payload.q).replace(/[%,()]/g, " ")}%`);
      if (payload.categoryId) q = q.eq("category_id", payload.categoryId);
      const [books, categories] = await Promise.all([
        run(q),
        run(sb.from("categories").select("id,kode,nama,icon,color").eq("school_id", session.schoolId).order("kode")),
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
          .select("*,category:categories(kode,icon,nama,color),shelf:shelves(kode,nama),copies:book_copies(status)")
          .eq("school_id", session.schoolId)
          .eq("id", payload.id)
          .maybeSingle()
      );
      if (!b) throw new AppError("Buku tidak ditemukan", 404);
      const { copies, ...rest } = b;
      return {
        ...rest,
        total: copies.filter((c) => c.status !== "hilang").length,
        tersedia: copies.filter((c) => c.status === "tersedia").length,
      };
    },
  },

  // Peminjaman HANYA lewat guru (siswa tidak punya aksi pinjam sendiri)
  "loan.preview": {
    roles: ["guru"],
    fn: async ({ payload, session }) => {
      const copy = await findCopy(session.schoolId, payload.code);
      if (!copy) throw new AppError("Kode belum terdaftar di perpustakaan", 404);
      let borrower = null;
      if (copy.status === "dipinjam") {
        const l = await activeLoanOfCopy(copy.id);
        borrower = l ? { nama: l.student?.nama, kelas: l.student?.kelas, since: l.borrowed_at } : null;
      }
      return { code: copy.qr_code, label: copy.label, status: copy.status, kondisi: copy.kondisi, book: copy.book, borrower };
    },
  },

};

export { runAll };
