// ═══════════════════════════════════════════════════════════════════
//  MESIN POIN & TANTANGAN
//  Semua poin DIHITUNG ULANG dari riwayat peminjaman, lalu hanya poin yang
//  belum tercatat yang disimpan (ref_key unik mencegah dobel).
//  Karena itu data demo cukup berisi peminjaman; poinnya muncul otomatis.
// ═══════════════════════════════════════════════════════════════════
import { db, run } from "./db";
import { dateStr, weekKey, monthKey, addDays, monthStartISO, diffDays } from "../time";
import { POIN, pickWeekly, classTarget, levelInfo } from "../rules";

export const LOAN_SELECT =
  "id,student_id,book_id,copy_id,borrowed_at,due_date,returned_at,return_condition,status,recorded_by," +
  "book:books(id,judul,cover_url,category_id,category:categories(kode,nama))";

/** Ambil semua baris (Supabase membatasi 1000 per query) */
export async function runAll(build, msg) {
  const size = 1000;
  let from = 0;
  const out = [];
  for (;;) {
    const rows = await run(build().range(from, from + size - 1), msg);
    out.push(...rows);
    if (rows.length < size) break;
    from += size;
  }
  return out;
}

const onTime = (l) => l.returned_at && dateStr(l.returned_at) <= l.due_date && l.return_condition !== "rusak_berat";
const byTime = (key) => (a, b) => String(a[key]).localeCompare(String(b[key]));

export async function loadClassContext(schoolId, kelas, now = new Date()) {
  const sb = db();
  const today = dateStr(now);
  // Semua query dijalankan bersamaan (satu putaran ke database), memakai join ke tabel siswa untuk menyaring kelas.
  const [students, loans, events, monthLoans, guru] = await Promise.all([
    run(sb.from("students").select("id,nama,kelas,nisn").eq("school_id", schoolId).eq("kelas", kelas).eq("status", "aktif").order("nama")),
    runAll(() =>
      sb.from("loans").select(`${LOAN_SELECT},st:students!inner(kelas,status)`).eq("st.kelas", kelas).eq("st.status", "aktif").eq("school_id", schoolId).order("borrowed_at").order("id")
    ),
    runAll(() =>
      sb.from("point_events").select("id,student_id,ref_key,amount,cancelled,created_at,reason,st:students!inner(kelas,status)").eq("st.kelas", kelas).eq("st.status", "aktif").eq("school_id", schoolId).order("id")
    ),
    runAll(() => sb.from("loans").select("id,book_id,borrowed_at").eq("school_id", schoolId).gte("borrowed_at", monthStartISO(monthKey(now))).order("id")),
    run(sb.from("challenges").select("*").eq("school_id", schoolId).lte("start_date", today).gte("end_date", today)),
  ]);
  return { schoolId, kelas, students, loans, events, monthLoans, guru, now, today };
}

/** Hitung semua poin yang seharusnya dimiliki satu siswa + progres tantangannya */
export function computeStudent(ctx, sid) {
  const { now, today } = ctx;
  const my = ctx.loans.filter((l) => l.student_id === sid);
  const returned = my.filter((l) => l.status === "kembali" && l.returned_at).sort(byTime("returned_at"));
  const events = [];
  const add = (ref_key, amount, reason, created_at, loan_id = null) =>
    events.push({ ref_key, amount, reason, created_at: created_at || now.toISOString(), loan_id });

  // ---- Poin dasar ----
  const firstBorrow = new Map();
  for (const l of my) if (!firstBorrow.has(l.book_id)) firstBorrow.set(l.book_id, l.id);
  const weekCount = {};
  for (const l of returned) {
    if (!onTime(l)) continue;
    const wk = weekKey(l.returned_at);
    weekCount[wk] = (weekCount[wk] || 0) + 1;
    if (weekCount[wk] > POIN.BATAS_MINGGUAN) continue;
    const judul = l.book?.judul || "buku";
    add(`loan:${l.id}`, POIN.TEPAT_WAKTU, `Tepat waktu: ${judul}`, l.returned_at, l.id);
    if (firstBorrow.get(l.book_id) === l.id) add(`loan:${l.id}:baru`, POIN.JUDUL_BARU, `Judul baru: ${judul}`, l.returned_at, l.id);
  }

  // ---- Minggu beruntun (untuk statistik beranda) ----
  const weekSet = new Set(my.map((l) => weekKey(l.borrowed_at)));
  const curWeek = weekKey(now);
  let currentStreak = 0;
  for (let w = weekSet.has(curWeek) ? curWeek : addDays(curWeek, -7); weekSet.has(w); w = addDays(w, -7)) currentStreak++;

  // ---- Tantangan mingguan sistem ----
  const wk = curWeek;
  const weekBorrow = my.filter((l) => weekKey(l.borrowed_at) === wk);
  const weekReturned = returned.filter((l) => weekKey(l.returned_at) === wk);
  const prevCats = new Set(my.filter((l) => weekKey(l.borrowed_at) < wk).map((l) => l.book?.category?.kode));
  const weekly = pickWeekly(wk).map((p) => {
    let list = [];
    if (p.kind === "returnOnTime") list = weekReturned.filter(onTime).map((l) => l.returned_at);
    if (p.kind === "newCategory") list = weekBorrow.filter((l) => !prevCats.has(l.book?.category?.kode)).map((l) => l.borrowed_at);
    if (p.kind === "borrowCategory") list = weekBorrow.filter((l) => l.book?.category?.kode === p.kode).map((l) => l.borrowed_at);
    if (p.kind === "rareBook")
      list = weekBorrow
        .filter((l) => !ctx.monthLoans.some((m) => m.book_id === l.book_id && m.id !== l.id && m.borrowed_at < l.borrowed_at))
        .map((l) => l.borrowed_at);
    if (p.kind === "allOnTime") {
      const overdue = my.some((l) => l.status === "dipinjam" && l.due_date < today);
      const allOk = weekReturned.length > 0 && weekReturned.every((l) => dateStr(l.returned_at) <= l.due_date);
      list = allOk && !overdue ? [weekReturned[weekReturned.length - 1].returned_at] : [];
    }
    const value = Math.min(list.length, p.target);
    const done = list.length >= p.target;
    if (done) add(`week:${wk}:${p.id}`, p.points, `Tantangan mingguan: ${p.title}`, list[p.target - 1]);
    return { id: p.id, title: p.title, icon: p.icon, points: p.points, target: p.target, value, done, source: "sistem" };
  });

  // ---- Tantangan buatan guru ----
  const kelas = ctx.kelas;
  const guru = ctx.guru
    .filter((c) => !c.kelas || c.kelas === kelas)
    .map((c) => {
      const inRange = (ts) => {
        const d = dateStr(ts);
        return d >= c.start_date && d <= c.end_date;
      };
      const match = (l) => (!c.category_id || l.book?.category_id === c.category_id) && (!c.book_id || l.book_id === c.book_id);
      const list =
        c.action === "pinjam"
          ? my.filter((l) => inRange(l.borrowed_at) && match(l)).map((l) => l.borrowed_at)
          : returned.filter((l) => onTime(l) && inRange(l.returned_at) && match(l)).map((l) => l.returned_at);
      const done = list.length >= c.target;
      if (done) add(`guru:${c.id}`, c.points, `Tantangan guru: ${c.title}`, list[c.target - 1]);
      return {
        id: `guru-${c.id}`, title: c.title, icon: "tantangan/guru", points: c.points, target: c.target,
        value: Math.min(list.length, c.target), done, source: "guru", end_date: c.end_date,
      };
    });

  return { events, streak: currentStreak, weekly, guru, returnedCount: returned.length, activeCount: my.filter((l) => l.status === "dipinjam").length };
}

