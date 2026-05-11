import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from "./components/GlobalHeader";
import MobileFooter from "./components/MobileFooter";

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
      <body className="min-h-full flex flex-col">
        <GlobalHeader />
        <main className="flex-1">{children}</main>
        <MobileFooter />
      </body>
    </html>
  );
}