"use client";
import { Home, Library, ScanLine, Trophy, Crown, BookMarked } from "lucide-react";
import AppShell from "@/components/AppShell";
import { RoleGate } from "@/components/SchoolContext";

const items = [
  { href: "", label: "Beranda", icon: Home },
  { href: "/koleksi", label: "Koleksi", icon: Library },
  { href: "/pinjam", label: "Pinjam", icon: ScanLine, fab: true },
  { href: "/tantangan", label: "Tantangan", icon: Trophy },
  { href: "/peringkat", label: "Peringkat", icon: Crown },
  { href: "/buku-saya", label: "Buku Saya", icon: BookMarked, mobile: false },
];

export default function SiswaLayout({ children }) {
  return (
    <RoleGate role="siswa">
      <AppShell role="siswa" items={items}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
