"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Gift, Award, TrendingUp, TrendingDown, Minus, Star, Crown, Medal } from "lucide-react";
import Ribbon from "@/components/Ribbon";
import { currentUser, poinHistory, rewardKatalog, leaderboard } from "@/lib/dummy";

const tabs = [
  { id: "history", label: "Riwayat", icon: TrendingUp },
  { id: "reward", label: "Tukar", icon: Gift },
  { id: "leaderboard", label: "Papan Skor", icon: Trophy },
];

export default function PoinPage() {
  const [tab, setTab] = useState("history");
  const u = currentUser.siswa;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white pt-8 pb-16 px-5 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 text-8xl opacity-15">⭐</div>
        <div className="relative text-center">
          <div className="text-xs font-semibold uppercase opacity-90">Poin Kamu</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Star className="w-8 h-8 fill-yellow-300 text-yellow-300" />
            <span className="font-data font-bold text-5xl">
              {u.poin.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="text-sm opacity-90 mt-1">Level {u.level} — {u.levelLabel}</div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="px-5 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-card p-1.5 grid grid-cols-3 gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 tap ${
                  active ? "text-white" : "text-slate-500"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-purple-500 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panels */}
      <div className="px-5 mt-5 pb-6">
        {tab === "history" && <HistoryPanel />}
        {tab === "reward" && <RewardPanel poin={u.poin} />}
        {tab === "leaderboard" && <LeaderboardPanel />}
      </div>
    </div>
  );
}

function HistoryPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Riwayat Poin
      </div>
      {poinHistory.map((h, i) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 line-clamp-1">
              {h.aktivitas}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{h.tanggal}</div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-purple-600">+{h.poin}</div>
            <div className="text-[10px] text-slate-400 uppercase">poin</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function RewardPanel({ poin }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Tukar Poin dengan Hadiah
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rewardKatalog.map((r, i) => {
          const affordable = poin >= r.poin;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-2xl shadow-card p-4 ${
                !affordable ? "opacity-60" : ""
              }`}
            >
              <div className="text-4xl text-center">{r.emoji}</div>
              <div className="font-display font-semibold text-sm text-center mt-2 leading-tight">
                {r.nama}
              </div>
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-600">
                  <Star className="w-3 h-3 fill-current" />
                  {r.poin.toLocaleString("id-ID")}
                </div>
              </div>
              <button
                disabled={!affordable}
                className={`mt-3 w-full py-2 rounded-xl text-xs font-semibold tap ${
                  affordable
                    ? "bg-purple-500 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {affordable ? "Tukar" : `Kurang ${(r.poin - poin).toLocaleString("id-ID")}`}
              </button>
              <div className="text-[10px] text-center text-slate-400 mt-1">
                Sisa {r.stock}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function LeaderboardPanel() {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Top 3 podium */}
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Papan Skor Kelas 2A · Bulan Ini
      </div>

      <div className="relative bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-100 rounded-3xl p-4 border-2 border-yellow-200">
        <div className="flex items-end justify-around gap-2">
          {/* 2nd place */}
          {top3[1] && (
            <PodiumPlayer player={top3[1]} height="h-20" bgColor="bg-slate-300" medal="🥈" />
          )}
          {/* 1st place */}
          {top3[0] && (
            <PodiumPlayer player={top3[0]} height="h-28" bgColor="bg-yellow-400" medal="🥇" isFirst />
          )}
          {/* 3rd place */}
          {top3[2] && (
            <PodiumPlayer player={top3[2]} height="h-16" bgColor="bg-orange-400" medal="🥉" />
          )}
        </div>
      </div>

      {/* Rest of leaderboard */}
      <div className="mt-4 space-y-2">
        {rest.map((p, i) => (
          <motion.div
            key={p.rank}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl p-3 flex items-center gap-3 shadow-card ${
              p.isMe ? "ring-2 ring-siswa-red" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-data font-bold text-slate-600 text-sm">
              {p.rank}
            </div>
            <div className="text-2xl">{p.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-sm text-slate-800 truncate">
                {p.nama} {p.isMe && <span className="text-[10px] text-siswa-red font-bold">(Kamu)</span>}
              </div>
              <div className="text-[10px] text-slate-500">Kelas {p.kelas}</div>
            </div>
            <TrendIcon trend={p.trend} />
            <div className="text-right">
              <div className="font-data font-bold text-slate-900">
                {p.poin.toLocaleString("id-ID")}
              </div>
              <div className="text-[10px] text-slate-400 uppercase">poin</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PodiumPlayer({ player, height, bgColor, medal, isFirst }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isFirst ? 0.3 : 0.1 }}
      className="flex-1 flex flex-col items-center"
    >
      {isFirst && <Crown className="w-6 h-6 text-yellow-500 fill-yellow-400 -mb-1 relative z-10" />}
      <div className={`text-4xl ${isFirst ? "text-5xl" : ""} ${player.isMe ? "ring-4 ring-siswa-red rounded-full" : ""}`}>
        {player.avatar}
      </div>
      <div className="font-display font-bold text-xs text-slate-800 mt-1 truncate w-full text-center">
        {player.nama.split(" ")[0]}
        {player.isMe && <span className="text-siswa-red"> (Kamu)</span>}
      </div>
      <div className="font-data font-bold text-xs text-slate-700">
        {player.poin.toLocaleString("id-ID")}
      </div>
      <div className={`w-full ${height} ${bgColor} rounded-t-xl mt-1.5 flex items-start justify-center pt-1`}>
        <span className="text-2xl">{medal}</span>
      </div>
    </motion.div>
  );
}

function TrendIcon({ trend }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}
