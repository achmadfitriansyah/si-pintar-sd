export const metadata = {
  title: "Kebijakan Privasi — SI-PINTAR SD",
  description: "Data apa yang dikumpulkan SI-PINTAR SD, untuk apa, dan bagaimana menghapusnya.",
};

const kontak = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
    <div className="mt-2 space-y-2 text-slate-700">{children}</div>
  </section>
);

export default function KebijakanPrivasi() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 leading-relaxed">
      <h1 className="font-display text-3xl font-bold text-slate-900">Kebijakan Privasi SI-PINTAR SD</h1>
      <p className="mt-2 text-sm text-slate-500">Berlaku sejak 1 Oktober 2026</p>

      <p className="mt-6 text-slate-700">
        SI-PINTAR SD adalah aplikasi perpustakaan sekolah dasar: mencatat peminjaman buku, poin membaca, dan tantangan membaca. Aplikasi ini dipakai oleh siswa, orang tua, dan guru. Halaman ini menjelaskan data apa yang kami simpan dan untuk apa.
      </p>

      <Section title="Siapa yang mengelola data">
        <p>
          Data siswa dimasukkan dan dikelola oleh <b>sekolah</b> (guru atau admin perpustakaan), bukan oleh siswa sendiri. Siswa dan orang tua tidak mendaftar sendiri; akun dibuat oleh sekolah. Setiap sekolah hanya bisa melihat data sekolahnya sendiri.
        </p>
      </Section>

      <Section title="Data yang kami simpan">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Data siswa:</b> nama, NISN, kelas, dan status (aktif atau alumni).</li>
          <li><b>Aktivitas membaca:</b> riwayat peminjaman dan pengembalian buku, poin, level, dan tantangan yang diselesaikan.</li>
          <li><b>Akun guru:</b> nama pengguna dan password (disimpan dalam bentuk terenkripsi/hash, tidak bisa dibaca kembali).</li>
          <li><b>Password siswa dan orang tua:</b> disimpan dalam bentuk hash. Bawaannya sama untuk semua akun baru dan bisa diganti sendiri.</li>
          <li><b>Katalog buku:</b> judul, penulis, kategori, rak, dan gambar sampul yang diunggah guru.</li>
        </ul>
        <p>Kami <b>tidak</b> mengumpulkan lokasi, kontak telepon, daftar aplikasi, atau data keuangan. Kami tidak menampilkan iklan dan tidak memakai alat analitik atau pelacak pihak ketiga.</p>
      </Section>

      <Section title="Kamera">
        <p>
          Kamera dipakai oleh guru untuk memindai kode QR dan barcode ISBN pada buku. Pemindaian terjadi di perangkat; gambar dari kamera tidak disimpan dan tidak dikirim ke server. Foto sampul buku hanya diunggah bila guru memilih untuk menambahkannya.
        </p>
      </Section>

      <Section title="Untuk apa data dipakai">
        <p>Data hanya dipakai untuk menjalankan perpustakaan sekolah: mencatat peminjaman, menghitung poin dan peringkat, menampilkan pantauan ke orang tua, dan membuat laporan untuk guru. Data tidak dijual dan tidak dibagikan untuk tujuan iklan.</p>
      </Section>

      <Section title="Layanan pihak ketiga">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Supabase</b> menyimpan database dan gambar sampul.</li>
          <li><b>Vercel</b> menjalankan situs dan aplikasi.</li>
          <li><b>Google Fonts</b> memuat huruf tampilan. Saat memuatnya, alamat IP perangkat terlihat oleh Google.</li>
        </ul>
        <p>Data dikirim lewat koneksi terenkripsi (HTTPS).</p>
      </Section>

      <Section title="Berapa lama data disimpan">
        <p>Data disimpan selama sekolah masih memakai aplikasi. Siswa yang lulus ditandai sebagai alumni. Sekolah dapat menghapus data siswa kapan saja dari menu Data Siswa.</p>
      </Section>

      <Section title="Menghapus data atau bertanya">
        <p>
          Orang tua yang ingin data anaknya dihapus atau dikoreksi dapat menghubungi guru atau admin perpustakaan di sekolah masing-masing, yang dapat menghapusnya langsung dari aplikasi.
          {kontak ? (
            <>
              {" "}Pertanyaan lain dapat dikirim ke <a className="font-semibold text-red-700 underline" href={`mailto:${kontak}`}>{kontak}</a>.
            </>
          ) : null}
        </p>
      </Section>

      <Section title="Perubahan kebijakan">
        <p>Bila kebijakan ini berubah, versi terbaru akan ditampilkan di halaman ini beserta tanggal berlakunya.</p>
      </Section>
    </main>
  );
}
