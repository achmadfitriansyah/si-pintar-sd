"use client";
import { SchoolProvider } from "@/components/SchoolContext";

export default function SchoolLayout({ children }) {
  return <SchoolProvider>{children}</SchoolProvider>;
}
