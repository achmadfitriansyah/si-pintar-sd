"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, List, X, UserRound, Check, Search, Ghost } from "lucide-react";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Card, Tabs, Button, Cover, Chip, Spinner, Empty, ErrorBox, SearchInput, inputCls } from "@/components/ui";
import Scanner from "@/components/Scanner";
import Confetti from "@/components/Confetti";
import { useToast, useConfirm } from "@/components/Providers";
import { useRpc, rpc } from "@/lib/client";
import { fmtDate, fmtShort } from "@/lib/time";
import { KONDISI } from "@/lib/rules";

export default function SirkulasiPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Sirkulasi />
    </Suspense>
  );
}

function Sirkulasi() {
  const sp = useSearchParams();
  const [tab, setTab] = useState(sp.get("tab") || "pinjam");
  return (
    <Page>
      <GuruHeader emoji="🔄" title="Sirkulasi" sub="Catat peminjaman dan pengembalian buku" />
      <div className="mx-auto max-w-5xl space-y-5">
        <Tabs
          id="sirk"
          color="#0D9488"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "pinjam", label: "Pinjam", icon: ArrowUpRight },
            { value: "kembali", label: "Kembali", icon: ArrowDownLeft },
            { value: "aktif", label: "Dipinjam", icon: List },
          ]}
        />
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {tab === "pinjam" && <PinjamTab />}
            {tab === "kembali" && <KembaliTab />}
            {tab === "aktif" && <AktifTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
}

