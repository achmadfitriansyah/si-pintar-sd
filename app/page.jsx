"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, School, PlayCircle } from "lucide-react";
import { Ribbon } from "@/components/ui";
import Icon from "@/components/Icon";

const choices = [
  {
    href: "/demo/login",
    title: "Coba Demo",
    sub: "Sudah berisi data contoh. Tidak perlu daftar.",
    icon: PlayCircle,
    tag: "Coba dulu",
    from: "#F59E0B",
    to: "#EF4444",
    pic: "status/balon-buku",
  },
  {
    href: "/sdn001balsel/login",
    title: "SDN 001 Balikpapan Selatan",
    sub: "Masuk sebagai siswa, orang tua, atau guru.",
    icon: School,
    tag: "Masuk",
    from: "#0D9488",
    to: "#1E3A8A",
    pic: "status/sekolah",
  },
];

export default function Landing() {
  return (
    <main className="paper relative min-h-dvh overflow-hidden bg-brand-cream">
      <div className="absolute inset-x-0 top-0 h-2 bg-brand" />
      <div className="absolute inset-x-0 top-2 h-2 bg-white" />
      <FloatingDecor />

      <div className="relative mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:px-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center lg:text-left">
          <div className="mb-4 flex justify-center lg:justify-start">
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 3.2 }} >
              <Icon name="kategori/semua" size={96} />
            </motion.div>
          </div>
          <h1 className="font-display text-5xl font-bold leading-none text-slate-900 sm:text-6xl">
            SI-PINTAR <span className="text-brand">SD</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-600 lg:mx-0 lg:text-lg">
            Aplikasi perpustakaan untuk SD. Peminjaman dicatat lewat scan QR, siswa dapat poin dari membaca, dan orang tua bisa melihat buku yang dibaca anaknya.
          </p>
          <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
            {[["status/balon-buku", "Scan QR"], ["tantangan/umum", "Tantangan"], ["status/laporan", "Laporan PDF"], ["peran/ortu", "Pantauan ortu"]].map(([ic, f]) => (
              <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-soft">
                <Icon name={ic} size={22} />
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        <div>
          <Ribbon className="mb-6">Pilih Sekolah</Ribbon>
          <div className="space-y-4">
            {choices.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.href} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 200, damping: 22 }}>
                  <Link href={c.href} className="group block">
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-card"
                      style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                    >
                      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                      <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />
                      <div className="relative flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/25 backdrop-blur"><Icon name={c.pic} size={48} /></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">{c.tag}</div>
                          <div className="font-display text-2xl font-bold leading-tight">{c.title}</div>
                          <div className="mt-1 text-sm text-white/85">{c.sub}</div>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 transition group-hover:translate-x-1">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                      <Icon className="absolute -bottom-3 left-4 h-16 w-16 text-white/10" />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <div className="font-display font-semibold text-brand">&ldquo;Membaca Hari Ini, Sukses Esok Hari!&rdquo;</div>
            <Link href="/kebijakan-privasi" className="mt-3 inline-block text-xs font-semibold text-slate-500 underline">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FloatingDecor() {
  const items = [
    { e: "konfeti/bintang", x: "8%", y: "18%", d: 0 },
    { e: "konfeti/buku", x: "88%", y: "12%", d: 0.6 },
    { e: "konfeti/percik", x: "80%", y: "78%", d: 1.2 },
    { e: "peringkat/medali-1", x: "6%", y: "82%", d: 0.3 },
  ];
  return items.map((it) => (
    <motion.div
      key={it.e}
      className="pointer-events-none absolute hidden opacity-80 sm:block"
      style={{ left: it.x, top: it.y }}
      animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
      transition={{ repeat: Infinity, duration: 4, delay: it.d }}
    >
      <Icon name={it.e} size={44} />
    </motion.div>
  ));
}
