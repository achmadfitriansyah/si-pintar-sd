"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

// ═══════════════ TOAST ═══════════════
const ToastCtx = createContext(null);
const ConfirmCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}
export function useConfirm() {
  return useContext(ConfirmCtx);
}

export default function Providers({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const resolver = useRef(null);

  const push = useCallback((type, text, ms = 3200) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-2), { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }, []);

  const toast = useRef({
    success: (t, ms) => push("success", t, ms),
    error: (t, ms) => push("error", t, ms ?? 4500),
    info: (t, ms) => push("info", t, ms),
  }).current;

  const confirm = useCallback((opts) => {
    setConfirmState(typeof opts === "string" ? { message: opts } : opts);
    return new Promise((res) => (resolver.current = res));
  }, []);

  const close = (v) => {
    setConfirmState(null);
    resolver.current?.(v);
  };

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const colors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-slate-800" };

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}

        {/* Toast */}
        <div className="fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none" style={{ paddingTop: "var(--safe-top)" }}>
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = icons[t.type];
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${colors[t.type]}`}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{t.text}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Konfirmasi */}
        <AnimatePresence>
          {confirmState && (
            <motion.div
              className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 40, scale: 0.96 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 40, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${confirmState.danger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-center font-display text-lg font-bold">{confirmState.title || "Yakin?"}</h3>
                {confirmState.message && <p className="mt-1 text-center text-sm text-slate-600">{confirmState.message}</p>}
                <div className="mt-5 flex gap-2">
                  <button onClick={() => close(false)} className="flex-1 rounded-2xl bg-slate-100 py-3 font-semibold text-slate-700 active:scale-95 transition">
                    Batal
                  </button>
                  <button
                    onClick={() => close(true)}
                    className={`flex-1 rounded-2xl py-3 font-bold text-white active:scale-95 transition ${confirmState.danger ? "bg-red-600" : "bg-slate-900"}`}
                  >
                    {confirmState.ok || "Ya, lanjut"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}
