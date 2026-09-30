"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSchool } from "@/components/SchoolContext";
import { Page } from "@/components/AppShell";
import { Card } from "@/components/ui";
import PasswordForm from "@/components/PasswordForm";
import Icon from "@/components/Icon";

export default function GantiPassword() {
  const { slug, refresh } = useSchool();
  const router = useRouter();
  return (
    <Page className="max-w-md py-10">
      <Card>
        <div className="mb-4 text-center">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} >
            <Icon name="status/kunci" size={64} className="mx-auto" />
          </motion.div>
          <h1 className="mt-2 font-display text-2xl font-bold">Ganti password dulu ya</h1>
          <p className="text-sm text-slate-500">Password bawaan &ldquo;admin&rdquo; mudah ditebak. Buat password baru supaya data sekolah aman.</p>
        </div>
        <PasswordForm
          submitLabel="Simpan & lanjut"
          onDone={async () => {
            await refresh();
            router.replace(`/${slug}/guru`);
          }}
        />
      </Card>
    </Page>
  );
}
