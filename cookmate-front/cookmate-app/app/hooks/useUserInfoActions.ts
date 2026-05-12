"use client";

import { useEffect, useState } from "react";

export interface UserInfo {
  userNo: number;
  nickname: string;
  profileImageUrl: string;
  authority: string;
}

interface StoredUser {
  userNo?: number | string;
  nickname?: string;
  profileImageUrl?: string;
  roles?: string[];
  authority?: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const USER_STORAGE_KEYS = ["authUser", "user", "loginUser", "member"];

function hasCookie(name: string) {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${name}=`));
}

function normalizeUser(user: StoredUser): UserInfo | null {
  const userNo = Number(user.userNo);
  if (!Number.isFinite(userNo) || userNo <= 0) return null;

  return {
    userNo,
    nickname: user.nickname || "사용자",
    profileImageUrl: user.profileImageUrl || "",
    authority: user.authority || user.roles?.[0] || "ROLE_USER",
  };
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return { userInfo: null, isLoggedIn: false };
  }

  const hasAccessToken =
    Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY)) || hasCookie(ACCESS_TOKEN_KEY);

  for (const key of USER_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (!value) continue;

    try {
      const userInfo = normalizeUser(JSON.parse(value) as StoredUser);
      if (userInfo) {
        return { userInfo, isLoggedIn: hasAccessToken };
      }
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  return { userInfo: null, isLoggedIn: false };
}

export function useUserInfoActions() {
  const [authState, setAuthState] = useState(readStoredUser);

  useEffect(() => {
    const syncAuthState = () => setAuthState(readStoredUser());

    syncAuthState();
    window.addEventListener("auth-state-changed", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("auth-state-changed", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return authState;
}
