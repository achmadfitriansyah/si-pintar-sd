"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, CheckCircle2, Camera, RotateCcw, BookOpen } from "lucide-react";
import Ribbon from "@/components/Ribbon";
import QRScanner from "@/components/QRScanner";
import { books, currentUser } from "@/lib/dummy";

export default function PinjamPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(null);
  const [manualCode, setManualCode] = useState("");

  const handleScan = (code) => {
    setShowScanner(false);
    const found = books.find((b) => b.kode_qr === code);
    setScanned(
      found
        ? { success: true, book: found, code }
        : { success: false, code }
    );
  };

  const handleManual = () => {
    if (!manualCode.trim()) return;
    handleScan(manualCode.trim());
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-700 text-white pt-8 pb-6 px-5 relative overflow-hidden">
        <div className="absolute -top-4 -right-6 text-8xl opacity-15">📱</div>
        <div className="relative">
          <div className="text-xs font-semibold uppercase opacity-90">Peminjaman</div>
          <h1 className="font-display font-bold text-3xl">Scan QR Buku</h1>
          <p className="text-sm opacity-90 mt-1">
            Pinjam buku dengan sekali scan!
          </p>
        </div>
      </div>

      <div className="px-5 -mt-4">
        {!scanned && (
          <>
            {/* Big scan card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-6 text-center"
            >
              <div className="relative mx-auto w-56 h-56 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                <ScanLine className="w-24 h-24 text-slate-400" strokeWidth={1.5} />
                {/* Corners */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-siswa-red rounded-tl-xl" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-siswa-red rounded-tr-xl" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-siswa-red rounded-bl-xl" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-siswa-red rounded-br-xl" />
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-siswa-red animate-[float_2s_linear_infinite]" />
              </div>

              <button
                onClick={() => setShowScanner(true)}
                className="mt-5 w-full bg-gradient-to-r from-siswa-red to-red-600 text-white font-display font-bold py-4 rounded-2xl shadow-pop flex items-center justify-center gap-2 tap"
              >
                <Camera className="w-5 h-5" />
                Buka Kamera & Scan
              </button>

              <p className="text-xs text-slate-500 mt-3">
                Cari QR code di sampul atau bagian belakang buku
              </p>
            </motion.div>

            {/* OR divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200" />
              <div className="text-xs font-semibold text-slate-400">atau</div>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Manual input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-card p-5"
            >
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Ketik kode manual
              </div>
              <div className="flex gap-2">
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleManual()}
                  placeholder="PPB.01.0001"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-siswa-red focus:outline-none font-data text-slate-800"
                />
                <button
                  onClick={handleManual}
                  className="px-5 py-3 rounded-xl bg-siswa-red text-white font-semibold tap"
                >
                  Cek
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Contoh kode: PPB.01.0001, PPB.02.0001
              </p>
            </motion.div>

            {/* Quick demo tips */}
            <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-900">
              💡 <span className="font-semibold">Untuk demo:</span> ketik salah satu kode
              di atas (PPB.01.0001 sampai PPB.07.0001) untuk simulasi peminjaman.
            </div>
          </>
        )}

        {/* Result */}
        <AnimatePresence>
          {scanned && <ResultPanel result={scanned} onReset={() => { setScanned(null); setManualCode(""); }} />}
        </AnimatePresence>
      </div>

      {/* Scanner overlay */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultPanel({ result, onReset }) {
  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-card p-6 text-center"
      >
        <div className="text-6xl mb-3">❌</div>
        <div className="font-display font-bold text-xl">Kode tidak ditemukan</div>
        <div className="text-sm text-slate-500 mt-1">
          Kode "<span className="font-data font-bold">{result.code}</span>" tidak ada di database
        </div>
        <button
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold tap"
        >
          <RotateCcw className="w-4 h-4" /> Scan Lagi
        </button>
      </motion.div>
    );
  }

  const b = result.book;
  const u = currentUser.siswa;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Confetti burst */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
        {["🎉", "✨", "🎊", "⭐", "🎉"].map((e, i) => (
          <motion.span
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="text-2xl"
          >
            {e}
          </motion.span>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-card p-6 mt-6">
        <div className="flex justify-center mb-3">
          <Ribbon color="red">Peminjaman Sukses!</Ribbon>
        </div>

        <div className="flex gap-4 items-start mt-4">
          <img
            src={b.cover_url}
            className="w-24 h-36 object-cover rounded-xl shadow-md flex-shrink-0"
            alt=""
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-siswa-red">{b.kategori}</div>
            <div className="font-display font-bold text-lg text-slate-900 leading-tight mt-0.5">
              {b.judul}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{b.penulis}</div>
            <div className="font-data text-xs text-slate-400 mt-2">{b.kode_qr}</div>
          </div>
        </div>

        <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-green-900 text-sm">
              Buku dipinjam atas nama
            </div>
            <div className="font-display font-bold text-green-900">
              {u.nama} (Kelas {u.kelas})
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-slate-500 uppercase font-semibold text-[10px]">Kembali</div>
            <div className="font-display font-bold text-slate-900 mt-0.5">7 hari lagi</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-slate-500 uppercase font-semibold text-[10px]">Poin didapat</div>
            <div className="font-display font-bold text-siswa-red mt-0.5">+50 poin</div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold tap flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Scan Lagi
          </button>
          <button className="flex-1 py-3 rounded-2xl bg-siswa-red text-white font-semibold tap flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> Baca
          </button>
        </div>
      </div>
    </motion.div>
  );
}
