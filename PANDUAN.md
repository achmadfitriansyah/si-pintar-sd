# Panduan Pasang SI-PINTAR SD v1

Urutannya: **(A) GitHub Desktop → (B) Supabase → (C) Vercel → (D) Langkah pertama → (E) Uji coba**.
Kerjakan berurutan. Total sekitar 20–30 menit.

---

## A. Update repository lewat GitHub Desktop

Repo lama kamu: `si-pintar-sd` (yang sudah tersambung ke Vercel). Kita ganti seluruh isinya dengan versi baru.

1. **Buka GitHub Desktop.** Pastikan *Current repository* = `si-pintar-sd`.
   - Kalau belum ada di komputer: **File → Clone repository → GitHub.com** → pilih `si-pintar-sd` → **Clone**.
2. Klik **Repository → Show in Explorer** (Windows) / **Show in Finder** (Mac). Folder repo akan terbuka.
3. **Hapus semua file dan folder lama** di folder itu, **KECUALI folder `.git`**.
   - Folder `.git` tersembunyi. Di Windows: Explorer → *View* → centang *Hidden items* supaya kelihatan, dan **jangan dihapus**.
   - File lama Apps Script (`backend-appscript`, dll.) boleh ikut dihapus — sudah tidak dipakai. (Kalau mau disimpan, pindahkan ke luar folder repo dulu.)
4. **Ekstrak `si-pintar-sd-v1.zip`**, lalu **salin semua isi di dalamnya** (bukan foldernya) ke folder repo.
   Hasil akhirnya harus seperti ini (langsung di akar repo):
   ```
   .git/            ← jangan disentuh
   app/
   components/
   lib/
   public/
   supabase/
   .env.example
   .gitignore
   next.config.mjs
   package.json
   package-lock.json
   PANDUAN.md
   README.md
   tailwind.config.js
   vercel.json
   ...
   ```
   ⚠️ Kalau `package.json` ada di dalam subfolder (misal `si-pintar-sd-v1/package.json`), Vercel akan gagal build. Pastikan ada di akar.
5. Kembali ke GitHub Desktop. Di tab **Changes** akan muncul banyak file (hapus + baru). Itu normal.
6. Di kotak kiri bawah isi **Summary**: `SI-PINTAR v1 – Next.js + Supabase` → klik **Commit to main**.
7. Klik **Push origin** (tombol biru di atas).
   Vercel otomatis mulai build. Build pertama **akan gagal atau error saat dibuka** — wajar, karena database & env belum diisi. Lanjut ke B.

> **Update berikutnya**: cukup ganti/ubah file di folder repo → GitHub Desktop → Commit → Push. Vercel otomatis deploy ulang dalam 1–2 menit.

---

## B. Siapkan database di Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → pilih project kamu.
   - Kalau belum ada: **New project** → Region **Asia-Pacific (Sydney atau Singapore)** — samakan dengan region di `vercel.json` → simpan password database di tempat aman.
2. Menu kiri → **SQL Editor** → **New query**.
3. **Hanya jika** kamu pernah menjalankan SQL versi lama di project ini: buka file `supabase/00-reset-OPSIONAL.sql`, salin semua isinya, tempel, klik **Run**. Kalau database masih kosong, **lewati langkah ini**.
4. Buka `supabase/01-schema.sql` (pakai Notepad / VS Code), **salin semua**, tempel di SQL Editor (hapus isi lama), klik **Run**.
   Harus muncul `Success. No rows returned`.
5. Query baru lagi → salin semua isi `supabase/02-seed.sql` → **Run**.
   Ini mengisi 2 sekolah (Demo & SDN 001), 24 buku contoh demo, 54 eksemplar, 30 siswa demo, riwayat pinjam, dll.
6. Cek: menu **Table Editor** → harus ada tabel `schools`, `students`, `books`, `book_copies`, `loans`, dst.
   Menu **Storage** → harus ada bucket `covers` (public).
7. Ambil 2 nilai untuk Vercel: **Project Settings (ikon gerigi) → API Keys**
   - **Project URL** → contoh `https://abcdxyz.supabase.co`
     (ada di *Project Settings → Data API*, atau tombol **Connect** di atas)
   - **Secret key** → di tab *API Keys*, bagian **Secret keys** (diawali `sb_secret_...`) → klik ikon mata / copy.
     Kalau yang muncul tab *Legacy API keys*, pakai **`service_role`** (bukan `anon`).

   ⚠️ Secret key ini = kunci master database. **Jangan** ditaruh di GitHub, WhatsApp grup, atau screenshot.

---

## C. Isi Environment Variables di Vercel

1. Buka [vercel.com](https://vercel.com) → project `si-pintar-sd` → **Settings → Environment Variables**.
2. **Hapus** variabel lama kalau ada: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sudah tidak dipakai).
3. Tambahkan 3 variabel ini (centang **Production, Preview, Development**):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari langkah B7 |
   | `SUPABASE_SERVICE_ROLE_KEY` | Secret key dari langkah B7 |
   | `SESSION_SECRET` | Teks acak ≥ 32 karakter, contoh ketik asal: `pintar-balsel-9f3k2m8x7q1w4e6r5t0y` (buat versimu sendiri) |

   `SESSION_SECRET` dipakai untuk mengunci cookie login. Kalau nanti diganti, semua pengguna otomatis keluar dan harus login ulang (tidak apa-apa).
