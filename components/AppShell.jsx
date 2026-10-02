"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LogOut, MoreHorizontal, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useSchool } from "./SchoolContext";
import { Modal } from "./ui";
import { initials, prefetchRpc } from "@/lib/client";
import { monthKey } from "@/lib/time";
import Icon from "./Icon";
import PasswordForm from "./PasswordForm";

// Data tab yang dipanasi di belakang layar (harus sama persis dengan pemanggilan useRpc di tiap halaman)
const WARM = {
  guru: () => [
    ["guru.activeLoans"], ["guru.meta"], ["guru.books", { q: "", categoryId: null }], ["guru.students", { status: "aktif" }],
    ["guru.challenges"], ["guru.report", { month: monthKey() }], ["guru.settings"],
  ],
  siswa: () => [["siswa.overview"], ["books.catalog", { q: "", categoryId: null }], ["siswa.leaderboard"], ["siswa.loans"]],
  ortu: () => [["siswa.overview"], ["siswa.loans"], ["siswa.leaderboard"]],
};

const THEMES = {
  siswa: { accent: "#EF4444", soft: "#FEE2E2", bg: "bg-brand-cream paper", label: "Siswa" },
  ortu: { accent: "#7C3AED", soft: "#EDE9FE", bg: "bg-ortu-bg paper", label: "Orang Tua" },
  guru: { accent: "#0D9488", soft: "#CCFBF1", bg: "bg-guru-bg", label: "Guru" },
};

/**
 * Kerangka aplikasi:
 * - HP (potret): bar atas tipis + navigasi bawah
 * - Komputer (lebar ≥ 1024px): sidebar kiri, konten melebar mengikuti layar
 */
