import { createClient } from "@supabase/supabase-js";

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

let client = null;

/** Klien Supabase dengan secret key. HANYA dipakai di server. */
export function db() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new AppError(
      "Database belum tersambung. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Vercel, lalu Redeploy.",
      500
    );
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** Jalankan query Supabase, lempar error yang mudah dibaca kalau gagal */
export async function run(query, msg = "Gagal mengakses database") {
  const { data, error, count } = await query;
  if (error) {
    if (error.code === "23505") throw new AppError("Data sudah ada (duplikat).");
    throw new AppError(`${msg}: ${error.message}`, 500);
  }
  return count !== undefined && count !== null && data === null ? count : data;
}
