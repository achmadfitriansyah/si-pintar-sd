"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Star, Clock, Crown, ChevronRight, Lightbulb } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useSchool } from "@/components/SchoolContext";
import { Page } from "@/components/AppShell";
import { Card, Spinner, ErrorBox, ProgressBar, BadgeMedal, PageHero } from "@/components/ui";
import { LoanCard, ClassChallenge } from "@/components/StudentBits";
import { useRpc, firstName } from "@/lib/client";
import { fmtShort } from "@/lib/time";

export default function OrtuHome() {
  const { slug } = useSchool();
  const { data: d, error, loading, reload } = useRpc("siswa.overview");
  if (loading && !d) return <Spinner label="Membuka laporan anak..." />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const nama = firstName(d.student.nama);
  const pctTepat = d.stats.kembali ? Math.round((d.stats.tepatWaktu / d.stats.kembali) * 100) : 0;
  const chart = d.weeks.map((w, i) => ({ label: i === d.weeks.length - 1 ? "Minggu ini" : fmtShort(w.week), pinjam: w.pinjam }));
  const overdue = d.active.filter((l) => l.late > 0);

  return (
    <div>
      <PageHero from="#7C3AED" to="#DB2777" className="pb-20 pt-6">
        <Page>
          <div className="text-sm text-white/85">Laporan membaca</div>
          <div className="mt-1 flex items-center gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/25 text-4xl backdrop-blur">
              {d.level.emoji}
            </motion.div>
            <div>
              <h1 className="font-display text-3xl font-bold">{d.student.nama}</h1>
              <div className="text-sm text-white/85">
                Kelas {d.student.kelas} · Level {d.level.level} {d.level.name}
              </div>
            </div>
          </div>
          <div className="mt-4 max-w-md">
            <ProgressBar value={d.level.pct} max={100} color="#FDE047" track="rgba(255,255,255,.25)" height={10} />
            <div className="mt-1 text-xs text-white/85">{d.level.next ? `${d.level.toNext} poin lagi ke Level ${d.level.next.level}` : "Level tertinggi!"}</div>
          </div>
        </Page>
      </PageHero>

      <Page className="-mt-12 space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={BookOpen} color="#7C3AED" value={d.stats.totalPinjam} label="Buku dipinjam" sub={`${d.stats.judulBerbeda} judul berbeda`} />
          <Stat icon={Clock} color="#10B981" value={`${pctTepat}%`} label="Kembali tepat waktu" sub={`${d.stats.tepatWaktu} dari ${d.stats.kembali}`} />
          <Stat icon={Star} color="#F59E0B" value={d.points.month} label="Poin bulan ini" sub={`Total ${d.points.total}`} />
          <Stat icon={Crown} color="#DB2777" value={`#${d.rank}`} label="Peringkat kelas" sub={`dari ${d.classSize} siswa`} />
        </div>

        {overdue.length > 0 && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-100">
            <b>Pengingat:</b> {nama} punya {overdue.length} buku yang sudah lewat jatuh tempo. Yuk bantu ingatkan untuk dikembalikan ke perpustakaan.
          </motion.div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="mb-1 font-display text-lg font-bold">Aktivitas meminjam</div>
            <div className="mb-3 text-xs text-slate-500">Jumlah buku yang dipinjam per minggu (8 minggu terakhir)</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ left: -28, right: 4, top: 6 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={44} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#F5F3FF" }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 20px rgba(0,0,0,.1)" }} formatter={(v) => [`${v} buku`, "Dipinjam"]} />
                  <Bar dataKey="pinjam" radius={[8, 8, 0, 0]} animationDuration={900}>
                    {chart.map((_, i) => (
                      <Cell key={i} fill={i === chart.length - 1 ? "#DB2777" : "#A78BFA"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-lg font-bold">Sedang dipinjam</div>
              <Link href={`/${slug}/ortu/riwayat`} className="flex items-center text-xs font-bold text-ortu">
                Riwayat <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {d.active.length ? (
              <div className="space-y-2">
                {d.active.map((l, i) => (
                  <LoanCard key={l.id} l={l} i={i} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">{nama} sedang tidak meminjam buku.</p>
            )}
          </Card>
        </div>

        <Card>
          <div className="mb-3 font-display text-lg font-bold">Lencana {nama}</div>
          {d.badges.length ? (
            <div className="flex flex-wrap gap-3">
              {d.badges.map((b, i) => (
                <motion.div key={b.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 14 }}>
                  <BadgeMedal badge={b} size={54} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Belum ada lencana. Lencana pertama didapat setelah 5 buku berbeda dikembalikan.</p>
          )}
        </Card>

        <ClassChallenge cc={d.classChallenge} compact />

        <div className="flex items-start gap-3 rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100">
          <Lightbulb className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
          <div className="text-sm text-amber-900">
            <div className="font-display text-base font-bold">Ide pendampingan</div>
            {d.active.length
              ? `Tanyakan pada ${nama} tentang isi buku "${d.active[0].judul}". Minta ceritakan tokoh favoritnya, 10 menit saja sudah cukup.`
              : `${nama} sedang tidak meminjam buku. Ajak ke perpustakaan sekolah minggu ini dan pilih buku bersama.`}
          </div>
        </div>
      </Page>
    </div>
  );
}

function Stat({ icon: Icon, color, value, label, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-4 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${color}1A`, color }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-2 font-data text-2xl font-bold">{value}</div>
      <div className="text-xs font-bold text-slate-600">{label}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
    </motion.div>
  );
}
