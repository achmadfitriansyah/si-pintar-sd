"use client";
import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Keyboard, ScanLine } from "lucide-react";

/**
 * Scanner kamera + ketik manual.
 * mode="qr"   → stiker QR buku
 * mode="isbn" → barcode ISBN di sampul belakang
 * continuous  → kamera tetap menyala untuk scan berturut-turut (guru)
 */
export default function Scanner({ onResult, mode = "qr", continuous = false, accent = "#EF4444", placeholder, autoStart = false, busy = false, hint }) {
  const rid = useId().replace(/:/g, "");
  const elId = `scan-${rid}`;
  const scanner = useRef(null);
  const last = useRef({ code: "", at: 0 });
  const cb = useRef(onResult);
  cb.current = onResult;
  const [on, setOn] = useState(false);
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState(0);
  const [manual, setManual] = useState("");

  const stop = async () => {
    const s = scanner.current;
    scanner.current = null;
    if (s) {
      try {
        await s.stop();
        s.clear();
      } catch {}
    }
    setOn(false);
  };

  const start = async () => {
    setErr("");
    setOn(true);
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats: F } = await import("html5-qrcode");
      await new Promise((r) => setTimeout(r, 30));
      const formats = mode === "isbn" ? [F.EAN_13, F.EAN_8, F.UPC_A] : [F.QR_CODE, F.CODE_128];
      const s = new Html5Qrcode(elId, { formatsToSupport: formats, verbose: false });
      scanner.current = s;
      await s.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: (w, h) => {
            const m = Math.min(w, h);
            return mode === "isbn" ? { width: Math.floor(w * 0.85), height: Math.floor(m * 0.4) } : { width: Math.floor(m * 0.7), height: Math.floor(m * 0.7) };
          },
          aspectRatio: 1.333,
        },
        (text) => {
          const code = text.trim();
          const now = Date.now();
          if (code === last.current.code && now - last.current.at < 2500) return;
          last.current = { code, at: now };
          navigator.vibrate?.(60);
          setFlash((f) => f + 1);
          cb.current(code);
          if (!continuous) stop();
        },
        () => {}
      );
    } catch (e) {
      const msg = String(e?.message || e);
      setErr(
        /permission|NotAllowed/i.test(msg)
          ? "Izin kamera ditolak. Buka pengaturan browser, izinkan kamera untuk situs ini, lalu coba lagi."
          : /NotFound|Requested device/i.test(msg)
          ? "Kamera tidak ditemukan di perangkat ini. Ketik kodenya saja di bawah."
          : "Kamera tidak bisa dibuka. Pastikan membuka lewat https dan tidak dipakai aplikasi lain."
      );
      await stop();
    }
  };

  useEffect(() => {
    if (autoStart) start();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitManual = (e) => {
    e.preventDefault();
    const v = manual.trim();
    if (!v) return;
    cb.current(v);
    setManual("");
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900" style={{ aspectRatio: on ? "4 / 3" : undefined }}>
        <div id={elId} className={`scanner-box absolute inset-0 ${on ? "" : "hidden"}`} />
        {on && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className={`relative ${mode === "isbn" ? "h-[32%] w-[85%]" : "aspect-square h-[70%]"}`}>
                {["left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl"].map((c) => (
                  <span key={c} className={`absolute h-8 w-8 border-white ${c}`} />
                ))}
                <span className="absolute inset-x-3 h-0.5 animate-scan rounded-full" style={{ background: accent, boxShadow: `0 0 16px ${accent}` }} />
              </div>
            </div>
            <AnimatePresence>
              <motion.div key={flash} initial={{ opacity: flash ? 0.6 : 0 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} className="pointer-events-none absolute inset-0 bg-white" />
            </AnimatePresence>
            <button onClick={stop} className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur active:scale-95">
              <CameraOff className="h-4 w-4" /> Tutup
            </button>
            {busy && <div className="absolute inset-x-0 bottom-3 text-center text-xs font-bold text-white/90">Memeriksa...</div>}
          </>
        )}
        {!on && (
          <button onClick={start} className="flex w-full flex-col items-center gap-3 px-6 py-10 text-white transition active:scale-[.98]">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: accent }}>
              {mode === "isbn" ? <ScanLine className="h-8 w-8" /> : <Camera className="h-8 w-8" />}
            </motion.div>
            <div className="font-display text-lg font-bold">{mode === "isbn" ? "Scan barcode ISBN" : "Buka kamera & scan"}</div>
            <div className="max-w-xs text-center text-xs text-white/70">
              {hint || (mode === "isbn" ? "Arahkan ke barcode di sampul belakang buku" : "Arahkan kamera ke stiker QR di buku")}
            </div>
          </button>
        )}
      </div>

      {err && <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{err}</div>}

      <form onSubmit={submitManual} className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Keyboard className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={manual}
            onChange={(e) => setManual(mode === "isbn" ? e.target.value.replace(/[^0-9Xx-]/g, "") : e.target.value.toUpperCase())}
            placeholder={placeholder || (mode === "isbn" ? "Atau ketik ISBN" : "Atau ketik kode stiker")}
            inputMode={mode === "isbn" ? "numeric" : "text"}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3 pl-12 pr-3 font-data text-slate-900 outline-none focus:border-slate-400"
          />
        </div>
        <motion.button whileTap={{ scale: 0.92 }} disabled={busy} className="rounded-2xl px-5 font-bold text-white disabled:opacity-50" style={{ background: accent }}>
          Cek
        </motion.button>
      </form>
    </div>
  );
}
