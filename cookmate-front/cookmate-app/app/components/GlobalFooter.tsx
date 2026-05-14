import Link from "next/link";
import styles from "./CommonLayout.module.css";

export default function GlobalFooter() {
  return (
    <footer className={styles.globalFooter}>
      <div className={styles.gfInner}>
        <div className={styles.gfBrand}>
          <strong>
            Cook<span>Mate</span>
          </strong>
          <p>집밥이 즐거워지는 레시피 플랫폼. 요리보고 조리봐조.</p>
        </div>
        <nav className={styles.gfLinks} aria-label="푸터 메뉴">
          <Link href="/boards">레시피</Link>
          <Link href="/find">AI 추천</Link>
          <Link href="/shop">장보기</Link>
          <Link href="/chef">셰프</Link>
          <Link href="/notice">공지사항</Link>
        </nav>
      </div>
    </footer>
  );
}
