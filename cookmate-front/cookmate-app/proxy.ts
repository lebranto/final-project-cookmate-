// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── 설정 ──────────────────────────────────────────────────

/** 로그인한 유저가 접근하면 → "/" 로 리다이렉트 */
const AUTH_ONLY_PAGES = ["/login", "/regist"];

/** 비로그인 유저가 접근하면 → "/login" 으로 리다이렉트 */
const PROTECTED_PAGES = ["/mypage", "/profile", "/settings","/admin"];

// ── proxy 함수 (middleware → proxy 로 이름 변경) ──────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;
  const isLoggedIn = Boolean(token);

  // 1) 로그인한 유저가 로그인/회원가입 접근 → 홈으로
  if (isLoggedIn && AUTH_ONLY_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2) 비로그인 유저가 보호된 페이지 접근 → 로그인으로
  if (!isLoggedIn && PROTECTED_PAGES.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ── 적용 경로 설정 (config 이름은 그대로 유지) ───────────
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};