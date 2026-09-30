"use client";
import { Page } from "@/components/AppShell";
import { PageHero } from "@/components/ui";
import Leaderboard from "@/components/Leaderboard";

export default function OrtuPeringkat() {
  return (
    <div>
      <PageHero from="#DB2777" to="#7C3AED" className="pb-14 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Peringkat</div>
          <h1 className="font-display text-3xl font-bold">Peringkat Kelas Bulan Ini</h1>
        </Page>
      </PageHero>
      <Page className="-mt-8 pb-6">
        <Leaderboard accent="#7C3AED" meLabel="Anak Anda" />
      </Page>
    </div>
  );
}
