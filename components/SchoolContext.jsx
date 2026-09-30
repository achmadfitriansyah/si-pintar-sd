"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { rpc } from "@/lib/client";
import { Spinner, ErrorBox } from "./ui";

const Ctx = createContext(null);
export const useSchool = () => useContext(Ctx);

export function SchoolProvider({ children }) {
  const { school: slug } = useParams();
  const [school, setSchool] = useState(null);
  const [me, setMe] = useState(undefined); // undefined = belum dicek
  const [error, setError] = useState(null);

  // Tampilkan data sekolah & sesi terakhir dari penyimpanan sesi dulu, lalu cocokkan ke server.
  useEffect(() => {
    try {
      const c = JSON.parse(sessionStorage.getItem(`sp:${slug}`) || "null");
      if (c?.school) setSchool((x) => x || c.school);
      if (c?.me) setMe((x) => (x === undefined ? c.me : x));
    } catch {}
  }, [slug]);

  const refresh = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([rpc("school.info", { slug }), rpc("auth.me")]);
      const mine = m && m.school?.slug === slug ? m : null;
      setSchool(s);
      setMe(mine);
      setError(null);
      try {
        sessionStorage.setItem(`sp:${slug}`, JSON.stringify({ school: s, me: mine }));
      } catch {}
      return m;
    } catch (e) {
      setError(e);
      setMe(null);
    }
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await rpc("auth.logout").catch(() => {});
    try {
      sessionStorage.removeItem(`sp:${slug}`);
    } catch {}
    setMe(null);
    window.location.href = `/${slug}/login`;
  }, [slug]);

  if (error && !school) return <ErrorBox error={error} onRetry={refresh} />;
  return <Ctx.Provider value={{ slug, school, me, refresh, logout, setSchool }}>{children}</Ctx.Provider>;
}

/** Pagar halaman: hanya peran tertentu yang boleh masuk */
export function RoleGate({ role, children }) {
  const { slug, me, school } = useSchool();
  const router = useRouter();
  const path = usePathname();
  const ok = me && me.role === role;
  const mustChange = ok && role === "guru" && me.admin?.must_change && !school?.is_demo;

  useEffect(() => {
    if (me === undefined) return;
    if (!ok) router.replace(`/${slug}/login`);
    else if (mustChange && !path.endsWith("/ganti-password")) router.replace(`/${slug}/guru/ganti-password`);
  }, [me, ok, mustChange, path, router, slug]);

  if (!ok || (mustChange && !path.endsWith("/ganti-password"))) {
    return (
      <div className="flex min-h-dvh items-center justify-center paper">
        <Spinner label="Menyiapkan..." />
      </div>
    );
  }
  return children;
}
