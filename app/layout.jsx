import { Fredoka, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});
const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space",
});

export const metadata = {
  title: "SI-PINTAR SD — Smart Library",
  description:
    "Sistem Perpustakaan Interaktif dan Literasi Terpadu SDN 001 Balikpapan Selatan",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SI-PINTAR SD",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport = {
  themeColor: "#EF4444",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${fredoka.variable} ${jakarta.variable} ${space.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
