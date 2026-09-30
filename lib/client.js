"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Panggil aksi server */
export async function rpc(action, payload = {}) {
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
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  const key = JSON.stringify(payload);

  const load = useCallback(
    async (silent = false) => {
      const id = ++seq.current;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await rpc(action, JSON.parse(key));
        if (id === seq.current) setData(res);
      } catch (e) {
        if (id === seq.current) setError(e);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action, key, ...deps]
  );

  useEffect(() => {
    load();
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
