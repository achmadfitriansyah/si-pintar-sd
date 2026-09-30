"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Star, Crown, Flame, Settings2, ScanLine } from "lucide-react";
import { useSchool } from "@/components/SchoolContext";
import { Page } from "@/components/AppShell";
import { Card, ProgressBar, Spinner, ErrorBox, Modal, Button, BadgeMedal, PageHero } from "@/components/ui";
import { ChallengeRow, ClassChallenge, LoanCard } from "@/components/StudentBits";
import { useToast } from "@/components/Providers";
import { useRpc, rpc, firstName } from "@/lib/client";
import { fmtShort } from "@/lib/time";

function greeting() {
  const h = new Date(Date.now() + 8 * 3600e3).getUTCHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function SiswaHome() {
  const { slug } = useSchool();
  const { data: d, error, loading, reload, setData } = useRpc("siswa.overview");
  const [pickOpen, setPickOpen] = useState(false);

  if (loading && !d) return <Spinner label="Membuka beranda..." />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const challenges = [...d.weekly, ...d.guru];
  const doneCount = challenges.filter((c) => c.done).length;

  return (
    <div>
      <PageHero from="#EF4444" to="#F97316" className="pb-24 pt-6 lg:rounded-b-[3rem]">
        <Page>
          <div className="flex items-center gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/25 text-4xl backdrop-blur">
              {d.level.emoji}
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white/85">{greeting()},</div>
              <h1 className="truncate font-display text-3xl font-bold">Hai, {firstName(d.student.nama)}!</h1>
              <div className="text-sm text-white/85">Kelas {d.student.kelas}</div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-white/15 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>
                Level {d.level.level} · {d.level.name}
              </span>
              <span className="font-data">{d.points.total} poin</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={d.level.pct} max={100} color="#FDE047" track="rgba(255,255,255,.25)" height={12} />
            </div>
            <div className="mt-1.5 text-xs text-white/85">{d.level.next ? `${d.level.toNext} poin lagi ke Level ${d.level.next.level} (${d.level.next.name})` : "Level tertinggi! Hebat sekali 🌟"}</div>
          </div>
        </Page>
      </PageHero>

      <Page className="-mt-16 space-y-5">
        {/* Lencana pajangan + angka cepat */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-lg font-bold">Lencanaku</div>
              {d.badges.length > 0 && (
                <button onClick={() => setPickOpen(true)} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 active:scale-95">
                  <Settings2 className="h-3.5 w-3.5" /> Atur pajangan
                </button>
              )}
            </div>
            {d.pinned.length ? (
              <div className="flex flex-wrap gap-3">
                {d.pinned.map((b, i) => (
                  <motion.div key={b.id} initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 300, damping: 13 }}>
                    <BadgeMedal badge={b} size={60} />
                  </motion.div>
                ))}
                {d.badges.length > d.pinned.length && (
                  <Link href={`/${slug}/siswa/tantangan`} className="flex h-[60px] items-center self-start rounded-full bg-slate-50 px-4 text-xs font-bold text-slate-500">
                    +{d.badges.length - d.pinned.length} lainnya
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Belum ada lencana. Kembalikan 5 buku tepat waktu untuk lencana pertamamu!</p>
            )}
          </Card>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <Stat icon={Star} color="#F59E0B" label="Poin bulan ini" value={d.points.month} />
            <Stat icon={Crown} color="#8B5CF6" label="Peringkat kelas" value={`#${d.rank}`} sub={`dari ${d.classSize}`} />
            <Stat icon={Flame} color="#EF4444" label="Minggu beruntun" value={d.tiers.find((t) => t.id === "rajin")?.extra?.currentStreak || 0} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Buku yang dipinjam */}
          <section>
            <SectionHead title="Buku yang kupinjam" href={`/${slug}/siswa/buku-saya`} extra={`${d.active.length}/${d.school.max_books}`} />
            {d.active.length ? (
              <div className="space-y-2">
                {d.active.map((l, i) => (
                  <LoanCard key={l.id} l={l} i={i} />
                ))}
              </div>
            ) : (
              <Link href={`/${slug}/siswa/pinjam`} className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-red-200 bg-white/70 p-5 active:scale-[.98] transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display font-bold">Belum ada buku dipinjam</div>
                  <div className="text-sm text-slate-500">Scan QR di buku untuk mulai meminjam</div>
                </div>
              </Link>
            )}
          </section>

          {/* Tantangan minggu ini */}
          <section>
            <SectionHead title="Tantangan minggu ini" href={`/${slug}/siswa/tantangan`} extra={`${doneCount}/${challenges.length} selesai`} />
            <div className="space-y-2">
              {challenges.slice(0, 4).map((c, i) => (
                <ChallengeRow key={c.id} c={c} i={i} />
              ))}
            </div>
          </section>
        </div>

        <ClassChallenge cc={d.classChallenge} />

        {d.recentPoints.length > 0 && (
          <section>
            <SectionHead title="Poin terbaru" />
            <Card className="divide-y divide-slate-100 p-0 sm:p-0">
              {d.recentPoints.slice(0, 5).map((e, i) => (
                <motion.div key={e.id || e.ref_key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-lg">⭐</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{e.reason}</div>
                    <div className="text-xs text-slate-400">{fmtShort(e.created_at)}</div>
                  </div>
                  <div className="font-data font-bold text-amber-600">+{e.amount}</div>
                </motion.div>
              ))}
            </Card>
          </section>
        )}

        <p className="pb-4 text-center font-display text-sm font-semibold text-brand">&ldquo;Membaca Hari Ini, Sukses Esok Hari!&rdquo; 📚</p>
      </Page>

      <PinPicker open={pickOpen} onClose={() => setPickOpen(false)} badges={d.badges} pinned={d.pinned} onSaved={(pinned) => setData({ ...d, pinned })} />
    </div>
  );
}

function Stat({ icon: Icon, color, label, value, sub }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} className="rounded-3xl bg-white p-3 shadow-card lg:flex lg:items-center lg:gap-3 lg:p-4">
      <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl lg:mb-0" style={{ background: `${color}1A`, color }}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-data text-xl font-bold leading-tight">
          {value} {sub && <span className="text-xs font-semibold text-slate-400">{sub}</span>}
        </div>
        <div className="text-[11px] font-semibold leading-tight text-slate-500">{label}</div>
      </div>
    </motion.div>
  );
}

function SectionHead({ title, href, extra }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="flex items-center gap-2">
        {extra && <span className="text-xs font-bold text-slate-400">{extra}</span>}
        {href && (
          <Link href={href} className="flex items-center text-xs font-bold text-brand">
            Lihat <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function PinPicker({ open, onClose, badges, pinned, onSaved }) {
  const toast = useToast();
  const [sel, setSel] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setSel(pinned.map((b) => b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? s : [...s, id]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pilih 3 lencana pajangan"
      footer={
        <Button
          className="w-full"
          loading={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const r = await rpc("siswa.setPinned", { badges: sel });
              onSaved(r.pinned.map((id) => badges.find((b) => b.id === id)));
              toast.success("Lencana pajangan diperbarui!");
              onClose();
            } catch (e) {
              toast.error(e.message);
            } finally {
              setSaving(false);
            }
          }}
        >
          Simpan ({sel.length}/3)
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {badges.map((b) => (
          <BadgeMedal key={b.id} badge={b} size={60} selected={sel.includes(b.id)} onClick={() => toggle(b.id)} />
        ))}
      </div>
    </Modal>
  );
}
