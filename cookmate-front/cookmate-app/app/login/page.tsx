"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("로그인 처리 중입니다.");
  };

  const handleKakao = () => {
    alert("카카오 로그인으로 이동합니다.");
  };

  const regist = () => {
    router.push("/regist");
  };

  return (
    <>
      <header className={styles.globalHeader}>
        <div className={styles.ghInner}>
          <span className={styles.ghLogo}>
            Cook<span>Mate</span>
          </span>

          <div className={styles.ghSearch}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#aaa" strokeWidth="1.8" />
              <line x1="14.5" y1="14.5" x2="19" y2="19" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input placeholder="레시피 또는 재료 검색..." />
          </div>

          <nav className={styles.ghNav}>
            <a>레시피</a>
            <a>AI추천</a>
            <a>장보기</a>
          </nav>

          <div className={styles.ghActions}>
            <span className={styles.ghNavBtn}>셰프</span>
            <span className={styles.ghNavBtn}>공지사항</span>

            <button className={styles.ghBell} aria-label="알림">
              {/* <image/> */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="18" cy="6" r="4" fill="#e05a2b" />
              </svg> 
            </button>

            <button className={styles.ghLogin}>로그인</button>
            <button className={styles.ghStart} onClick={regist}>회원가입</button>

            <button
              className={styles.ghMobileMenu}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="메뉴"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`${styles.ghMobileNav} ${menuOpen ? styles.open : ""}`}>
          {["레시피", "AI추천", "장보기", "셰프", "공지사항", "로그인"].map((item) => (
            <a key={item}>{item}</a>
          ))}
        </div>
      </header>

      <div className={styles.loginWrap}>
        <div className={styles.loginBox}>
          <div className={styles.loginLogoArea}>
            <span className={styles.loginLogo}>
              Cook<span>Mate</span>
            </span>
            <div className={styles.loginSub}>맛있는 요리의 시작</div>
          </div>

          <div className={styles.loginCard}>
            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>이메일</label>
                <input
                  className={styles.formInput}
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>비밀번호</label>
                <input
                  className={styles.formInput}
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className={styles.forgotPw}>
                  <span>비밀번호를 잊으셨나요?</span>
                </div>
              </div>

              <button type="submit" className={styles.btnLoginSubmit}>로그인</button>
            </form>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              또는
              <div className={styles.dividerLine} />
            </div>

            <button className={`${styles.socialBtn} ${styles.kakaoBtn}`} onClick={handleKakao}>
              카카오로 로그인
            </button>

            <div className={styles.signupRow}>
              계정이 없으신가요? <span onClick={regist}>회원가입</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomNav}>
        <div className={styles.bottomNavInner}>
          {[
            { label: "홈", active: false },
            { label: "레시피", active: false },
            { label: "AI추천", active: false },
            { label: "내 정보", active: true },
          ].map((item) => (
            <span
              key={item.label}
              className={`${styles.bnavItem} ${item.active ? styles.active : ""}`}
            >
              <span className={styles.bnavIcon}></span>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
