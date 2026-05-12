"use client";

import { JSX, useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

function hasCookie(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${name}=`));
}

const BRAND_TAGS = [
  { label: "2.4만 레시피" },
  { label: "18만 사용자" },
  { label: "AI 맞춤 추천" },
];

function AuthBrand(): JSX.Element {
  return (
    <div className={styles.authBrand}>
      <div className={styles.authBrandLogo}>
        Cook<span className={styles.dot}>.</span>Mate
      </div>
      <h2>
        요리를 더 즐겁게
        <br />
        AI와 함께
      </h2>
      <p>
        냉장고 속 재료를 입력하면
        <br />
        CookMate가 어울리는 레시피를 추천합니다.
      </p>
      <div className={styles.authBrandTags}>
        {BRAND_TAGS.map((tag) => (
          <span key={tag.label} className={styles.authBrandTag}>
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function LoginForm(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleSubmit = async (e: SubmitEvent) => {
  e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
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
      alert("이메일이나 비밀번호가 올바르지 않습니다.");
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
    window.location.href = "http://localhost:8081/api/oauth2/authorization/kakao";
  };

  return (
    <div className={styles.authFormWrap}>
      <div className={styles.authCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <input
              className={styles.formInput}
              type="email"
              placeholder="이메일을 입력하세요."
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>비밀번호</label>
            <input
              className={styles.formInput}
              type="password"
              placeholder="비밀번호를 입력하세요."
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.formSubmit}>
            로그인
          </button>
        </form>

        <div className={styles.authDivider}>또는</div>

        <button
          type="button"
          className={`${styles.socialBtn} ${styles.kakao}`}
          onClick={handleKakao}
        >
          카카오로 로그인
        </button>

        <p className={styles.authFooterTxt}>
          아직 계정이 없으신가요?{" "}
          <button
            type="button"
            className={styles.authFooterLink}
            onClick={() => router.push("/regist")}
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <div className={styles.authWrap}>
      <AuthBrand />
      <LoginForm />
    </div>
  );
}
