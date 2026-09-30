"use client";
import { Page } from "@/components/AppShell";
import { PageHero } from "@/components/ui";
import Leaderboard from "@/components/Leaderboard";

export default function Peringkat() {
  return (
    <div>
      <PageHero from="#8B5CF6" to="#DB2777" className="pb-14 pt-6">
        <Page>
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Papan Peringkat</div>
          <h1 className="font-display text-3xl font-bold">Juara Membaca Kelas</h1>
          <p className="text-sm text-white/85">Siapa yang paling rajin bulan ini?</p>
        </Page>
      </PageHero>
      <Page className="-mt-8 pb-6">
        <Leaderboard />
      </Page>
    </div>
  );
}
