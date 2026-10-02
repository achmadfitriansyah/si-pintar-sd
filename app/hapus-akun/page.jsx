export const metadata = {
  title: "Hapus Akun dan Data — SI-PINTAR SD",
  description: "Cara meminta penghapusan akun dan data di aplikasi SI-PINTAR SD.",
};

const kontak = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
    <div className="mt-2 space-y-2 text-slate-700">{children}</div>
  </section>
);

export default function HapusAkun() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 leading-relaxed">
      <h1 className="font-display text-3xl font-bold text-slate-900">Hapus Akun dan Data — SI-PINTAR SD</h1>
      <p className="mt-2 text-sm text-slate-500">Berlaku sejak 1 Oktober 2026</p>

      <p className="mt-6 text-slate-700">
        Halaman ini menjelaskan cara meminta penghapusan akun dan data di aplikasi <b>SI-PINTAR SD</b> (aplikasi perpustakaan sekolah dasar). Akun siswa dan orang tua dibuat dan dikelola oleh <b>sekolah</b>, sehingga penghapusan dilakukan lewat sekolah.
      </p>

      <Section title="Langkah meminta penghapusan">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Orang tua atau siswa menyampaikan permintaan kepada guru atau admin perpustakaan di sekolah, secara langsung atau lewat saluran yang biasa dipakai sekolah.</li>
          <li>Guru atau admin membuka aplikasi, masuk ke menu <b>Data Siswa</b>, lalu memilih <b>Hapus</b> pada siswa yang dimaksud. Bila siswa masih meminjam buku, buku dikembalikan dulu.</li>
          <li>Data siswa terhapus saat itu juga.</li>
        </ol>
        {kontak ? (
          <p>
            Bila tidak bisa menghubungi sekolah, kirim permintaan ke <a className="font-semibold text-red-700 underline" href={`mailto:${kontak}`}>{kontak}</a> dengan menyebut nama sekolah, nama siswa, dan kelas. Kami meneruskannya ke sekolah yang bersangkutan.
          </p>
        ) : null}
      </Section>

      <Section title="Data yang dihapus">
        <ul className="list-disc space-y-1 pl-5">
          <li>Nama, NISN, kelas, dan status siswa.</li>
          <li>Riwayat peminjaman dan pengembalian buku siswa tersebut.</li>
          <li>Poin, level, dan tantangan yang diselesaikan.</li>
          <li>Password siswa dan password orang tua (dalam bentuk terenkripsi).</li>
        </ul>
      </Section>

      <Section title="Data yang tetap disimpan">
        <ul className="list-disc space-y-1 pl-5">
          <li>Katalog buku sekolah (judul, penulis, kategori, rak, sampul). Data ini bukan data pribadi siswa.</li>
          <li>Salinan cadangan teknis dari penyedia database dapat masih memuat data tersebut untuk sementara, dan terhapus otomatis mengikuti siklus cadangan penyedia.</li>
        </ul>
      </Section>

      <Section title="Akun guru">
        <p>Akun guru atau admin dihapus lewat permintaan ke pengelola aplikasi (email di atas, bila tersedia) atau oleh admin sekolah.</p>
      </Section>

      <p className="mt-8 text-sm text-slate-500">
        Penjelasan data yang kami simpan ada di <a className="font-semibold text-red-700 underline" href="/kebijakan-privasi">Kebijakan Privasi</a>.
      </p>
    </main>
  );
}
