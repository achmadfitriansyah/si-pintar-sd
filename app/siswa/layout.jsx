import { Home, BookOpen, ScanLine, Trophy, Star } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const items = [
  { href: "/siswa", label: "Beranda", icon: Home },
  { href: "/siswa/koleksi", label: "Koleksi", icon: BookOpen },
  { href: "/siswa/pinjam", label: "Pinjam", icon: ScanLine },
  { href: "/siswa/tantangan", label: "Tantangan", icon: Trophy },
  { href: "/siswa/poin", label: "Poin", icon: Star },
];

export default function SiswaLayout({ children }) {
  return (
    <div className="min-h-screen bg-siswa-bg paper">
      <main className="max-w-md mx-auto pb-24">{children}</main>
      <BottomNav items={items} activeColor="red" />
    </div>
  );
}
