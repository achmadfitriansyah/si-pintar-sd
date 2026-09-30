"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import Icon from "./Icon";

const PIECES = ["konfeti/bintang", "konfeti/buku", "konfeti/percik", "konfeti/hati", "konfeti/lingkaran", "konfeti/pita"];

/** Hujan konfeti lucu. show=true untuk memicu (ganti `key` untuk memicu ulang). */
export default function Confetti({ show, count = 26 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 360,
        y: -(180 + Math.random() * 260),
        r: (Math.random() - 0.5) * 540,
        e: PIECES[i % PIECES.length],
        d: Math.random() * 0.15,
        s: 18 + Math.random() * 16,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [show]
  );
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center overflow-hidden">
          {items.map((p) => (
            <motion.span
              key={p.id}
              className="absolute"
              initial={{ x: 0, y: 60, opacity: 1, scale: 0.4, rotate: 0 }}
              animate={{ x: p.x, y: [60, p.y, p.y + 520], opacity: [1, 1, 0], scale: 1, rotate: p.r }}
              transition={{ duration: 1.8, delay: p.d, ease: "easeOut" }}
            >
              <Icon name={p.e} size={p.s + 10} />
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