4. Tab **Deployments** → deployment paling atas → tombol **⋯** → **Redeploy** → **Redeploy**.
   (Env baru hanya terbaca setelah redeploy.)
5. Tunggu status **Ready** ✅ lalu buka `https://si-pintar-sd.vercel.app`.

---

## D. Langkah pertama setelah online

### 1. Simpan checkpoint awal Demo (penting!)
1. Buka `https://si-pintar-sd.vercel.app/demo/checkpoint` (alamat ini tidak ada tombolnya, ketik manual).
2. Ketik username `admin`, password `admin`.
3. Isi nama checkpoint, misal **Awal**, lalu **Simpan**.
   Nanti setelah demo ke sekolah lain dan datanya berantakan, buka halaman yang sama → pada **Awal** tekan **Kembalikan**.
   Sistem menyimpan 5 checkpoint terakhir.

### 2. Aktifkan akun guru SDN 001
1. Buka `/sdn001balsel/login` → tab **Guru** → `admin` / `admin`.
2. Kamu langsung diminta **ganti password**. Pakai password yang kuat, catat, lalu serahkan ke pustakawan/guru.
3. Masuk **Pengaturan** → upload logo sekolah, cek nama sekolah, aturan pinjam (default 3 buku, 7 hari).
4. Menu **Siswa → Impor Excel** → unduh templatenya → isi NISN, Nama, Kelas → upload.
5. Menu **Buku** → tambah buku (scan stiker QR → scan barcode ISBN → foto cover).

---

## E. Uji coba cepat (akun Demo)

| Peran | Login | Catatan |
|---|---|---|
| Siswa | NISN `0012345678` / `123456` | Arga Pramudita, kelas 2A |
| Orang tua | tab **Orang Tua**, NISN `0012345678` / `123456` | melihat data Arga |
| Guru | `admin` / `admin` | di demo password tidak bisa diganti |

Di halaman login Demo ada tombol isi cepat — tombol itu hanya mengisi form, tetap tekan **Masuk**.

Checklist:
- [ ] Siswa → **Pinjam** → ketik kode `DEMO-0001` s/d `DEMO-0054` (atau scan QR kalau sudah dicetak) → poin & tantangan bergerak
- [ ] Guru → **Sirkulasi → Pinjam** → ketik NISN (nama muncul) → scan/ketik kode buku
- [ ] Guru → **Sirkulasi → Kembali** → ketik kode → pilih kondisi → **Terima** (+10 poin kalau tepat waktu)
- [ ] Guru → **Tantangan → Buat tantangan** → muncul di HP siswa
- [ ] Guru → **Laporan** → Unduh PDF
- [ ] Buka di HP: tampilan potret + navigasi bawah. Buka di laptop: sidebar + layar lebar
- [ ] HP Android (Chrome) → menu ⋮ → **Tambahkan ke layar utama** → terpasang seperti aplikasi

---

## F. Kalau ada masalah

| Gejala | Penyebab & solusi |
|---|---|
| Build Vercel gagal: `Couldn't find any pages or app directory` | Isi zip tersalin dalam subfolder. Pindahkan semua ke akar repo (lihat A4). |
| Muncul "Database belum tersambung" / error 500 | Env di Vercel belum lengkap atau belum **Redeploy** (C4). |
| `Sekolah tidak ditemukan` | `02-seed.sql` belum dijalankan (B5). |
| Error SQL `already exists` saat menjalankan 01 | Pernah menjalankan SQL lama → jalankan `00-reset-OPSIONAL.sql` dulu, lalu 01 dan 02 lagi. |
| Kamera tidak mau terbuka | Harus lewat `https://` (Vercel sudah https) dan izin kamera di browser diizinkan. |
| Upload cover gagal | Cek Storage → bucket `covers` ada & **Public**. Kalau tidak ada, jalankan ulang bagian storage di `01-schema.sql`. |
| Salah password 5× | Tunggu 5 menit, lalu coba lagi. |
| Lupa password guru SDN 001 | Supabase → Table Editor → `admins` → baris `sdn001balsel` → kosongkan kolom `password_hash` & set `must_change` = true → login lagi pakai `admin`/`admin`. |
| Pencarian ISBN / cover Google tidak muncul | Kadang Google Books membatasi. Isi manual atau foto cover pakai kamera. |

---

## Yang belum ada di v1 (tahap berikutnya)
- Cetak stiker QR massal (modul terpisah)
- Aplikasi Android di Play Store (bungkus web ini + scanner native)
- Login pakai tanggal lahir / PIN, satu akun ortu untuk beberapa anak
- Sanksi keterlambatan, e-book
