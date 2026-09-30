"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Search, BookOpen } from "lucide-react";
import { useEffect } from "react";
import Icon from "./Icon";

export function Ribbon({ children, color = "#EF4444", dark = "#B91C1C", className = "" }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="ribbon text-base sm:text-lg" style={{ "--rb": color, "--rbd": dark }}>
        {children}
      </div>
    </div>
  );
}

export function Button({ children, variant = "primary", loading, className = "", icon: Icon, ...rest }) {
  const v = {
    primary: "bg-brand text-white shadow-pop",
    dark: "bg-slate-900 text-white",
    teal: "bg-guru text-white shadow-[0_10px_24px_-10px_rgba(13,148,136,.7)]",
    purple: "bg-ortu text-white",
    soft: "bg-slate-100 text-slate-700",
    white: "bg-white text-slate-800 shadow-card",
    danger: "bg-red-50 text-red-600",
    ghost: "text-slate-600 hover:bg-slate-100",
  }[variant];
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold transition disabled:opacity-50 ${v} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : Icon ? <Icon className="h-5 w-5" /> : null}
      {children}
    </motion.button>
  );
}

export function Card({ children, className = "", ...rest }) {
  return (
    <div className={`rounded-3xl bg-white p-4 shadow-card sm:p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Spinner({ label = "Memuat..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <motion.div animate={{ y: [0, -10, 0], rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 1.1 }}>
        <Icon name="kategori/semua" size={48} />
      </motion.div>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

export function Empty({ icon = "status/kosong", title, text, action }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-3 animate-float">
        <Icon name={icon} size={88} />
      </div>
      <div className="font-display text-lg font-bold text-slate-800">{title}</div>
      {text && <p className="mt-1 max-w-xs text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="mx-auto my-10 max-w-sm rounded-3xl bg-white p-6 text-center shadow-card">
      <Icon name="status/error" size={72} className="mx-auto" />
      <div className="mt-2 font-display text-lg font-bold">Ada yang tidak beres</div>
      <p className="mt-1 text-sm text-slate-500">{error?.message || "Gagal memuat data"}</p>
      {onRetry && (
        <Button variant="dark" className="mt-4" onClick={() => onRetry()}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white placeholder:text-slate-400";

export function Input(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${inputCls} ${props.className || ""}`}>
      {children}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder = "Cari...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-12`} />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Lembar bawah di HP, dialog di tengah di layar lebar */
export function Modal({ open, onClose, title, children, wide = false, footer }) {
  useEffect(() => {
    if (!open) return;
    const o = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = o);
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/50 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className={`flex max-h-[92dvh] w-full flex-col rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem] ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
            <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3 sm:pt-5">
              <h3 className="font-display text-xl font-bold text-slate-900">{title}</h3>
              <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 transition active:scale-90">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
            {footer && <div className="border-t border-slate-100 px-5 py-4 pb-safe">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ProgressBar({ value, max, color = "#EF4444", track = "#F1F5F9", height = 10, delay = 0.1 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ background: track, height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 14, delay }}
      />
    </div>
  );
}

/** Tab dengan pil yang meluncur */
export function Tabs({ tabs, value, onChange, color = "#EF4444", id = "tabs" }) {
  return (
    <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-card">
      {tabs.map((t) => {
        const active = t.value === value;
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-bold transition ${active ? "text-white" : "text-slate-500"}`}
          >
            {active && <motion.div layoutId={`pill-${id}`} className="absolute inset-0 rounded-xl" style={{ background: color }} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
            {Icon && <Icon className="relative z-10 h-4 w-4" />}
            <span className="relative z-10">{t.label}</span>
            {t.badge ? <span className="relative z-10 rounded-full bg-white/25 px-1.5 text-xs">{t.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function Cover({ src, alt = "", className = "", rounded = "rounded-2xl" }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 ${rounded} ${className}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-slate-400">
          <BookOpen className="h-8 w-8" />
          <span className="line-clamp-3 text-[10px] font-bold">{alt}</span>
        </div>
      )}
    </div>
  );
}

export function Chip({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
}

/** Keterangan jatuh tempo yang ramah */
export function DueChip({ due, late }) {
  if (late > 0) return <Chip className="bg-red-100 text-red-700">Terlambat {late} hari</Chip>;
  const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
  const d = Math.round((Date.parse(due) - Date.parse(today)) / 864e5);
  if (d <= 0) return <Chip className="bg-amber-100 text-amber-700">Kembalikan hari ini</Chip>;
  if (d === 1) return <Chip className="bg-amber-100 text-amber-700">Besok jatuh tempo</Chip>;
  return <Chip className="bg-emerald-100 text-emerald-700">{d} hari lagi</Chip>;
}

export function PageHero({ children, from = "#EF4444", to = "#F97316", className = "" }) {
  return (
    <div className={`relative overflow-hidden text-white ${className}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 1.5px, transparent 1.5px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="relative">{children}</div>
    </div>
  );
}

export const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } },
};
