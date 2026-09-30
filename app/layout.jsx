import Providers from "@/components/Providers";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
