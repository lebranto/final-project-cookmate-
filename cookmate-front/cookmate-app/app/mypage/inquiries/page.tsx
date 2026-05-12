"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; // 🌟 axios 인스턴스 임포트
import styles from './inquiries.module.css';

// 1. 문의 인터페이스 정의 (백엔드 DTO 매칭)
interface Inquiry {
  inquiryNo: number;
  title: string;
  createDate: string;
  status: string; // 'Y' 또는 'N'
}

const PER_PAGE = 10;

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]); // 🌟 실제 데이터 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loginUserNo = 1; // 임시 로그인 유저 번호

  // 2. 백엔드에서 문의 목록 가져오기
  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/inquiries', {
          params: { userNo: loginUserNo }
        });
        if (response.status === 200) {
          setInquiries(response.data);
        }
      } catch (error) {
        console.error("문의 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // 페이징 로직
  const totalPages = Math.max(1, Math.ceil(inquiries.length / PER_PAGE));
  const pageItems = inquiries.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleWriteClick = () => {
    router.push('/mypage/inquiries/write');
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button 
          key={i} 
          className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
          onClick={() => { setCurrentPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          {i}
        </button>
      );
    }
    return (
      <div className={styles.pagination}>
        <button 
          className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
        >‹</button>
        {pages}
        <button 
          className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
        >›</button>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>문의 내역을 불러오는 중...</div>;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>💬 문의 내역</h2>
        <button className={styles.btnOutline} onClick={handleWriteClick}>+ 문의하기</button>
      </div>

      <div className={styles.inquiryList}>
        {pageItems.length > 0 ? (
          pageItems.map(q => {
            // 3. 'Y'/'N' 상태에 따른 텍스트 및 스타일 결정
            const isAnswered = q.status === 'Y';
            
            return (
              <Link key={q.inquiryNo} href={`/mypage/inquiries/${q.inquiryNo}`} className={styles.inquiryItem}>
                <div className={styles.inquirySummary}>
                  <div>
                    <div className={styles.inquiryQ}>{q.title}</div>
                    <div className={styles.inquiryDate}>{q.createDate.split('T')[0]}</div>
                  </div>
                  <span className={isAnswered ? styles.badgeDone : styles.badgePending}>
                    {isAnswered ? '답변완료' : '답변대기'}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <p>등록된 문의 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {renderPagination()}
    </div>
  );
}