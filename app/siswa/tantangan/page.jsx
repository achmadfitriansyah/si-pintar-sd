"use client";
import { motion } from "framer-motion";
import { Trophy, Flame, Clock, BookMarked, Gift, TrendingUp } from "lucide-react";
import Ribbon from "@/components/Ribbon";
import { activeChallenges, currentUser } from "@/lib/dummy";

const iconMap = { red: Flame, yellow: BookMarked, sky: Clock };
const colorMap = {
  red: { bg: "from-red-500 to-red-600", ring: "ring-red-200" },
  yellow: { bg: "from-yellow-500 to-orange-500", ring: "ring-yellow-200" },
  sky: { bg: "from-sky-500 to-blue-600", ring: "ring-sky-200" },
};

export default function TantanganPage() {
  const u = currentUser.siswa;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white pt-8 pb-6 px-5 relative overflow-hidden">
        <div className="absolute -bottom-4 -right-4 text-8xl opacity-15">🏆</div>
        <div className="relative">
          <div className="text-xs font-semibold uppercase opacity-90">Reading Challenge</div>
          <h1 className="font-display font-bold text-3xl">Tantangan Kamu</h1>
          <p className="text-sm opacity-90 mt-1">
            Selesaikan tantangan, dapatkan poin & badge!
          </p>
        </div>
      </div>

      {/* Featured challenge card */}
      <div className="px-5 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-3xl p-6 shadow-card relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-7xl opacity-20 animate-[wiggle_2s_ease-in-out_infinite]">🏆</div>
            <div className="relative text-white">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/25 rounded-full text-[10px] font-semibold backdrop-blur">
                <Flame className="w-3 h-3" />
                CHALLENGE UTAMA
              </div>
              <h2 className="font-display font-bold text-2xl mt-2 leading-tight">
                Baca 3 Buku Minggu Ini
              </h2>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-data font-bold text-5xl">2</span>
                <span className="text-2xl opacity-80">/ 3</span>
                <span className="text-sm opacity-90 ml-1">buku selesai</span>
              </div>

              {/* Progress ring visual */}
              <div className="mt-3 h-3 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "66.6%" }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  <span>+200 poin & Badge Rajin</span>
                </div>
                <div className="opacity-90">7 hari lagi</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Poin snapshot */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl">
            ⭐
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500 uppercase">Poin Kamu</div>
            <div className="font-display font-bold text-2xl text-slate-900">
              {u.poin.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            +80 minggu ini
          </div>
        </div>
      </div>

      {/* Active challenges */}
      <div className="mt-6">
        <div className="flex justify-center mb-4">
          <Ribbon color="red">Tantangan Aktif</Ribbon>
        </div>

        <div className="px-5 space-y-3">
          {activeChallenges.map((c, i) => {
            const Icon = iconMap[c.color] || Flame;
            const cl = colorMap[c.color];
            const pct = Math.round((c.progress / c.target) * 100);

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className={`bg-white rounded-2xl shadow-card p-4 ring-2 ${cl.ring}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cl.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">
                      {c.kategori}
                    </div>
                    <div className="font-display font-semibold text-slate-900 leading-tight">
                      {c.judul}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <div className="font-data font-bold text-slate-800">
                        {c.progress}/{c.target}
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.7 }}
                          className={`h-full bg-gradient-to-r ${cl.bg} rounded-full`}
                        />
                      </div>
                      <div className="text-slate-500 flex items-center gap-0.5">
                        <Gift className="w-3 h-3" />
                        <span className="font-semibold">+{c.hadiah}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Achievements section */}
      <div className="mt-8">
        <div className="flex justify-center mb-4">
          <Ribbon color="red">Badge Kamu</Ribbon>
        </div>
        <div className="px-5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { emoji: "🌱", label: "Pemula", earned: true },
              { emoji: "📖", label: "Rajin Baca", earned: true },
              { emoji: "🔥", label: "5 Hari", earned: true },
              { emoji: "🏆", label: "Juara Kelas", earned: false },
              { emoji: "🌟", label: "Bintang", earned: false },
              { emoji: "💎", label: "Elit", earned: false },
              { emoji: "🚀", label: "Cepat", earned: false },
              { emoji: "👑", label: "Legenda", earned: false },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="text-center"
              >
                <div
                  className={`aspect-square rounded-2xl flex items-center justify-center text-3xl ${
                    b.earned
                      ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300"
                      : "bg-slate-100 grayscale opacity-50"
                  }`}
                >
                  {b.emoji}
                </div>
                <div className="text-[10px] font-semibold text-slate-600 mt-1">
                  {b.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
