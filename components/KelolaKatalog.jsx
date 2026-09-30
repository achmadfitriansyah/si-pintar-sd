"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Button, Modal, Field, Input, Spinner } from "./ui";
import Icon from "./Icon";
import { useToast, useConfirm } from "./Providers";
import { useSchool } from "./SchoolContext";
import { useRpc, rpc } from "@/lib/client";
import { KATEGORI_ICONS } from "@/lib/icons";

const COLORS = ["#EF4444", "#F97316", "#F59E0B", "#10B981", "#0D9488", "#3B82F6", "#8B5CF6", "#EC4899"];
const ALL_ROMBEL = "ABCDEFGHIJKL".split("");

export default function KelolaKatalog() {
  const toast = useToast();
  const confirm = useConfirm();
  const { school, refresh } = useSchool();
  const { data: meta, reload } = useRpc("guru.meta");
  const [cat, setCat] = useState(null); // objek kategori (id kosong = baru)
  const [shelf, setShelf] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      await fn();
      toast.success(okMsg);
      await reload(true);
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const del = async (kind, x) => {
    if (!(await confirm({ title: `Hapus ${kind}?`, message: x.nama, danger: true, ok: "Hapus" }))) return;
    run(() => rpc(kind === "kategori" ? "guru.deleteCategory" : "guru.deleteShelf", { id: x.id }), `${kind === "kategori" ? "Kategori" : "Rak"} dihapus`);
  };

  const rombel = (school?.rombel || "A,B,C,D,E,F").split(",");
  const toggleRombel = async (r) => {
    const next = rombel.includes(r) ? rombel.filter((x) => x !== r) : [...rombel, r];
    const ok = await run(() => rpc("guru.saveRombel", { rombel: next }), "Rombel disimpan");
    if (ok) refresh();
  };

  if (!meta) return <Spinner />;
  return (
    <>
      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-lg font-bold">Kategori buku</div>
            <div className="text-xs text-slate-500">Dipakai di koleksi siswa dan form buku</div>
          </div>
          <Button variant="soft" icon={Plus} className="py-2 text-sm" onClick={() => setCat({ nama: "", color: COLORS[0], icon: KATEGORI_ICONS[0] })}>
            Tambah
          </Button>
        </div>
        <div className="space-y-2">
          {meta.categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: c.color + "22" }}>
                <Icon name={c.icon || "kategori/semua"} size={30} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{c.nama}</span>
              <button aria-label="Ubah" onClick={() => setCat({ ...c, icon: c.icon || "kategori/semua" })} className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700">
                <Pencil className="h-4 w-4" />
              </button>
              <button aria-label="Hapus" onClick={() => del("kategori", c)} className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-lg font-bold">Rak</div>
            <div className="text-xs text-slate-500">Lokasi buku di perpustakaan</div>
          </div>
          <Button variant="soft" icon={Plus} className="py-2 text-sm" onClick={() => setShelf({ nama: "" })}>
            Tambah
          </Button>
        </div>
        <div className="space-y-2">
          {meta.shelves.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">Belum ada rak.</p>}
          {meta.shelves.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5 pl-4">
              <span className="font-data text-xs font-bold text-slate-400">{s.kode}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{s.nama}</span>
              <button aria-label="Ubah" onClick={() => setShelf(s)} className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700">
                <Pencil className="h-4 w-4" />
              </button>
              <button aria-label="Hapus" onClick={() => del("rak", s)} className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-1 font-display text-lg font-bold">Rombel kelas</div>
        <div className="mb-3 text-xs text-slate-500">Pilih huruf rombel yang ada di sekolah. Muncul di dropdown kelas pada menu Siswa.</div>
        <div className="flex flex-wrap gap-2">
          {ALL_ROMBEL.map((r) => (
            <button
              key={r}
              disabled={busy}
              onClick={() => toggleRombel(r)}
              className={`h-11 w-11 rounded-xl text-base font-bold transition ${rombel.includes(r) ? "bg-guru text-white" : "bg-slate-100 text-slate-400"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </Card>

      <Modal
        open={!!cat}
        onClose={() => setCat(null)}
        title={cat?.id ? "Ubah kategori" : "Kategori baru"}
        footer={
          <Button variant="teal" className="w-full" loading={busy} onClick={async () => (await run(() => rpc("guru.saveCategory", cat), "Kategori disimpan")) && setCat(null)}>
            Simpan
          </Button>
        }
      >
        {cat && (
          <div className="space-y-4">
            <Field label="Nama kategori">
              <Input value={cat.nama} maxLength={30} onChange={(e) => setCat({ ...cat, nama: e.target.value })} placeholder="mis. Sains" />
            </Field>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Ikon</div>
              <div className="grid grid-cols-5 gap-2">
                {KATEGORI_ICONS.map((i) => (
                  <button key={i} type="button" onClick={() => setCat({ ...cat, icon: i })} className={`flex items-center justify-center rounded-2xl p-2 ${cat.icon === i ? "bg-teal-50 ring-2 ring-teal-500" : "bg-slate-50"}`}>
                    <Icon name={i} size={36} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Warna</div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" aria-label={c} onClick={() => setCat({ ...cat, color: c })} className={`h-9 w-9 rounded-full ${cat.color === c ? "ring-2 ring-offset-2 ring-slate-800" : ""}`} style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!shelf}
        onClose={() => setShelf(null)}
        title={shelf?.id ? "Ubah rak" : "Rak baru"}
        footer={
          <Button variant="teal" className="w-full" loading={busy} onClick={async () => (await run(() => rpc("guru.saveShelf", shelf), "Rak disimpan")) && setShelf(null)}>
            Simpan
          </Button>
        }
      >
        {shelf && (
          <Field label="Nama rak">
            <Input value={shelf.nama} maxLength={40} onChange={(e) => setShelf({ ...shelf, nama: e.target.value })} placeholder="mis. Rak Cerita Anak" />
          </Field>
        )}
      </Modal>
    </>
  );
}
