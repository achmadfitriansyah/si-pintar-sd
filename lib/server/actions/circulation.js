import { db, run, AppError } from "../db";
import { dateStr, addDays, diffDays } from "../../time";
import { evaluateClass } from "../engine";

export const normCode = (c) => String(c || "").trim().toUpperCase();

const COPY_SELECT = "id,qr_code,label,status,kondisi,book:books(id,judul,penulis,cover_url,category:categories(kode,nama))";

/**
 * Cari eksemplar dari isi QR (hasil pindai) atau, kalau tidak cocok, dari nomor stiker.
 * Fungsi ini hanya dipakai akun guru: siswa tidak punya aksi pinjam/kembali.
 */
export async function findCopy(schoolId, code) {
  const c = normCode(code);
  if (!c) throw new AppError("Kode kosong");
  const byQr = await run(db().from("book_copies").select(COPY_SELECT).eq("school_id", schoolId).eq("qr_code", c).maybeSingle());
  if (byQr) return byQr;
  return run(db().from("book_copies").select(COPY_SELECT).eq("school_id", schoolId).eq("label", c).maybeSingle());
}

/** Nomor stiker berikutnya (0001, 0002, ...) */
export async function nextLabel(schoolId) {
  const rows = await run(db().from("book_copies").select("label").eq("school_id", schoolId).order("id", { ascending: false }).limit(300));
  const max = rows.reduce((m, r) => (/^\d+$/.test(r.label || "") ? Math.max(m, parseInt(r.label, 10)) : m), 0);
  return String(max + 1).padStart(4, "0");
}

/** Pastikan nomor stiker belum dipakai; kosong → otomatis */
export async function resolveLabel(schoolId, wanted) {
  const w = normCode(wanted);
  if (!w) return nextLabel(schoolId);
  const dup = await run(db().from("book_copies").select("id").eq("school_id", schoolId).eq("label", w).maybeSingle());
  if (dup) throw new AppError(`Nomor stiker ${w} sudah dipakai buku lain`);
  return w;
}

export async function activeLoanOfCopy(copyId) {
  return run(
    db()
      .from("loans")
      .select("id,borrowed_at,due_date,recorded_by,student:students(id,nama,kelas,nisn)")
      .eq("copy_id", copyId)
      .eq("status", "dipinjam")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
}

/** Pinjamkan satu atau beberapa eksemplar ke siswa. Setiap kode dicek terpisah. */
export async function borrowCore(school, student, codes, by) {
  const sb = db();
  const active = await run(sb.from("loans").select("id", { count: "exact", head: true }).eq("student_id", student.id).eq("status", "dipinjam"));
  let activeCount = typeof active === "number" ? active : 0;
  const due = addDays(dateStr(), school.loan_days);
  const results = [];
  const seen = new Set();
  for (const raw of codes) {
    const code = normCode(raw);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    try {
      if (activeCount >= school.max_books) throw new AppError(`Batas pinjam ${school.max_books} buku sudah penuh`);
      const copy = await findCopy(school.id, code);
      if (!copy) throw new AppError("Kode belum terdaftar di perpustakaan");
      if (copy.status === "hilang") throw new AppError("Eksemplar ini tercatat hilang");
      if (copy.status === "dipinjam") {
        const l = await activeLoanOfCopy(copy.id);
        throw new AppError(
          by === "guru" && l ? `Masih dipinjam ${l.student?.nama} (${l.student?.kelas}) sejak ${dateStr(l.borrowed_at)}` : "Buku ini sedang dipinjam"
        );
      }
      // kunci eksemplar dulu (hindari dua orang meminjam bersamaan)
      const locked = await run(sb.from("book_copies").update({ status: "dipinjam" }).eq("id", copy.id).eq("status", "tersedia").select("id"));
      if (!locked?.length) throw new AppError("Buku ini baru saja dipinjam orang lain");
      const { error } = await sb.from("loans").insert({
        school_id: school.id, copy_id: copy.id, book_id: copy.book.id, student_id: student.id, recorded_by: by, due_date: due,
      });
      if (error) {
        await sb.from("book_copies").update({ status: "tersedia" }).eq("id", copy.id);
        throw new AppError("Gagal menyimpan peminjaman: " + error.message);
      }
      activeCount++;
      results.push({ code, ok: true, judul: copy.book.judul, cover_url: copy.book.cover_url, due_date: due });
    } catch (e) {
      results.push({ code, ok: false, error: e.message });
    }
  }
  let points = [];
  if (results.some((r) => r.ok)) {
    const { inserted } = await evaluateClass(school.id, student.kelas);
    points = inserted.filter((e) => e.student_id === student.id);
  }
  return { results, due_date: due, points, activeCount, maxBooks: school.max_books };
}

export function lateDays(dueDate, today = dateStr()) {
  return Math.max(0, diffDays(dueDate, today));
}
