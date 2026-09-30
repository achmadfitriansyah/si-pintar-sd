"use client";
import { motion } from "framer-motion";

export default function GuruHeader({ title, sub, emoji, actions }) {
  return (
    <div className="mb-5 flex flex-col gap-3 pt-5 sm:flex-row sm:items-end sm:justify-between lg:pt-8">
      <div className="flex items-center gap-3">
        {emoji && (
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-guru text-2xl shadow-card">
            {emoji}
          </motion.div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{title}</h1>
          {sub && <p className="text-sm text-slate-500">{sub}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
