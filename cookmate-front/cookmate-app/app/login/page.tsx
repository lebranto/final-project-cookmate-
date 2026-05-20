"use client";

import { JSX, useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/config";
import styles from "./login.module.css";


// ── 왼쪽 브랜드 영역 ──────────────────────────────────────
function AuthBrand(): JSX.Element {
  return (
    <div className={styles.authBrand}>
      <div className={styles.authBrandLogo}>
        Cook<span className={styles.dot}>.</span>Mate
      </div>
      <h2>
        요리의 즐거움을<br />AI와 함께
      </h2>
      <p>
        냉장고 속 재료를 입력하면<br />
        당신의 메이트가 맞춤 레시피를 추천해드립니다.
      </p>
    </div>
  );
}

// ── 로그인 폼 ─────────────────────────────────────────────
function LoginForm(): JSX.Element {
  const router = useRouter();
  const [email,    setEmail]    = useState<string>("");
  const [password, setPassword] = useState<string>("");

 const handleSubmit = async (e: SubmitEvent) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userEmail: email,
        userPw: password,
      }),
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert("로그인 할 수 없는 계정입니다.");
        return;
      }

      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    const authResult = await response.json();

    if (authResult?.accessToken) {
      window.localStorage.setItem("accessToken", authResult.accessToken);
    }

    if (authResult?.user) {
      window.localStorage.setItem("authUser", JSON.stringify(authResult.user));
    }

    window.dispatchEvent(new Event("auth-state-changed"));
    router.replace("/");
    router.refresh();
  } catch (error) {
    console.error("요청 실패:", error);
    alert("백엔드 서버에 연결할 수 없습니다.");
  }
};
  
  const handleKakao = (): void => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
  };

  const handleSignup = (): void => {
    router.push("/regist");
  };

  const handleFindPassword = (): void => {
    router.push("/find");
  };

  return (
    <div className={styles.authFormWrap}>
      <div className={styles.authCard}>
        <form onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <input
              className={styles.formInput}
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* 비밀번호 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>비밀번호</label>
            <input
              className={styles.formInput}
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button type="submit" className={styles.formSubmit}>
            로그인
          </button>
        </form>

        {/* 구분선 */}
        <div className={styles.authDivider}>또는</div>

        {/* 카카오 로그인 */}
        <button
          type="button"
          className={`${styles.socialBtn} ${styles.kakao}`}
          onClick={handleKakao}
        >
          카카오로 로그인
        </button>

        {/* 회원가입 링크 → /regist */}
        <p className={styles.authFooterTxt}>
          아직 계정이 없으신가요?{" "}
          <span
            className={styles.authFooterLink}
            onClick={handleSignup}
          >
            회원가입
          </span>
        </p>
        <p className={styles.authFooterTxt}>
          비밀번호를 잊으셨나요?{" "}
          <span
            className={styles.authFooterLink}
            onClick={handleFindPassword}
          >
            비밀번호 재설정
          </span>
        </p>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
// layout.tsx에서 GlobalHeader / MobileFooter를 이미 포함하므로
// 이 페이지에서는 헤더·푸터를 별도로 렌더하지 않습니다.
export default function LoginPage(): JSX.Element {
  return (
    <div className={styles.authWrap}>
      <AuthBrand />
      <LoginForm />
    </div>
  );
}
