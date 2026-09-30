"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ScanLine, Pencil, Trash2, Ghost, Undo2, BookPlus, Copy, ArrowLeft } from "lucide-react";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Button, Cover, Modal, Spinner, Empty, ErrorBox, SearchInput, Select, Chip } from "@/components/ui";
import Scanner from "@/components/Scanner";
import BookForm, { emptyBook } from "@/components/BookForm";
import { useToast, useConfirm } from "@/components/Providers";
import { useRpc, rpc } from "@/lib/client";
import { KONDISI, STATUS_COPY } from "@/lib/rules";
import { fmtShort } from "@/lib/time";
import Icon from "@/components/Icon";
import { catIcon } from "@/lib/icons";

export default function GuruBuku() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [cat, setCat] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [adding, setAdding] = useState(false);
  const { data: meta } = useRpc("guru.meta");

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, error, loading, reload } = useRpc("guru.books", { q: dq, categoryId: cat || null });

  return (
    <Page>
      <GuruHeader
        icon="kategori/semua"
        title="Koleksi Buku"
        sub={data ? `${data.length} judul · ${data.reduce((a, b) => a + b.total, 0)} eksemplar` : "Kelola judul dan eksemplar"}
        actions={
          <Button variant="teal" icon={ScanLine} onClick={() => setAdding(true)}>
            Tambah via scan
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchInput value={q} onChange={setQ} placeholder="Cari judul, penulis, ISBN..." className="flex-1" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-56">
          <option value="">Semua kategori</option>
          {meta?.categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nama}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : data.length === 0 ? (
        <Empty icon="status/kosong" title="Belum ada buku" text="Tempel stiker QR di buku, lalu tekan Tambah via scan." action={<Button variant="teal" icon={Plus} onClick={() => setAdding(true)}>Tambah buku pertama</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {data.map((b, i) => (
            <motion.button key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 18) * 0.02 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => setDetailId(b.id)} className="text-left">
              <div className="relative">
                <Cover src={b.cover_url} alt={b.judul} className="shadow-card" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 font-data text-[11px] font-bold text-slate-700 shadow">
                  {b.tersedia}/{b.total} ada
                </span>
                {b.rusak > 0 && <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900">{b.rusak} rusak</span>}
              </div>
              <div className="mt-2 line-clamp-2 text-sm font-bold leading-tight">{b.judul}</div>
              <div className="truncate text-xs text-slate-500">{b.penulis || "-"}</div>
            </motion.button>
          ))}
        </div>
      )}

      <AddFlow open={adding} onClose={() => setAdding(false)} meta={meta} onDone={(id) => { reload(true); if (id) setDetailId(id); }} />
      <BookDetail id={detailId} meta={meta} onClose={() => setDetailId(null)} onChanged={() => reload(true)} />
    </Page>
  );
}

