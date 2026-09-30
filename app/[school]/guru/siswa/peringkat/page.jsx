"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Card, Select, Spinner, ErrorBox, Empty } from "@/components/ui";
import { useRpc } from "@/lib/client";
import Icon from "@/components/Icon";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function PeringkatKelas() {
  const { school } = useParams();
  const { data: meta } = useRpc("guru.meta");
  const [kelas, setKelas] = useState("");
  useEffect(() => {
    if (!kelas && meta?.classes?.length) setKelas(meta.classes[0]);
  }, [meta, kelas]);
  return (
    <Page>
      <GuruHeader
        icon="peringkat/mahkota"
        title="Peringkat Kelas"
        sub="Poin bulan ini reset tiap awal bulan, total poin tetap tersimpan"
        actions={
          <Link href={`/${school}/guru/siswa`} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-slate-800 shadow-card">
            <ArrowLeft className="h-5 w-5" /> Data siswa
          </Link>
        }
      />
      <div className="mb-4 max-w-xs">
        <Select value={kelas} onChange={(e) => setKelas(e.target.value)} aria-label="Kelas">
          {meta?.classes?.map((k) => (
            <option key={k} value={k}>
              Kelas {k}
            </option>
          ))}
        </Select>
      </div>
      {!meta ? (
        <Spinner />
      ) : !meta.classes?.length ? (
        <Empty icon="status/kosong" title="Belum ada siswa" text="Tambahkan siswa dulu di menu Data Siswa." />
      ) : kelas ? (
        <Tabel kelas={kelas} />
      ) : null}
    </Page>
  );
}

function Tabel({ kelas }) {
  const { data: d, error, loading, reload } = useRpc("guru.classRanking", { kelas });
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (loading && !d) return <Spinner />;
  if (!d) return null;
  const [y, m] = d.month.split("-");
  return (
    <Card className="p-2 sm:p-3">
      <div className="px-3 pb-1 pt-2 text-sm font-bold text-slate-700">
        Kelas {d.kelas} · {BULAN[(+m || 1) - 1]} {y}
      </div>
      <div className="grid grid-cols-[2.5rem_1fr_4.5rem_4.5rem] items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        <span>#</span>
        <span>Nama</span>
        <span className="text-right">Bulan ini</span>
        <span className="text-right">Total</span>
      </div>
      {d.rows.map((r) => (
        <div key={r.id} className="grid grid-cols-[2.5rem_1fr_4.5rem_4.5rem] items-center gap-2 rounded-2xl px-3 py-2.5 odd:bg-slate-50">
          <span className="font-data font-bold text-slate-500">{r.rank}</span>
          <span className="flex min-w-0 items-center gap-2">
            <Icon name={r.levelIcon} size={28} />
            <span className="truncate font-semibold">{r.nama}</span>
          </span>
          <span className="text-right font-data font-bold text-teal-700">{r.month}</span>
          <span className="text-right font-data text-slate-500">{r.total}</span>
        </div>
      ))}
    </Card>
  );
}
