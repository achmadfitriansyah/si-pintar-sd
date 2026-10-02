"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanBarcode, ImagePlus } from "lucide-react";
import { Field, Input, Select, Button, Cover, inputCls } from "./ui";
import Scanner from "./Scanner";
import CoverEditor from "./CoverEditor";
import { useToast } from "./Providers";
import { rpc } from "@/lib/client";

export const emptyBook = { judul: "", penulis: "", penerbit: "", tahun: "", isbn: "", category_id: "", shelf_id: "", deskripsi: "", cover_url: "" };

/** Form data buku + ISBN otomatis + cover. Dipakai untuk tambah & edit. */
export default function BookForm({ value, onChange, meta }) {
  const toast = useToast();
  const [isbnScan, setIsbnScan] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverInit, setCoverInit] = useState(null);
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });

  return (
    <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
      <div className="flex flex-col items-center gap-2">
        <motion.div key={value.cover_url} initial={{ scale: 0.9, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} className="w-32 sm:w-full">
          <Cover src={value.cover_url} alt={value.judul || "Cover"} className="shadow-card" />
        </motion.div>
        <Button
          type="button"
          variant="soft"
          className="w-full py-2 text-sm"
          icon={ImagePlus}
          onClick={() => {
            setCoverInit(null);
            setCoverOpen(true);
          }}
        >
          {value.cover_url ? "Ganti cover" : "Ambil cover"}
        </Button>
      </div>

      <div className="space-y-3">
        <Field label="ISBN (opsional)">
          <div className="flex gap-2">
            <input value={value.isbn} onChange={set("isbn")} inputMode="numeric" placeholder="978..." className={`${inputCls} font-data`} />
            <Button type="button" variant="soft" onClick={() => setIsbnScan((s) => !s)} title="Scan barcode ISBN">
              <ScanBarcode className="h-5 w-5" />
            </Button>
          </div>
        </Field>
        <AnimatePresence>
          {isbnScan && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Scanner mode="isbn" autoStart accent="#0D9488" onResult={(v) => {
                onChange({ ...value, isbn: v.replace(/[^0-9Xx]/g, "") });
                setIsbnScan(false);
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        <Field label="Judul buku *">
          <Input value={value.judul} onChange={set("judul")} placeholder="Judul lengkap" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Penulis">
            <Input value={value.penulis} onChange={set("penulis")} />
          </Field>
          <Field label="Penerbit">
            <Input value={value.penerbit} onChange={set("penerbit")} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tahun">
            <Input value={value.tahun} onChange={(e) => onChange({ ...value, tahun: e.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" />
          </Field>
          <Field label="Kategori" className="col-span-2">
            <Select value={value.category_id || ""} onChange={set("category_id")}>
              <option value="">Pilih kategori</option>
              {meta?.categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Rak">
          <Select value={value.shelf_id || ""} onChange={set("shelf_id")}>
            <option value="">Pilih rak</option>
            {meta?.shelves?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sinopsis singkat">
          <textarea value={value.deskripsi} onChange={set("deskripsi")} rows={3} className={inputCls} placeholder="Opsional" />
        </Field>
      </div>

      <CoverEditor open={coverOpen} onClose={() => setCoverOpen(false)} initialUrl={coverInit} onSaved={(url) => onChange({ ...value, cover_url: url })} />
    </div>
  );
}
