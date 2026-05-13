"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import styles from './view.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

interface InquiryDetail {
  inquiryNo: number;
  userNo: number;
  title: string;
  content: string;
  createDate: string;
  typeName: string; 
  status: string; 
  answer?: string; 
  answerDate?: string; 
}

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inquiryNo = params.id || params.inquiryNo;

  // 🌟 [핵심] 하이드레이션 에러 방지용 상태
  const [isMounted, setIsMounted] = useState(false);

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 🌟 훅을 사용하여 로그인 유저 정보 가져오기
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  // 1. 마운트 상태 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. 데이터 호출 및 권한 검사
  useEffect(() => {
    // 마운트 전이거나 로그인 정보가 없으면 실행 안 함
    if (!isMounted || !loginUserNo) {
      if (isMounted && !loginUserNo) setLoading(false);
      return;
    }

    const fetchInquiryDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/inquiries/${inquiryNo}`);
        if (response.status === 200) {
          const data = response.data;

          // 🚨 [보안] 작성자와 로그인 유저가 다르면 목록으로 튕겨냄
          if (data.userNo !== loginUserNo) {
            alert("본인의 문의 내역만 확인할 수 있습니다.");
            router.push('/mypage/inquiries');
            return;
          }

          setInquiry(data);
        }
      } catch (error) {
        console.error("문의 상세 불러오기 실패:", error);
        alert("문의 내역을 불러오는데 실패했습니다.");
        router.push('/mypage/inquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryDetail();
  }, [inquiryNo, loginUserNo, isMounted, router]);

  const handleDelete = async () => {
    if (confirm('문의를 삭제하시겠습니까?\n삭제된 문의는 복구할 수 없습니다.')) {
      try {
        const res = await api.delete(`/users/inquiries/${inquiryNo}`, {
          params: { userNo: loginUserNo } 
        });
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

  // ==========================================
  // 🌟 조건부 렌더링 가드 (Hydration Fix 순서)
  // ==========================================

  // 1. 서버/클라이언트 불일치 방지 (마운트 전 null 반환)
  if (!isMounted) return null;

  // 2. 로그인 여부 체크
  if (!isLoggedIn || !loginUserNo) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  // 3. 데이터 로딩 중
  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;
  }

  // 4. 데이터 없음
  if (!inquiry) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>문의 내역을 찾을 수 없습니다.</div>;
  }

  const isAnswered = inquiry.status === 'Y';

  return (
    <div className={styles.mainInner}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}><span>💬</span> 문의 상세</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.inquiryHeader}>
          <div className={styles.inquiryMeta}>
            <span className={`${styles.badge} ${inquiry.typeName === '계정' ? styles.badgeAccount : styles.badgeRecipe}`}>
              {inquiry.typeName}
            </span>
            <span className={`${styles.badge} ${isAnswered ? styles.badgeDone : styles.badgePending}`}>
              {isAnswered ? '답변 완료' : '답변 대기'}
            </span>
            <span className={styles.inquiryDate}>{inquiry.createDate?.split('T')[0]}</span>
          </div>
          <h1 className={styles.inquiryTitle}>{inquiry.title}</h1>
        </div>

        <div className={styles.inquiryBody}>
          <div className={styles.inquiryContent}>{inquiry.content}</div>
        </div>

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

        <div className={styles.actionFooter}>
          <Link href="/mypage/inquiries" className={`${styles.btn} ${styles.btnBack}`}>
            ← 목록으로
          </Link>
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