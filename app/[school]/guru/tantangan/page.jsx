"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Card, Button, Modal, Field, Input, Select, Spinner, ErrorBox, Chip, ProgressBar } from "@/components/ui";
import { useToast, useConfirm } from "@/components/Providers";
import { useRpc, rpc } from "@/lib/client";
import { dateStr, weekKey, addDays, fmtShort } from "@/lib/time";
import Icon from "@/components/Icon";

export default function GuruTantangan() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: d, error, loading, reload } = useRpc("guru.challenges");
  const { data: meta } = useRpc("guru.meta");
  const [open, setOpen] = useState(false);

  const del = async (c) => {
    if (!(await confirm({ title: "Hapus tantangan?", message: c.title, danger: true, ok: "Hapus" }))) return;
    try {
      await rpc("guru.deleteChallenge", { id: c.id });
      toast.success("Tantangan dihapus");
      reload(true);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Page>
      <GuruHeader
        icon="tantangan/umum"
        title="Tantangan"
        sub="Buat tantangan mingguan sendiri dan pantau tantangan kelas"
        actions={
          <Button variant="teal" icon={Plus} onClick={() => setOpen(true)}>
            Buat tantangan
          </Button>
        }
      />
      {error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : loading && !d ? (
        <Spinner />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <Card>
              <div className="mb-1 font-display text-lg font-bold">Tantangan buatan guru</div>
              <div className="mb-3 text-xs text-slate-500">Tampil di halaman siswa bersama tantangan dari sistem</div>
              {d.list.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada. Contoh: &ldquo;Hari Pahlawan: pinjam 1 buku Biografi, +25 poin&rdquo;.</div>
              ) : (
                <div className="space-y-2">
                  {d.list.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className={`flex items-center gap-3 rounded-2xl p-3 ${c.state === "aktif" ? "bg-teal-50" : "bg-slate-50 opacity-70"}`}>
                      <Icon name="tantangan/guru" size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{c.title}</div>
                        <div className="text-xs text-slate-500">
                          {c.kelas ? `Kelas ${c.kelas}` : "Semua kelas"} · {fmtShort(c.start_date)} – {fmtShort(c.end_date)}
                        </div>
                      </div>
                      <Chip className={`hidden sm:inline-flex ${c.state === "aktif" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"}`}>{c.state}</Chip>
                      <Chip className="shrink-0 bg-amber-100 text-amber-700">+{c.points}</Chip>
                      <button onClick={() => del(c)} className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
            <Card>
              <div className="mb-1 flex items-center gap-2 font-display text-lg font-bold">
                <Sparkles className="h-5 w-5 text-amber-500" /> Tantangan sistem minggu ini
              </div>
              <div className="mb-3 text-xs text-slate-500">Dipilih acak otomatis setiap Senin, sama untuk semua siswa</div>
              <div className="space-y-2">
                {d.weekly.map((w) => (
                  <div key={w.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <Icon name={w.icon} size={32} />
                    <span className="min-w-0 flex-1 text-sm font-semibold">{w.title}</span>
                    <Chip className="shrink-0 bg-amber-100 text-amber-700">+{w.points}</Chip>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-1 font-display text-lg font-bold">Tantangan kelas bulan ini</div>
            <div className="mb-4 text-xs text-slate-500">Target = 1,5 × jumlah siswa. Tercapai → semua anggota kelas +{d.classReward} poin.</div>
            <div className="space-y-4">
              {d.classes.map((c, i) => (
                <div key={c.kelas}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-bold">
                      Kelas {c.kelas} <span className="font-normal text-slate-400">({c.size} siswa)</span>
                    </span>
                    <span className="font-data text-xs font-bold">
                      {c.value}/{c.target}
                    </span>
                  </div>
                  <ProgressBar value={c.value} max={c.target} color={c.value >= c.target ? "#10B981" : "#0D9488"} height={10} delay={i * 0.05} />
                </div>
              ))}
              {d.classes.length === 0 && <p className="text-sm text-slate-500">Belum ada siswa.</p>}
            </div>
          </Card>
        </div>
      )}
      <ChallengeForm open={open} onClose={() => setOpen(false)} meta={meta} books={d?.books || []} onSaved={() => reload(true)} />
    </Page>
  );
}

function Seg({ value, onPick, opts }) {
  return (
    <div className="grid gap-1 rounded-2xl bg-slate-100 p-1" style={{ gridTemplateColumns: `repeat(${opts.length}, minmax(0, 1fr))` }}>
      {opts.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onPick(v)} className={`rounded-xl px-2 py-2 text-sm font-bold leading-tight transition ${value === v ? "bg-white text-slate-900 shadow-soft" : "text-slate-500"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div>
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      {children}
    </div>
  );
}

function ChallengeForm({ open, onClose, meta, books, onSaved }) {
  const toast = useToast();
  const today = dateStr();
  const weekEnd = addDays(weekKey(), 6);
  const init = { title: "", action: "pinjam", target: 1, filter: "any", category_id: "", book_id: "", points: 20, kelas: "", period: "week", start_date: today, end_date: weekEnd };
  const [f, setF] = useState(init);
  const [saving, setSaving] = useState(false);
  const [bq, setBq] = useState("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const auto = useMemo(() => {
    const cat = meta?.categories?.find((c) => String(c.id) === String(f.category_id));
    const bk = books.find((b) => String(b.id) === String(f.book_id));
    const what = f.filter === "book" && bk ? `"${bk.judul}"` : f.filter === "category" && cat ? `buku ${cat.nama}` : "buku";
    const n = f.filter === "book" ? "" : `${f.target} `;
    return `${f.action === "pinjam" ? "Pinjam" : "Kembalikan tepat waktu"} ${n}${what}`;
  }, [f, meta, books]);

  const save = async () => {
    setSaving(true);
    try {
      await rpc("guru.saveChallenge", {
        title: f.title || auto,
        action: f.action,
        target: f.filter === "book" ? 1 : f.target,
        category_id: f.filter === "category" ? f.category_id || null : null,
        book_id: f.filter === "book" ? f.book_id || null : null,
        points: f.points,
        kelas: f.kelas || null,
        start_date: f.period === "week" ? today : f.start_date,
        end_date: f.period === "week" ? weekEnd : f.end_date,
      });
      toast.success("Tantangan dibuat!");
      setF(init);
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
      open={open}
      onClose={onClose}
      title="Buat tantangan"
      footer={
        <Button variant="teal" className="w-full" loading={saving} onClick={save}>
          Simpan tantangan
        </Button>
      }
    >
      <div className="space-y-4">
        <motion.div layout className="rounded-2xl bg-teal-50 p-4 text-center">
          <div className="text-xs font-bold uppercase text-teal-700">Pratinjau</div>
          <div className="mt-1 font-display text-lg font-bold text-teal-900">{f.title || auto}</div>
          <div className="text-sm text-teal-700">
            +{f.points} poin · {f.kelas ? `Kelas ${f.kelas}` : "Semua kelas"}
          </div>
        </motion.div>
        <Group label="Aksi">
          <Seg value={f.action} onPick={(v) => set("action", v)} opts={[["pinjam", "Pinjam"], ["kembali", "Kembali tepat waktu"]]} />
        </Group>
        <Group label="Buku">
          <Seg value={f.filter} onPick={(v) => set("filter", v)} opts={[["any", "Apa saja"], ["category", "Kategori"], ["book", "Judul tertentu"]]} />
        </Group>
        {f.filter === "category" && (
          <Select value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
            <option value="">Pilih kategori</option>
            {meta?.categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </Select>
        )}
        {f.filter === "book" && (
          <div className="space-y-2">
            <Input value={bq} onChange={(e) => setBq(e.target.value)} placeholder="Cari judul..." />
            <Select value={f.book_id} onChange={(e) => set("book_id", e.target.value)}>
              <option value="">Pilih judul</option>
              {books
                .filter((b) => !bq || b.judul.toLowerCase().includes(bq.toLowerCase()))
                .slice(0, 200)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.judul}
                  </option>
                ))}
            </Select>
          </div>
        )}
        {f.filter !== "book" && (
          <Field label={`Jumlah buku: ${f.target}`}>
            <input type="range" min={1} max={10} value={f.target} onChange={(e) => set("target", Number(e.target.value))} className="w-full accent-teal-600" />
          </Field>
        )}
        <Field label={`Poin: +${f.points}`} hint="5–50 poin, supaya adil dibanding tantangan lain">
          <input type="range" min={5} max={50} step={5} value={f.points} onChange={(e) => set("points", Number(e.target.value))} className="w-full accent-teal-600" />
        </Field>
        <Field label="Untuk">
          <Select value={f.kelas} onChange={(e) => set("kelas", e.target.value)}>
            <option value="">Semua kelas</option>
            {meta?.classes?.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </Select>
        </Field>
        <Group label="Berlaku">
          <Seg value={f.period} onPick={(v) => set("period", v)} opts={[["week", "Minggu ini"], ["custom", "Pilih tanggal"]]} />
        </Group>
        {f.period === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={f.start_date} onChange={(e) => set("start_date", e.target.value)} />
            <Input type="date" value={f.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </div>
        )}
        <Field label="Judul tantangan (opsional)">
          <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder={auto} />
        </Field>
      </div>
    </Modal>
  );
}
