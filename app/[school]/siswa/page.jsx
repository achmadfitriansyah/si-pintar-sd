"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useSchool } from "@/components/SchoolContext";
import { Page } from "@/components/AppShell";
import { Card, ProgressBar, Spinner, ErrorBox, PageHero } from "@/components/ui";
import Icon from "@/components/Icon";
import { ChallengeRow, ClassChallenge, LoanCard } from "@/components/StudentBits";
import { useRpc, firstName } from "@/lib/client";
import { fmtShort } from "@/lib/time";

function greeting() {
  const h = new Date(Date.now() + 8 * 3600e3).getUTCHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function SiswaHome() {
  const { slug } = useSchool();
  const { data: d, error, loading, reload } = useRpc("siswa.overview");

  if (loading && !d) return <Spinner label="Membuka beranda..." />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const challenges = [...d.weekly, ...d.guru];
  const doneCount = challenges.filter((c) => c.done).length;

  return (
    <div>
      <PageHero from="#EF4444" to="#F97316" className="pb-24 pt-6 lg:rounded-b-[3rem]">
        <Page>
          <div className="flex items-center gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/25 backdrop-blur">
              <Icon name={d.level.icon} size={48} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white/85">{greeting()},</div>
              <h1 className="truncate font-display text-3xl font-bold">Hai, {firstName(d.student.nama)}!</h1>
              <div className="text-sm text-white/85">Kelas {d.student.kelas}</div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-white/15 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>
                Level {d.level.level} · {d.level.name}
              </span>
              <span className="font-data">{d.points.total} poin</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={d.level.pct} max={100} color="#FDE047" track="rgba(255,255,255,.25)" height={12} />
            </div>
            <div className="mt-1.5 text-xs text-white/85">{d.level.next ? `${d.level.toNext} poin lagi ke Level ${d.level.next.level} (${d.level.next.name})` : "Level tertinggi! Hebat sekali!"}</div>
          </div>
        </Page>
      </PageHero>

      <Page className="-mt-16 space-y-5">
        {/* Angka cepat */}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon="status/poin" label="Poin bulan ini" value={d.points.month} />
          <Stat icon="peringkat/mahkota" label="Peringkat kelas" value={`#${d.rank}`} sub={`dari ${d.classSize}`} />
          <Stat icon="tantangan/kembali-tepat" label="Minggu beruntun" value={d.streak || 0} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Buku yang dipinjam */}
          <section>
            <SectionHead title="Buku yang kupinjam" href={`/${slug}/siswa/buku-saya`} extra={`${d.active.length}/${d.school.max_books}`} />
            {d.active.length ? (
              <div className="space-y-2">
                {d.active.map((l, i) => (
                  <LoanCard key={l.id} l={l} i={i} />
                ))}
              </div>
            ) : (
              <Link href={`/${slug}/siswa/koleksi`} className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-red-200 bg-white/70 p-5 active:scale-[.98] transition">
                <Icon name="status/buku-tersedia" size={48} />
                <div>
                  <div className="font-display font-bold">Belum ada buku dipinjam</div>
                  <div className="text-sm text-slate-500">Pilih buku di Koleksi, lalu pinjam lewat guru</div>
                </div>
              </Link>
            )}
          </section>

          {/* Tantangan minggu ini */}
          <section>
            <SectionHead title="Tantangan minggu ini" href={`/${slug}/siswa/tantangan`} extra={`${doneCount}/${challenges.length} selesai`} />
            <div className="space-y-2">
              {challenges.slice(0, 4).map((c, i) => (
                <ChallengeRow key={c.id} c={c} i={i} />
              ))}
            </div>
          </section>
        </div>

        <ClassChallenge cc={d.classChallenge} />

        {d.recentPoints.length > 0 && (
          <section>
            <SectionHead title="Poin terbaru" />
            <Card className="divide-y divide-slate-100 p-0 sm:p-0">
              {d.recentPoints.slice(0, 5).map((e, i) => (
                <motion.div key={e.id || e.ref_key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                    <Icon name="status/poin" size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{e.reason}</div>
                    <div className="text-xs text-slate-400">{fmtShort(e.created_at)}</div>
                  </div>
                  <div className="font-data font-bold text-amber-600">+{e.amount}</div>
                </motion.div>
              ))}
            </Card>
          </section>
        )}

        <p className="pb-4 text-center font-display text-sm font-semibold text-brand">&ldquo;Membaca Hari Ini, Sukses Esok Hari!&rdquo;</p>
      </Page>

          </div>
  );
}

function Stat({ icon, label, value, sub }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} className="rounded-3xl bg-white p-3 text-center shadow-card">
      <Icon name={icon} size={36} className="mx-auto mb-1" />
      <div className="font-data text-xl font-bold leading-tight">
        {value} {sub && <span className="text-xs font-semibold text-slate-400">{sub}</span>}
      </div>
      <div className="text-[11px] font-semibold leading-tight text-slate-500">{label}</div>
    </motion.div>
  );
}

function SectionHead({ title, href, extra }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="flex items-center gap-2">
        {extra && <span className="text-xs font-bold text-slate-400">{extra}</span>}
        {href && (
          <Link href={href} className="flex items-center text-xs font-bold text-brand">
            Lihat <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
