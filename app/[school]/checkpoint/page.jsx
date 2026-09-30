"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, ShieldCheck, History } from "lucide-react";
import { useSchool } from "@/components/SchoolContext";
import { Button, Card, Input, Field, Spinner, Empty } from "@/components/ui";
import { useToast, useConfirm } from "@/components/Providers";
import { rpc } from "@/lib/client";
import { fmtDate } from "@/lib/time";

// Halaman tersembunyi: /demo/checkpoint — tidak ada di menu mana pun.
export default function CheckpointPage() {
  const { slug, school } = useSchool();
  const toast = useToast();
  const confirm = useConfirm();
  const [cred, setCred] = useState({ username: "", password: "" });
  const [list, setList] = useState(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  if (!school) return <Spinner />;
  if (!school.is_demo) return <Empty emoji="🔒" title="Hanya untuk mode demo" text="Halaman ini tidak tersedia untuk sekolah asli." />;

  const call = async (action, extra = {}) => rpc(action, { slug, ...cred, ...extra });

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      setList(await call("checkpoint.list"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      setList(await call("checkpoint.save", { label }));
      setLabel("");
      toast.success("Checkpoint tersimpan");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const restore = async (cp) => {
    const ok = await confirm({
      title: "Kembalikan ke checkpoint ini?",
      message: `Semua perubahan data demo setelah ${fmtDate(cp.created_at)} akan dihapus.`,
      danger: true,
      ok: "Kembalikan",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const r = await call("checkpoint.restore", { id: cp.id });
      toast.success(`Data demo dikembalikan (${r.counts.loans} peminjaman, ${r.counts.students} siswa)`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="text-center">
          <div className="text-5xl">🛟</div>
          <h1 className="mt-2 font-display text-2xl font-bold">Checkpoint Demo</h1>
          <p className="text-sm text-slate-500">Simpan kondisi data demo, lalu kembalikan kapan saja.</p>
        </div>

        {!list ? (
          <Card>
            <form onSubmit={login} className="space-y-3">
              <Field label="Username">
                <Input value={cred.username} onChange={(e) => setCred({ ...cred, username: e.target.value })} autoComplete="off" />
              </Field>
              <Field label="Password">
                <Input type="password" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} autoComplete="new-password" />
              </Field>
              <Button variant="dark" className="w-full" icon={ShieldCheck} loading={busy}>
                Masuk
              </Button>
            </form>
          </Card>
        ) : (
          <>
            <Card>
              <div className="mb-2 font-display font-bold">Simpan kondisi sekarang</div>
              <div className="flex gap-2">
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nama checkpoint (opsional)" />
                <Button variant="teal" icon={Save} loading={busy} onClick={save}>
                  Simpan
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Hanya 5 checkpoint terakhir yang disimpan.</p>
            </Card>
            <Card>
              <div className="mb-3 flex items-center gap-2 font-display font-bold">
                <History className="h-5 w-5" /> Daftar checkpoint
              </div>
              {list.length === 0 && <p className="text-sm text-slate-500">Belum ada checkpoint. Simpan satu dulu.</p>}
              <div className="space-y-2">
                {list.map((cp, i) => (
                  <motion.div key={cp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{cp.label || `Checkpoint #${cp.id}`}</div>
                      <div className="text-xs text-slate-500">{new Date(cp.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</div>
                    </div>
                    <Button variant="danger" icon={RotateCcw} onClick={() => restore(cp)} disabled={busy} className="py-2 text-sm">
                      Kembalikan
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
