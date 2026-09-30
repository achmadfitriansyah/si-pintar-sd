"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSchool } from "@/components/SchoolContext";
import { Spinner } from "@/components/ui";

export default function SchoolHome() {
  const { slug, me } = useSchool();
  const router = useRouter();
  useEffect(() => {
    if (me === undefined) return;
    router.replace(me ? `/${slug}/${me.role}` : `/${slug}/login`);
  }, [me, slug, router]);
  return (
    <div className="paper flex min-h-dvh items-center justify-center bg-brand-cream">
      <Spinner />
    </div>
  );
}