// ═════════════════════════════════ PINJAM
function PinjamTab() {
  const toast = useToast();
  const [nisn, setNisn] = useState("");
  const [st, setSt] = useState(null);
  const [finding, setFinding] = useState(false);
  const [queue, setQueue] = useState([]);
  const [saving, setSaving] = useState(false);
  const [party, setParty] = useState(0);

  const find = async (v = nisn) => {
    if (v.length !== 10) return;
    setFinding(true);
    try {
      setSt(await rpc("guru.findStudent", { nisn: v }));
    } catch (e) {
      setSt(null);
      toast.error(e.message);
    } finally {
      setFinding(false);
    }
  };

  const addCode = async (code) => {
    const c = code.trim().toUpperCase();
    if (queue.some((q) => q.code === c)) return toast.info("Buku ini sudah ada di daftar");
    const tmp = { code: c, loading: true };
    setQueue((q) => [...q, tmp]);
    try {
      const p = await rpc("loan.preview", { code: c });
      setQueue((q) => q.map((x) => (x.code === c ? { ...p, code: c } : x)));
    } catch (e) {
      setQueue((q) => q.map((x) => (x.code === c ? { code: c, error: e.message } : x)));
    }
  };

  const ok = queue.filter((q) => q.status === "tersedia");
  const quota = st ? st.maxBooks - st.active.length : 0;
  const over = ok.length > quota;

  const save = async () => {
    setSaving(true);
    try {
      const r = await rpc("guru.borrow", { nisn: st.student.nisn, codes: ok.map((q) => q.code) });
      const good = r.results.filter((x) => x.ok);
      const bad = r.results.filter((x) => !x.ok);
      if (good.length) {
        setParty((p) => p + 1);
        toast.success(`${good.length} buku dipinjam ${st.student.nama}. Kembali ${fmtDate(r.due_date)}`);
      }
      if (bad.length) toast.error(bad.map((b) => `${b.code}: ${b.error}`).join(" · "));
      setQueue([]);
      setSt(null);
      setNisn("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Confetti show={party > 0} key={party} />
      <Card>
        <div className="mb-2 flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-guru text-sm text-white">1</span> Ketik NISN siswa
        </div>
        <div className="flex gap-2">
          <input
            value={nisn}
            inputMode="numeric"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 10);
              setNisn(v);
              if (v.length === 10) find(v);
              else setSt(null);
            }}
            placeholder="10 digit NISN"
            className={`${inputCls} font-data text-lg`}
          />
          <Button variant="teal" loading={finding} onClick={() => find()} icon={Search}>
            Cari
          </Button>
        </div>

        <AnimatePresence>
          {st && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 rounded-2xl bg-teal-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-guru text-white">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-lg font-bold leading-tight">{st.student.nama}</div>
                    <div className="text-sm text-slate-600">Kelas {st.student.kelas}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-data text-xl font-bold text-guru">
                      {st.active.length}/{st.maxBooks}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">dipinjam</div>
                  </div>
                </div>
                {st.active.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {st.active.map((l) => (
                      <div key={l.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-slate-600">• {l.book?.judul}</span>
                        {l.late > 0 ? <span className="shrink-0 font-bold text-red-600">telat {l.late} hr</span> : <span className="shrink-0 text-slate-400">s/d {fmtShort(l.due_date)}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className={st ? "" : "pointer-events-none opacity-50"}>
        <div className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-guru text-sm text-white">2</span> Scan buku
        </div>
        {st ? <Scanner onResult={addCode} continuous accent="#0D9488" hint="Bisa scan beberapa buku berturut-turut" /> : <div className="rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-500">Cari siswa dulu</div>}
      </Card>

      {queue.length > 0 && (
        <Card className="lg:col-span-2">
          <div className="mb-3 font-display text-lg font-bold">Buku yang akan dipinjam</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <AnimatePresence>
              {queue.map((q) => (
                <motion.div key={q.code} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 40 }} className={`flex items-center gap-3 rounded-2xl p-2.5 ${q.status === "tersedia" ? "bg-slate-50" : "bg-red-50"}`}>
                  <Cover src={q.book?.cover_url} alt={q.book?.judul || q.code} className="w-10 shrink-0" rounded="rounded-md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{q.loading ? "Memeriksa..." : q.book?.judul || q.code}</div>
                    <div className="text-xs">
                      {q.error ? (
                        <span className="font-semibold text-red-600">{q.error}</span>
                      ) : q.status === "dipinjam" ? (
                        <span className="font-semibold text-red-600">Masih dipinjam {q.borrower?.nama} ({q.borrower?.kelas})</span>
                      ) : q.status === "hilang" ? (
                        <span className="font-semibold text-red-600">Tercatat hilang</span>
                      ) : (
                        <span className="font-data text-slate-500">{q.code}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setQueue((x) => x.filter((y) => y.code !== q.code))} className="rounded-full p-1.5 text-slate-400 hover:bg-white">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {over && <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Sisa kuota siswa ini {quota} buku. Kurangi daftar di atas.</div>}
          <Button variant="teal" className="mt-4 w-full" loading={saving} disabled={!ok.length || over} onClick={save} icon={Check}>
            Simpan peminjaman ({ok.length} buku)
          </Button>
        </Card>
      )}
    </div>
  );
}

// ═════════════════════════════════ KEMBALI
function KembaliTab() {
  const toast = useToast();
  const [prev, setPrev] = useState(null);
  const [kondisi, setKondisi] = useState("baik");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [party, setParty] = useState(0);
  const [log, setLog] = useState([]);

  const check = async (code) => {
    setChecking(true);
    try {
      const r = await rpc("guru.returnPreview", { code });
      setPrev(r);
      setKondisi(r.copy?.kondisi || "baik");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setChecking(false);
    }
  };

  const accept = async () => {
    setSaving(true);
    try {
      const r = await rpc("guru.returnConfirm", { loanId: prev.loan.id, kondisi });
      const nama = prev.loan.student?.nama;
      if (r.points > 0) {
        setParty((p) => p + 1);
        toast.success(`Diterima! ${nama} dapat +${r.points} poin`);
      } else toast.success(r.late ? `Diterima (terlambat ${r.late} hari, tanpa poin)` : "Diterima");
      setLog((l) => [{ judul: prev.copy.book?.judul, nama, late: r.late, points: r.points, at: Date.now() }, ...l].slice(0, 8));
      setPrev(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Confetti show={party > 0} key={party} count={18} />
      <Card>
        <div className="mb-3 font-display text-lg font-bold">Scan buku yang dikembalikan</div>
        <Scanner onResult={check} continuous busy={checking} accent="#2563EB" hint="Tidak perlu NISN. Data peminjam muncul otomatis." />
      </Card>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {prev ? (
            <motion.div key={prev.copy?.qr_code} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <div className="flex gap-4">
                  <Cover src={prev.copy?.book?.cover_url} alt={prev.copy?.book?.judul} className="w-20 shrink-0 shadow-card" rounded="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg font-bold leading-tight">{prev.copy?.book?.judul}</div>
                    <div className="font-data text-xs text-slate-400">{prev.copy?.qr_code}</div>
                    {prev.loan && (
                      <div className="mt-2 text-sm">
                        <div className="font-bold">
                          {prev.loan.student?.nama} <span className="font-normal text-slate-500">· {prev.loan.student?.kelas}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Pinjam {fmtDate(prev.loan.borrowed_at)} · Jatuh tempo {fmtDate(prev.loan.due_date)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {prev.loan ? (
                  <>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`mt-4 rounded-2xl p-3 text-center font-display text-lg font-bold ${prev.loan.late ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {prev.loan.late ? `Terlambat ${prev.loan.late} hari` : "Tepat waktu 👍"}
                    </motion.div>
                    <div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Kondisi buku</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {Object.entries(KONDISI).map(([k, v]) => (
                        <motion.button key={k} whileTap={{ scale: 0.94 }} onClick={() => setKondisi(k)} className={`rounded-2xl border-2 py-2.5 text-sm font-bold transition ${kondisi === k ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600"}`}>
                          {v.label}
                        </motion.button>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="soft" className="flex-1" onClick={() => setPrev(null)}>
                        Batal
                      </Button>
                      <Button variant="teal" className="flex-1" loading={saving} onClick={accept} icon={Check}>
                        Terima
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{prev.message}</div>
                )}
              </Card>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="text-center">
                <div className="animate-float text-5xl">📥</div>
                <div className="mt-2 font-display font-bold">Siap menerima buku</div>
                <p className="text-sm text-slate-500">Scan stiker QR buku yang dikembalikan.</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {log.length > 0 && (
          <Card>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Baru saja diterima</div>
            <div className="space-y-1.5">
              {log.map((l) => (
                <motion.div key={l.at} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    <b>{l.nama}</b> · {l.judul}
                  </span>
                  {l.points > 0 ? <Chip className="bg-amber-100 text-amber-700">+{l.points}</Chip> : l.late ? <Chip className="bg-red-100 text-red-700">telat</Chip> : null}
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════ SEDANG DIPINJAM
function AktifTab() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, loading, reload } = useRpc("guru.activeLoans");
  const [q, setQ] = useState("");
  const [lateOnly, setLateOnly] = useState(false);

  const rows = useMemo(() => {
    if (!data) return [];
    const s = q.toLowerCase();
    return data.filter(
      (l) => (!lateOnly || l.late > 0) && (!s || [l.student?.nama, l.student?.nisn, l.book?.judul, l.copy?.qr_code].some((v) => String(v || "").toLowerCase().includes(s)))
    );
  }, [data, q, lateOnly]);

  const lost = async (l) => {
    const ok = await confirm({ title: "Tandai buku hilang?", message: `"${l.book?.judul}" yang dipinjam ${l.student?.nama} akan dicatat hilang.`, danger: true, ok: "Tandai hilang" });
    if (!ok) return;
    try {
      await rpc("guru.markLost", { loanId: l.id });
      toast.success("Dicatat sebagai hilang");
      reload(true);
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (loading && !data) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput value={q} onChange={setQ} placeholder="Cari nama, NISN, judul, atau kode..." className="flex-1" />
        <button onClick={() => setLateOnly((v) => !v)} className={`rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-95 ${lateOnly ? "bg-red-600 text-white" : "bg-white text-slate-600 shadow-card"}`}>
          Terlambat saja ({data.filter((l) => l.late > 0).length})
        </button>
      </div>
      {rows.length === 0 ? (
        <Empty emoji="✨" title="Tidak ada data" text={data.length ? "Coba kata kunci lain." : "Belum ada buku yang dipinjam."} />
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          {rows.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-100">
              <Cover src={l.book?.cover_url} alt={l.book?.judul} className="w-11 shrink-0" rounded="rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{l.book?.judul}</div>
                <div className="truncate text-xs text-slate-500">
                  {l.student?.nama} · {l.student?.kelas} · <span className="font-data">{l.copy?.qr_code}</span>
                </div>
                <div className="mt-1">{l.late > 0 ? <Chip className="bg-red-100 text-red-700">Terlambat {l.late} hari</Chip> : <Chip className="bg-slate-100 text-slate-600">s/d {fmtShort(l.due_date)}</Chip>}</div>
              </div>
              <button onClick={() => lost(l)} title="Tandai hilang" className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
                <Ghost className="h-5 w-5" />
                <span className="text-[10px] font-bold">Hilang</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
