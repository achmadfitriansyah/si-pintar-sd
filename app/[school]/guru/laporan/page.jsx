"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, BookOpen, Undo2, Clock, AlertTriangle, Users, Star } from "lucide-react";
import { Page } from "@/components/AppShell";
import GuruHeader from "@/components/GuruHeader";
import { Card, Button, Spinner, ErrorBox, Input } from "@/components/ui";
import { useToast } from "@/components/Providers";
import { useRpc } from "@/lib/client";
import { monthKey, fmtMonth, fmtDate } from "@/lib/time";

export default function Laporan() {
  const toast = useToast();
  const [month, setMonth] = useState(monthKey());
  const { data: d, error, loading, reload } = useRpc("guru.report", { month });
  const [making, setMaking] = useState(false);

  const pdf = async () => {
    setMaking(true);
    try {
      await makePdf(d);
    } catch (e) {
      toast.error("Gagal membuat PDF: " + e.message);
    } finally {
      setMaking(false);
    }
  };

  return (
    <Page>
      <GuruHeader
        icon="status/laporan"
        title="Laporan Bulanan"
        sub="Ringkasan sirkulasi untuk kepala sekolah atau dinas"
        actions={
          <>
            <Input type="month" value={month} max={monthKey()} onChange={(e) => e.target.value && setMonth(e.target.value)} className="w-auto py-2.5" />
            <Button variant="teal" icon={Download} loading={making} disabled={!d} onClick={pdf}>
              Unduh PDF
            </Button>
          </>
        }
      />
      {error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : loading || !d ? (
        <Spinner label="Menyusun laporan..." />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi icon={BookOpen} label="Peminjaman" value={d.summary.pinjam} c="#0D9488" />
            <Kpi icon={Undo2} label="Pengembalian" value={d.summary.kembali} c="#2563EB" />
            <Kpi icon={Clock} label="Tepat waktu" value={d.summary.kembali ? `${Math.round((d.summary.tepatWaktu / d.summary.kembali) * 100)}%` : "-"} c="#10B981" />
            <Kpi icon={AlertTriangle} label="Terlambat" value={d.summary.terlambat} c="#DC2626" />
            <Kpi icon={Users} label="Siswa aktif" value={d.summary.siswaAktif} c="#7C3AED" />
            <Kpi icon={Star} label="Poin diberikan" value={d.summary.poin} c="#F59E0B" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <div className="mb-3 font-display text-lg font-bold">Buku terpopuler</div>
              <Rank rows={d.topBooks.map((b) => [b.judul, b.kategori, b.n])} empty="Belum ada peminjaman" />
            </Card>
            <Card>
              <div className="mb-3 font-display text-lg font-bold">Siswa paling rajin</div>
              <Rank rows={d.topStudents.map((s) => [s.nama, `Kelas ${s.kelas}`, s.n])} empty="Belum ada peminjaman" />
            </Card>
            <Card>
              <div className="mb-3 font-display text-lg font-bold">Peminjaman per kelas</div>
              {d.perClass.length ? (
                <div className="space-y-2">
                  {d.perClass.map((c) => {
                    const max = Math.max(...d.perClass.map((x) => x.n));
                    return (
                      <div key={c.kelas} className="flex items-center gap-3 text-sm">
                        <span className="w-10 font-bold">{c.kelas}</span>
                        <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(c.n / max) * 100}%` }} transition={{ type: "spring", stiffness: 60 }} className="h-full rounded-full bg-teal-500" />
                        </div>
                        <span className="w-8 text-right font-data font-bold">{c.n}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Belum ada data.</p>
              )}
            </Card>
            <Card>
              <div className="mb-3 font-display text-lg font-bold">Buku hilang / rusak berat</div>
              {d.damaged.length ? (
                <div className="space-y-1.5 text-sm">
                  {d.damaged.map((x, i) => (
                    <div key={i} className="flex justify-between gap-2 rounded-xl bg-slate-50 p-2">
                      <span className="truncate">{x.judul}</span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {x.siswa} ({x.kelas}) · <b>{x.jenis}</b>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Tidak ada buku hilang atau rusak berat</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </Page>
  );
}

function Kpi({ icon: Icon, label, value, c }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card">
      <Icon className="h-5 w-5" style={{ color: c }} />
      <div className="mt-2 font-data text-2xl font-bold">{value}</div>
      <div className="text-xs font-bold text-slate-500">{label}</div>
    </div>
  );
}

function Rank({ rows, empty }) {
  if (!rows.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <div className="space-y-1.5">
      {rows.map(([a, b, n], i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 text-sm">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full font-data text-xs font-bold ${i < 3 ? "bg-amber-100 text-amber-700" : "bg-white text-slate-500"}`}>{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{a}</div>
            <div className="text-xs text-slate-500">{b}</div>
          </div>
          <span className="font-data font-bold">{n}×</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════ PDF
async function makePdf(d) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const teal = [13, 148, 136];

  // Kop
  doc.setFillColor(...teal);
  doc.rect(0, 0, W, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("LAPORAN BULANAN PERPUSTAKAAN", 14, 13);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.school.name} · ${fmtMonth(d.month)}`, 14, 21);
  doc.setFontSize(8);
  doc.text(`Dibuat ${fmtDate(new Date())} · SI-PINTAR SD`, W - 14, 21, { align: "right" });

  doc.setTextColor(15, 23, 42);
  let y = 40;
  const s = d.summary;
  const pct = s.kembali ? Math.round((s.tepatWaktu / s.kembali) * 100) : 0;
  const boxes = [
    ["Peminjaman", s.pinjam],
    ["Pengembalian", s.kembali],
    ["Tepat waktu", `${pct}%`],
    ["Terlambat", s.terlambat],
    ["Siswa aktif", s.siswaAktif],
    ["Hilang/rusak", s.hilang + s.rusakBerat],
  ];
  const bw = (W - 28 - 5 * 3) / 6;
  boxes.forEach(([l, v], i) => {
    const x = 14 + i * (bw + 3);
    doc.setFillColor(240, 253, 250);
    doc.roundedRect(x, y, bw, 20, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(String(v), x + bw / 2, y + 9, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(l, x + bw / 2, y + 15, { align: "center" });
  });
  y += 28;

  const table = (title, head, body) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [head],
      body: body.length ? body : [[{ content: "Tidak ada data", colSpan: head.length, styles: { halign: "center", textColor: [148, 163, 184] } }]],
      theme: "grid",
      headStyles: { fillColor: teal, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  };

  table("Buku Terpopuler", ["#", "Judul", "Kategori", "Dipinjam"], d.topBooks.map((b, i) => [i + 1, b.judul, b.kategori || "-", `${b.n}x`]));
  table("Siswa Paling Rajin", ["#", "Nama", "Kelas", "Meminjam"], d.topStudents.map((b, i) => [i + 1, b.nama, b.kelas, `${b.n}x`]));
  table("Peminjaman per Kelas", ["Kelas", "Jumlah peminjaman"], d.perClass.map((c) => [c.kelas, c.n]));
  table("Pengembalian Terlambat", ["Judul", "Siswa", "Kelas", "Jatuh tempo", "Dikembalikan"], d.lateList.map((l) => [l.judul, l.siswa, l.kelas, fmtDate(l.due), fmtDate(l.kembali)]));
  table("Buku Hilang / Rusak Berat", ["Judul", "Siswa", "Kelas", "Keterangan"], d.damaged.map((x) => [x.judul, x.siswa, x.kelas, x.jenis]));

  // Tanda tangan
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Mengetahui,", 30, y + 6);
  doc.text("Kepala Sekolah", 30, y + 11);
  doc.text("Pustakawan", W - 60, y + 11);
  doc.text("(____________________)", 22, y + 32);
  doc.text("(____________________)", W - 68, y + 32);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Halaman ${i} dari ${pages}`, W / 2, 290, { align: "center" });
  }
  doc.save(`laporan-perpustakaan-${d.month}.pdf`);
}
