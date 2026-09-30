"use client";
import { Page } from "@/components/AppShell";
import { PageHero } from "@/components/ui";
import LoanHistory from "@/components/LoanHistory";

export default function BukuSaya() {
  return (
    <div>
      <PageHero from="#0EA5E9" to="#2563EB" className="pb-14 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Buku Saya</div>
          <h1 className="font-display text-3xl font-bold">Pinjaman & Riwayat</h1>
          <p className="text-sm text-white/85">Jangan lupa kembalikan tepat waktu ya!</p>
        </Page>
      </PageHero>
      <Page className="-mt-8">
        <LoanHistory accent="#2563EB" />
      </Page>
    </div>
  );
}
