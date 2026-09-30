# SI-PINTAR SD

Sistem Perpustakaan Interaktif dan Literasi Terpadu untuk Sekolah Dasar.

- **Web**: Next.js 14 (App Router) + Tailwind + Framer Motion
- **Database**: Supabase (Postgres + Storage untuk cover & logo)
- **Hosting**: Vercel (region Singapura, dekat dengan Supabase)

Panduan lengkap pemasangan (GitHub Desktop → Supabase → Vercel) ada di **[PANDUAN.md](./PANDUAN.md)**.

## Alamat penting

| Halaman | Alamat |
|---|---|
| Pilih sekolah | `/` |
| Demo | `/demo/login` |
| SDN 001 Balikpapan Selatan | `/sdn001balsel/login` |
| Checkpoint demo (tersembunyi) | `/demo/checkpoint` |

## Variabel lingkungan (isi di Vercel, bukan di kode)

| Nama | Isi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key / service_role key dari Supabase |
| `SESSION_SECRET` | Teks acak minimal 32 karakter |

> Repo ini publik. Jangan pernah menaruh key atau password asli di file mana pun.

## Menjalankan di komputer (opsional)

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```
