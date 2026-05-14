"use client";

import { usePathname } from "next/navigation";
import AdminHeader from "../admin/components/AdminHeader";
import GlobalHeader from "./GlobalHeader";
import GlobalFooter from "./GlobalFooter";
import MobileFooter from "./MobileFooter";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {isAdminPage ? <AdminHeader /> : <GlobalHeader />}
      <main className="flex-1">{children}</main>
      {!isAdminPage && <GlobalFooter />}
      {!isAdminPage && <MobileFooter />}
    </>
  );
}
