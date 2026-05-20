"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./CommonLayout.module.css";
import UserAvatar from '@/app/components/UserAvatar';
import api from "@/app/lib/api";
import { API_BASE_URL } from "@/app/lib/config";


type UserRole = "ROLE_USER" | "ROLE_ADMIN";

type StoredUser = {
  userNo?: number;
  userEmail?: string;
  nickname?: string;
  profileImageUrl?: string;
  role?: string;
  roles?: string[];
  authorities?: Array<string | { authority?: string }>;
};

type NotificationItem = {
  notificationNo: number;
  message: string;
  boardNo?: number | null;
  readYn: "Y" | "N";
  createdAt: string;
};

const HEADER_MENU_ITEMS = [
  { label: "레시피", path: "/boards" },
  { label: "AI추천", path: "/ai" },
  { label: "장보기", path: "/shop" },
  { label: "셰프", path: "/chef" },
  { label: "공지사항", path: "/notice" },
];

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

function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of STORAGE_USER_KEYS) {
    const value = window.localStorage.getItem(key);

    if (!value) {
      continue;
    }

    try {
      const user = JSON.parse(value) as StoredUser;

      if (user && typeof user === "object") {
        return user;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function hasAccessToken(): boolean {
  return Boolean(getCookieValue(ACCESS_TOKEN_KEY));
}

function removeCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem("role");
  STORAGE_USER_KEYS.forEach((key) => window.localStorage.removeItem(key));
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie("refreshToken");
  removeCookie(ROLE_COOKIE_KEY);
}

function formatElapsedTime(createdAt: string): string {
  const createdTime = new Date(createdAt.replace(" ", "T")).getTime();

  if (Number.isNaN(createdTime)) {
    return "";
  }

  const diffSeconds = Math.max(Math.floor((Date.now() - createdTime) / 1000), 0);
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diffSeconds < minute) {
    return "방금 전";
  }

  if (diffSeconds < hour) {
    return `${Math.floor(diffSeconds / minute)}분 전`;
  }

  if (diffSeconds < day) {
    return `${Math.floor(diffSeconds / hour)}시간 전`;
  }

  return `${Math.floor(diffSeconds / day)}일 전`;
}

export default function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const goLogin = () => router.push("/login");
  const goRegist = () => router.push("/regist");
  const canOpenMyPage = roles.includes("ROLE_USER") || roles.includes("ROLE_ADMIN");
  const canOpenAdminPage = roles.includes("ROLE_ADMIN");
  const currentUserNo = currentUser?.userNo;

  const mobileMenuItems = useMemo(() => {
    if (!isLoggedIn) {
      return [...HEADER_MENU_ITEMS, { label: "로그인", path: "/login" }];
    }

    return [
      ...HEADER_MENU_ITEMS,
      ...(canOpenMyPage ? [{ label: "마이페이지", path: "/mypage" }] : []),
      ...(canOpenAdminPage ? [{ label: "관리자 페이지", path: "/admin" }] : []),
      { label: "로그아웃", path: "/logout" },
    ];
  }, [canOpenAdminPage, canOpenMyPage, isLoggedIn]);

  useEffect(() => {
   const fetchAuthUser = async () => {
  try {
    const response = await api.get("/auth/me");

    const user = response.data as StoredUser;
    
      window.localStorage.setItem("authUser", JSON.stringify(user));
      setCurrentUser(user);
      setRoles(getStoredRoles());
      setIsLoggedIn(true);
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      clearStoredAuth();
      setRoles([]);
      setCurrentUser(null);
      setIsLoggedIn(false);
  }
};


    const syncAuthState = () => {
      const nextHasToken = hasAccessToken();
      const nextUser = getStoredUser();
      const nextRoles = getStoredRoles();
      const restoreAuthFromRefresh = async () => {
        try {
          const refreshResponse = await api.post("/auth/refresh");
          const nextToken = refreshResponse.data?.accessToken;

          if (nextToken) {
            window.localStorage.setItem("accessToken", nextToken);
        }

          await fetchAuthUser();
        } catch {
            clearStoredAuth();
            setRoles([]);
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        };


    if (!nextHasToken && !nextUser) {
      void restoreAuthFromRefresh();
    return;
    }

    setRoles(nextRoles);
    setCurrentUser(nextUser);
    setIsLoggedIn(true);

    void fetchAuthUser();
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

  useEffect(() => {
    if (!isLoggedIn || !currentUserNo) {
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications", {
          params: { userNo: currentUserNo },
        });
        setNotifications(response.data.notifications ?? []);
        setUnreadCount(response.data.unreadCount ?? 0);
      } catch (error) {
        console.error("알림 조회 실패:", error);
      }
    };

    void fetchNotifications();
    const timer = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(timer);
  }, [currentUserNo, isLoggedIn]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const closeOverlaysOnMobile = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setNotificationOpen(false);
        setMenuOpen(false);
      }
    };

    mobileQuery.addEventListener("change", closeOverlaysOnMobile);
    return () => mobileQuery.removeEventListener("change", closeOverlaysOnMobile);
  }, []);

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
      setCurrentUser(null);
      setNotifications([]);
      setUnreadCount(0);
      setNotificationOpen(false);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  const handleBellClick = () => {
    setNotificationOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!currentUserNo) return;

    if (notification.readYn === "N") {
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationNo === notification.notificationNo
            ? { ...item, readYn: "Y" }
            : item,
        ),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));

      try {
        const response = await api.patch(
          `/notifications/${notification.notificationNo}/read`,
          null,
          { params: { userNo: currentUserNo } },
        );
        setUnreadCount(response.data.unreadCount ?? 0);
      } catch (error) {
        console.error("알림 읽음 처리 실패:", error);
      }
    }

    if (notification.boardNo) {
      setNotificationOpen(false);
      router.push(`/boards/${notification.boardNo}`);
    }
  };

  const handleReadAll = async () => {
    if (!currentUserNo || unreadCount === 0) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, readYn: "Y" })));
    setUnreadCount(0);

    try {
      await api.patch("/notifications/read-all", null, {
        params: { userNo: currentUserNo },
      });
    } catch (error) {
      console.error("알림 전체 읽음 처리 실패:", error);
    }
  };

  const isActivePath = (targetPath: string) => {
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

  return (
    <header className={styles.globalHeader}>
      <div className={styles.ghInner}>
        <button type="button" className={styles.ghLogo} onClick={() => router.push("/")}>
          Cook<span>Mate</span>
        </button>

        <div className={styles.ghActions}>
          <nav className={styles.ghNav}>
            {HEADER_MENU_ITEMS.map((item) => (
              <button
                key={item.path}
                type="button"
                className={isActivePath(item.path) ? styles.ghNavActive : ""}
                aria-current={isActivePath(item.path) ? "page" : undefined}
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className={styles.ghNotificationWrap}>
            <button
              type="button"
              className={`${styles.ghBell} ${styles.ghMobileBell}`}
              aria-label="알림"
              aria-expanded={notificationOpen}
              onClick={handleBellClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {unreadCount > 0 && (
                <span className={styles.ghNotificationBadge}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className={styles.notificationPanel}>
                <div className={styles.notificationHeader}>
                  <strong>알림</strong>
                  {isLoggedIn && (
                    <button type="button" onClick={handleReadAll}>
                      모두 읽음
                    </button>
                  )}
                </div>

                {!isLoggedIn ? (
                  <div className={styles.notificationLoginRequired}>로그인이 필요합니다.</div>
                ) : notifications.length === 0 ? (
                  <div className={styles.notificationEmpty}>새 알림이 없습니다.</div>
                ) : (
                  <div className={styles.notificationList}>
                    {notifications.map((notification) => (
                      <button
                        key={notification.notificationNo}
                        type="button"
                        className={`${styles.notificationItem} ${
                          notification.readYn === "N" ? styles.notificationUnread : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <span className={styles.notificationMessage}>
                          {notification.message}
                        </span>
                        <span className={styles.notificationTime}>
                          {formatElapsedTime(notification.createdAt)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <>
              <div className={styles.ghUserSummary}>
                <UserAvatar 
                  imageUrl={currentUser?.profileImageUrl} 
                  name={currentUser?.nickname} 
                  email={currentUser?.userEmail}
                  size={30} 
                />
                <span className={styles.ghUserName}>
                  {currentUser?.nickname ?? currentUser?.userEmail ?? "사용자"}
                </span>
              </div>
              {canOpenMyPage && (
                <button
                  type="button"
                  className={`${styles.ghLoginBtn} ${isActivePath("/mypage") ? styles.ghActionActive : ""}`}
                  aria-current={isActivePath("/mypage") ? "page" : undefined}
                  onClick={() => router.push("/mypage")}
                >
                  마이페이지
                </button>
              )}
              {canOpenAdminPage && (
                <button
                  type="button"
                  className={`${styles.ghLoginBtn} ${isActivePath("/admin") ? styles.ghActionActive : ""}`}
                  aria-current={isActivePath("/admin") ? "page" : undefined}
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
            className={item.path !== "/logout" && isActivePath(item.path) ? styles.ghMobileActive : ""}
            aria-current={item.path !== "/logout" && isActivePath(item.path) ? "page" : undefined}
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
