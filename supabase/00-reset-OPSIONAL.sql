-- ═══════════════════════════════════════════════════════════════════
--  OPSIONAL — HANYA jika sebelumnya Pipit pernah menjalankan SQL lain
--  (misalnya 01-schema.sql versi lama dari paket "supabase-upgrade").
--  Script ini MENGHAPUS semua tabel SI-PINTAR beserta isinya.
--  Kalau database Supabase masih benar-benar kosong, LEWATI file ini.
-- ═══════════════════════════════════════════════════════════════════
drop view if exists v_books_full cascade;
drop view if exists v_books_stock cascade;
drop view if exists v_book_copies_full cascade;
drop function if exists generate_nomor_induk(bigint, bigint) cascade;
drop function if exists generate_random_qr_code() cascade;
drop function if exists bulk_generate_qr_tags(integer, text) cascade;
drop function if exists register_qr_to_book(text, bigint) cascade;
drop table if exists login_attempts, demo_checkpoints, challenges, point_events, loans,
  book_copies, qr_tags, books, shelves, categories, students, teachers, admins, schools cascade;
