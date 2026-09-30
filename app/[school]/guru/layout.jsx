"use client";
import { LayoutDashboard, ArrowLeftRight, BookOpen, Users, Trophy, FileText, Settings } from "lucide-react";
import AppShell from "@/components/AppShell";
import { RoleGate } from "@/components/SchoolContext";

const items = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sirkulasi", label: "Sirkulasi", icon: ArrowLeftRight },
  { href: "/buku", label: "Buku", icon: BookOpen },
  { href: "/siswa", label: "Siswa", icon: Users },
  { href: "/tantangan", label: "Tantangan", icon: Trophy },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function GuruLayout({ children }) {
  return (
    <RoleGate role="guru">
      <AppShell role="guru" items={items}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
