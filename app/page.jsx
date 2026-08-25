"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Users, BookOpen, ArrowRight, Sparkles } from "lucide-react";

const roles = [
  {
    id: "siswa",
    title: "Siswa",
    subtitle: "Baca, tantangan, dan raih poin!",
    href: "/siswa",
    icon: BookOpen,
    color: "from-siswa-red to-red-600",
    bgAccent: "bg-siswa-yellow",
    emoji: "📚",
  },
  {
    id: "guru",
    title: "Guru",
    subtitle: "Pantau aktivitas & kelola koleksi",
    href: "/guru",
    icon: GraduationCap,
    color: "from-guru-teal to-teal-700",
    bgAccent: "bg-teal-100",
    emoji: "🎓",
  },
  {
    id: "ortu",
    title: "Orang Tua",
    subtitle: "Dampingi perkembangan literasi anak",
    href: "/ortu",
    icon: Users,
    color: "from-ortu-purple to-purple-700",
    bgAccent: "bg-ortu-cream",
    emoji: "👨‍👩‍👧",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 via-yellow-50 to-red-50 paper overflow-hidden">
      {/* Bendera merah putih di atas */}
      <div className="absolute top-0 inset-x-0 h-3 bg-siswa-red" />
      <div className="absolute top-3 inset-x-0 h-3 bg-white" />

      <div className="relative max-w-md mx-auto px-6 pt-16 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur border border-red-200 rounded-full text-xs font-semibold text-red-700 mb-4">
            <Sparkles className="w-3 h-3" />
            SDN 001 Balikpapan Selatan
          </div>
          <h1 className="font-display font-bold text-4xl text-slate-900 leading-tight">
            SI-PINTAR <span className="text-siswa-red">SD</span>
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-xs mx-auto">
            Sistem Perpustakaan Interaktif dan Literasi Terpadu
          </p>
        </motion.div>

        {/* Mascot / illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative flex justify-center mb-6"
        >
          <div className="relative">
            <div className="text-7xl animate-float">📖</div>
            <div className="absolute -top-2 -right-2 text-2xl animate-[wiggle_1s_ease-in-out_infinite]">✨</div>
            <div className="absolute -bottom-1 -left-3 text-xl animate-[wiggle_1.4s_ease-in-out_infinite]">⭐</div>
          </div>
        </motion.div>

        {/* Ribbon: Pilih Peran */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="ribbon ribbon-red text-lg">Pilih Peran Kamu</div>
        </motion.div>

        {/* Role cards */}
        <div className="space-y-3">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              >
                <Link href={role.href} className="block group tap">
                  <div
                    className={`relative rounded-3xl bg-gradient-to-br ${role.color} p-5 shadow-card overflow-hidden`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-6 -right-4 w-20 h-20 bg-white/10 rounded-full" />

                    <div className="relative flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl flex-shrink-0">
                        {role.emoji}
                      </div>
                      <div className="flex-1 min-w-0 text-white">
                        <div className="font-display font-bold text-xl">
                          {role.title}
                        </div>
                        <div className="text-sm text-white/85 mt-0.5">
                          {role.subtitle}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Motto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 mb-1">
            <span>BERIMAN</span><span>·</span>
            <span>SEHAT</span><span>·</span>
            <span>RAMAH</span><span>·</span>
            <span>INOVATIF</span><span>·</span>
            <span>BERSERI</span>
          </div>
          <p className="font-display text-siswa-red font-semibold text-sm">
            "Membaca Hari Ini, Sukses Esok Hari!"
          </p>
        </motion.div>
      </div>
    </main>
  );
}
