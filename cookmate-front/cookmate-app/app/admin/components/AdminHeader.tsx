"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "../../components/CommonLayout.module.css";

const ADMIN_NAV_ITEMS = [
  { label: "대시보드", path: "/admin/dashboard" },
  { label: "회원 관리", path: "/admin/users" },
  { label: "레시피 관리", path: "/admin/boards" },
  { label: "신고 관리", path: "/admin/reports" },
  { label: "공지 관리", path: "/admin/notices" },
  { label: "문의 관리", path: "/admin/inquiries" },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className={styles.adminHeader}>
      <div className={styles.adminInner}>
        <button type="button" className={styles.adminLogo} onClick={() => router.push("/")}>
          CookMate <span>Admin</span>
        </button>

        <nav className={styles.adminNav} aria-label="관리자 메뉴">
          {ADMIN_NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={pathname === item.path || pathname.startsWith(`${item.path}/`) ? styles.adminNavActive : ""}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.adminActions}>
          <button type="button" className={styles.adminSiteButton} onClick={() => router.push("/")}>
            사용자 화면
          </button>
        </div>
      </div>
    </header>
  );
}
