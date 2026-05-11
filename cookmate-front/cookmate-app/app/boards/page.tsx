import Link from "next/link";

export default function BoardsPage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>레시피 목록</h1>
      <p>레시피 목록 페이지 작업 전 임시 화면입니다.</p>
      <Link href="/boards/1">레시피 상세 보기</Link>
    </main>
  );
}
