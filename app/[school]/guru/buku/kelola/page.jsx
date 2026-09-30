"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import KelolaKatalog from "@/components/KelolaKatalog";

export default function Kelola() {
  const { school } = useParams();
  return (
    <Page>
      <GuruHeader
        icon="kategori/semua"
        title="Kategori, Rak & Rombel"
        sub="Atur pilihan yang dipakai di form buku, koleksi siswa, dan data kelas"
        actions={
          <Link href={`/${school}/guru/buku`} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-slate-800 shadow-card">
            <ArrowLeft className="h-5 w-5" /> Kembali ke buku
          </Link>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <KelolaKatalog />
      </div>
    </Page>
  );
}
