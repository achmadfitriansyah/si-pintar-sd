"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Save, ImagePlus, Lock } from "lucide-react";
import { Page, SchoolLogo } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Card, Field, Input, Button, Spinner, ErrorBox } from "@/components/ui";
import KelolaKatalog from "@/components/KelolaKatalog";
import PasswordForm from "@/components/PasswordForm";
import { useToast } from "@/components/Providers";
import { useSchool } from "@/components/SchoolContext";
import { useRpc, rpc, uploadImage } from "@/lib/client";
import { logoBlob } from "@/lib/image";

export default function Pengaturan() {
  const toast = useToast();
  const { refresh } = useSchool();
  const { data, error, loading, reload } = useRpc("guru.settings");
  const [f, setF] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (data) setF({ ...data.school });
  }, [data]);

  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (loading || !f) return <Spinner />;
  const demo = data.school.is_demo;

  const save = async () => {
    setSaving(true);
    try {
      await rpc("guru.saveSettings", f);
      await refresh();
      toast.success("Pengaturan disimpan");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(await logoBlob(file), "logo");
      setF((x) => ({ ...x, logo_url: url }));
      toast.info("Logo siap. Tekan Simpan untuk menerapkan.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Page>
      <GuruHeader icon="status/pengaturan" title="Pengaturan" sub="Identitas sekolah, aturan pinjam, kategori, rak, dan keamanan" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 font-display text-lg font-bold">Identitas sekolah</div>
          <div className="mb-4 flex items-center gap-4">
            <motion.div key={f.logo_url} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <SchoolLogo school={f} accent="#0D9488" size={72} />
            </motion.div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
            <div className="space-y-2">
              <Button variant="soft" icon={ImagePlus} loading={uploading} onClick={() => fileRef.current?.click()} className="py-2 text-sm">
                Ganti logo
              </Button>
              {f.logo_url && (
                <button onClick={() => setF({ ...f, logo_url: null })} className="block text-xs font-bold text-red-500">
                  Hapus logo
                </button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <Field label="Nama sekolah">
              <Input value={f.name || ""} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </Field>
            <Field label="Nama singkat" hint="Tampil di bagian atas aplikasi, contoh: SDN 001 Balsel">
              <Input value={f.short_name || ""} onChange={(e) => setF({ ...f, short_name: e.target.value })} />
            </Field>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="mb-4 font-display text-lg font-bold">Aturan peminjaman</div>
            <div className="space-y-5">
              <Field label={`Maksimal buku dipinjam bersamaan: ${f.max_books}`}>
                <input type="range" min={1} max={10} value={f.max_books} onChange={(e) => setF({ ...f, max_books: Number(e.target.value) })} className="w-full accent-teal-600" />
              </Field>
              <Field label={`Lama pinjam: ${f.loan_days} hari`}>
                <input type="range" min={1} max={30} value={f.loan_days} onChange={(e) => setF({ ...f, loan_days: Number(e.target.value) })} className="w-full accent-teal-600" />
              </Field>
              <p className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">Belum ada sanksi keterlambatan. Buku yang terlambat hanya tidak mendapat poin.</p>
            </div>
          </Card>
          <Button variant="teal" icon={Save} loading={saving} onClick={save} className="w-full">
            Simpan pengaturan
          </Button>
          <Card>
            <div className="mb-1 flex items-center gap-2 font-display text-lg font-bold">
              <Lock className="h-5 w-5" /> Ganti password admin
            </div>
            <div className="mb-4 text-xs text-slate-500">Username: {data.admin.username}</div>
            {demo ? <p className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Tidak tersedia di mode demo, supaya login demo tetap admin/admin.</p> : <PasswordForm />}
          </Card>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <KelolaKatalog />
      </div>
    </Page>
  );
}
