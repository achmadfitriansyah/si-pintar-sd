-- =====================================================================
--  MIGRASI (jalankan SEKALI di database yang sudah berisi data)
--  - Nomor stiker terpisah dari isi QR
--  - Password orang tua terpisah dari password siswa
--  - Hapus sistem lencana
--  Aman dijalankan ulang.
-- =====================================================================

alter table book_copies add column if not exists label text;

update book_copies
   set label = qr_code,
       qr_code = 'SP' || upper(replace(substr(gen_random_uuid()::text, 1, 13), '-', ''))
 where label is null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'book_copies_school_id_label_key') then
    alter table book_copies add constraint book_copies_school_id_label_key unique (school_id, label);
  end if;
end $$;

alter table students add column if not exists ortu_pin_hash text;
-- (kolom pinned_badges lama dibiarkan; tidak dipakai lagi)

-- poin dari lencana lama tidak dihitung lagi
delete from point_events where ref_key like 'tier:%';
