import Link from "next/link";

export default function BoardWritePage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>레시피 작성</h1>
      <p>레시피 작성 페이지 작업 전 임시 화면입니다.</p>
      <Link href="/boards">목록으로 돌아가기</Link>
    </main>
  );
}
