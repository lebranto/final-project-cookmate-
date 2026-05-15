"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; 
import styles from './inquiries.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

interface Inquiry {
  inquiryNo: number;
  title: string;
  createDate: string;
  status: string; 
}

const PER_PAGE = 10;

export default function InquiriesPage() {
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !loginUserNo) {
      if (isMounted && !loginUserNo) setLoading(false);
      return;
    }

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
  }, [loginUserNo, isMounted]);

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
        <button className={`${styles.pageBtn} ${styles.arrow}`} disabled={currentPage === 1} onClick={() => setCurrentPage(c => Math.max(1, c - 1))}>‹</button>
        {pages}
        <button className={`${styles.pageBtn} ${styles.arrow}`} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}>›</button>
      </div>
    );
  };

  if (!isMounted) return null;

  if (!isLoggedIn || !loginUserNo) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>문의 내역을 불러오는 중...</div>;
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>문의 내역</h2>
        <button className={styles.btnOutline} onClick={handleWriteClick}>+ 문의하기</button>
      </div>

      <div className={styles.inquiryList}>
        {pageItems.length > 0 ? (
          pageItems.map(q => {
            const isAnswered = q.status === 'Y';
            return (
              <Link key={q.inquiryNo} href={`/mypage/inquiries/${q.inquiryNo}`} className={styles.inquiryItem}>
                <div className={styles.inquirySummary}>
                  <div>
                    <div className={styles.inquiryQ}>{q.title}</div>
                    <div className={styles.inquiryDate}>{q.createDate ? q.createDate.split('T')[0] : ''}</div>
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
            <div className={styles.emptyIcon}></div>
            <p>등록된 문의 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {renderPagination()}
    </div>
  );
}