"use client";
import { motion } from "framer-motion";
import {
  BookOpen, Calendar, Clock, Award, Flame, CheckCircle2, XCircle,
  MessageCircle, Bell, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import Ribbon from "@/components/Ribbon";
import {
  currentUser, anakStats, aktivitasMingguan, bukuTerakhirDibaca,
} from "@/lib/dummy";

export default function OrtuDashboard() {
  const u = currentUser.ortu;
  const anak = u.anak;

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Greeting + child header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-ortu-purple to-purple-700 text-white rounded-3xl p-5 shadow-card relative overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 text-8xl opacity-15">📚</div>
        <div className="relative">
          <div className="text-xs opacity-90">Selamat datang,</div>
          <div className="font-display font-bold text-lg">{u.nama}</div>
          <div className="mt-4 bg-white/15 backdrop-blur rounded-2xl p-3 flex items-center gap-3">
            <div className="text-4xl">{anak.avatar}</div>
            <div className="flex-1">
              <div className="text-[10px] opacity-90 uppercase font-semibold">Anak Anda</div>
              <div className="font-display font-bold">{anak.nama}</div>
              <div className="text-xs opacity-90">Kelas {anak.kelas} · SDN 001 Balikpapan Selatan</div>
            </div>
            <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center tap">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Highlight stats */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="purple">Laporan Anak</Ribbon>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={BookOpen} label="Buku Dibaca" value={anakStats.buku_dibaca} unit="buku" color="purple" />
          <StatCard icon={Calendar} label="Hari Aktif" value={anakStats.hari_aktif} unit="hari" color="pink" />
          <StatCard icon={Clock} label="Minggu Ini" value={anakStats.menit_baca_minggu} unit="menit" color="amber" />
          <StatCard icon={Flame} label="Streak" value={anakStats.streak} unit="hari" color="red" />
        </div>
      </motion.section>

      {/* Weekly activity chart */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="purple">Grafik Aktivitas Membaca</Ribbon>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">
                Menit membaca per hari
              </div>
              <div className="font-display font-bold text-2xl text-slate-900 mt-1">
                {anakStats.menit_baca_minggu} <span className="text-sm text-slate-500 font-normal">menit</span>
              </div>
            </div>
            <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +18% vs minggu lalu
            </div>
          </div>
          <div className="h-40 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aktivitasMingguan}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hari"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v) => [`${v} menit`, "Baca"]}
                />
                <Area
                  type="monotone"
                  dataKey="menit"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  fill="url(#grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>

      {/* Buku terakhir dibaca */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="purple">Aktivitas Terakhir</Ribbon>
        </div>
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          {bukuTerakhirDibaca.map((b, i) => (
            <div
              key={i}
              className={`p-4 flex items-center gap-3 ${
                i < bukuTerakhirDibaca.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                {b.selesai ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <BookOpen className="w-5 h-5 text-ortu-purple" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900 truncate">
                  {b.judul}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {b.tanggal} · {b.durasi}
                </div>
              </div>
              <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {b.selesai ? "Selesai" : "Sedang baca"}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Saran pendampingan */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="purple">Saran untuk Anda</Ribbon>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <div className="font-display font-bold text-slate-900">
                Ajak Arga baca bersama sore ini!
              </div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Arga sudah baca 5 hari berturut-turut. Sabtu-Minggu belum ada aktivitas — 
                waktu tepat untuk <span className="font-semibold text-orange-700">family reading time</span>.
              </p>
              <div className="flex gap-2 mt-3">
                <button className="text-xs font-semibold px-3 py-1.5 bg-white rounded-lg shadow-sm text-slate-700 tap">
                  Ingatkan jam 4 sore
                </button>
                <button className="text-xs font-semibold px-3 py-1.5 bg-ortu-purple text-white rounded-lg tap flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Chat Guru
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit, color }) {
  const colors = {
    purple: "bg-purple-50 text-ortu-purple",
    pink: "bg-pink-50 text-pink-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" strokeWidth={2.2} />
      </div>
      <div className="mt-3">
        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
          {label}
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <div className="font-data font-bold text-2xl text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{unit}</div>
        </div>
      </div>
    </div>
  );
}
