"use client";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Page } from "@/components/AppShell";
import { Card, ProgressBar, Spinner, ErrorBox, BadgeMedal, PageHero, Ribbon } from "@/components/ui";
import { ChallengeRow, ClassChallenge } from "@/components/StudentBits";
import { useRpc } from "@/lib/client";
import { TIERS, TIER_NAMES, TIER_COLORS, badgeInfo } from "@/lib/rules";

export default function Tantangan() {
  const { data: d, error, loading, reload } = useRpc("siswa.overview");
  if (loading && !d) return <Spinner label="Mengambil tantangan..." />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const list = [...d.weekly, ...d.guru];
  const earned = new Set(d.badges.map((b) => b.id));

  return (
    <div>
      <PageHero from="#F97316" to="#EF4444" className="pb-16 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Reading Challenge</div>
          <h1 className="font-display text-3xl font-bold">Tantangan Kamu</h1>
          <p className="text-sm text-white/85">Selesaikan tantangan, kumpulkan poin dan lencana!</p>
          <div className="mt-4 flex gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
              <div className="font-data text-2xl font-bold">{d.points.total}</div>
              <div className="text-[11px] font-semibold text-white/80">Total poin</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
              <div className="font-data text-2xl font-bold">{d.badges.length}</div>
              <div className="text-[11px] font-semibold text-white/80">Lencana</div>
            </div>
          </div>
        </Page>
      </PageHero>

      <Page className="-mt-8 space-y-8">
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
                🎉 Semua tantangan minggu ini beres! Tantangan baru datang hari Senin.
              </motion.div>
            ) : null}
          </Card>
          <div>
            <ClassChallenge cc={d.classChallenge} />
            <p className="mt-3 px-2 text-xs text-slate-500">Tantangan kelas dikerjakan bersama. Kalau tercapai, semua anggota kelas dapat poin. Saling ingatkan ya!</p>
          </div>
        </div>

        <section>
          <Ribbon color="#F97316" dark="#C2410C" className="mb-5">
            Tantangan Berjenjang
          </Ribbon>
          <div className="grid gap-4 sm:grid-cols-2">
            {d.tiers.map((t, i) => (
              <TierCard key={t.id} t={t} i={i} />
            ))}
          </div>
        </section>

        <section className="pb-4">
          <Ribbon color="#8B5CF6" dark="#6D28D9" className="mb-5">
            Koleksi Lencana
          </Ribbon>
          <Card>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8">
              {TIERS.flatMap((t) => t.levels.map((_, i) => badgeInfo(`${t.id}-${i + 1}`))).map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                  <BadgeMedal badge={b} size={52} locked={!earned.has(b.id)} />
                </motion.div>
              ))}
            </div>
          </Card>
        </section>
      </Page>
    </div>
  );
}

function TierCard({ t, i }) {
  const color = TIER_COLORS[Math.max(0, t.done - 1)] || "#CBD5E1";
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
      <Card className="h-full">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${color}33` }}>
            {t.emoji}
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-bold leading-tight">{t.name}</div>
            <div className="text-xs font-semibold text-slate-500">
              {t.done ? `Tingkat ${TIER_NAMES[t.done - 1]} tercapai` : "Belum ada tingkat"} · {t.value} {t.unit}
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: t.total }).map((_, k) => (
            <motion.div
              key={k}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2 + k * 0.08 }}
              className="h-2 flex-1 origin-left rounded-full"
              style={{ background: k < t.done ? TIER_COLORS[k] : "#E2E8F0" }}
            />
          ))}
        </div>
        {t.next ? (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
              <span>
                Menuju {TIER_NAMES[t.done]}: {t.next.target} {t.unit}
              </span>
              <span className="text-amber-600">+{t.next.points}</span>
            </div>
            <ProgressBar value={t.value} max={t.next.target} color={TIER_COLORS[t.done]} height={8} />
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-sky-50 p-2 text-center text-xs font-bold text-sky-700">Semua tingkat selesai! Luar biasa 💎</div>
        )}
        {t.extra && <div className="mt-2 text-xs text-slate-500">Minggu beruntun saat ini: {t.extra.currentStreak}</div>}
        {!t.done && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <Lock className="h-3 w-3" /> Lencana pertama terbuka di {t.next.target} {t.unit}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
