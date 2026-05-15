"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminHeader from "../admin/components/AdminHeader";
import GlobalHeader from "./GlobalHeader";
import GlobalFooter from "./GlobalFooter";
import styles from "./CommonLayout.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {isAdminPage ? <AdminHeader /> : <GlobalHeader />}
      <main className="flex-1">{children}</main>
      {!isAdminPage && <GlobalFooter />}
      <button
        type="button"
        className={`${styles.scrollTopButton} ${showScrollTop ? styles.scrollTopVisible : ""}`}
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
      >
        ↑
      </button>
    </>
  );
}
