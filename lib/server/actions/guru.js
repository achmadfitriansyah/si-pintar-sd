import { db, run, AppError } from "../db";
import { dateStr, addDays, monthKey, monthStartISO, dayStartISO, weekKey } from "../../time";
import { evaluateClass, runAll, pointSummary } from "../engine";
import { KATEGORI_ICONS } from "../../icons";
import { pickWeekly, classTarget, POIN } from "../../rules";
import { schoolById } from "./auth";
import { borrowCore, findCopy, activeLoanOfCopy, lateDays, normCode, resolveLabel } from "./circulation";

const G = ["guru"];
const clean = (s) => String(s ?? "").trim();
const safeLike = (s) => clean(s).replace(/[%,()]/g, " ");

async function studentByNisn(schoolId, nisn) {
  const st = await run(db().from("students").select("id,nisn,nama,kelas,status").eq("school_id", schoolId).eq("nisn", clean(nisn)).maybeSingle());
  if (!st) throw new AppError("NISN tidak ditemukan", 404);
  if (st.status !== "aktif") throw new AppError("Siswa ini sudah alumni");
  return st;
}

function validStudent(row) {
  const nisn = clean(row.nisn);
  const nama = clean(row.nama).replace(/\s+/g, " ");
  const kelas = clean(row.kelas).toUpperCase().replace(/^KELAS/, "").replace(/[\s.\-_]/g, "");
  const errors = [];
  if (!/^\d{10}$/.test(nisn)) errors.push("NISN harus 10 digit angka");
  if (nama.length < 2) errors.push("Nama kosong");
  if (!/^[1-6][A-Z]$/.test(kelas)) errors.push("Kelas harus seperti 2A (angka 1-6 lalu huruf)");
  return { nisn, nama, kelas, errors };
}

async function classesProgress(schoolId) {
  const sb = db();
  const mk = monthKey();
  const [students, returns] = await Promise.all([
    runAll(() => sb.from("students").select("id,kelas").eq("school_id", schoolId).eq("status", "aktif").order("id")),
    runAll(() =>
      sb.from("loans").select("student_id,due_date,returned_at,return_condition").eq("school_id", schoolId).eq("status", "kembali").gte("returned_at", monthStartISO(mk)).order("id")
    ),
  ]);
  const kelasOf = new Map(students.map((s) => [s.id, s.kelas]));
  const size = {};
  students.forEach((s) => (size[s.kelas] = (size[s.kelas] || 0) + 1));
  const val = {};
  for (const l of returns) {
    if (dateStr(l.returned_at) > l.due_date || l.return_condition === "rusak_berat") continue;
    const k = kelasOf.get(l.student_id);
    if (k) val[k] = (val[k] || 0) + 1;
  }
  return Object.keys(size)
    .sort()
    .map((k) => ({ kelas: k, size: size[k], target: classTarget(size[k]), value: val[k] || 0 }));
}

