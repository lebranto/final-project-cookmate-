"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import styles from './view.module.css';

// 백엔드 InquiryDto 구조와 일치하는 인터페이스
interface InquiryDetail {
  inquiryNo: number;
  userNo: number;
  title: string;
  content: string;
  createDate: string;
  typeName: string; // '계정', '레시피', '기타'
  status: string; // 'Y' (답변완료), 'N' (답변대기)
  answer?: string; // 관리자 답변 (null 가능)
  answerDate?: string; // 답변일 (null 가능)
}

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inquiryNo = params.inquiryNo;

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 문의 상세 데이터 호출
  useEffect(() => {
    const fetchInquiryDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/inquiries/${inquiryNo}`);
        if (response.status === 200) {
          setInquiry(response.data);
        }
      } catch (error) {
        console.error("문의 상세 불러오기 실패:", error);
        alert("문의 내역을 불러오는데 실패했습니다.");
        router.push('/mypage/inquiries'); // 에러 시 목록으로 돌려보냄
      } finally {
        setLoading(false);
      }
    };

    if (inquiryNo) {
      fetchInquiryDetail();
    }
  }, [inquiryNo, router]);

  // 삭제 처리 핸들러
  const handleDelete = async () => {
    if (confirm('문의를 삭제하시겠습니까?\n삭제된 문의는 복구할 수 없습니다.')) {
      try {
        const res = await api.delete(`/users/inquiries/${inquiryNo}`);
        if (res.status === 200) {
          alert('삭제되었습니다.');
          router.push('/mypage/inquiries');
        }
      } catch (error) {
        console.error("문의 삭제 실패:", error);
        alert("문의 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;
  if (!inquiry) return <div style={{ padding: '100px', textAlign: 'center' }}>문의 내역을 찾을 수 없습니다.</div>;

  const isAnswered = inquiry.status === 'Y';

  return (
    <div className={styles.mainInner}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}><span>💬</span> 문의 상세</h2>
      </div>

      <div className={styles.card}>
        {/* 헤더 섹션 */}
        <div className={styles.inquiryHeader}>
          <div className={styles.inquiryMeta}>
            <span className={`${styles.badge} ${inquiry.typeName === '계정' ? styles.badgeAccount : styles.badgeRecipe}`}>
              {inquiry.typeName}
            </span>
            <span className={`${styles.badge} ${isAnswered ? styles.badgeDone : styles.badgePending}`}>
              {isAnswered ? '답변 완료' : '답변 대기'}
            </span>
            <span className={styles.inquiryDate}>{inquiry.createDate.split('T')[0]}</span>
          </div>
          <h1 className={styles.inquiryTitle}>{inquiry.title}</h1>
        </div>

        {/* 질문 본문 */}
        <div className={styles.inquiryBody}>
          <div className={styles.inquiryContent}>{inquiry.content}</div>
        </div>

        {/* 답변 섹션 */}
        <div className={styles.answerSection}>
          <div className={styles.answerLabel}>
            <span style={{ fontSize: '16px' }}>🛡️</span> 관리자 답변
          </div>
          {isAnswered && inquiry.answer ? (
            <>
              <div className={styles.answerContent}>{inquiry.answer}</div>
              <div className={styles.answerDate}>{inquiry.answerDate?.split('T')[0]}</div>
            </>
          ) : (
            <div className={styles.noAnswer}>
              아직 답변이 등록되지 않았습니다. 빠른 시일 내에 답변 드리겠습니다.
            </div>
          )}
        </div>

        {/* 푸터 액션 버튼 */}
        <div className={styles.actionFooter}>
          <Link href="/mypage/inquiries" className={`${styles.btn} ${styles.btnBack}`}>
            ← 목록으로
          </Link>
          {/* 답변이 완료된 문의는 수정할 수 없도록 조건부 렌더링 */}
          {!isAnswered && (
            <button className={`${styles.btn} ${styles.btnEdit}`} onClick={() => router.push(`/mypage/inquiries/write?edit=${inquiry.inquiryNo}`)}>
              수정
            </button>
          )}
          <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}