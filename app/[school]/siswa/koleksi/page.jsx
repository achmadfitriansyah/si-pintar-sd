"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { Page } from "@/components/AppShell";
import { SearchInput, Cover, Modal, Spinner, Empty, ErrorBox, PageHero, Chip } from "@/components/ui";
import Icon from "@/components/Icon";
import { catIcon } from "@/lib/icons";
import { useToast } from "@/components/Providers";
import { useRpc, rpc } from "@/lib/client";

export default function Koleksi() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [cat, setCat] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, error, loading, reload } = useRpc("books.catalog", { q: dq, categoryId: cat });

  return (
    <div>
      <PageHero from="#8B5CF6" to="#6D28D9" className="pb-16 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Perpustakaan</div>
          <h1 className="font-display text-3xl font-bold">Koleksi Buku</h1>
          <p className="text-sm text-white/85">Temukan buku seru, lalu pinjam di perpustakaan.</p>
          <div className="mt-4 max-w-xl">
            <SearchInput value={q} onChange={setQ} placeholder="Cari judul atau penulis..." />
          </div>
        </Page>
      </PageHero>

      <Page className="-mt-8">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          <CatChip active={!cat} onClick={() => setCat(null)} icon="kategori/semua" label="Semua" />
          {data?.categories?.map((c) => (
            <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} icon={catIcon(c.kode)} label={c.nama} />
          ))}
        </div>

        {error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : loading && !data ? (
          <Spinner label="Mengambil buku..." />
        ) : data.books.length === 0 ? (
          <Empty icon="status/cari" title="Buku tidak ditemukan" text="Coba kata kunci atau kategori lain." />
        ) : (
          <motion.div layout className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            <AnimatePresence>
              {data.books.map((b, i) => (
                <motion.button
                  layout
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: Math.min(i, 12) * 0.03 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenId(b.id)}
                  className="text-left"
                >
                  <div className="relative">
                    <Cover src={b.cover_url} alt={b.judul} className="shadow-card" />
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${b.tersedia ? "bg-emerald-500 text-white" : "bg-white/90 text-slate-600"}`}>
                      {b.tersedia ? `Tersedia ${b.tersedia}` : "Dipinjam semua"}
                    </span>
                  </div>
                  <div className="mt-2 line-clamp-2 font-display text-sm font-bold leading-tight">{b.judul}</div>
                  <div className="flex items-center gap-1 truncate text-xs text-slate-500">
                    <Icon name={catIcon(b.category?.kode)} size={16} /> {b.category?.nama}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Page>

      <BookSheet id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function CatChip({ active, onClick, icon, label }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shadow-soft transition ${active ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
    >
      <Icon name={icon} size={20} /> {label}
    </motion.button>
  );
}

function BookSheet({ id, onClose }) {
  const toast = useToast();
  const [b, setB] = useState(null);

  useEffect(() => {
    if (!id) return;
    setB(null);
    rpc("books.detail", { id }).then(setB).catch((e) => toast.error(e.message));
  }, [id, toast]);

  return (
    <Modal open={!!id} onClose={onClose} title="Detail buku" wide>
      {!b ? (
        <Spinner />
      ) : (
        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <motion.div initial={{ rotate: -4, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="mx-auto w-40 sm:w-full">
            <Cover src={b.cover_url} alt={b.judul} className="shadow-2xl" />
          </motion.div>
          <div>
            <Chip className="bg-violet-100 text-violet-700">
              <Icon name={catIcon(b.category?.kode)} size={16} /> {b.category?.nama}
            </Chip>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{b.judul}</h2>
            <div className="text-sm text-slate-500">
              {b.penulis}
              {b.penerbit ? ` · ${b.penerbit}` : ""}
              {b.tahun ? ` · ${b.tahun}` : ""}
            </div>
            {b.deskripsi && <p className="mt-3 text-sm leading-relaxed text-slate-700">{b.deskripsi}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <div className="font-data text-2xl font-bold text-emerald-700">
                  {b.tersedia}/{b.total}
                </div>
                <div className="text-[11px] font-bold uppercase text-emerald-700/70">Tersedia</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-sky-50 p-3 text-center">
                <MapPin className="h-5 w-5 text-sky-600" />
                <div className="text-xs font-bold text-sky-700">{b.shelf?.nama || "Rak belum diatur"}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              <Icon name="status/buku-pinjam" size={36} />
              {b.tersedia ? "Mau pinjam? Bawa bukunya ke guru di perpustakaan." : "Semua buku ini sedang dipinjam. Coba lagi nanti ya."}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
