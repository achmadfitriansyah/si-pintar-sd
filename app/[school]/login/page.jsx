"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, LogIn, GraduationCap, Users, BookOpen } from "lucide-react";
import { useSchool } from "@/components/SchoolContext";
import { SchoolLogo } from "@/components/AppShell";
import { Spinner } from "@/components/ui";
import { rpc } from "@/lib/client";

const ROLES = [
  { id: "siswa", label: "Siswa", icon: BookOpen, color: "#EF4444", to: "#F97316", idLabel: "NISN", idPh: "10 digit NISN", emoji: "🧒" },
  { id: "ortu", label: "Orang Tua", icon: Users, color: "#7C3AED", to: "#DB2777", idLabel: "NISN anak", idPh: "NISN anak Anda", emoji: "👨‍👩‍👧" },
  { id: "guru", label: "Guru", icon: GraduationCap, color: "#0D9488", to: "#1E3A8A", idLabel: "Username", idPh: "admin", emoji: "🧑‍🏫" },
];

const DEMO = {
  siswa: { username: "0012345678", password: "123456" },
  ortu: { username: "0012345678", password: "123456" },
  guru: { username: "admin", password: "admin" },
};

export default function LoginPage() {
  const { slug, school, me, refresh } = useSchool();
  const router = useRouter();
  const [role, setRole] = useState("siswa");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const r = ROLES.find((x) => x.id === role);

  useEffect(() => {
    if (me) router.replace(`/${slug}/${me.role}`);
  }, [me, slug, router]);

  const pickRole = (id) => {
    setRole(id);
    setError("");
    setUsername("");
    setPassword("");
  };

  const fillDemo = (id) => {
    setRole(id);
    setError("");
    setUsername(DEMO[id].username);
    setPassword(DEMO[id].password);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await rpc("auth.login", { slug, role, username, password });
      await refresh();
      router.replace(res.mustChange && !school?.is_demo ? `/${slug}/guru/ganti-password` : `/${slug}/${role}`);
    } catch (err) {
      setError(err.message);
      setShake((s) => s + 1);
      setLoading(false);
    }
  };

  if (!school) return <div className="paper flex min-h-dvh items-center justify-center bg-brand-cream"><Spinner /></div>;

  return (
    <main className="paper relative min-h-dvh bg-brand-cream">
      <motion.div className="absolute inset-x-0 top-0 h-[46vh] lg:hidden" animate={{ background: `linear-gradient(160deg, ${r.color}, ${r.to})` }} transition={{ duration: 0.4 }} style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} />

      <div className="relative mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10">
        {/* Panel kiri (layar lebar) */}
        <motion.div className="relative hidden h-[80vh] overflow-hidden rounded-[2.5rem] p-10 text-white lg:flex lg:flex-col lg:justify-between" animate={{ background: `linear-gradient(160deg, ${r.color}, ${r.to})` }} transition={{ duration: 0.4 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/85 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Beranda
          </Link>
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={role} initial={{ scale: 0.6, rotate: -10, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="text-8xl">
                {r.emoji}
              </motion.div>
            </AnimatePresence>
            <h2 className="mt-6 font-display text-4xl font-bold leading-tight">Selamat datang di perpustakaan {school.short_name || school.name}</h2>
            <p className="mt-3 max-w-md text-white/85">Membaca hari ini, sukses esok hari.</p>
          </div>
          <div className="text-xs font-semibold text-white/70">SI-PINTAR SD</div>
        </motion.div>

        {/* Form */}
        <div className="px-5 pb-10 pt-6 lg:px-0 lg:py-0">
          <div className="mb-6 flex items-center justify-between text-white lg:hidden">
            <Link href="/" className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <ArrowLeft className="h-4 w-4" /> Beranda
            </Link>
            {school.is_demo && <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-600">MODE DEMO</span>}
          </div>
          <div className="mb-6 text-center text-white lg:text-left lg:text-slate-900">
            <div className="mb-3 flex justify-center lg:justify-start">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
                <SchoolLogo school={school} accent="rgba(255,255,255,.25)" size={64} />
              </motion.div>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight">{school.name}</h1>
            <p className="mt-1 text-sm opacity-85 lg:text-slate-500">Masuk ke SI-PINTAR SD</p>
          </div>

          <motion.div key={shake} animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}} transition={{ duration: 0.4 }} className="mx-auto max-w-md rounded-[2rem] bg-white p-5 shadow-card sm:p-7">
            <div className="mb-5 flex gap-1 rounded-2xl bg-slate-100 p-1.5">
              {ROLES.map((x) => {
                const Icon = x.icon;
                const active = x.id === role;
                return (
                  <button key={x.id} type="button" onClick={() => pickRole(x.id)} className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition ${active ? "text-white" : "text-slate-500"}`}>
                    {active && <motion.div layoutId="login-pill" className="absolute inset-0 rounded-xl" style={{ background: x.color }} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative">{x.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{r.idLabel}</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(role === "guru" ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode={role === "guru" ? "text" : "numeric"}
                  autoComplete="username"
                  placeholder={r.idPh}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 font-data text-lg outline-none transition focus:bg-white"
                  style={{ borderColor: username ? r.color : undefined }}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Password</span>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••"
                    className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-lg outline-none transition focus:bg-white"
                    style={{ borderColor: password ? r.color : undefined }}
                  />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileTap={{ scale: 0.96 }} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-lg font-bold text-white shadow-lg disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${r.color}, ${r.to})` }}>
                {loading ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>📖</motion.span> : <LogIn className="h-5 w-5" />}
                {loading ? "Masuk..." : "Masuk"}
              </motion.button>
            </form>

            {school.is_demo && (
              <div className="mt-6 border-t border-dashed border-slate-200 pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-400">Coba cepat sebagai</div>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((x) => (
                    <motion.button key={x.id} type="button" whileTap={{ scale: 0.93 }} whileHover={{ y: -2 }} onClick={() => fillDemo(x.id)} className="flex flex-col items-center gap-1 rounded-2xl border-2 border-slate-100 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-200">
                      <span className="text-2xl">{x.emoji}</span>
                      {x.label}
                    </motion.button>
                  ))}
                </div>
                <p className="mt-2 text-center text-[11px] text-slate-400">Mengisi form otomatis, lalu tekan Masuk.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
