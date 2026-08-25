"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function BookCard({ book, onClick, size = "md" }) {
  const sizes = {
    sm: "w-24",
    md: "w-32",
    lg: "w-full",
  };
  const cover =
    book.cover_url ||
    `https://placehold.co/300x450/EF4444/FFFFFF/png?text=${encodeURIComponent(
      book.judul.substring(0, 16)
    )}&font=montserrat`;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${sizes[size]} flex-shrink-0 text-left group`}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-card bg-slate-100">
        <img
          src={cover}
          alt={book.judul}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        {book.rating > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-slate-700">
              {book.rating.toFixed(1)}
            </span>
          </div>
        )}
        {book.badge && (
          <div className="absolute top-1.5 left-1.5 bg-siswa-red text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {book.badge}
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="font-display font-semibold text-sm text-slate-900 line-clamp-2 leading-tight">
          {book.judul}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">{book.kategori}</div>
      </div>
    </motion.button>
  );
}
