"use client";
import { Page } from "@/components/AppShell";
import { PageHero } from "@/components/ui";
import LoanHistory from "@/components/LoanHistory";

export default function OrtuRiwayat() {
  return (
    <div>
      <PageHero from="#7C3AED" to="#6D28D9" className="pb-14 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Riwayat</div>
          <h1 className="font-display text-3xl font-bold">Buku yang Dipinjam Anak</h1>
        </Page>
      </PageHero>
      <Page className="-mt-8">
        <LoanHistory accent="#7C3AED" />
      </Page>
    </div>
  );
}
