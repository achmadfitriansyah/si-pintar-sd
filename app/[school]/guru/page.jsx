"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, BookCopy, AlertTriangle, Users, Library, ScanLine, Undo2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useSchool } from "@/components/SchoolContext";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Card, Spinner, ErrorBox, ProgressBar, Cover, Chip, stagger } from "@/components/ui";
import { useRpc } from "@/lib/client";
import { fmtShort, fmtDate } from "@/lib/time";

export default function GuruDashboard() {
  const { slug, school, me } = useSchool();
  const { data: d, error, loading, reload } = useRpc("guru.dashboard");
  const hour = new Date(Date.now() + 8 * 3600e3).getUTCHours();
  const hello = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <Page>
      <GuruHeader
        icon="status/sapa"
        title={`${hello}!`}
        sub={`${school?.name} · ${fmtDate(new Date())}`}
        actions={
          <>
            <Link href={`/${slug}/guru/sirkulasi?tab=pinjam`} className="flex items-center gap-2 rounded-2xl bg-guru px-4 py-2.5 text-sm font-bold text-white shadow-card active:scale-95 transition">
              <ScanLine className="h-4 w-4" /> Pinjam
            </Link>
            <Link href={`/${slug}/guru/sirkulasi?tab=kembali`} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-card active:scale-95 transition">
              <Undo2 className="h-4 w-4" /> Kembali
            </Link>
          </>
        }
      />
      {error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : loading && !d ? (
        <Spinner />
      ) : (
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-5">
          <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi icon={ArrowUpRight} color="#0D9488" label="Dipinjam hari ini" value={d.today.pinjam} />
            <Kpi icon={ArrowDownLeft} color="#2563EB" label="Kembali hari ini" value={d.today.kembali} />
            <Kpi icon={BookCopy} color="#7C3AED" label="Sedang dipinjam" value={d.activeCount} sub={d.dueToday ? `${d.dueToday} jatuh tempo hari ini` : null} />
            <Kpi icon={AlertTriangle} color="#DC2626" label="Terlambat" value={d.overdue.length} warn={d.overdue.length > 0} />
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3">
            <motion.div variants={stagger.item} className="lg:col-span-2">
              <Card>
                <div className="mb-1 font-display text-lg font-bold">Sirkulasi 14 hari terakhir</div>
                <div className="mb-3 flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> Pinjam
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Kembali
                  </span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d.days.map((x) => ({ ...x, label: fmtShort(x.date) }))} margin={{ left: -24, right: 8, top: 6 }}>
                      <defs>
                        <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 20px rgba(0,0,0,.1)" }} />
                      <Area type="monotone" name="Pinjam" dataKey="pinjam" stroke="#0D9488" strokeWidth={2.5} fill="url(#gp)" />
                      <Area type="monotone" name="Kembali" dataKey="kembali" stroke="#2563EB" strokeWidth={2.5} fill="url(#gk)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
            <motion.div variants={stagger.item}>
              <Card className="h-full">
                <div className="mb-3 font-display text-lg font-bold">Perpustakaan</div>
                <div className="space-y-3">
                  <Row icon={Users} label="Siswa aktif" value={d.counts.students} href={`/${slug}/guru/siswa`} />
                  <Row icon={Library} label="Judul buku" value={d.counts.books} href={`/${slug}/guru/buku`} />
                  <Row icon={BookCopy} label="Eksemplar" value={d.counts.copies} href={`/${slug}/guru/buku`} />
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <motion.div variants={stagger.item}>
              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-display text-lg font-bold">Buku terlambat</div>
                  <Link href={`/${slug}/guru/sirkulasi?tab=aktif`} className="text-xs font-bold text-guru">
                    Semua pinjaman →
                  </Link>
                </div>
                {d.overdue.length === 0 ? (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">Tidak ada buku terlambat</div>
                ) : (
                  <div className="space-y-2">
                    {d.overdue.slice(0, 6).map((l) => (
                      <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-red-50/60 p-2.5">
                        <Cover src={l.book?.cover_url} alt={l.book?.judul} className="w-9 shrink-0" rounded="rounded-md" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold">{l.book?.judul}</div>
                          <div className="text-xs text-slate-500">
                            {l.student?.nama} · {l.student?.kelas}
                          </div>
                        </div>
                        <Chip className="bg-red-100 text-red-700">{l.late} hari</Chip>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={stagger.item}>
              <Card>
                <div className="mb-1 font-display text-lg font-bold">Tantangan kelas bulan ini</div>
                <div className="mb-3 text-xs text-slate-500">Pengembalian tepat waktu per kelas</div>
                {d.classes.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada data siswa.</p>
                ) : (
                  <div className="space-y-3">
                    {d.classes.map((c, i) => (
                      <div key={c.kelas}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-bold">Kelas {c.kelas}</span>
                          <span className="font-data text-xs font-bold text-slate-500">
                            {c.value}/{c.target}
                          </span>
                        </div>
                        <ProgressBar value={c.value} max={c.target} color={c.value >= c.target ? "#10B981" : "#0D9488"} height={8} delay={i * 0.05} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </Page>
  );
}

function Kpi({ icon: Icon, color, label, value, sub, warn }) {
  return (
    <motion.div whileHover={{ y: -3 }} className={`rounded-3xl bg-white p-4 shadow-card ${warn ? "ring-2 ring-red-200" : ""}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${color}1A`, color }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-data text-3xl font-bold">{value}</div>
      <div className="text-xs font-bold text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] font-semibold text-amber-600">{sub}</div>}
    </motion.div>
  );
}

function Row({ icon: Icon, label, value, href }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100">
      <Icon className="h-5 w-5 text-guru" />
      <span className="flex-1 text-sm font-semibold text-slate-600">{label}</span>
      <span className="font-data text-lg font-bold">{value}</span>
    </Link>
  );
}