export default function AppShell({ role, items, children }) {
  const path = usePathname();
  const { slug, school, me, logout } = useSchool();
  const reduce = useReducedMotion();
  const router = useRouter();
  const [more, setMore] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const canPin = role === "siswa" || role === "ortu";
  const t = THEMES[role];
  const base = `/${slug}/${role}`;
  const href = (i) => `${base}${i.href}`;
  const isActive = (i) => (i.href === "" ? path === base : path.startsWith(href(i)));
  const name = me?.student?.nama || me?.admin?.username || "";
  // Setelah halaman pertama tampil: siapkan kode dan data tab lain supaya ketukan pertama tidak menunggu
  useEffect(() => {
    if (navigator.connection?.saveData) return;
    const t = setTimeout(() => {
      items.forEach((i) => router.prefetch(href(i)));
      prefetchRpc(WARM[role]?.() || []);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, slug]);
  const mob = items.filter((i) => i.mobile !== false);
  const mobileItems = mob.length > 5 ? mob.slice(0, 4) : mob;
  const extra = mob.filter((i) => !mobileItems.includes(i));

  return (
    <div className={`min-h-dvh ${t.bg}`}>
      {/* ===== Sidebar desktop ===== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/70 bg-white/90 backdrop-blur lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <SchoolLogo school={school} accent={t.accent} />
          <div className="min-w-0">
            <div className="truncate font-display text-base font-bold leading-tight">{school?.short_name || school?.name}</div>
            <div className="text-xs font-semibold" style={{ color: t.accent }}>
              SI-PINTAR · {t.label}
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((i) => {
            const active = isActive(i);
            const Icon = i.icon;
            return (
              <Link key={i.href} href={href(i)} className="relative flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition hover:bg-slate-50">
                {active && <motion.div layoutId="side-pill" className="absolute inset-0 rounded-2xl" style={{ background: t.soft }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <Icon className="relative h-5 w-5" style={{ color: active ? t.accent : "#64748B" }} strokeWidth={active ? 2.5 : 2} />
                <span className="relative" style={{ color: active ? t.accent : "#334155" }}>
                  {i.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold text-white" style={{ background: t.accent }}>
            {initials(name) || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{name}</div>
            <div className="text-xs text-slate-500">{me?.student ? `Kelas ${me.student.kelas}` : "Admin"}</div>
          </div>
          {canPin && (
            <button onClick={() => setPinOpen(true)} title="Ganti password" className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-800 active:scale-90">
              <KeyRound className="h-5 w-5" />
            </button>
          )}
          <button onClick={logout} title="Keluar" className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-red-600 active:scale-90">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* ===== Bar atas HP ===== */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-white/60 bg-white/80 px-4 py-2.5 backdrop-blur-lg lg:hidden" style={{ paddingTop: "calc(0.6rem + var(--safe-top))" }}>
        <SchoolLogo school={school} accent={t.accent} size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold leading-tight">{school?.short_name || school?.name}</div>
          <div className="truncate text-[11px] font-semibold text-slate-500">{name}</div>
        </div>
        {school?.is_demo && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">DEMO</span>}
        {canPin && (
          <button onClick={() => setPinOpen(true)} aria-label="Ganti password" className="rounded-xl bg-slate-100 p-2 text-slate-600 active:scale-95">
            <KeyRound className="h-4 w-4" />
          </button>
        )}
        <button onClick={logout} className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 active:scale-95">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </header>

      {/* ===== Konten ===== */}
      <main className="pb-28 lg:pl-64 lg:pb-10">
        {/* Animasi masuk saja. Jangan pakai AnimatePresence mode="wait" di sini:
            di Next.js App Router animasi keluar bisa macet dan halaman berhenti transparan. */}
        <motion.div key={path} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
          {children}
        </motion.div>
      </main>

      {/* ===== Navigasi bawah HP ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur-lg pb-safe lg:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1.5">
          {mobileItems.map((i) => {
            const active = isActive(i);
            const Icon = i.icon;
            if (i.fab) {
              return (
                <Link key={i.href} href={href(i)} className="-mt-7 flex flex-col items-center">
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    animate={active ? { rotate: [0, -8, 8, 0] } : {}}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white text-white shadow-pop"
                    style={{ background: `linear-gradient(135deg, ${t.accent}, #F97316)` }}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                  </motion.div>
                  <span className="mt-0.5 text-[10px] font-bold" style={{ color: active ? t.accent : "#64748B" }}>
                    {i.label}
                  </span>
                </Link>
              );
            }
            return (
              <Link key={i.href} href={href(i)} className="relative flex w-16 flex-col items-center py-1.5">
                {active && <motion.div layoutId="nav-pill" className="absolute inset-x-1 inset-y-0 rounded-2xl" style={{ background: t.soft }} transition={{ type: "spring", stiffness: 480, damping: 32 }} />}
                <motion.div whileTap={{ scale: 0.8 }} animate={active ? { y: [0, -3, 0] } : { y: 0 }} transition={{ duration: 0.35 }} className="relative">
                  <Icon className="h-6 w-6" style={{ color: active ? t.accent : "#94A3B8" }} strokeWidth={active ? 2.5 : 2} />
                </motion.div>
                <span className="relative mt-0.5 text-[10px] font-bold" style={{ color: active ? t.accent : "#64748B" }}>
                  {i.label}
                </span>
              </Link>
            );
          })}
          {extra.length > 0 && (
            <button onClick={() => setMore(true)} className="relative flex w-16 flex-col items-center py-1.5">
              <MoreHorizontal className="h-6 w-6" style={{ color: extra.some(isActive) ? t.accent : "#94A3B8" }} />
              <span className="mt-0.5 text-[10px] font-bold text-slate-500">Lainnya</span>
            </button>
          )}
        </div>
      </nav>

      <Modal open={pinOpen} onClose={() => setPinOpen(false)} title="Ganti password">
        {school?.is_demo ? (
          <p className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Tidak tersedia di mode demo, supaya login demo tetap 123456.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">Password awal adalah 123456. Kamu boleh menggantinya kapan saja. Kalau lupa, minta guru untuk mengembalikannya.</p>
            <PasswordForm action="auth.changePin" variant="primary" onDone={() => setPinOpen(false)} />
          </>
        )}
      </Modal>

      <Modal open={more} onClose={() => setMore(false)} title="Menu lainnya">
        <div className="grid grid-cols-3 gap-3">
          {extra.map((i) => {
            const Icon = i.icon;
            return (
              <Link key={i.href} href={href(i)} onClick={() => setMore(false)} className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 active:scale-95 transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: t.accent }}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-center text-xs font-bold">{i.label}</span>
              </Link>
            );
          })}
          <button onClick={logout} className="flex flex-col items-center gap-2 rounded-2xl bg-red-50 p-4 active:scale-95 transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white">
              <LogOut className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-red-600">Keluar</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function SchoolLogo({ school, accent = "#EF4444", size = 40 }) {
  if (school?.logo_url)
    return <img src={school.logo_url} alt="" className="shrink-0 rounded-xl bg-white object-contain" style={{ width: size, height: size }} />;
  return (
    <div className="flex shrink-0 items-center justify-center rounded-xl text-white" style={{ width: size, height: size, background: accent, fontSize: size * 0.5 }}>
      <Icon name="kategori/semua" size={size * 0.7} />
    </div>
  );
}

/** Pembungkus isi halaman: lebar nyaman di HP, melebar di komputer */
export function Page({ children, className = "" }) {
  return <div className={`relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
