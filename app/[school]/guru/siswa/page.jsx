"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Upload, ArrowUpCircle, Pencil, Trash2, Download, FileSpreadsheet, Undo2, Ban } from "lucide-react";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Button, Modal, Spinner, Empty, ErrorBox, SearchInput, Select, Field, Input, Chip, Tabs, BadgeMedal } from "@/components/ui";
import { useToast, useConfirm } from "@/components/Providers";
import { useSchool } from "@/components/SchoolContext";
import { useRpc, rpc, initials } from "@/lib/client";
import { fmtDate } from "@/lib/time";

export default function GuruSiswa() {
  const toast = useToast();
  const confirm = useConfirm();
  const [status, setStatus] = useState("aktif");
  const [q, setQ] = useState("");
  const [kelas, setKelas] = useState("");
  const [form, setForm] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const { data, error, loading, reload } = useRpc("guru.students", { status });
  const { data: meta, reload: reloadMeta } = useRpc("guru.meta");

  const rows = useMemo(() => {
    if (!data) return [];
    const s = q.toLowerCase();
    return data.filter((r) => (!kelas || r.kelas === kelas) && (!s || r.nama.toLowerCase().includes(s) || r.nisn.includes(s)));
  }, [data, q, kelas]);

  const refresh = () => {
    reload(true);
    reloadMeta(true);
  };

  const promote = async () => {
    try {
      const p = await rpc("guru.promote", { dryRun: true });
      const ok = await confirm({
        title: "Naikkan semua kelas?",
        message: `${p.naik} siswa naik satu tingkat (1A → 2A, dst). ${p.alumni} siswa kelas 6 menjadi alumni. Lakukan sekali saja di awal tahun ajaran.`,
        ok: "Naikkan kelas",
      });
      if (!ok) return;
      const r = await rpc("guru.promote");
      toast.success(`${r.naik} siswa naik kelas, ${r.alumni} menjadi alumni`);
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const del = async (s) => {
    const ok = await confirm({ title: `Hapus ${s.nama}?`, message: "Riwayat peminjaman dan poin siswa ini ikut terhapus.", danger: true, ok: "Hapus" });
    if (!ok) return;
    try {
      await rpc("guru.deleteStudent", { id: s.id });
      toast.success("Siswa dihapus");
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Page>
      <GuruHeader
        emoji="🧒"
        title="Data Siswa"
        sub={data ? `${data.length} siswa ${status}` : "NISN, nama, dan kelas"}
        actions={
          <>
            <Button variant="teal" icon={UserPlus} onClick={() => setForm({ nisn: "", nama: "", kelas: "" })}>
              Tambah
            </Button>
            <Button variant="white" icon={Upload} onClick={() => setImportOpen(true)}>
              Impor Excel
            </Button>
            <Button variant="white" icon={ArrowUpCircle} onClick={promote}>
              Naik kelas
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-[auto_1fr_auto]">
        <div className="sm:w-64">
          <Tabs id="st" color="#0D9488" value={status} onChange={setStatus} tabs={[{ value: "aktif", label: "Aktif" }, { value: "alumni", label: "Alumni" }]} />
        </div>
        <SearchInput value={q} onChange={setQ} placeholder="Cari nama atau NISN..." />
        <Select value={kelas} onChange={(e) => setKelas(e.target.value)} className="sm:w-40">
          <option value="">Semua kelas</option>
          {[...new Set((data || []).map((r) => r.kelas))].sort().map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
      </div>

      {error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Empty emoji="🧑‍🎓" title={data.length ? "Tidak ada yang cocok" : "Belum ada siswa"} text={data.length ? "Coba kata kunci lain." : "Tambah satu per satu atau impor dari Excel."} />
      ) : (
        <>
          {/* Tabel (layar lebar) */}
          <div className="hidden overflow-hidden rounded-3xl bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">NISN</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 20) * 0.015 }} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <button onClick={() => setDetail(s.id)} className="flex items-center gap-3 font-semibold hover:text-guru">
                        <Avatar name={s.nama} />
                        {s.nama}
                      </button>
                    </td>
                    <td className="px-5 py-3 font-data text-slate-600">{s.nisn}</td>
                    <td className="px-5 py-3">
                      <Chip className="bg-teal-50 text-teal-700">{s.kelas}</Chip>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <RowBtn icon={Pencil} onClick={() => setForm(s)} />
                        <RowBtn icon={Trash2} danger onClick={() => del(s)} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Kartu (HP) */}
          <div className="space-y-2 md:hidden">
            {rows.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
                <button onClick={() => setDetail(s.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Avatar name={s.nama} />
                  <div className="min-w-0">
                    <div className="truncate font-bold">{s.nama}</div>
                    <div className="font-data text-xs text-slate-500">
                      {s.nisn} · Kelas {s.kelas}
                    </div>
                  </div>
                </button>
                <RowBtn icon={Pencil} onClick={() => setForm(s)} />
                <RowBtn icon={Trash2} danger onClick={() => del(s)} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      <StudentForm value={form} onClose={() => setForm(null)} onSaved={refresh} classes={meta?.classes || []} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onDone={refresh} />
      <StudentDetail id={detail} onClose={() => setDetail(null)} />
    </Page>
  );
}

function Avatar({ name }) {
  return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 font-display text-sm font-bold text-teal-700">{initials(name)}</div>;
}

function RowBtn({ icon: Icon, onClick, danger }) {
  return (
    <motion.button whileTap={{ scale: 0.85 }} onClick={onClick} className={`rounded-xl p-2 transition ${danger ? "text-slate-400 hover:bg-red-50 hover:text-red-600" : "text-slate-500 hover:bg-slate-100"}`}>
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}

// ═══════════════════════ Tambah / edit
function StudentForm({ value, onClose, onSaved, classes }) {
  const toast = useToast();
  const [f, setF] = useState(value || {});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (value) setF(value);
  }, [value]);

  const save = async () => {
    setSaving(true);
    try {
      await rpc("guru.saveStudent", f);
      toast.success(f.id ? "Data siswa diperbarui" : "Siswa ditambahkan");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!value}
      onClose={onClose}
      title={f.id ? "Edit siswa" : "Tambah siswa"}
      footer={
        <Button variant="teal" className="w-full" loading={saving} onClick={save}>
          Simpan
        </Button>
      }
    >
      <div className="space-y-3">
        <Field label="NISN (10 digit)">
          <Input value={f.nisn || ""} inputMode="numeric" className="font-data" onChange={(e) => setF({ ...f, nisn: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
        </Field>
        <Field label="Nama lengkap">
          <Input value={f.nama || ""} onChange={(e) => setF({ ...f, nama: e.target.value })} />
        </Field>
        <Field label="Kelas" hint="Contoh: 1A, 2B, 6C">
          <Input value={f.kelas || ""} list="kelas-list" onChange={(e) => setF({ ...f, kelas: e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 3) })} />
          <datalist id="kelas-list">
            {classes.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </Field>
        {!f.id && <p className="text-xs text-slate-500">Siswa dan orang tua login memakai NISN ini dengan password awal 123456.</p>}
      </div>
    </Modal>
  );
}

// ═══════════════════════ Impor Excel
function ImportModal({ open, onClose, onDone }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [rows, setRows] = useState(null);
  const [existing, setExisting] = useState(new Set());
  const [mode, setMode] = useState("skip");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    rpc("guru.students", { status: "aktif" })
      .then((a) => rpc("guru.students", { status: "alumni" }).then((b) => setExisting(new Set([...a, ...b].map((s) => s.nisn)))))
      .catch(() => {});
  }, [open]);

  const template = async () => {
    const XLSX = await import("xlsx");
    const aoa = [["NISN", "NAMA", "KELAS"], ["0012345678", "Contoh Nama Siswa", "2A"]];
    for (let i = 0; i < 600; i++) aoa.push(["", "", ""]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // semua sel berformat TEKS supaya angka 0 di depan NISN tidak hilang
    for (const addr of Object.keys(ws)) {
      if (addr.startsWith("!")) continue;
      ws[addr].t = "s";
      ws[addr].z = "@";
    }
    ws["!cols"] = [{ wch: 16 }, { wch: 34 }, { wch: 8 }];
    const info = XLSX.utils.aoa_to_sheet([
      ["PETUNJUK PENGISIAN"],
      ["1. Isi mulai baris ke-3 di sheet 'Data Siswa'. Baris ke-2 adalah contoh, boleh dihapus."],
      ["2. NISN harus 10 digit angka. Kolom sudah berformat teks, jadi angka 0 di depan aman."],
      ["3. Kelas ditulis angka + huruf tanpa spasi, contoh: 1A, 2B, 6C."],
      ["4. Kalau menyalin dari file lain, gunakan Paste Values (Ctrl+Shift+V) agar format teks tidak hilang."],
    ]);
    info["!cols"] = [{ wch: 95 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.utils.book_append_sheet(wb, info, "Petunjuk");
    XLSX.writeFile(wb, "template-data-siswa.xlsx");
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
      const ws = wb.Sheets["Data Siswa"] || wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
      const head = (aoa[0] || []).map((h) => String(h).trim().toUpperCase());
      const iN = head.indexOf("NISN");
      const iM = head.indexOf("NAMA");
      const iK = head.indexOf("KELAS");
      if (iN < 0 || iM < 0 || iK < 0) throw new Error("Kolom NISN, NAMA, KELAS tidak ditemukan. Pakai template yang disediakan.");
      const seen = new Set();
      const out = aoa
        .slice(1)
        .map((r, idx) => ({ row: idx + 2, nisn: String(r[iN]).trim(), nama: String(r[iM]).trim().replace(/\s+/g, " "), kelas: String(r[iK]).trim().toUpperCase().replace(/\s/g, "") }))
        .filter((r) => r.nisn || r.nama || r.kelas)
        .filter((r) => !(r.nisn === "0012345678" && r.nama === "Contoh Nama Siswa"))
        .map((r) => {
          const err = [];
          if (!/^\d{10}$/.test(r.nisn)) err.push(/^\d{1,9}$/.test(r.nisn) ? `NISN ${r.nisn.length} digit (0 di depan hilang?)` : "NISN harus 10 digit");
          if (r.nama.length < 2) err.push("Nama kosong");
          if (!/^[1-6][A-Z]{0,2}$/.test(r.kelas)) err.push("Kelas tidak valid");
          if (seen.has(r.nisn)) err.push("NISN dobel di file");
          seen.add(r.nisn);
          return { ...r, err, dup: existing.has(r.nisn) };
        });
      if (!out.length) throw new Error("File kosong");
      setRows(out);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const valid = rows?.filter((r) => !r.err.length) || [];
  const bad = rows?.filter((r) => r.err.length) || [];
  const dups = valid.filter((r) => r.dup);

  const doImport = async () => {
    setSaving(true);
    try {
      const r = await rpc("guru.importStudents", { rows: valid, mode });
      toast.success(`${r.inserted} baru, ${r.updated} diperbarui, ${r.skipped} dilewati`);
      onDone();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Impor data siswa"
      wide
      footer={
        rows ? (
          <div className="flex gap-2">
            <Button variant="soft" onClick={() => setRows(null)}>
              Pilih file lain
            </Button>
            <Button variant="teal" className="flex-1" loading={saving} disabled={!valid.length} onClick={doImport}>
              Impor {mode === "skip" ? valid.length - dups.length : valid.length} siswa
            </Button>
          </div>
        ) : null
      }
    >
      {!rows ? (
        <div className="space-y-4">
          <div className="rounded-3xl bg-teal-50 p-4">
            <div className="flex items-center gap-2 font-display font-bold text-teal-900">
              <FileSpreadsheet className="h-5 w-5" /> Langkah 1: unduh template
            </div>
            <p className="mt-1 text-sm text-teal-800">Kolom: NISN, NAMA, KELAS. Semua kolom sudah berformat teks supaya angka 0 di depan NISN tidak hilang.</p>
            <Button variant="teal" className="mt-3" icon={Download} onClick={template}>
              Unduh template Excel
            </Button>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 p-8 text-slate-500 transition hover:border-guru hover:text-guru">
            <Upload className="h-10 w-10" />
            <div className="font-display font-bold">Langkah 2: pilih file yang sudah diisi</div>
            <div className="text-xs">.xlsx atau .csv</div>
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Count n={valid.length - dups.length} label="Siap masuk" cls="bg-emerald-50 text-emerald-700" />
            <Count n={dups.length} label="NISN sudah ada" cls="bg-amber-50 text-amber-700" />
            <Count n={bad.length} label="Perlu diperbaiki" cls="bg-red-50 text-red-700" />
          </div>
          {dups.length > 0 && (
            <div className="rounded-2xl bg-amber-50 p-3">
              <div className="mb-2 text-sm font-bold text-amber-900">Untuk NISN yang sudah ada:</div>
              <div className="flex gap-2">
                {[
                  ["skip", "Lewati"],
                  ["overwrite", "Timpa nama & kelas"],
                ].map(([k, l]) => (
                  <button key={k} onClick={() => setMode(k)} className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${mode === k ? "bg-amber-500 text-white" : "bg-white text-amber-800"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="max-h-[45vh] overflow-y-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Baris</th>
                  <th className="px-3 py-2">NISN</th>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Kelas</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.row} className={r.err.length ? "bg-red-50" : r.dup ? "bg-amber-50" : "bg-emerald-50/50"}>
                    <td className="px-3 py-1.5 text-slate-400">{r.row}</td>
                    <td className="px-3 py-1.5 font-data">{r.nisn}</td>
                    <td className="px-3 py-1.5">{r.nama}</td>
                    <td className="px-3 py-1.5">{r.kelas}</td>
                    <td className="px-3 py-1.5 text-xs font-bold">{r.err.length ? <span className="text-red-600">{r.err.join(", ")}</span> : r.dup ? <span className="text-amber-700">Sudah ada</span> : <span className="text-emerald-700">OK</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bad.length > 0 && <p className="text-xs text-slate-500">Baris merah tidak akan diimpor. Perbaiki di Excel lalu impor ulang kalau perlu.</p>}
        </div>
      )}
    </Modal>
  );
}

function Count({ n, label, cls }) {
  return (
    <div className={`rounded-2xl p-3 ${cls}`}>
      <div className="font-data text-2xl font-bold">{n}</div>
      <div className="text-[11px] font-bold">{label}</div>
    </div>
  );
}

// ═══════════════════════ Detail poin siswa
function StudentDetail({ id, onClose }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [d, setD] = useState(null);
  const load = () => rpc("guru.studentDetail", { id }).then(setD).catch((e) => toast.error(e.message));
  useEffect(() => {
    if (!id) return;
    setD(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggle = async (e) => {
    if (!e.cancelled) {
      const ok = await confirm({ title: "Batalkan poin ini?", message: `${e.reason} (+${e.amount})`, danger: true, ok: "Batalkan poin" });
      if (!ok) return;
    }
    try {
      await rpc("guru.cancelPoints", { id: e.id, restore: e.cancelled });
      toast.success(e.cancelled ? "Poin dikembalikan" : "Poin dibatalkan");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={!!id} onClose={onClose} title="Detail siswa" wide>
      {!d ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-100 text-4xl">{d.level.emoji}</div>
            <div>
              <div className="font-display text-2xl font-bold">{d.student.nama}</div>
              <div className="text-sm text-slate-500">
                <span className="font-data">{d.student.nisn}</span> · Kelas {d.student.kelas} · Level {d.level.level}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Count n={d.total} label="Total poin" cls="bg-amber-50 text-amber-700" />
            <Count n={d.month} label="Bulan ini" cls="bg-teal-50 text-teal-700" />
            <Count n={d.loans.length} label="Peminjaman" cls="bg-violet-50 text-violet-700" />
          </div>
          {d.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {d.badges.map((b) => (
                <BadgeMedal key={b.id} badge={b} size={44} />
              ))}
            </div>
          )}
          <div>
            <div className="mb-2 font-display font-bold">Riwayat poin</div>
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {d.events.length === 0 && <p className="text-sm text-slate-500">Belum ada poin.</p>}
              {d.events.map((e) => (
                <div key={e.id} className={`flex items-center gap-2 rounded-xl p-2.5 text-sm ${e.cancelled ? "bg-slate-100 text-slate-400 line-through" : "bg-slate-50"}`}>
                  <span className="min-w-0 flex-1 truncate">{e.reason}</span>
                  <span className="text-xs text-slate-400">{fmtDate(e.created_at)}</span>
                  <span className="w-10 text-right font-data font-bold">+{e.amount}</span>
                  <button onClick={() => toggle(e)} title={e.cancelled ? "Kembalikan" : "Batalkan"} className="rounded-lg p-1 text-slate-400 no-underline hover:bg-white hover:text-slate-700">
                    {e.cancelled ? <Undo2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Batalkan poin kalau ada peminjaman yang salah catat. Poin yang dibatalkan tidak akan muncul lagi.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
