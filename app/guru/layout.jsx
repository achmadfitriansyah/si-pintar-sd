import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GuruLayout({ children }) {
  return (
    <div className="min-h-screen bg-guru-bg">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Kembali</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-guru-teal flex items-center justify-center text-white text-lg">
              🎓
            </div>
            <div className="text-sm font-display font-bold text-slate-800">
              SI-PINTAR SD · Guru
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto pb-8">{children}</main>
    </div>
  );
}
