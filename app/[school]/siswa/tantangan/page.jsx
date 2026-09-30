"use client";
import { motion } from "framer-motion";
import { Page } from "@/components/AppShell";
import { Card, Spinner, ErrorBox, PageHero } from "@/components/ui";
import { ChallengeRow, ClassChallenge } from "@/components/StudentBits";
import { useRpc } from "@/lib/client";

export default function Tantangan() {
  const { data: d, error, loading, reload } = useRpc("siswa.overview");
  if (loading && !d) return <Spinner label="Mengambil tantangan..." />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const list = [...d.weekly, ...d.guru];
  const selesai = list.filter((c) => c.done).length;

  return (
    <div>
      <PageHero from="#F97316" to="#EF4444" className="pb-16 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Reading Challenge</div>
          <h1 className="font-display text-3xl font-bold">Tantangan Kamu</h1>
          <p className="text-sm text-white/85">Selesaikan tantangan, kumpulkan poin, naik level!</p>
          <div className="mt-4 flex gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
              <div className="font-data text-2xl font-bold">{d.points.total}</div>
              <div className="text-[11px] font-semibold text-white/80">Total poin</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
              <div className="font-data text-2xl font-bold">
                {selesai}/{list.length}
              </div>
              <div className="text-[11px] font-semibold text-white/80">Selesai minggu ini</div>
            </div>
          </div>
        </Page>
      </PageHero>

      <Page className="-mt-8 space-y-8 pb-4">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Minggu ini</h2>
              <span className="text-xs font-bold text-slate-400">Ganti tiap Senin</span>
            </div>
            <div className="space-y-2">
              {list.map((c, i) => (
                <ChallengeRow key={c.id} c={c} i={i} />
              ))}
            </div>
            {list.length && list.every((c) => c.done) ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-3 rounded-2xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700">
                Semua tantangan minggu ini beres! Tantangan baru datang hari Senin.
              </motion.div>
            ) : null}
          </Card>
          <div>
            <ClassChallenge cc={d.classChallenge} />
            <p className="mt-3 px-2 text-xs text-slate-500">Tantangan kelas dikerjakan bersama. Kalau tercapai, semua anggota kelas dapat poin. Saling ingatkan ya!</p>
          </div>
        </div>
      </Page>
    </div>
  );
}
