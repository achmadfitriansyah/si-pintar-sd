"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { useSchool } from "@/components/SchoolContext";
import { Page } from "@/components/AppShell";
import { Card, Cover, Button, PageHero, Ribbon } from "@/components/ui";
import Scanner from "@/components/Scanner";
import Confetti from "@/components/Confetti";
import { useToast } from "@/components/Providers";
import { useRpc, rpc } from "@/lib/client";
import { fmtDate } from "@/lib/time";

export default function Pinjam() {
  const { slug, school } = useSchool();
  const toast = useToast();
  const { data: ov, reload } = useRpc("siswa.overview");
  const [preview, setPreview] = useState(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const check = async (code) => {
    setChecking(true);
    try {
      setPreview(await rpc("loan.preview", { code }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setChecking(false);
    }
  };

  const borrow = async () => {
    setBusy(true);
    try {
      const r = await rpc("loan.borrowSelf", { code: preview.code });
      setDone({ ...r.results[0], book: preview.book });
      setPreview(null);
      reload(true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const active = ov?.active?.length ?? 0;
  const max = ov?.school?.max_books ?? school?.max_books ?? 3;
  const full = active >= max;

  return (
    <div>
      <Confetti show={!!done} key={done?.code} />
      <PageHero from="#10B981" to="#0D9488" className="pb-16 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Peminjaman</div>
          <h1 className="font-display text-3xl font-bold">Pinjam Buku</h1>
          <p className="text-sm text-white/85">Scan stiker QR di buku, konfirmasi, selesai!</p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
            <span className="text-sm font-semibold">Pinjaman aktif</span>
            <div className="flex gap-1.5">
              {Array.from({ length: max }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} className={`h-4 w-4 rounded-full ${i < active ? "bg-yellow-300" : "bg-white/30"}`} />
              ))}
            </div>
            <span className="font-data font-bold">
              {active}/{max}
            </span>
          </div>
        </Page>
      </PageHero>

      <Page className="-mt-8">
        <div className="mx-auto max-w-xl space-y-4">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Card className="text-center">
                  <Ribbon color="#10B981" dark="#047857" className="mb-4">
                    Peminjaman Berhasil!
                  </Ribbon>
                  <motion.div initial={{ rotate: -8, y: 20 }} animate={{ rotate: 0, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="mx-auto w-32">
                    <Cover src={done.book?.cover_url} alt={done.judul} className="shadow-2xl" />
                  </motion.div>
                  <div className="mt-4 font-display text-xl font-bold">{done.judul}</div>
                  <div className="mx-auto mt-3 max-w-xs rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
                    Kembalikan paling lambat <b>{fmtDate(done.due_date)}</b>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Kembalikan tepat waktu untuk dapat <b className="text-amber-600">+10 poin</b>, dan <b className="text-amber-600">+5</b> lagi kalau ini judul baru buatmu ⭐
                  </p>
                  <div className="mt-5 flex gap-2">
                    <Button variant="soft" className="flex-1" icon={RotateCcw} onClick={() => setDone(null)}>
                      Pinjam lagi
                    </Button>
                    <Link href={`/${slug}/siswa`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        Ke beranda
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ) : preview ? (
              <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card>
                  <div className="flex gap-4">
                    <Cover src={preview.book?.cover_url} alt={preview.book?.judul} className="w-24 shrink-0 shadow-card" rounded="rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-violet-600">
                        {preview.book?.category?.emoji} {preview.book?.category?.nama}
                      </div>
                      <div className="font-display text-lg font-bold leading-tight">{preview.book?.judul}</div>
                      <div className="text-sm text-slate-500">{preview.book?.penulis}</div>
                      <div className="mt-2 font-data text-xs text-slate-400">{preview.code}</div>
                    </div>
                  </div>
                  {preview.status === "tersedia" && !full && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="mr-1 inline h-4 w-4" /> Buku tersedia. Lama pinjam {ov?.school?.loan_days ?? school?.loan_days ?? 7} hari.
                    </div>
                  )}
                  {preview.status === "tersedia" && full && <Warn text={`Kamu sudah meminjam ${max} buku. Kembalikan dulu salah satunya ya.`} />}
                  {preview.status === "dipinjam" && <Warn text={preview.borrower?.self ? "Buku ini sedang kamu pinjam." : "Buku ini sedang dipinjam teman lain."} />}
                  {preview.status === "hilang" && <Warn text="Buku ini tercatat hilang. Laporkan ke guru ya." />}
                  <div className="mt-4 flex gap-2">
                    <Button variant="soft" className="flex-1" onClick={() => setPreview(null)}>
                      Batal
                    </Button>
                    <Button className="flex-1" loading={busy} disabled={preview.status !== "tersedia" || full} onClick={borrow}>
                      Pinjam buku ini
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-3 sm:p-4">
                  <Scanner onResult={check} busy={checking} accent="#10B981" />
                </Card>
                {ov?.school?.is_demo && (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="mb-1 flex items-center gap-1 font-bold">
                      <Sparkles className="h-4 w-4" /> Mode demo
                    </div>
                    Belum punya stiker? Ketik salah satu kode contoh: <span className="font-data font-bold">DEMO-0001</span> sampai <span className="font-data font-bold">DEMO-0054</span>. Kode tiap buku juga terlihat di halaman Koleksi.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Page>
    </div>
  );
}

function Warn({ text }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {text}
    </div>
  );
}
