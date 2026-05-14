import type { Metadata } from "next";
import { DM_Serif_Display, Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AppShell from "../app/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "CookMate",
  description: "CookMate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable} ${dmSerifDisplay.variable} min-h-full flex flex-col`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
