"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ScanLine, Trophy, Star, ArrowRight, Flame } from "lucide-react";
import Ribbon from "@/components/Ribbon";
import BookCard from "@/components/BookCard";
import { currentUser, books, readingChallenge } from "@/lib/dummy";

const menu = [
  {
    href: "/siswa/koleksi",
    icon: BookOpen,
    title: "Koleksi Buku",
    subtitle: "Jelajahi",
    bg: "bg-siswa-red",
    text: "text-white",
    emoji: "📚",
  },
  {
    href: "/siswa/pinjam",
    icon: ScanLine,
    title: "Pinjam Buku",
    subtitle: "Scan QR",
    bg: "bg-siswa-sky",
    text: "text-white",
    emoji: "📖",
  },
  {
    href: "/siswa/tantangan",
    icon: Trophy,
    title: "Tantangan",
    subtitle: "Reading challenge",
    bg: "bg-siswa-yellow",
    text: "text-slate-900",
    emoji: "🏆",
  },
  {
    href: "/siswa/poin",
    icon: Star,
    title: "Poin Saya",
    subtitle: `${currentUser.siswa.poin.toLocaleString("id-ID")} poin`,
    bg: "bg-purple-500",
    text: "text-white",
    emoji: "⭐",
  },
];

export default function SiswaBeranda() {
  const u = currentUser.siswa;

  return (
    <div className="min-h-screen">
      {/* Header with wave bottom */}
      <div className="relative bg-gradient-to-br from-siswa-red to-red-600 text-white pb-16">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative px-5 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-3xl">
              {u.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm opacity-90">Selamat pagi,</div>
              <div className="font-display font-bold text-xl truncate">
                Hai, {u.nama.split(" ")[0]}!
              </div>
              <div className="text-xs opacity-90 mt-0.5">Kelas {u.kelas}</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] opacity-80 font-semibold">LEVEL {u.level}</div>
              <div className="text-xs font-bold">{u.levelLabel}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-sm">
              <Flame className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold">Ayo, baca buku hari ini!</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full text-siswa-bg"
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          style={{ height: "40px" }}
        >
          <path
            d="M0,40 C100,0 300,0 400,40 L400,40 L0,40 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Menu Grid */}
      <div className="px-5 -mt-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3"
        >
          {menu.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link href={m.href} className="block tap">
                  <div className={`relative ${m.bg} ${m.text} rounded-3xl p-4 shadow-card overflow-hidden aspect-square flex flex-col justify-between`}>
                    <div className="absolute -top-3 -right-3 text-6xl opacity-20">
                      {m.emoji}
                    </div>
                    <Icon className="w-7 h-7 relative" strokeWidth={2.5} />
                    <div className="relative">
                      <div className="font-display font-bold text-lg leading-tight">
                        {m.title}
                      </div>
                      <div className="text-xs opacity-90 mt-0.5">{m.subtitle}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Reading Challenge Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-5 mt-6"
      >
        <div className="flex justify-center mb-3">
          <Ribbon color="red">Tantangan Minggu Ini</Ribbon>
        </div>
        <Link href="/siswa/tantangan" className="block tap">
          <div className="bg-white rounded-3xl p-5 shadow-card border-2 border-yellow-200 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-3xl animate-[wiggle_2s_ease-in-out_infinite]">🏆</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {readingChallenge.deskripsi}
            </div>
            <div className="font-display font-bold text-2xl text-slate-900 mt-1">
              {readingChallenge.progress}<span className="text-slate-400">/{readingChallenge.target}</span>
              <span className="text-lg text-slate-500 font-normal ml-1">buku</span>
            </div>
            <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(readingChallenge.progress / readingChallenge.target) * 100}%` }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-siswa-red to-siswa-yellow rounded-full"
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-slate-500">🎁 {readingChallenge.hadiah}</span>
              <span className="font-semibold text-siswa-red flex items-center gap-1">
                Lanjut <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Popular books */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <div className="flex justify-between items-end px-5 mb-3">
          <div>
            <div className="font-display font-bold text-lg text-slate-900">
              🔥 Buku Populer
            </div>
            <div className="text-xs text-slate-500">Paling banyak dibaca minggu ini</div>
          </div>
          <Link href="/siswa/koleksi" className="text-xs font-semibold text-siswa-red">
            Lihat semua →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
          {books.slice(0, 5).map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </motion.div>

      {/* Ajakan literasi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mx-5 mt-6 text-center"
      >
        <div className="text-2xl mb-1">📚✨</div>
        <p className="font-display font-semibold text-siswa-red text-sm">
          "Membaca Hari Ini, Sukses Esok Hari!"
        </p>
      </motion.div>
    </div>
  );
}
