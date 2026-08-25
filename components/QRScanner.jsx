"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, XCircle } from "lucide-react";

export default function QRScanner({ onScan, onClose }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("initializing");
  const [error, setError] = useState(null);

  useEffect(() => {
    let scanner;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        scanner = new Html5Qrcode("qr-reader-region");
        setStatus("scanning");

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          (decoded) => {
            onScan(decoded);
            scanner.stop().catch(() => {});
          },
          () => {} // ignore per-frame errors
        );
      } catch (e) {
        setError(
          e?.message?.includes("Permission")
            ? "Aplikasi butuh izin kamera. Coba refresh dan izinkan akses kamera."
            : "Kamera tidak bisa diakses. Pastikan browser mendukung dan HTTPS aktif."
        );
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (scanner) scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <span className="font-display font-semibold">Scan QR Buku</span>
        </div>
        <button onClick={onClose} className="p-2 tap">
          <XCircle className="w-7 h-7" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div
          id="qr-reader-region"
          ref={containerRef}
          className="w-full max-w-sm aspect-square"
        />

        {status === "scanning" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-60 h-60 border-4 border-white/80 rounded-3xl relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-siswa-yellow shadow-[0_0_20px_#FCD34D] animate-[float_2s_linear_infinite]" />
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-white text-sm font-semibold whitespace-nowrap">
                Arahkan kamera ke QR
              </span>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-white text-center px-8">
            <div className="text-6xl mb-3">📷</div>
            <div className="font-display font-semibold text-lg mb-2">
              Tidak bisa buka kamera
            </div>
            <p className="text-sm text-white/80">{error}</p>
          </div>
        )}
      </div>

      <p className="text-center text-white/60 text-xs pb-8 px-6">
        Cari kode QR di sampul atau bagian belakang buku
      </p>
    </motion.div>
  );
}
