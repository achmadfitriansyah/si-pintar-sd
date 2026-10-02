"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Cache sementara di memori: halaman yang pernah dibuka langsung tampil, datanya disegarkan di belakang layar.
const cache = new Map();
// Permintaan pemanasan yang sedang berjalan, supaya halaman yang dibuka saat itu tidak meminta dua kali.
const inflight = new Map();
let epoch = 0; // naik tiap cache dibersihkan (login/keluar), supaya hasil pemanasan lama tidak masuk cache akun lain
export const clearCache = () => {
  epoch++;
  cache.clear();
  inflight.clear();
};
const keyOf = (action, payload) => `${action}|${JSON.stringify(payload)}`;

/**
 * Pemanasan: ambil data tab lain di belakang layar setelah halaman pertama tampil,
 * supaya ketukan pertama ke tab itu tidak perlu menunggu server.
 * jobs = [[action, payload], ...]; berjalan 2 permintaan sekaligus.
 */
export async function prefetchRpc(jobs) {
  const my = epoch;
  const queue = jobs.filter(([a, p = {}]) => !cache.has(keyOf(a, p)) && !inflight.has(keyOf(a, p)));
  const worker = async () => {
    while (queue.length && my === epoch) {
      const [a, p = {}] = queue.shift();
      const ck = keyOf(a, p);
      const pr = rpc(a, p);
      inflight.set(ck, pr);
      try {
        const res = await pr;
        if (my === epoch && !cache.has(ck)) cache.set(ck, res);
      } catch {}
      if (inflight.get(ck) === pr) inflight.delete(ck);
    }
  };
  await Promise.all([worker(), worker()]);
}

/** Panggil aksi server */
export async function rpc(action, payload = {}) {
  if (action.startsWith("auth.") || action.startsWith("checkpoint.")) clearCache();
  let r;
  try {
    r = await fetch("/api/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
  } catch {
    throw new Error("Tidak ada koneksi internet");
  }
  let j = {};
  try {
    j = await r.json();
  } catch {
    throw new Error("Server tidak merespons");
  }
  if (!r.ok || j.error) {
    const e = new Error(j.error || "Terjadi kesalahan");
    e.status = r.status;
    throw e;
  }
  return j.result;
}

/** Ambil data saat halaman dibuka; reload() untuk menyegarkan */
export function useRpc(action, payload = {}, deps = []) {
  const key = JSON.stringify(payload);
  const ck = `${action}|${key}`;
  const [data, setDataRaw] = useState(() => cache.get(ck) ?? null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(() => !cache.has(ck));
  const seq = useRef(0);
  const setData = useCallback(
    (v) => {
      const nv = typeof v === "function" ? v(cache.get(ck) ?? null) : v;
      if (nv != null) cache.set(ck, nv);
      setDataRaw(nv);
    },
    [ck]
  );

  const load = useCallback(
    async (silent = false, fromMount = false) => {
      const id = ++seq.current;
      const hit = cache.get(ck);
      if (hit !== undefined && !silent) {
        setDataRaw(hit); // tampilkan yang tersimpan dulu, lalu segarkan
        setLoading(false);
      } else if (!silent) setLoading(true);
      setError(null);
      try {
        // saat halaman baru dibuka, pakai permintaan pemanasan yang sedang berjalan (kalau ada)
        const res = await ((fromMount && inflight.get(ck)) || rpc(action, JSON.parse(key)));
        if (id === seq.current) {
          cache.set(ck, res);
          setDataRaw(res);
        }
      } catch (e) {
        if (id === seq.current) setError(e);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action, key, ck, ...deps]
  );

  useEffect(() => {
    load(false, true);
  }, [load]);

  return { data, error, loading, reload: load, setData };
}

/** Unggah gambar yang sudah distandarkan */
export async function uploadImage(blob, kind = "cover") {
  const fd = new FormData();
  fd.append("file", blob, kind === "logo" ? "logo.png" : "cover.jpg");
  fd.append("kind", kind);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || "Gagal mengunggah gambar");
  return j.result.url;
}

export const firstName = (n = "") => n.split(" ")[0];
export const initials = (n = "") =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
