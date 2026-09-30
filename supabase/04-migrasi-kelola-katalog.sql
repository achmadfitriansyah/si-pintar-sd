-- Kelola kategori, rak, rombel dari menu Pengaturan guru. Aman dijalankan ulang.
alter table categories add column if not exists icon text;
update categories set icon = case kode
  when '01' then 'kategori/cerpen'     when '02' then 'kategori/pengetahuan'
  when '03' then 'kategori/fiksi'      when '04' then 'kategori/komik'
  when '05' then 'kategori/pelajaran'  when '06' then 'kategori/cerita-rakyat'
  when '07' then 'kategori/agama'      when '08' then 'kategori/hobi'
  else 'kategori/semua' end
 where icon is null;
alter table schools add column if not exists rombel text not null default 'A,B,C,D,E,F';
