"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Field, Input, Button } from "./ui";
import { useToast } from "./Providers";
import { rpc } from "@/lib/client";

export default function PasswordForm({ onDone, submitLabel = "Ganti password", action = "auth.changePassword", variant = "teal" }) {
  const toast = useToast();
  const [f, setF] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return toast.error("Konfirmasi password tidak sama");
    setSaving(true);
    try {
      await rpc(action, f);
      toast.success("Password berhasil diganti");
      setF({ oldPassword: "", newPassword: "", confirm: "" });
      onDone?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Password lama">
        <Input type="password" value={f.oldPassword} onChange={(e) => setF({ ...f, oldPassword: e.target.value })} autoComplete="current-password" />
      </Field>
      <Field label="Password baru" hint="Minimal 6 karakter">
        <Input type="password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} autoComplete="new-password" />
      </Field>
      <Field label="Ulangi password baru">
        <Input type="password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} autoComplete="new-password" />
      </Field>
      <Button variant={variant} icon={KeyRound} loading={saving} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
