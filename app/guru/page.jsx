"use client";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, Award, Search, Flame } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  PieChart, Pie,
} from "recharts";
import Ribbon from "@/components/Ribbon";
import {
  currentUser, kelasStats, siswaAktif, kategoriPopuler, aktivitasMingguan,
} from "@/lib/dummy";

export default function GuruDashboard() {
  const u = currentUser.guru;

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-14 h-14 rounded-2xl bg-guru-teal flex items-center justify-center text-3xl">
          {u.avatar}
        </div>
        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase">
            Selamat datang
          </div>
          <div className="font-display font-bold text-xl text-guru-slate">
            {u.nama}
          </div>
          <div className="text-sm text-slate-600">{u.kelas}</div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <KpiCard
          icon={Users}
          label="Total Siswa"
          value={kelasStats.total_siswa}
          note={`${kelasStats.siswa_aktif_minggu_ini} aktif minggu ini`}
          color="teal"
        />
        <KpiCard
          icon={BookOpen}
          label="Peminjaman"
          value={kelasStats.total_pinjam_minggu_ini}
          note="minggu ini"
          color="blue"
        />
        <KpiCard
          icon={TrendingUp}
          label="Rata-rata Baca"
          value={kelasStats.rata_buku_per_siswa}
          note="buku/siswa"
          color="purple"
        />
        <KpiCard
          icon={Award}
          label="Partisipasi"
          value={`${Math.round((kelasStats.siswa_aktif_minggu_ini / kelasStats.total_siswa) * 100)}%`}
          note="siswa aktif"
          color="orange"
        />
      </motion.div>

      {/* Activity chart */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="teal">Aktivitas Kelas Mingguan</Ribbon>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="text-xs text-slate-500 mb-3">
            Total menit membaca per hari (semua siswa)
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aktivitasMingguan}>
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
                <Bar dataKey="menit" radius={[8, 8, 0, 0]}>
                  {aktivitasMingguan.map((_, i) => (
                    <Cell key={i} fill={i < 5 ? "#0D9488" : "#94A3B8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>

      {/* Kategori populer */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="teal">Kategori Paling Dipinjam</Ribbon>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-5">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kategoriPopuler}
                    dataKey="jumlah"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={3}
                  >
                    {kategoriPopuler.map((k, i) => (
                      <Cell key={i} fill={k.warna} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {kategoriPopuler.map((k) => (
                <div key={k.kategori} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: k.warna }}
                  />
                  <span className="flex-1 text-slate-700">{k.kategori}</span>
                  <span className="font-data font-bold text-slate-900">
                    {k.jumlah}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Siswa list */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="teal">Monitoring Siswa</Ribbon>
        </div>
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Cari nama siswa..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-guru-teal"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {siswaAktif.map((s, i) => (
              <motion.div
                key={s.nama}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-guru-teal/10 text-guru-teal font-display font-bold flex items-center justify-center">
                  {s.nama.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">
                    {s.nama}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{s.buku_dibaca} buku</span>
                    <span>•</span>
                    <span>{s.poin.toLocaleString("id-ID")} poin</span>
                    {s.streak > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-orange-600">
                          <Flame className="w-3 h-3" />
                          {s.streak}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.status === "aktif"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {s.status === "aktif" ? "Aktif" : "Perlu perhatian"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, note, color }) {
  const colors = {
    teal: "bg-teal-50 text-guru-teal",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" strokeWidth={2.2} />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
          {label}
        </div>
        <div className="font-data font-bold text-2xl text-guru-slate mt-0.5">
          {value}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">{note}</div>
      </div>
    </div>
  );
}
