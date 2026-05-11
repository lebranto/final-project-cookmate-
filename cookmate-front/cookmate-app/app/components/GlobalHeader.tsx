"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./CommonLayout.module.css";

type UserRole = "ROLE_USER" | "ROLE_ADMIN";

type StoredUser = {
  role?: string;
  roles?: string[];
  authorities?: Array<string | { authority?: string }>;
};

const API_BASE_URL = "http://localhost:8081/api";
const ACCESS_TOKEN_KEY = "accessToken";
const ROLE_COOKIE_KEY = "userRoles";
const STORAGE_USER_KEYS = ["user", "loginUser", "member", "authUser"];

function getCookieValue(name: string): string {
  if (typeof document === "undefined") {
    return "";
  }

  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1] ?? "";
}

function toRoles(value?: string | null): UserRole[] {
  if (!value) {
    return [];
  }

  return decodeURIComponent(value)
    .split(/[|,\s]+/)
    .filter((role): role is UserRole => role === "ROLE_USER" || role === "ROLE_ADMIN");
}

function getStoredRoles(): UserRole[] {
  if (typeof window === "undefined") {
    return [];
  }

  const roles = new Set<UserRole>(toRoles(getCookieValue(ROLE_COOKIE_KEY)));
  const plainRole = window.localStorage.getItem("role");

  toRoles(plainRole).forEach((role) => roles.add(role));

  STORAGE_USER_KEYS.forEach((key) => {
    const value = window.localStorage.getItem(key);

    if (!value) {
      return;
    }

    try {
      const user = JSON.parse(value) as StoredUser;
      const candidates = [
        user.role,
        ...(user.roles ?? []),
        ...(user.authorities ?? []).map((authority) =>
          typeof authority === "string" ? authority : authority.authority,
        ),
      ];

      candidates.forEach((role) => {
        toRoles(role).forEach((parsedRole) => roles.add(parsedRole));
      });
    } catch {
      toRoles(value).forEach((role) => roles.add(role));
    }
  });

  return Array.from(roles);
}

function hasAccessToken(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    getCookieValue(ACCESS_TOKEN_KEY) || window.localStorage.getItem(ACCESS_TOKEN_KEY),
  );
}

function removeCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

export default function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const goLogin = () => router.push("/login");
  const goRegist = () => router.push("/regist");
  const canOpenMyPage = roles.includes("ROLE_USER") || roles.includes("ROLE_ADMIN");
  const canOpenAdminPage = roles.includes("ROLE_ADMIN");

  const mobileMenuItems = useMemo(() => {
    const baseItems = [
      { label: "레시피", path: "/recipes" },
      { label: "AI추천", path: "/ai" },
      { label: "장보기", path: "/shop" },
      { label: "셰프", path: "/chef" },
      { label: "공지사항", path: "/notice" },
    ];

    if (!isLoggedIn) {
      return [...baseItems, { label: "로그인", path: "/login" }];
    }

    return [
      ...baseItems,
      ...(canOpenMyPage ? [{ label: "마이페이지", path: "/mypage" }] : []),
      ...(canOpenAdminPage ? [{ label: "관리자 페이지", path: "/admin" }] : []),
      { label: "로그아웃", path: "/logout" },
    ];
  }, [canOpenAdminPage, canOpenMyPage, isLoggedIn]);

  useEffect(() => {
    const syncAuthState = () => {
      const nextRoles = getStoredRoles();
      setRoles(nextRoles);
      setIsLoggedIn(hasAccessToken() || nextRoles.length > 0);
    };

    syncAuthState();

    const syncVisiblePage = () => {
      if (document.visibilityState === "visible") {
        syncAuthState();
      }
    };

    window.addEventListener("focus", syncAuthState);
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("pageshow", syncAuthState);
    window.addEventListener("auth-state-changed", syncAuthState);
    document.addEventListener("visibilitychange", syncVisiblePage);

    return () => {
      window.removeEventListener("focus", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("pageshow", syncAuthState);
      window.removeEventListener("auth-state-changed", syncAuthState);
      document.removeEventListener("visibilitychange", syncVisiblePage);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem("role");
      STORAGE_USER_KEYS.forEach((key) => window.localStorage.removeItem(key));
      removeCookie(ACCESS_TOKEN_KEY);
      removeCookie("refreshToken");
      removeCookie(ROLE_COOKIE_KEY);

      setIsLoggedIn(false);
      setRoles([]);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className={styles.globalHeader}>
      <div className={styles.ghInner}>
        <button type="button" className={styles.ghLogo} onClick={() => router.push("/")}>
          Cook<span>Mate</span>
        </button>

        <div className={styles.ghSearch}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7" stroke="#aaa" strokeWidth="1.8" />
            <line x1="14.5" y1="14.5" x2="19" y2="19" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input placeholder="레시피 또는 재료 검색..." />
        </div>

        <nav className={styles.ghNav}>
          <button type="button">레시피</button>
          <button type="button">AI추천</button>
          <button type="button">장보기</button>
        </nav>

        <div className={styles.ghActions}>
          <button type="button" className={styles.ghNavBtn}>셰프</button>
          <button type="button" className={styles.ghNavBtn}>공지사항</button>

          <button type="button" className={styles.ghBell} aria-label="알림">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="18" cy="6" r="4" fill="#e05a2b" />
            </svg>
          </button>

          {isLoggedIn ? (
            <>
              {canOpenMyPage && (
                <button
                  type="button"
                  className={styles.ghLoginBtn}
                  onClick={() => router.push("/mypage")}
                >
                  마이페이지
                </button>
              )}
              {canOpenAdminPage && (
                <button
                  type="button"
                  className={styles.ghLoginBtn}
                  onClick={() => router.push("/admin")}
                >
                  관리자 페이지
                </button>
              )}
              <button type="button" className={styles.ghStart} onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button type="button" className={styles.ghLoginBtn} onClick={goLogin}>로그인</button>
              <button type="button" className={styles.ghStart} onClick={goRegist}>회원가입</button>
            </>
          )}

          <button
            type="button"
            className={styles.ghMobileMenu}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="메뉴"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`${styles.ghMobileNav}${menuOpen ? ` ${styles.open}` : ""}`}>
        {mobileMenuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.path === "/logout") {
                void handleLogout();
                return;
              }

              setMenuOpen(false);
              router.push(item.path);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
