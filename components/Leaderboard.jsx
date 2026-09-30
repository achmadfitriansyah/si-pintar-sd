"use client";
import { motion } from "framer-motion";
import { Spinner, ErrorBox, Empty } from "./ui";
import Icon from "./Icon";
import { useRpc } from "@/lib/client";
import { fmtMonth, monthKey } from "@/lib/time";

const PODIUM = [
  { place: 2, h: 96, bg: "linear-gradient(180deg,#E2E8F0,#94A3B8)", medal: "peringkat/medali-2", delay: 0.25 },
  { place: 1, h: 132, bg: "linear-gradient(180deg,#FDE68A,#F59E0B)", medal: "peringkat/medali-1", delay: 0.1 },
  { place: 3, h: 76, bg: "linear-gradient(180deg,#FED7AA,#EA580C)", medal: "peringkat/medali-3", delay: 0.4 },
];

/** Papan peringkat kelas bulan ini (siswa & orang tua) */
export default function Leaderboard({ accent = "#8B5CF6", meLabel = "Kamu" }) {
  const { data, error, loading, reload } = useRpc("siswa.leaderboard");
  if (loading && !data) return <Spinner label="Menghitung peringkat..." />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const rows = data.rows;
  if (!rows.length) return <Empty icon="peringkat/garis-finis" title="Belum ada data" />;
  const top = [rows[1], rows[0], rows[2]];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="rounded-[2rem] bg-gradient-to-b from-amber-50 to-white p-5 shadow-card">
        <div className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
          Kelas {data.kelas} · {fmtMonth(monthKey())}
        </div>
        <div className="flex items-end justify-center gap-3 pt-8">
          {PODIUM.map((p, idx) => {
            const r = top[idx];
            if (!r) return <div key={p.place} className="flex-1" />;
            return (
              <div key={p.place} className="flex max-w-[120px] flex-1 flex-col items-center">
                {p.place === 1 && (
                  <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: "spring" }}>
                    <Icon name="peringkat/mahkota" size={36} className="mb-1" />
                  </motion.div>
                )}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: p.delay + 0.35, type: "spring", stiffness: 300, damping: 14 }} className={`flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card ${r.isMe ? "ring-4" : ""}`} style={{ "--tw-ring-color": accent }}>
                  <Icon name={r.levelIcon} size={40} />
                </motion.div>
                <div className="mt-1 w-full truncate text-center text-xs font-bold">{r.nama.split(" ")[0]}</div>
                {r.isMe && <div className="text-[10px] font-bold" style={{ color: accent }}>({meLabel})</div>}
                <div className="font-data text-xs font-bold text-slate-600">{r.month} poin</div>
                <motion.div initial={{ height: 0 }} animate={{ height: p.h }} transition={{ delay: p.delay, type: "spring", stiffness: 120, damping: 16 }} className="mt-1.5 flex w-full items-start justify-center rounded-t-2xl pt-2" style={{ background: p.bg }}>
                  <Icon name={p.medal} size={40} />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.04 }}
            className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ${r.isMe ? "ring-2" : "ring-1 ring-slate-100"}`}
            style={r.isMe ? { "--tw-ring-color": accent } : undefined}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-data text-sm font-bold ${r.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{r.rank}</div>
            <Icon name={r.levelIcon} size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">
                {r.nama} {r.isMe && <span style={{ color: accent }}>({meLabel})</span>}
              </div>
              <div className="text-xs text-slate-500">
                Level {r.level}
              </div>
            </div>
            <div className="text-right">
              <div className="font-data font-bold">{r.month}</div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">poin</div>
            </div>
          </motion.div>
        ))}
        <p className="px-2 pt-1 text-xs text-slate-500">Peringkat dihitung dari poin bulan ini dan diulang setiap awal bulan. Total poin dan level tetap tersimpan.</p>
      </div>
    </div>
  );
}