/** Progres tantangan kelas bulan ini */
export function computeClass(ctx) {
  const mk = monthKey(ctx.now);
  const list = ctx.loans
    .filter((l) => l.status === "kembali" && l.returned_at && monthKey(l.returned_at) === mk && onTime(l))
    .sort(byTime("returned_at"));
  const target = classTarget(ctx.students.length);
  const contrib = {};
  for (const l of list) contrib[l.student_id] = (contrib[l.student_id] || 0) + 1;
  const [y, m] = mk.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const daysLeft = Math.max(0, diffDays(ctx.today, `${mk}-${String(lastDay).padStart(2, "0")}`));
  return {
    kelas: ctx.kelas, month: mk, target, value: list.length, done: list.length >= target,
    doneAt: list[target - 1]?.returned_at || null, contrib, daysLeft, reward: POIN.KELAS,
    title: `Kumpulkan ${target} pengembalian tepat waktu bulan ini`,
  };
}

/** Hitung ulang satu kelas dan simpan poin yang belum tercatat. */
export async function evaluateClass(schoolId, kelas, now = new Date()) {
  const ctx = await loadClassContext(schoolId, kelas, now);
  const computed = new Map();
  const existing = new Set(ctx.events.map((e) => `${e.student_id}|${e.ref_key}`));
  const cls = ctx.students.length ? computeClass(ctx) : null;
  const rows = [];
  for (const s of ctx.students) {
    const r = computeStudent(ctx, s.id);
    if (cls?.done) r.events.push({ ref_key: `class:${cls.month}:${kelas}`, amount: POIN.KELAS, reason: `Tantangan kelas ${kelas} tercapai`, created_at: cls.doneAt, loan_id: null });
    computed.set(s.id, r);
    for (const e of r.events) {
      if (!existing.has(`${s.id}|${e.ref_key}`)) rows.push({ ...e, school_id: schoolId, student_id: s.id });
    }
  }
  let inserted = [];
  if (rows.length) {
    const sb = db();
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const res = await run(
        sb.from("point_events").upsert(chunk, { onConflict: "student_id,ref_key", ignoreDuplicates: true }).select("id,student_id,ref_key,amount,cancelled,created_at,reason")
      );
      inserted.push(...(res || []));
    }
    ctx.events.push(...inserted);
  }
  return { ctx, computed, cls, inserted };
}

/** Ringkasan poin satu siswa dari daftar event */
export function pointSummary(events, sid, now = new Date()) {
  const mk = monthKey(now);
  // baris lama berawalan "tier:" (sistem lencana yang sudah dihapus) tidak dihitung
  const mine = events.filter((e) => e.student_id === sid && !e.cancelled && !e.ref_key.startsWith("tier:"));
  const total = mine.reduce((a, e) => a + e.amount, 0);
  const month = mine.filter((e) => monthKey(e.created_at) === mk).reduce((a, e) => a + e.amount, 0);
  return { total, month, level: levelInfo(total) };
}
