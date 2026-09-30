"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Link2, Search, Wand2, RotateCcw, Check, Maximize2, Loader2 } from "lucide-react";
import { Modal, Button, Input, Spinner } from "./ui";
import { useToast } from "./Providers";
import { rpc, uploadImage } from "@/lib/client";
import { loadImage, toCanvas, warp, enhance, toJpeg, fetchViaProxy, COVER_W, COVER_H } from "@/lib/image";

/**
 * Editor cover buku: kamera / file / link / Google Books
 * → luruskan 4 sudut → rapikan cahaya → 600×900 JPEG → unggah
 * onSaved(url) dipanggil setelah berhasil diunggah.
 */
export default function CoverEditor({ open, onClose, onSaved, searchQuery = "", initialUrl = null }) {
  const toast = useToast();
  const [step, setStep] = useState("pick"); // pick | adjust | saving
  const [src, setSrc] = useState(null); // { url, fromCamera }
  const [link, setLink] = useState("");
  const [q, setQ] = useState(searchQuery);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const camRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStep("pick");
    setResults(null);
    setQ(searchQuery);
    setLink("");
    if (initialUrl) takeRemote(initialUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => src?.url && URL.revokeObjectURL(src.url), [src]);

  const takeBlob = (blob, fromCamera) => {
    setSrc({ url: URL.createObjectURL(blob), fromCamera });
    setStep("adjust");
  };

  const takeRemote = async (url) => {
    setLoadingImg(true);
    try {
      takeBlob(await fetchViaProxy(url), false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoadingImg(false);
    }
  };

  const onFile = (e, fromCamera) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) takeBlob(f, fromCamera);
  };

  const search = async (e) => {
    e?.preventDefault();
    setSearching(true);
    try {
      setResults(await rpc("books.searchCovers", { q }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSearching(false);
    }
  };

  const save = async (blob) => {
    setStep("saving");
    try {
      const url = await uploadImage(blob, "cover");
      onSaved(url);
      toast.success("Cover tersimpan");
      onClose();
    } catch (e) {
      toast.error(e.message);
      setStep("adjust");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={step === "pick" ? "Cover buku" : "Rapikan cover"} wide>
      {step === "pick" && (
        <div className="space-y-5">
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e, true)} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e, false)} />
          <div className="grid grid-cols-2 gap-3">
            <SourceBtn icon={Camera} title="Foto pakai kamera" text="Letakkan buku di meja kontras" color="#0D9488" onClick={() => camRef.current?.click()} />
            <SourceBtn icon={ImagePlus} title="Pilih dari galeri" text="Foto atau gambar yang sudah ada" color="#7C3AED" onClick={() => fileRef.current?.click()} />
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Link2 className="h-4 w-4" /> Tempel link gambar
            </div>
            <div className="flex gap-2">
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
              <Button variant="dark" loading={loadingImg} onClick={() => link && takeRemote(link)}>
                Ambil
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Search className="h-4 w-4" /> Cari cover di Google Books
            </div>
            <form onSubmit={search} className="flex gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Judul buku" />
              <Button variant="dark" loading={searching}>
                Cari
              </Button>
            </form>
            {results && results.length === 0 && <p className="mt-3 text-sm text-slate-500">Tidak ada cover ditemukan. Coba foto langsung saja.</p>}
            {results?.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {results.map((r, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => takeRemote(r.cover)} className="text-left">
                    <img src={r.cover} alt="" className="aspect-[2/3] w-full rounded-xl bg-slate-200 object-cover shadow-card" />
                    <div className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-600">{r.judul}</div>
                  </motion.button>
                ))}
              </div>
            )}
            {loadingImg && <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Mengambil gambar...</p>}
          </div>
        </div>
      )}

      {step === "adjust" && src && <DocScanner src={src.url} full={!src.fromCamera} autoEnhance={src.fromCamera} onBack={() => setStep("pick")} onDone={save} />}
      {step === "saving" && <Spinner label="Mengunggah cover..." />}
    </Modal>
  );
}

function SourceBtn({ icon: Icon, title, text, color, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }} onClick={onClick} className="flex flex-col items-start gap-2 rounded-3xl border-2 border-slate-100 bg-white p-4 text-left shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: color }}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="font-display font-bold leading-tight">{title}</div>
      <div className="text-xs text-slate-500">{text}</div>
    </motion.button>
  );
}

