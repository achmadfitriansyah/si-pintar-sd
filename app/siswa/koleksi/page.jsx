"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, X, Star } from "lucide-react";
import Ribbon from "@/components/Ribbon";
import BookCard from "@/components/BookCard";
import { books, kategoriList } from "@/lib/dummy";

export default function KoleksiPage() {
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (kat !== "all") {
        const catId = b.kategori.toLowerCase().replace(/ /g, "-");
        if (catId !== kat) return false;
      }
      if (q && !b.judul.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, kat]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white pt-8 pb-6 px-5 relative overflow-hidden">
        <div className="absolute -bottom-4 -right-6 text-8xl opacity-15">📚</div>
        <div className="relative">
          <div className="text-xs font-semibold uppercase opacity-90">Perpustakaan</div>
          <h1 className="font-display font-bold text-3xl">Koleksi Buku</h1>
          <p className="text-sm opacity-90 mt-1">Temukan buku seru di sini!</p>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul buku..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 -mt-4">
        <div className="bg-white rounded-2xl shadow-card p-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {kategoriList.map((k) => (
              <button
                key={k.id}
                onClick={() => setKat(k.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all tap ${
                  kat === k.id
                    ? "bg-siswa-red text-white shadow-md"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <span className="mr-1">{k.emoji}</span>
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">{filtered.length}</span> buku ditemukan
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-3 animate-float">📭</div>
            <div className="font-display font-bold text-slate-800">Tidak ada buku</div>
            <div className="text-sm text-slate-500 mt-1">Coba kata kunci lain</div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-4"
          >
            {filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BookCard book={b} size="lg" onClick={() => setSelected(b)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <BookDetailModal book={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function BookDetailModal({ book, onClose }) {
  const cover =
    book.cover_url ||
    `https://placehold.co/300x450/EF4444/FFFFFF/png?text=${encodeURIComponent(book.judul)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto"
      >
        <div className="relative">
          <div className="relative h-56 overflow-hidden">
            <img
              src={cover}
              className="w-full h-full object-cover blur-md scale-110 opacity-40"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            <img
              src={cover}
              alt={book.judul}
              className="absolute left-1/2 top-6 -translate-x-1/2 h-44 w-32 object-cover rounded-2xl shadow-2xl"
            />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow tap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-6 -mt-2">
          <div className="text-xs font-semibold text-siswa-red">{book.kategori}</div>
          <h2 className="font-display font-bold text-2xl text-slate-900 mt-1 leading-tight">
            {book.judul}
          </h2>
          <div className="text-sm text-slate-500 mt-1">{book.penulis}</div>

          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-display font-bold text-lg">{book.rating}</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Rating</div>
            </div>
            <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
              <div className="font-display font-bold text-lg text-green-700">
                {book.stok}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                Tersedia
              </div>
            </div>
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
              <div className="font-data font-bold text-sm text-blue-700">
                {book.kode_qr}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                Kode
              </div>
            </div>
          </div>

          <button className="w-full mt-5 bg-gradient-to-r from-siswa-red to-red-600 text-white font-display font-bold py-3.5 rounded-2xl shadow-pop flex items-center justify-center gap-2 tap">
            <BookOpen className="w-5 h-5" />
            Baca / Pinjam Sekarang
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
