"use client";

import { usePathname } from "next/navigation";
import GlobalFooter from "./GlobalFooter";

export default function AppFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <GlobalFooter />;
}
