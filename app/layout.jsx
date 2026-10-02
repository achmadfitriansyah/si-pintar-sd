import Providers from "@/components/Providers";
import "./globals.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";

export const metadata = {
  title: "SI-PINTAR SD — Perpustakaan Pintar",
  description: "Sistem Perpustakaan Interaktif dan Literasi Terpadu untuk Sekolah Dasar",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SI-PINTAR SD" },
  icons: { icon: "/icons/favicon.png", apple: "/icons/apple-icon.png" },
};

export const viewport = {
  themeColor: "#EF4444",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
