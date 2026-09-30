"use client";
import { motion } from "framer-motion";
import { Check, Users } from "lucide-react";
import { ProgressBar, Cover, DueChip } from "./ui";
import Icon from "./Icon";
import { fmtShort } from "@/lib/time";

/** Kartu satu tantangan (mingguan / guru) */
export function ChallengeRow({ c, accent = "#F97316", i = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.06 }}
      className={`flex items-center gap-3 rounded-2xl p-3 ${c.done ? "bg-emerald-50" : "bg-white shadow-soft ring-1 ring-slate-100"}`}
    >
      <motion.div
        animate={c.done ? { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.6, delay: 0.3 + i * 0.06 }}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.done ? "bg-emerald-500" : "bg-orange-50"}`}
      >
        {c.done ? <Check className="h-6 w-6 text-white" strokeWidth={3} /> : <Icon name={c.icon || "tantangan/umum"} size={30} />}
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          {c.source === "guru" && <span className="mt-0.5 shrink-0 rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">GURU</span>}
          <div className={`line-clamp-2 text-sm font-bold leading-snug ${c.done ? "text-emerald-800" : "text-slate-800"}`}>{c.title}</div>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar value={c.value} max={c.target} color={c.done ? "#10B981" : accent} height={7} delay={0.2 + i * 0.06} />
          </div>
          <span className="font-data text-xs font-bold text-slate-500">
            {c.value}/{c.target}
          </span>
        </div>
      </div>
      <div className={`shrink-0 rounded-full px-2 py-1 font-data text-xs font-bold ${c.done ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"}`}>+{c.points}</div>
    </motion.div>
  );
}

/** Tantangan kelas bulan ini */
export function ClassChallenge({ cc, compact }) {
  if (!cc) return null;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white shadow-card">
      <Icon name="tantangan/kelas" size={110} className="absolute -right-4 -top-4 opacity-25" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
          <Users className="h-4 w-4" /> Tantangan Kelas {cc.kelas}
        </div>
        <div className="mt-1 font-display text-lg font-bold leading-tight">{cc.title}</div>
        <div className="mt-3 flex items-end gap-2">
          <span className="font-data text-4xl font-bold">{Math.min(cc.value, cc.target)}</span>
          <span className="pb-1 text-lg text-white/70">/ {cc.target}</span>
          {cc.done && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-1 ml-auto rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-slate-900">
              TERCAPAI! +{cc.reward}
            </motion.span>
          )}
        </div>
        <div className="mt-2">
          <ProgressBar value={cc.value} max={cc.target} color={cc.done ? "#FDE047" : "#fff"} track="rgba(255,255,255,.25)" height={12} />
        </div>
        {!compact && (
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs font-semibold text-white/85">
            <span>Kontribusimu: {cc.mine}</span>
            <span>Sisa {cc.daysLeft} hari</span>
            <span>Hadiah +{cc.reward} poin untuk semua</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Kartu buku yang sedang dipinjam */
export function LoanCard({ l, i = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-100">
      <Cover src={l.cover_url || l.book?.cover_url} alt={l.judul || l.book?.judul} className="w-12 shrink-0" rounded="rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm font-bold leading-tight">{l.judul || l.book?.judul}</div>
        <div className="mt-1 text-xs text-slate-500">Jatuh tempo {fmtShort(l.due_date)}</div>
      </div>
      <DueChip due={l.due_date} late={l.late} />
    </motion.div>
  );
}
