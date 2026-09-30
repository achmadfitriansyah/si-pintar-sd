-- ═══════════════════════════════════════════════════════════════════
--  SI-PINTAR SD v1 — SKEMA DATABASE
--  Jalankan PERTAMA di Supabase → SQL Editor → New query → Run
--  Aman dijalankan di database kosong.
-- ═══════════════════════════════════════════════════════════════════

-- ---------- SEKOLAH ----------
create table if not exists schools (
  id          bigserial primary key,
  slug        text unique not null,          -- dipakai di alamat web: /demo, /sdn001balsel
  name        text not null,
  short_name  text,
  logo_url    text,
  is_demo     boolean not null default false,
  max_books   int not null default 3,         -- maksimal buku dipinjam bersamaan
  loan_days   int not null default 7,         -- lama pinjam (hari)
  created_at  timestamptz not null default now()
);

-- ---------- ADMIN / GURU ----------
create table if not exists admins (
  id             bigserial primary key,
  school_id      bigint not null references schools(id) on delete cascade,
  username       text not null,
  password_hash  text,                         -- NULL = masih password bawaan "admin"
  must_change    boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (school_id, username)
);

-- ---------- SISWA ----------
create table if not exists students (
  id             bigserial primary key,
  school_id      bigint not null references schools(id) on delete cascade,
  nisn           text not null,
  nama           text not null,
  kelas          text not null,
  status         text not null default 'aktif' check (status in ('aktif','alumni')),
  tanggal_lahir  date,                         -- disiapkan untuk login versi berikutnya
  pin_hash       text,                         -- password siswa; NULL = masih bawaan "123456"
  ortu_pin_hash  text,                         -- password orang tua; NULL = masih bawaan "123456"
  created_at     timestamptz not null default now(),
  unique (school_id, nisn)
);
create index if not exists idx_students_kelas on students(school_id, kelas);

-- ---------- KATEGORI & RAK ----------
create table if not exists categories (
  id         bigserial primary key,
  school_id  bigint not null references schools(id) on delete cascade,
  kode       text not null,
  nama       text not null,
  emoji      text not null default '📚',
  color      text not null default '#EF4444',
  unique (school_id, kode)
);

create table if not exists shelves (
  id         bigserial primary key,
  school_id  bigint not null references schools(id) on delete cascade,
  kode       text not null,
  nama       text not null,
  unique (school_id, kode)
);

-- ---------- BUKU (JUDUL) ----------
create table if not exists books (
  id           bigserial primary key,
  school_id    bigint not null references schools(id) on delete cascade,
  judul        text not null,
  penulis      text,
  penerbit     text,
  tahun        int,
  isbn         text,
  category_id  bigint references categories(id) on delete set null,
  shelf_id     bigint references shelves(id) on delete set null,
  cover_url    text,
  deskripsi    text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_books_school on books(school_id);

-- ---------- EKSEMPLAR (BUKU FISIK, 1 STIKER QR) ----------
create table if not exists book_copies (
  id          bigserial primary key,
  school_id   bigint not null references schools(id) on delete cascade,
  book_id     bigint not null references books(id) on delete cascade,
  qr_code     text not null,   -- isi QR di stiker (acak, tidak bisa ditebak)
  label       text,            -- nomor stiker yang tercetak, mudah dibaca manusia (mis. 0001)
  kondisi     text not null default 'baik' check (kondisi in ('baik','rusak_ringan','rusak_berat')),
  status      text not null default 'tersedia' check (status in ('tersedia','dipinjam','hilang')),
  created_at  timestamptz not null default now(),
  unique (school_id, qr_code),
  unique (school_id, label)
);
create index if not exists idx_copies_book on book_copies(book_id);

-- ---------- PEMINJAMAN ----------
create table if not exists loans (
  id                bigserial primary key,
  school_id         bigint not null references schools(id) on delete cascade,
  copy_id           bigint not null references book_copies(id) on delete cascade,
  book_id           bigint not null references books(id) on delete cascade,
  student_id        bigint not null references students(id) on delete cascade,
  recorded_by       text not null default 'guru' check (recorded_by in ('siswa','guru')),
  borrowed_at       timestamptz not null default now(),
  due_date          date not null,
  returned_at       timestamptz,
  return_condition  text check (return_condition in ('baik','rusak_ringan','rusak_berat')),
  status            text not null default 'dipinjam' check (status in ('dipinjam','kembali','hilang')),
  created_at        timestamptz not null default now()
);
create index if not exists idx_loans_student on loans(student_id);
create index if not exists idx_loans_status on loans(school_id, status);
create index if not exists idx_loans_copy on loans(copy_id);

-- ---------- POIN ----------
-- ref_key unik per siswa = mencegah poin dobel (misal 'loan:12', 'tier:setia:1', 'week:2026-09-28:kembali2')
create table if not exists point_events (
  id          bigserial primary key,
  school_id   bigint not null references schools(id) on delete cascade,
  student_id  bigint not null references students(id) on delete cascade,
  amount      int not null,
  reason      text not null,
  ref_key     text not null,
  loan_id     bigint references loans(id) on delete set null,
  cancelled   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (student_id, ref_key)
);
create index if not exists idx_points_student on point_events(student_id);
create index if not exists idx_points_school_time on point_events(school_id, created_at);

-- ---------- TANTANGAN BUATAN GURU ----------
create table if not exists challenges (
  id           bigserial primary key,
  school_id    bigint not null references schools(id) on delete cascade,
  title        text not null,
  action       text not null check (action in ('pinjam','kembali')),
  target       int not null default 1 check (target between 1 and 20),
  category_id  bigint references categories(id) on delete set null,
  book_id      bigint references books(id) on delete set null,
  points       int not null check (points between 5 and 50),
  kelas        text,                            -- NULL = semua kelas
  start_date   date not null,
  end_date     date not null,
  created_at   timestamptz not null default now()
);

-- ---------- CHECKPOINT DEMO ----------
create table if not exists demo_checkpoints (
  id          bigserial primary key,
  school_id   bigint not null references schools(id) on delete cascade,
  label       text,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- ---------- PEMBATAS SALAH LOGIN ----------
create table if not exists login_attempts (
  id          bigserial primary key,
  key         text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_login_attempts on login_attempts(key, created_at);

-- ═══════════════════════════════════════════════════════════════════
--  KEAMANAN: semua tabel dikunci (RLS aktif tanpa policy).
--  Aplikasi mengakses database HANYA dari server Vercel memakai secret key,
--  jadi tidak ada yang bisa membaca data langsung dari browser.
-- ═══════════════════════════════════════════════════════════════════
alter table schools          enable row level security;
alter table admins           enable row level security;
alter table students         enable row level security;
alter table categories       enable row level security;
alter table shelves          enable row level security;
alter table books            enable row level security;
alter table book_copies      enable row level security;
alter table loans            enable row level security;
alter table point_events     enable row level security;
alter table challenges       enable row level security;
alter table demo_checkpoints enable row level security;
alter table login_attempts   enable row level security;

-- ---------- STORAGE: cover buku & logo (bisa dilihat publik) ----------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;
