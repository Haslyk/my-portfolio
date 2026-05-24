import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Halim Aslıyüksek | Yazılım Mühendisi",
  description:
    "Halim Aslıyüksek'in web, mobil ve yapay zeka odaklı yazılım mühendisliği portfolyosu.",
  keywords: [
    "Halim Aslıyüksek",
    "Yazılım Mühendisi",
    "Full-Stack Developer",
    "React",
    "Node.js",
    "Python",
    "Yapay Zeka",
    "Portfolio",
  ],
  authors: [{ name: "Halim Aslıyüksek" }],
  creator: "Halim Aslıyüksek",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://halim-asliyuksek.vercel.app",
    title: "Halim Aslıyüksek | Yazılım Mühendisi",
    description:
      "Halim Aslıyüksek'in web, mobil ve yapay zeka odaklı yazılım mühendisliği portfolyosu.",
    siteName: "Halim Aslıyüksek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Halim Aslıyüksek | Yazılım Mühendisi",
    description:
      "Halim Aslıyüksek'in web, mobil ve yapay zeka odaklı yazılım mühendisliği portfolyosu.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
