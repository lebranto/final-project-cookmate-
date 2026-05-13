"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./CommonLayout.module.css";

const NAV_ITEMS = [
  { label: "홈", path: "/" },
  { label: "레시피", path: "/recipes" },
  { label: "AI추천", path: "/ai" },
  { label: "내 정보", path: "/mypage" },
];

export default function MobileFooter() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} aria-label="모바일 하단 메뉴">
      <div className={styles.bottomNavInner}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.label}
              type="button"
              className={`${styles.bnavItem}${active ? ` ${styles.active}` : ""}`}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
