"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav({ items, activeColor = "red" }) {
  const pathname = usePathname();
  const colorMap = {
    red: { active: "text-siswa-red", bg: "bg-siswa-red" },
    purple: { active: "text-ortu-purple", bg: "bg-ortu-purple" },
    teal: { active: "text-guru-teal", bg: "bg-guru-teal" },
  };
  const c = colorMap[activeColor] || colorMap.red;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t-2 border-slate-100 bottom-nav-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 pt-2">
        {items.map((item) => {
          const isActive =
            item.href === pathname ||
            (item.href !== "/siswa" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-1.5 tap"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className={`absolute inset-x-2 inset-y-0 ${c.bg}/10 rounded-2xl`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-6 h-6 relative z-10 transition-colors ${
                  isActive ? c.active : "text-slate-400"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-semibold mt-0.5 relative z-10 ${
                  isActive ? c.active : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
