"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link'; // 🌟 링크 이동을 위한 컴포넌트
import api from '@/lib/axios';
import styles from './mypage.module.css';

// 1. 레시피 데이터 인터페이스
interface Recipe {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  likesCount: number;
  thumbClass: string;
  boardPostdate: string;
  open: string;
}

// 2. 문의 데이터 인터페이스
interface Inquiry {
  inquiryNo: number;
  title: string;
  createDate: string;
  status: string; 
}

export default function MyPage() {
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 임시 로그인 유저 번호 (실제 구현 시 세션 등에서 가져옴)
  const loginUserNo = 1; 

  // 데이터 로드
  useEffect(() => {
    const fetchMyPageData = async () => {
      setLoading(true);
      try {
        const [recipeRes, inquiryRes] = await Promise.all([
          api.get(`/users/recipes`, { params: { userNo: loginUserNo, category: '전체' } }),
          api.get(`/users/inquiries`, { params: { userNo: loginUserNo } })
        ]);

        // 대시보드이므로 최신 데이터 몇 개만 잘라서 보여줍니다 (레시피 3개, 문의 2개)
        if (recipeRes.status === 200) setRecentRecipes(recipeRes.data.slice(0, 3));
        if (inquiryRes.status === 200) setRecentInquiries(inquiryRes.data.slice(0, 2));

      } catch (err) {
        console.error("마이페이지 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPageData();
  }, []);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        
        {/* 우측 메인 콘텐츠 */}
        <main className={styles.mainContent}>
          <div className={styles.mainSectionWrap}>
            
            {/* ========================================== */}
            {/* 1. 내가 만든 레시피 요약 섹션 */}
            {/* ========================================== */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>내가 만든 레시피</h2>
                {/* 추후 레시피 작성 페이지 경로가 나오면 여기도 Link로 감싸주세요 */}
                <button className={styles.btnAction}>+ 레시피 작성</button>
              </div>
              
              <div className={styles.recipeGrid}>
                {recentRecipes.length > 0 ? (
                  recentRecipes.map(recipe => (
                    <div key={recipe.boardNo} className={styles.recipeCard}>
                      <div className={`${styles.recipeThumb} ${styles[recipe.thumbClass] || styles.bgGreen}`}>
                        <span className={styles.openBadge}>
                          {recipe.open === 'Y' ? '공개' : '비공개'}
                        </span>
                        <div className={styles.emoji}>
                          {recipe.category === '한식' ? '🍲' : recipe.category === '양식' ? '🍝' : recipe.category === '일식' ? '🍣' : recipe.category === '분식' ? '🍢' : '🍳'}
                        </div>
                      </div>
                      <div className={styles.recipeInfo}>
                        <div className={styles.recipeTitle}>{recipe.title}</div>
                        <div className={styles.recipeMeta}>
                          <span>⏱ {recipe.cookTime || '시간 미상'}</span>
                        </div>
                        <div className={styles.recipeFooter}>
                          <span className={styles.recipeTag}>{recipe.open === 'Y' ? '공개' : '비공개'}</span>
                          <span className={styles.recipeLikes}>❤️ {recipe.likesCount} 좋아요</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyMsg}>아직 작성한 레시피가 없습니다.</div>
                )}
              </div>
            </section>

            {/* ========================================== */}
            {/* 2. 문의 내역 요약 섹션 */}
            {/* ========================================== */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>문의 내역</h2>
                {/* 🌟 문의하기 페이지로 이동 */}
                <Link href="/mypage/inquiries/write">
                  <button className={styles.btnActionOutline}>+ 문의하기</button>
                </Link>
              </div>

              <div className={styles.inquiryList}>
                {recentInquiries.length > 0 ? (
                  recentInquiries.map(inquiry => {
                    const isAnswered = inquiry.status === 'Y';
                    const statusText = isAnswered ? '답변완료' : '답변대기';
                    const statusClass = isAnswered ? styles.statusDone : styles.statusWait;

                    return (
                      /* 🌟 리스트 아이템 클릭 시 문의 상세 보기 페이지로 이동 */
                      <Link 
                        href={`/mypage/inquiries/${inquiry.inquiryNo}`} 
                        key={inquiry.inquiryNo} 
                        className={styles.inquiryLink}
                      >
                        <div className={styles.inquiryItem}>
                          <div className={styles.inquiryInfo}>
                            <div className={styles.inquiryTitle}>{inquiry.title}</div>
                            <div className={styles.inquiryDate}>
                              {inquiry.createDate ? inquiry.createDate.split('T')[0] : ''}
                            </div>
                          </div>
                          <div className={`${styles.inquiryStatus} ${statusClass}`}>
                            {statusText}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className={styles.emptyMsg}>최근 문의 내역이 없습니다.</div>
                )}
              </div>
              
              {/* 문의 내역 전체보기 버튼 */}
              <div className={styles.sectionFooter} style={{ textAlign: 'right', marginTop: '10px' }}>
                <Link href="/mypage/inquiries" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>
                  전체보기 &gt;
                </Link>
              </div>
            </section>
            
          </div>
        </main>
      </div>
    </div>
  );
}