/** Geser 4 sudut → luruskan → rapikan cahaya → pratinjau */
function DocScanner({ src, full, autoEnhance, onBack, onDone }) {
  const wrap = useRef(null);
  const work = useRef(null);
  const [dims, setDims] = useState(null); // ukuran kanvas kerja
  const [box, setBox] = useState({ w: 0, h: 0 }); // ukuran tampilan
  const [quad, setQuad] = useState(null);
  const [fix, setFix] = useState(autoEnhance);
  const [result, setResult] = useState(null); // { url, blob, kb }
  const [busy, setBusy] = useState(false);

  const initQuad = (w, h, isFull) => {
    const m = isFull ? 0 : 0.08;
    return [
      [w * m, h * m],
      [w * (1 - m), h * m],
      [w * (1 - m), h * (1 - m)],
      [w * m, h * (1 - m)],
    ];
  };

  useEffect(() => {
    let alive = true;
    loadImage(src).then((img) => {
      if (!alive) return;
      const c = toCanvas(img);
      work.current = c;
      setDims({ w: c.width, h: c.height });
      setQuad(initQuad(c.width, c.height, full));
    });
    return () => {
      alive = false;
    };
  }, [src, full]);

  useEffect(() => {
    if (!dims || !wrap.current) return;
    const fit = () => {
      if (!wrap.current) return;
      const maxW = wrap.current.clientWidth;
      const maxH = Math.min(window.innerHeight * 0.55, 560);
      const s = Math.min(maxW / dims.w, maxH / dims.h);
      setBox({ w: dims.w * s, h: dims.h * s });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [dims, result]);

  const scale = dims && box.w ? box.w / dims.w : 1;

  const area = useRef(null);
  const [dragging, setDragging] = useState(-1);
  // Geser dipantau di level window supaya tetap mengikuti jari walau keluar dari kotak,
  // dan tidak terputus oleh gestur scroll/pinch browser.
  useEffect(() => {
    if (dragging < 0 || !dims) return;
    const move = (e) => {
      const el = area.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(dims.w, (e.clientX - r.left) / scale));
      const y = Math.max(0, Math.min(dims.h, (e.clientY - r.top) / scale));
      setQuad((q) => q.map((p, i) => (i === dragging ? [x, y] : p)));
      e.preventDefault?.();
    };
    const up = () => setDragging(-1);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, dims, scale]);

  const process = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 30));
    try {
      const out = warp(work.current, quad, COVER_W, COVER_H);
      if (fix) enhance(out);
      const blob = await toJpeg(out);
      setResult({ url: URL.createObjectURL(blob), blob, kb: Math.round(blob.size / 1024) });
    } finally {
      setBusy(false);
    }
  };

  if (!dims || !quad) return <Spinner label="Membuka foto..." />;

  if (result) {
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.img initial={{ scale: 0.9, rotate: -3, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} src={result.url} alt="" className="w-48 rounded-2xl shadow-2xl sm:w-56" />
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          ✓ Standar 600×900 · {result.kb} KB
        </div>
        <div className="flex w-full gap-2">
          <Button variant="soft" className="flex-1" icon={RotateCcw} onClick={() => setResult(null)}>
            Ulangi
          </Button>
          <Button variant="teal" className="flex-1" icon={Check} onClick={() => onDone(result.blob)}>
            Pakai foto ini
          </Button>
        </div>
      </div>
    );
  }

  const pts = quad.map(([x, y]) => [x * scale, y * scale]);
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-600">
        Geser <b className="text-guru">4 titik</b> tepat ke sudut buku.
      </p>
      <div ref={wrap} className="flex w-full justify-center">
        <div
          ref={area}
          className="relative touch-none select-none"
          style={{ width: box.w, height: box.h }}
        >
          <img src={src} alt="" className="pointer-events-none h-full w-full rounded-xl" draggable={false} />
          <svg className="absolute inset-0" width={box.w} height={box.h}>
            <defs>
              <mask id="quadmask">
                <rect width="100%" height="100%" fill="white" />
                <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="black" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(15,23,42,.55)" mask="url(#quadmask)" />
            <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#2DD4BF" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          {pts.map(([x, y], i) => (
            <div
              key={i}
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(i);
              }}
              className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              style={{ left: x, top: y }}
            >
              <motion.span whileTap={{ scale: 1.3 }} className="h-6 w-6 rounded-full border-4 border-white bg-teal-500 shadow-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => setQuad(initQuad(dims.w, dims.h, true))} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 active:scale-95">
          <Maximize2 className="h-4 w-4" /> Seluruh gambar
        </button>
        <button
          onClick={() => setFix((f) => !f)}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold transition active:scale-95 ${fix ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}
        >
          <Wand2 className="h-4 w-4" /> Rapikan cahaya & bayangan: {fix ? "Ya" : "Tidak"}
        </button>
      </div>

      <div className="flex gap-2">
        <Button variant="soft" className="flex-1" onClick={onBack}>
          Ganti foto
        </Button>
        <Button variant="teal" className="flex-1" loading={busy} icon={Wand2} onClick={process}>
          Proses
        </Button>
      </div>
    </div>
  );
}