export const guruActions = {
  // ---------------------------------------------------------------- DASHBOARD
  "guru.dashboard": {
    roles: G,
    fn: async ({ session }) => {
      const sb = db();
      const sid = session.schoolId;
      const today = dateStr();
      const since14 = dayStartISO(addDays(today, -13));
      const [active, recent, nStudents, nBooks, nCopies, classes] = await Promise.all([
        runAll(() =>
          sb.from("loans").select("id,due_date,borrowed_at,student:students(nama,kelas),book:books(judul,cover_url)").eq("school_id", sid).eq("status", "dipinjam").order("due_date")
        ),
        runAll(() => sb.from("loans").select("borrowed_at,returned_at").eq("school_id", sid).or(`borrowed_at.gte.${since14},returned_at.gte.${since14}`).order("id")),
        run(sb.from("students").select("id", { count: "exact", head: true }).eq("school_id", sid).eq("status", "aktif")),
        run(sb.from("books").select("id", { count: "exact", head: true }).eq("school_id", sid)),
        run(sb.from("book_copies").select("id", { count: "exact", head: true }).eq("school_id", sid).neq("status", "hilang")),
        classesProgress(sid),
      ]);
      const overdue = active.filter((l) => l.due_date < today).map((l) => ({ ...l, late: lateDays(l.due_date, today) }));
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = addDays(today, -i);
        days.push({
          date: d,
          pinjam: recent.filter((l) => l.borrowed_at && dateStr(l.borrowed_at) === d).length,
          kembali: recent.filter((l) => l.returned_at && dateStr(l.returned_at) === d).length,
        });
      }
      return {
        today: { pinjam: days[13].pinjam, kembali: days[13].kembali },
        activeCount: active.length,
        overdue,
        dueToday: active.filter((l) => l.due_date === today).length,
        counts: { students: nStudents || 0, books: nBooks || 0, copies: nCopies || 0 },
        days,
        classes,
      };
    },
  },

  // ---------------------------------------------------------------- SIRKULASI
  "guru.findStudent": {
    roles: G,
    fn: async ({ payload, session }) => {
      const st = await studentByNisn(session.schoolId, payload.nisn);
      const school = await schoolById(session.schoolId);
      const loans = await run(
        db().from("loans").select("id,due_date,book:books(judul)").eq("student_id", st.id).eq("status", "dipinjam").order("due_date")
      );
      return { student: st, active: loans.map((l) => ({ ...l, late: lateDays(l.due_date) })), maxBooks: school.max_books, loanDays: school.loan_days };
    },
  },

  "guru.borrow": {
    roles: G,
    fn: async ({ payload, session }) => {
      const st = await studentByNisn(session.schoolId, payload.nisn);
      const school = await schoolById(session.schoolId);
      const codes = Array.isArray(payload.codes) ? payload.codes : [];
      if (!codes.length) throw new AppError("Belum ada buku yang di-scan");
      return borrowCore(school, st, codes, "guru");
    },
  },

  "guru.returnPreview": {
    roles: G,
    fn: async ({ payload, session }) => {
      const copy = await findCopy(session.schoolId, payload.code);
      if (!copy) throw new AppError("Kode belum terdaftar di perpustakaan", 404);
      if (copy.status !== "dipinjam") {
        return { copy, loan: null, message: copy.status === "hilang" ? "Eksemplar ini tercatat hilang." : "Buku ini tidak sedang dipinjam." };
      }
      const loan = await activeLoanOfCopy(copy.id);
      if (!loan) return { copy, loan: null, message: "Data peminjaman tidak ditemukan." };
      return { copy, loan: { ...loan, late: lateDays(loan.due_date) } };
    },
  },

  "guru.returnConfirm": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const kondisi = ["baik", "rusak_ringan", "rusak_berat"].includes(payload.kondisi) ? payload.kondisi : "baik";
      const loan = await run(
        sb.from("loans").select("id,copy_id,student_id,due_date,status,student:students(kelas)").eq("school_id", session.schoolId).eq("id", payload.loanId).maybeSingle()
      );
      if (!loan) throw new AppError("Peminjaman tidak ditemukan", 404);
      if (loan.status !== "dipinjam") throw new AppError("Buku ini sudah dikembalikan");
      await run(sb.from("loans").update({ status: "kembali", returned_at: new Date().toISOString(), return_condition: kondisi }).eq("id", loan.id));
      await run(sb.from("book_copies").update({ status: "tersedia", kondisi }).eq("id", loan.copy_id));
      const { inserted } = await evaluateClass(session.schoolId, loan.student.kelas);
      const mine = inserted.filter((e) => e.student_id === loan.student_id);
      return { late: lateDays(loan.due_date), points: mine.reduce((a, e) => a + e.amount, 0), events: mine };
    },
  },

  "guru.activeLoans": {
    roles: G,
    fn: async ({ session }) => {
      const rows = await runAll(() =>
        db()
          .from("loans")
          .select("id,borrowed_at,due_date,recorded_by,student:students(nama,kelas,nisn),book:books(judul,cover_url),copy:book_copies(qr_code,label)")
          .eq("school_id", session.schoolId)
          .eq("status", "dipinjam")
          .order("due_date")
      );
      return rows.map((l) => ({ ...l, late: lateDays(l.due_date) }));
    },
  },

  "guru.markLost": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      if (payload.loanId) {
        const loan = await run(sb.from("loans").select("id,copy_id,status").eq("school_id", session.schoolId).eq("id", payload.loanId).maybeSingle());
        if (!loan || loan.status !== "dipinjam") throw new AppError("Peminjaman tidak ditemukan");
        await run(sb.from("loans").update({ status: "hilang" }).eq("id", loan.id));
        await run(sb.from("book_copies").update({ status: "hilang" }).eq("id", loan.copy_id));
        return { ok: true };
      }
      const copy = await run(sb.from("book_copies").select("id,status").eq("school_id", session.schoolId).eq("id", payload.copyId).maybeSingle());
      if (!copy) throw new AppError("Eksemplar tidak ditemukan");
      if (copy.status === "dipinjam") throw new AppError("Buku sedang dipinjam. Tandai hilang dari daftar Sedang Dipinjam.");
      await run(sb.from("book_copies").update({ status: "hilang" }).eq("id", copy.id));
      return { ok: true };
    },
  },

  // ---------------------------------------------------------------- BUKU
  "guru.meta": {
    roles: G,
    fn: async ({ session }) => {
      const sb = db();
      const [categories, shelves, kelas] = await Promise.all([
        run(sb.from("categories").select("id,kode,nama,icon,color").eq("school_id", session.schoolId).order("kode")),
        run(sb.from("shelves").select("id,kode,nama").eq("school_id", session.schoolId).order("kode")),
        runAll(() => sb.from("students").select("kelas").eq("school_id", session.schoolId).eq("status", "aktif").order("id")),
      ]);
      return { categories, shelves, classes: [...new Set(kelas.map((k) => k.kelas))].sort() };
    },
  },

  "guru.books": {
    roles: G,
    fn: async ({ payload, session }) => {
      let q = db()
        .from("books")
        .select("id,judul,penulis,cover_url,created_at,category:categories(kode,icon,nama,color),copies:book_copies(status,kondisi)")
        .eq("school_id", session.schoolId)
        .order("created_at", { ascending: false })
        .limit(500);
      if (payload.q) q = q.or(`judul.ilike.%${safeLike(payload.q)}%,penulis.ilike.%${safeLike(payload.q)}%,isbn.ilike.%${safeLike(payload.q)}%`);
      if (payload.categoryId) q = q.eq("category_id", payload.categoryId);
      const rows = await run(q);
      return rows.map(({ copies, ...b }) => ({
        ...b,
        total: copies.filter((c) => c.status !== "hilang").length,
        tersedia: copies.filter((c) => c.status === "tersedia").length,
        dipinjam: copies.filter((c) => c.status === "dipinjam").length,
        rusak: copies.filter((c) => c.kondisi !== "baik" && c.status !== "hilang").length,
      }));
    },
  },

  "guru.bookDetail": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const book = await run(
        sb.from("books").select("*,category:categories(id,kode,icon,nama,color),shelf:shelves(id,kode,nama)").eq("school_id", session.schoolId).eq("id", payload.id).maybeSingle()
      );
      if (!book) throw new AppError("Buku tidak ditemukan", 404);
      const copies = await run(sb.from("book_copies").select("id,qr_code,label,status,kondisi,created_at").eq("book_id", book.id).order("id"));
      const loans = copies.length
        ? await run(
            sb.from("loans").select("copy_id,due_date,student:students(nama,kelas)").in("copy_id", copies.map((c) => c.id)).eq("status", "dipinjam")
          )
        : [];
      const count = await run(sb.from("loans").select("id", { count: "exact", head: true }).eq("book_id", book.id));
      return {
        book,
        copies: copies.map((c) => ({ ...c, loan: loans.find((l) => l.copy_id === c.id) || null })),
        timesBorrowed: count || 0,
      };
    },
  },

  "guru.codeCheck": {
    roles: G,
    fn: async ({ payload, session }) => {
      const copy = await findCopy(session.schoolId, payload.code);
      return copy ? { exists: true, code: copy.qr_code, label: copy.label, bookId: copy.book.id, judul: copy.book.judul } : { exists: false, code: normCode(payload.code) };
    },
  },

  "guru.createBook": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const b = payload.book || {};
      const code = normCode(payload.code);
      if (!clean(b.judul)) throw new AppError("Judul wajib diisi");
      if (!code) throw new AppError("Kode stiker kosong");
      if (await findCopy(session.schoolId, code)) throw new AppError("Kode stiker ini sudah dipakai buku lain");
      const label = await resolveLabel(session.schoolId, payload.label);
      const tahun = parseInt(b.tahun, 10);
      const [book] = await run(
        sb
          .from("books")
          .insert({
            school_id: session.schoolId, judul: clean(b.judul), penulis: clean(b.penulis) || null, penerbit: clean(b.penerbit) || null,
            tahun: Number.isFinite(tahun) ? tahun : null, isbn: clean(b.isbn) || null, category_id: b.category_id || null,
            shelf_id: b.shelf_id || null, cover_url: b.cover_url || null, deskripsi: clean(b.deskripsi) || null,
          })
          .select("id")
      );
      await run(sb.from("book_copies").insert({ school_id: session.schoolId, book_id: book.id, qr_code: code, label }));
      return { id: book.id, label };
    },
  },

  "guru.addCopy": {
    roles: G,
    fn: async ({ payload, session }) => {
      const code = normCode(payload.code);
      if (!code) throw new AppError("Kode stiker kosong");
      const book = await run(db().from("books").select("id,judul").eq("school_id", session.schoolId).eq("id", payload.bookId).maybeSingle());
      if (!book) throw new AppError("Buku tidak ditemukan");
      if (await findCopy(session.schoolId, code)) throw new AppError("Kode stiker ini sudah dipakai");
      const label = await resolveLabel(session.schoolId, payload.label);
      await run(db().from("book_copies").insert({ school_id: session.schoolId, book_id: book.id, qr_code: code, label }));
      return { ok: true, judul: book.judul, label };
    },
  },

  "guru.updateBook": {
    roles: G,
    fn: async ({ payload, session }) => {
      const b = payload.book || {};
      if (!clean(b.judul)) throw new AppError("Judul wajib diisi");
      const tahun = parseInt(b.tahun, 10);
      await run(
        db()
          .from("books")
          .update({
            judul: clean(b.judul), penulis: clean(b.penulis) || null, penerbit: clean(b.penerbit) || null,
            tahun: Number.isFinite(tahun) ? tahun : null, isbn: clean(b.isbn) || null, category_id: b.category_id || null,
            shelf_id: b.shelf_id || null, cover_url: b.cover_url || null, deskripsi: clean(b.deskripsi) || null,
          })
          .eq("school_id", session.schoolId)
          .eq("id", payload.id)
      );
      return { ok: true };
    },
  },

  "guru.deleteBook": {
    roles: G,
    fn: async ({ payload, session }) => {
      const busy = await run(db().from("book_copies").select("id").eq("book_id", payload.id).eq("status", "dipinjam"));
      if (busy.length) throw new AppError("Masih ada eksemplar yang sedang dipinjam");
      await run(db().from("books").delete().eq("school_id", session.schoolId).eq("id", payload.id));
      return { ok: true };
    },
  },

  "guru.updateCopy": {
    roles: G,
    fn: async ({ payload, session }) => {
      const copy = await run(db().from("book_copies").select("id,status").eq("school_id", session.schoolId).eq("id", payload.id).maybeSingle());
      if (!copy) throw new AppError("Eksemplar tidak ditemukan");
      const upd = {};
      if (payload.kondisi) {
        if (!["baik", "rusak_ringan", "rusak_berat"].includes(payload.kondisi)) throw new AppError("Kondisi tidak dikenal");
        upd.kondisi = payload.kondisi;
      }
      if (payload.status) {
        if (copy.status === "dipinjam") throw new AppError("Eksemplar sedang dipinjam");
        if (!["tersedia", "hilang"].includes(payload.status)) throw new AppError("Status tidak dikenal");
        upd.status = payload.status;
      }
      await run(db().from("book_copies").update(upd).eq("id", copy.id));
      return { ok: true };
    },
  },

  "guru.deleteCopy": {
    roles: G,
    fn: async ({ payload, session }) => {
      const copy = await run(db().from("book_copies").select("id,status").eq("school_id", session.schoolId).eq("id", payload.id).maybeSingle());
      if (!copy) throw new AppError("Eksemplar tidak ditemukan");
      if (copy.status === "dipinjam") throw new AppError("Eksemplar sedang dipinjam");
      await run(db().from("book_copies").delete().eq("id", copy.id));
      return { ok: true };
    },
  },

  "books.lookupIsbn": {
    roles: G,
    fn: async ({ payload }) => {
      const isbn = clean(payload.isbn).replace(/[^0-9Xx]/g, "");
      if (isbn.length < 10) throw new AppError("ISBN minimal 10 digit");
      const items = await googleBooks(`isbn:${isbn}`, 1);
      if (!items.length) throw new AppError("ISBN tidak ditemukan di Google Books. Isi manual saja.", 404);
      return items[0];
    },
  },

  "books.searchCovers": {
    roles: G,
    fn: async ({ payload }) => {
      const q = clean(payload.q);
      if (q.length < 3) throw new AppError("Ketik judul minimal 3 huruf");
      const items = await googleBooks(`intitle:${q}`, 12);
      return items.filter((i) => i.cover);
    },
  },

  // ---------------------------------------------------------------- SISWA
  "guru.students": {
    roles: G,
    fn: async ({ payload, session }) => {
      const status = payload.status === "alumni" ? "alumni" : "aktif";
      const rows = await runAll(() => {
        let q = db().from("students").select("id,nisn,nama,kelas,status").eq("school_id", session.schoolId).eq("status", status).order("kelas").order("nama").order("id");
        if (payload.kelas) q = q.eq("kelas", payload.kelas);
        if (payload.q) q = q.or(`nama.ilike.%${safeLike(payload.q)}%,nisn.ilike.%${safeLike(payload.q)}%`);
        return q;
      });
      return rows;
    },
  },

  "guru.saveStudent": {
    roles: G,
    fn: async ({ payload, session }) => {
      const v = validStudent(payload);
      if (v.errors.length) throw new AppError(v.errors.join(", "));
      const sb = db();
      const dup = await run(sb.from("students").select("id").eq("school_id", session.schoolId).eq("nisn", v.nisn).maybeSingle());
      if (dup && dup.id !== payload.id) throw new AppError("NISN sudah dipakai siswa lain");
      if (payload.id) {
        await run(sb.from("students").update({ nisn: v.nisn, nama: v.nama, kelas: v.kelas }).eq("school_id", session.schoolId).eq("id", payload.id));
      } else {
        await run(sb.from("students").insert({ school_id: session.schoolId, nisn: v.nisn, nama: v.nama, kelas: v.kelas }));
      }
      return { ok: true };
    },
  },

  "guru.deleteStudent": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const active = await run(sb.from("loans").select("id").eq("student_id", payload.id).eq("status", "dipinjam"));
      if (active.length) throw new AppError(`Siswa masih meminjam ${active.length} buku. Kembalikan dulu.`);
      await run(sb.from("students").delete().eq("school_id", session.schoolId).eq("id", payload.id));
      return { ok: true };
    },
  },

  "guru.importStudents": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const rows = Array.isArray(payload.rows) ? payload.rows.slice(0, 3000) : [];
      const overwrite = payload.mode === "overwrite";
      const existing = await runAll(() => sb.from("students").select("id,nisn").eq("school_id", session.schoolId).order("id"));
      const byNisn = new Map(existing.map((s) => [s.nisn, s.id]));
      const inserts = [];
      let updated = 0,
        skipped = 0;
      const errors = [];
      const seen = new Set();
      for (const [i, r] of rows.entries()) {
        const v = validStudent(r);
        if (v.errors.length) {
          errors.push({ row: i + 2, nisn: v.nisn, error: v.errors.join(", ") });
          continue;
        }
        if (seen.has(v.nisn)) {
          errors.push({ row: i + 2, nisn: v.nisn, error: "NISN dobel di file" });
          continue;
        }
        seen.add(v.nisn);
        const id = byNisn.get(v.nisn);
        if (id) {
          if (overwrite) {
            await run(sb.from("students").update({ nama: v.nama, kelas: v.kelas, status: "aktif" }).eq("id", id));
            updated++;
          } else skipped++;
        } else inserts.push({ school_id: session.schoolId, nisn: v.nisn, nama: v.nama, kelas: v.kelas });
      }
      for (let i = 0; i < inserts.length; i += 500) await run(sb.from("students").insert(inserts.slice(i, i + 500)));
      return { inserted: inserts.length, updated, skipped, errors };
    },
  },

  "guru.promote": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const rows = await runAll(() => sb.from("students").select("id,kelas").eq("school_id", session.schoolId).eq("status", "aktif").order("id"));
      const groups = {};
      const alumni = [];
      for (const s of rows) {
        const m = s.kelas.match(/^(\d+)(.*)$/);
        if (!m) continue;
        const n = Number(m[1]);
        if (n >= 6) alumni.push(s.id);
        else (groups[`${n + 1}${m[2]}`] ||= []).push(s.id);
      }
      if (payload.dryRun) {
        return { naik: Object.values(groups).reduce((a, g) => a + g.length, 0), alumni: alumni.length };
      }
      // proses dari kelas tertinggi supaya tidak tertukar
      for (const k of Object.keys(groups).sort().reverse()) {
        const ids = groups[k];
        for (let i = 0; i < ids.length; i += 300) await run(sb.from("students").update({ kelas: k }).in("id", ids.slice(i, i + 300)));
      }
      for (let i = 0; i < alumni.length; i += 300) await run(sb.from("students").update({ status: "alumni" }).in("id", alumni.slice(i, i + 300)));
      return { naik: Object.values(groups).reduce((a, g) => a + g.length, 0), alumni: alumni.length };
    },
  },

  "guru.studentDetail": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const st = await run(sb.from("students").select("id,nisn,nama,kelas,status").eq("school_id", session.schoolId).eq("id", payload.id).maybeSingle());
      if (!st) throw new AppError("Siswa tidak ditemukan", 404);
      if (st.status === "aktif") await evaluateClass(session.schoolId, st.kelas);
      const [events, loans] = await Promise.all([
        run(sb.from("point_events").select("id,amount,reason,cancelled,created_at,ref_key").eq("student_id", st.id).order("created_at", { ascending: false })),
        run(
          sb.from("loans").select("id,borrowed_at,due_date,returned_at,status,return_condition,book:books(judul)").eq("student_id", st.id).order("borrowed_at", { ascending: false }).limit(50)
        ),
      ]);
      const events2 = events.filter((e) => !e.ref_key.startsWith("tier:"));
      const sum = pointSummary(events2.map((e) => ({ ...e, student_id: st.id })), st.id);
      return { student: st, events: events2, loans, total: sum.total, month: sum.month, level: sum.level };
    },
  },

  // Kembalikan password siswa DAN orang tua ke 123456
  "guru.resetPin": {
    roles: G,
    fn: async ({ payload, session }) => {
      const school = await schoolById(session.schoolId);
      if (school.is_demo) throw new AppError("Reset password tidak tersedia di mode demo.");
      await run(db().from("students").update({ pin_hash: null, ortu_pin_hash: null }).eq("school_id", session.schoolId).eq("id", payload.id));
      return { ok: true };
    },
  },

  "guru.cancelPoints": {
    roles: G,
    fn: async ({ payload, session }) => {
      await run(db().from("point_events").update({ cancelled: !payload.restore }).eq("school_id", session.schoolId).eq("id", payload.id));
      return { ok: true };
    },
  },

  // ---------------------------------------------------------------- TANTANGAN
  "guru.challenges": {
    roles: G,
    fn: async ({ session }) => {
      const sb = db();
      const [list, books, classes] = await Promise.all([
        run(sb.from("challenges").select("*,category:categories(nama,emoji),book:books(judul)").eq("school_id", session.schoolId).order("end_date", { ascending: false }).limit(100)),
        run(sb.from("books").select("id,judul").eq("school_id", session.schoolId).order("judul").limit(1000)),
        classesProgress(session.schoolId),
      ]);
      const today = dateStr();
      return {
        list: list.map((c) => ({ ...c, state: c.end_date < today ? "selesai" : c.start_date > today ? "akan datang" : "aktif" })),
        weekly: pickWeekly(weekKey()),
        books,
        classes,
        classReward: POIN.KELAS,
      };
    },
  },

  "guru.saveChallenge": {
    roles: G,
    fn: async ({ payload, session }) => {
      const c = payload;
      const action = c.action === "kembali" ? "kembali" : "pinjam";
      const target = Math.min(20, Math.max(1, parseInt(c.target, 10) || 1));
      const points = parseInt(c.points, 10);
      if (!(points >= 5 && points <= 50)) throw new AppError("Poin harus 5 sampai 50");
      if (!c.start_date || !c.end_date || c.end_date < c.start_date) throw new AppError("Tanggal berlaku tidak valid");
      let title = clean(c.title);
      if (!title) {
        const what = c.book_id ? "buku pilihan" : c.category_id ? "buku kategori pilihan" : "buku";
        title = `${action === "pinjam" ? "Pinjam" : "Kembalikan tepat waktu"} ${target} ${what}`;
      }
      await run(
        db().from("challenges").insert({
          school_id: session.schoolId, title, action, target, points, category_id: c.category_id || null, book_id: c.book_id || null,
          kelas: c.kelas || null, start_date: c.start_date, end_date: c.end_date,
        })
      );
      return { ok: true };
    },
  },

  "guru.deleteChallenge": {
    roles: G,
    fn: async ({ payload, session }) => {
      await run(db().from("challenges").delete().eq("school_id", session.schoolId).eq("id", payload.id));
      return { ok: true };
    },
  },

  // ---------------------------------------------------------------- LAPORAN
  "guru.report": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const mk = /^\d{4}-\d{2}$/.test(payload.month || "") ? payload.month : monthKey();
      const [y, m] = mk.split("-").map(Number);
      const next = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}`;
      const from = monthStartISO(mk);
      const to = monthStartISO(next);
      const school = await schoolById(session.schoolId);
      const sel = "id,borrowed_at,due_date,returned_at,status,return_condition,student:students(id,nama,kelas),book:books(id,judul,category:categories(nama))";
      const [borrowed, returned, lost, points] = await Promise.all([
        runAll(() => sb.from("loans").select(sel).eq("school_id", session.schoolId).gte("borrowed_at", from).lt("borrowed_at", to).order("id")),
        runAll(() => sb.from("loans").select(sel).eq("school_id", session.schoolId).gte("returned_at", from).lt("returned_at", to).order("id")),
        runAll(() => sb.from("loans").select(sel).eq("school_id", session.schoolId).eq("status", "hilang").gte("borrowed_at", from).lt("borrowed_at", to).order("id")),
        runAll(() => sb.from("point_events").select("amount").eq("school_id", session.schoolId).eq("cancelled", false).gte("created_at", from).lt("created_at", to).order("id")),
      ]);
      const late = returned.filter((l) => dateStr(l.returned_at) > l.due_date);
      const count = (arr, key) => {
        const map = new Map();
        for (const l of arr) {
          const k = key(l);
          if (!k) continue;
          const cur = map.get(k.id) || { ...k, n: 0 };
          cur.n++;
          map.set(k.id, cur);
        }
        return [...map.values()].sort((a, b) => b.n - a.n);
      };
      const perClass = {};
      for (const l of borrowed) {
        const k = l.student?.kelas || "-";
        perClass[k] = (perClass[k] || 0) + 1;
      }
      return {
        school: { name: school.name, logo_url: school.logo_url },
        month: mk,
        summary: {
          pinjam: borrowed.length,
          kembali: returned.length,
          tepatWaktu: returned.length - late.length,
          terlambat: late.length,
          hilang: lost.length,
          rusakBerat: returned.filter((l) => l.return_condition === "rusak_berat").length,
          siswaAktif: new Set(borrowed.map((l) => l.student?.id)).size,
          poin: points.reduce((a, p) => a + p.amount, 0),
        },
        topBooks: count(borrowed, (l) => l.book && { id: l.book.id, judul: l.book.judul, kategori: l.book.category?.nama }).slice(0, 10),
        topStudents: count(borrowed, (l) => l.student && { id: l.student.id, nama: l.student.nama, kelas: l.student.kelas }).slice(0, 10),
        perClass: Object.entries(perClass).sort().map(([kelas, n]) => ({ kelas, n })),
        damaged: [...returned.filter((l) => l.return_condition === "rusak_berat"), ...lost].map((l) => ({
          judul: l.book?.judul, siswa: l.student?.nama, kelas: l.student?.kelas, jenis: l.status === "hilang" ? "Hilang" : "Rusak berat",
        })),
        lateList: late.slice(0, 50).map((l) => ({ judul: l.book?.judul, siswa: l.student?.nama, kelas: l.student?.kelas, due: l.due_date, kembali: dateStr(l.returned_at) })),
      };
    },
  },

  "guru.classRanking": {
    roles: G,
    fn: async ({ payload, session }) => {
      const kelas = clean(payload.kelas);
      if (!kelas) throw new AppError("Pilih kelas");
      const { ctx } = await evaluateClass(session.schoolId, kelas);
      const rows = ctx.students
        .map((s) => {
          const p = pointSummary(ctx.events, s.id);
          return { id: s.id, nama: s.nama, month: p.month, total: p.total, level: p.level.level, levelIcon: p.level.icon };
        })
        .sort((a, b) => b.month - a.month || b.total - a.total || a.nama.localeCompare(b.nama))
        .map((r, i) => ({ ...r, rank: i + 1 }));
      return { kelas, month: monthKey(), rows };
    },
  },

  // ---------------------------------------------------------------- PENGATURAN

  // ---------------------------------------------------------------- KELOLA KATALOG
  "guru.saveCategory": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const nama = clean(payload.nama).replace(/\s+/g, " ");
      if (nama.length < 2 || nama.length > 30) throw new AppError("Nama kategori 2 sampai 30 huruf");
      const color = /^#[0-9A-Fa-f]{6}$/.test(payload.color || "") ? payload.color : "#EF4444";
      const icon = KATEGORI_ICONS.includes(payload.icon) ? payload.icon : "kategori/semua";
      const dup = await run(sb.from("categories").select("id").eq("school_id", session.schoolId).ilike("nama", nama.replace(/[%_]/g, "")).limit(1));
      if (dup.length && String(dup[0].id) !== String(payload.id)) throw new AppError("Nama kategori itu sudah ada");
      if (payload.id) {
        await run(sb.from("categories").update({ nama, color, icon }).eq("school_id", session.schoolId).eq("id", payload.id));
      } else {
        const all = await run(sb.from("categories").select("kode").eq("school_id", session.schoolId));
        const next = String(Math.max(0, ...all.map((c) => parseInt(c.kode, 10) || 0)) + 1).padStart(2, "0");
        await run(sb.from("categories").insert({ school_id: session.schoolId, kode: next, nama, color, icon }));
      }
      return { ok: true };
    },
  },

  "guru.deleteCategory": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const used = await run(sb.from("books").select("id").eq("school_id", session.schoolId).eq("category_id", payload.id));
      if (used.length) throw new AppError(`Kategori ini masih dipakai ${used.length} buku. Pindahkan bukunya dulu.`);
      await run(sb.from("challenges").update({ category_id: null }).eq("school_id", session.schoolId).eq("category_id", payload.id));
      await run(sb.from("categories").delete().eq("school_id", session.schoolId).eq("id", payload.id));
      return { ok: true };
    },
  },

  "guru.saveShelf": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const nama = clean(payload.nama).replace(/\s+/g, " ");
      if (nama.length < 2 || nama.length > 40) throw new AppError("Nama rak 2 sampai 40 huruf");
      if (payload.id) {
        await run(sb.from("shelves").update({ nama }).eq("school_id", session.schoolId).eq("id", payload.id));
      } else {
        const all = await run(sb.from("shelves").select("kode").eq("school_id", session.schoolId));
        const next = "R" + String(Math.max(0, ...all.map((c) => parseInt(String(c.kode).replace(/\D/g, ""), 10) || 0)) + 1).padStart(2, "0");
        await run(sb.from("shelves").insert({ school_id: session.schoolId, kode: next, nama }));
      }
      return { ok: true };
    },
  },

  "guru.deleteShelf": {
    roles: G,
    fn: async ({ payload, session }) => {
      const sb = db();
      const used = await run(sb.from("books").select("id").eq("school_id", session.schoolId).eq("shelf_id", payload.id));
      if (used.length) throw new AppError(`Rak ini masih dipakai ${used.length} buku. Pindahkan bukunya dulu.`);
      await run(sb.from("shelves").delete().eq("school_id", session.schoolId).eq("id", payload.id));
      return { ok: true };
    },
  },

  "guru.saveRombel": {
    roles: G,
    fn: async ({ payload, session }) => {
      const list = [...new Set((payload.rombel || []).map((r) => clean(r).toUpperCase()))];
      if (!list.length || list.length > 12 || !list.every((r) => /^[A-Z]$/.test(r))) throw new AppError("Rombel harus huruf tunggal A-Z, 1 sampai 12 buah");
      list.sort();
      const used = await run(db().from("students").select("kelas").eq("school_id", session.schoolId).eq("status", "aktif").limit(5000));
      const missing = [...new Set(used.map((s) => String(s.kelas).slice(1)))].filter((r) => !list.includes(r));
      if (missing.length) throw new AppError(`Rombel ${missing.join(", ")} masih dipakai siswa aktif`);
      await run(db().from("schools").update({ rombel: list.join(",") }).eq("id", session.schoolId));
      return { ok: true };
    },
  },

  "guru.settings": {
    roles: G,
    fn: async ({ session }) => {
      const school = await schoolById(session.schoolId);
      const admin = await run(db().from("admins").select("username,must_change").eq("id", session.adminId).single());
      return { school, admin };
    },
  },

  "guru.saveSettings": {
    roles: G,
    fn: async ({ payload, session }) => {
      const name = clean(payload.name);
      if (name.length < 3) throw new AppError("Nama sekolah terlalu pendek");
      const max = parseInt(payload.max_books, 10);
      const days = parseInt(payload.loan_days, 10);
      if (!(max >= 1 && max <= 10)) throw new AppError("Maksimal buku 1 sampai 10");
      if (!(days >= 1 && days <= 30)) throw new AppError("Lama pinjam 1 sampai 30 hari");
      await run(
        db()
          .from("schools")
          .update({ name, short_name: clean(payload.short_name) || null, logo_url: payload.logo_url || null, max_books: max, loan_days: days })
          .eq("id", session.schoolId)
      );
      return { ok: true };
    },
  },
};

// ---------------------------------------------------------------- Google Books
async function googleBooks(q, max) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${max}&printType=books`;
  let data;
  try {
    const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    data = await r.json();
  } catch {
    throw new AppError("Google Books sedang tidak bisa dihubungi. Coba lagi atau isi manual.");
  }
  return (data.items || []).map((it) => {
    const v = it.volumeInfo || {};
    const img = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
    const isbn = (v.industryIdentifiers || []).find((x) => x.type === "ISBN_13")?.identifier || (v.industryIdentifiers || [])[0]?.identifier || "";
    return {
      judul: [v.title, v.subtitle].filter(Boolean).join(": "),
      penulis: (v.authors || []).join(", "),
      penerbit: v.publisher || "",
      tahun: (v.publishedDate || "").slice(0, 4),
      deskripsi: (v.description || "").slice(0, 600),
      isbn,
      // parameter fife meminta gambar lebih besar dari Google
      cover: img ? img.replace("http://", "https://").replace("&edge=curl", "") + "&fife=w600-h900" : null,
    };
  });
}