// ═══════════════════════ Alur tambah: scan stiker → buku baru / eksemplar lama
function AddFlow({ open, onClose, meta, onDone }) {
  const toast = useToast();
  const [step, setStep] = useState("scan"); // scan | choose | new | existing
  const [code, setCode] = useState("");
  const [book, setBook] = useState(emptyBook);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [found, setFound] = useState([]);

  useEffect(() => {
    if (open) {
      setStep("scan");
      setCode("");
      setBook(emptyBook);
      setQ("");
      setFound([]);
    }
  }, [open]);

  useEffect(() => {
    if (step !== "existing") return;
    const t = setTimeout(async () => setFound(await rpc("guru.books", { q }).catch(() => [])), 250);
    return () => clearTimeout(t);
  }, [q, step]);

  const onScan = async (c) => {
    try {
      const r = await rpc("guru.codeCheck", { code: c });
      if (r.exists) {
        toast.info(`Stiker ${r.label || r.code} sudah terdaftar untuk "${r.judul}"`);
        onClose();
        onDone(r.bookId);
        return;
      }
      setCode(r.code);
      setStep("choose");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const saveNew = async () => {
    if (!book.judul.trim()) return toast.error("Judul wajib diisi");
    setSaving(true);
    try {
      const r = await rpc("guru.createBook", { book, code });
      toast.success(`Buku tersimpan, nomor stiker ${r.label}`);
      onClose();
      onDone(r.id);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addTo = async (b) => {
    setSaving(true);
    try {
      await rpc("guru.addCopy", { bookId: b.id, code });
      toast.success(`Eksemplar baru "${b.judul}" ditambahkan`);
      onClose();
      onDone(b.id);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const title = { scan: "Scan stiker buku", choose: "Kode baru terdeteksi", new: "Buku baru", existing: "Tambah eksemplar" }[step];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      wide={step === "new"}
      footer={
        step === "new" ? (
          <div className="flex gap-2">
            <Button variant="soft" icon={ArrowLeft} onClick={() => setStep("choose")}>
              Kembali
            </Button>
            <Button variant="teal" className="flex-1" loading={saving} onClick={saveNew}>
              Simpan buku
            </Button>
          </div>
        ) : null
      }
    >
      {step === "scan" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Tempel stiker QR di buku, lalu scan. Kalau kodenya belum terdaftar, kamu bisa mendaftarkan buku baru atau menambah eksemplar dari judul yang sudah ada.</p>
          <Scanner onResult={onScan} accent="#0D9488" autoStart />
        </div>
      )}
      {step === "choose" && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-teal-50 p-4 text-center">
            <div className="text-xs font-bold uppercase text-teal-700">Kode stiker</div>
            <div className="font-data text-2xl font-bold text-teal-900">{code}</div>
          </div>
          <ChoiceBtn icon={BookPlus} title="Buku baru" text="Judul ini belum ada di perpustakaan" onClick={() => setStep("new")} />
          <ChoiceBtn icon={Copy} title="Eksemplar dari buku yang sudah ada" text="Tambah stok judul yang sudah pernah diinput" onClick={() => setStep("existing")} />
        </div>
      )}
      {step === "new" && (
        <div>
          <div className="mb-4 rounded-2xl bg-teal-50 px-4 py-2 text-sm">
            Kode stiker: <span className="font-data font-bold">{code}</span>
          </div>
          <BookForm value={book} onChange={setBook} meta={meta} />
        </div>
      )}
      {step === "existing" && (
        <div className="space-y-3">
          <SearchInput value={q} onChange={setQ} placeholder="Cari judul..." />
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {found.map((b) => (
              <motion.button key={b.id} whileTap={{ scale: 0.97 }} disabled={saving} onClick={() => addTo(b)} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-2.5 text-left hover:bg-teal-50">
                <Cover src={b.cover_url} alt={b.judul} className="w-10 shrink-0" rounded="rounded-md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{b.judul}</div>
                  <div className="text-xs text-slate-500">{b.total} eksemplar</div>
                </div>
                <Plus className="h-5 w-5 text-guru" />
              </motion.button>
            ))}
          </div>
          <Button variant="soft" icon={ArrowLeft} onClick={() => setStep("choose")}>
            Kembali
          </Button>
        </div>
      )}
    </Modal>
  );
}

function ChoiceBtn({ icon: Icon, title, text, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} whileHover={{ x: 3 }} onClick={onClick} className="flex w-full items-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-4 text-left">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-guru text-white">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="font-display font-bold">{title}</div>
        <div className="text-sm text-slate-500">{text}</div>
      </div>
    </motion.button>
  );
}

// ═══════════════════════ Detail buku + eksemplar
function BookDetail({ id, meta, onClose, onChanged }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [d, setD] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addCode, setAddCode] = useState(false);

  const load = async () => {
    try {
      setD(await rpc("guru.bookDetail", { id }));
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    if (!id) return;
    setD(null);
    setEdit(null);
    setAddCode(false);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const act = async (fn, msg) => {
    try {
      await fn();
      if (msg) toast.success(msg);
      await load();
      onChanged();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    await act(() => rpc("guru.updateBook", { id, book: edit }), "Perubahan disimpan");
    setSaving(false);
    setEdit(null);
  };

  const del = async () => {
    const ok = await confirm({ title: "Hapus buku ini?", message: "Semua eksemplar dan riwayat peminjamannya ikut terhapus.", danger: true, ok: "Hapus" });
    if (!ok) return;
    await act(() => rpc("guru.deleteBook", { id }), "Buku dihapus");
    onClose();
  };

  const b = d?.book;
  return (
    <Modal
      open={!!id}
      onClose={onClose}
      title={edit ? "Edit buku" : "Detail buku"}
      wide
      footer={
        edit ? (
          <div className="flex gap-2">
            <Button variant="soft" onClick={() => setEdit(null)}>
              Batal
            </Button>
            <Button variant="teal" className="flex-1" loading={saving} onClick={saveEdit}>
              Simpan perubahan
            </Button>
          </div>
        ) : null
      }
    >
      {!d ? (
        <Spinner />
      ) : edit ? (
        <BookForm value={edit} onChange={setEdit} meta={meta} />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
            <Cover src={b.cover_url} alt={b.judul} className="mx-auto w-32 shadow-card sm:w-full" />
            <div>
              {b.category && (
                <Chip className="bg-teal-50 text-teal-700">
                  <Icon name={catIcon(b.category.kode)} size={16} /> {b.category.nama}
                </Chip>
              )}
              <h2 className="mt-1 font-display text-2xl font-bold leading-tight">{b.judul}</h2>
              <div className="text-sm text-slate-500">{[b.penulis, b.penerbit, b.tahun].filter(Boolean).join(" · ") || "-"}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {b.isbn && <Chip className="bg-slate-100 font-data text-slate-600">ISBN {b.isbn}</Chip>}
                {b.shelf && <Chip className="bg-slate-100 text-slate-600">{b.shelf.nama}</Chip>}
                <Chip className="bg-amber-50 text-amber-700">Dipinjam {d.timesBorrowed}×</Chip>
              </div>
              {b.deskripsi && <p className="mt-3 line-clamp-4 text-sm text-slate-600">{b.deskripsi}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="soft"
                  className="py-2 text-sm"
                  icon={Pencil}
                  onClick={() =>
                    setEdit({
                      judul: b.judul || "", penulis: b.penulis || "", penerbit: b.penerbit || "", tahun: b.tahun ? String(b.tahun) : "", isbn: b.isbn || "",
                      category_id: b.category_id || "", shelf_id: b.shelf_id || "", deskripsi: b.deskripsi || "", cover_url: b.cover_url || "",
                    })
                  }
                >
                  Edit & cover
                </Button>
                <Button variant="danger" className="py-2 text-sm" icon={Trash2} onClick={del}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-display text-lg font-bold">Eksemplar ({d.copies.length})</div>
              <Button variant="teal" className="py-2 text-sm" icon={Plus} onClick={() => setAddCode((v) => !v)}>
                Tambah
              </Button>
            </div>
            <AnimatePresence>
              {addCode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3 overflow-hidden">
                  <Scanner
                    accent="#0D9488"
                    autoStart
                    onResult={(c) =>
                      act(async () => {
                        await rpc("guru.addCopy", { bookId: id, code: c });
                        setAddCode(false);
                      }, "Eksemplar ditambahkan")
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              {d.copies.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3">
                  <div className="min-w-[110px] flex-1">
                    <div className="font-data text-sm font-bold">
                      {c.label || c.qr_code} <span className="text-[10px] font-semibold text-slate-400">nomor stiker</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Chip className={STATUS_COPY[c.status].color}>{STATUS_COPY[c.status].label}</Chip>
                      {c.loan && (
                        <span className="text-xs text-slate-500">
                          oleh {c.loan.student?.nama} ({c.loan.student?.kelas}) s/d {fmtShort(c.loan.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={c.kondisi}
                    onChange={(e) => act(() => rpc("guru.updateCopy", { id: c.id, kondisi: e.target.value }), "Kondisi diperbarui")}
                    className={`rounded-xl border-0 px-3 py-2 text-sm font-bold ${KONDISI[c.kondisi].color}`}
                  >
                    {Object.entries(KONDISI).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                  {c.status === "tersedia" && (
                    <IconBtn title="Tandai hilang" icon={Ghost} onClick={async () => (await confirm({ title: "Tandai eksemplar hilang?", message: c.label || c.qr_code, danger: true })) && act(() => rpc("guru.markLost", { copyId: c.id }), "Ditandai hilang")} />
                  )}
                  {c.status === "hilang" && <IconBtn title="Ditemukan lagi" icon={Undo2} onClick={() => act(() => rpc("guru.updateCopy", { id: c.id, status: "tersedia" }), "Eksemplar tersedia lagi")} />}
                  {c.status !== "dipinjam" && (
                    <IconBtn title="Hapus eksemplar" icon={Trash2} danger onClick={async () => (await confirm({ title: "Hapus eksemplar?", message: c.label || c.qr_code, danger: true, ok: "Hapus" })) && act(() => rpc("guru.deleteCopy", { id: c.id }), "Eksemplar dihapus")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function IconBtn({ icon: Icon, title, onClick, danger }) {
  return (
    <motion.button whileTap={{ scale: 0.88 }} title={title} onClick={onClick} className={`rounded-xl p-2 transition ${danger ? "text-slate-400 hover:bg-red-50 hover:text-red-600" : "text-slate-500 hover:bg-white"}`}>
      <Icon className="h-5 w-5" />
    </motion.button>
  );
}
