"use client";
import { Heart, History, Crown } from "lucide-react";
import AppShell from "@/components/AppShell";
import { RoleGate } from "@/components/SchoolContext";

const items = [
  { href: "", label: "Anak Saya", icon: Heart },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/peringkat", label: "Peringkat", icon: Crown },
];

export default function OrtuLayout({ children }) {
  return (
    <RoleGate role="ortu">
      <AppShell role="ortu" items={items}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
