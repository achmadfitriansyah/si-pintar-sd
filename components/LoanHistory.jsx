"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Cover, Tabs, Spinner, ErrorBox, Empty, Chip } from "./ui";
import { LoanCard } from "./StudentBits";
import { useRpc } from "@/lib/client";
import { fmtDate } from "@/lib/time";

/** Daftar buku sedang dipinjam + riwayat (dipakai siswa dan orang tua) */
export default function LoanHistory({ accent = "#EF4444" }) {
  const { data, error, loading, reload } = useRpc("siswa.loans");
  const [tab, setTab] = useState("aktif");
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const aktif = data.filter((l) => l.status === "dipinjam");
  const riwayat = data.filter((l) => l.status !== "dipinjam");

  return (
    <div className="space-y-4">
      <Tabs
        id="loans"
        color={accent}
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "aktif", label: "Sedang dipinjam", badge: aktif.length },
          { value: "riwayat", label: "Riwayat", badge: riwayat.length },
        ]}
      />
      {tab === "aktif" ? (
        aktif.length ? (
          <div className="grid gap-2 lg:grid-cols-2">
            {aktif.map((l, i) => (
              <LoanCard key={l.id} l={l} i={i} />
            ))}
          </div>
        ) : (
          <Empty icon="status/buku-tersedia" title="Tidak ada buku yang sedang dipinjam" />
        )
      ) : riwayat.length ? (
        <div className="grid gap-2 lg:grid-cols-2">
          {riwayat.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.04 }} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-100">
              <Cover src={l.book?.cover_url} alt={l.book?.judul} className="w-11 shrink-0" rounded="rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm font-bold">{l.book?.judul}</div>
                <div className="text-xs text-slate-500">
                  {fmtDate(l.borrowed_at)} → {l.returned_at ? fmtDate(l.returned_at) : "-"}
                </div>
              </div>
              {l.status === "hilang" ? (
                <Chip className="bg-slate-200 text-slate-600">Hilang</Chip>
              ) : l.late > 0 ? (
                <Chip className="bg-red-100 text-red-700">Telat {l.late} hr</Chip>
              ) : (
                <Chip className="bg-emerald-100 text-emerald-700">Tepat waktu</Chip>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <Empty icon="status/kosong" title="Belum ada riwayat" />
      )}
    </div>
  );
}
