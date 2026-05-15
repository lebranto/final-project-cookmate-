"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link'; 
import api from '@/lib/axios';
import styles from './mypage.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

interface Recipe {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  likesCount: number;
  thumbClass: string;
  boardPostdate: string;
  open: string;
  imageUrl?: string; 
}

interface Inquiry {
  inquiryNo: number;
  title: string;
  createDate: string;
  status: string; 
}

function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}

export default function MyPage() {
  const [isMounted, setIsMounted] = useState(false);

  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
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

    const fetchMyPageData = async () => {
      setLoading(true);
      try {
        const [recipeRes, inquiryRes] = await Promise.all([
          api.get(`/users/recipes`, { params: { userNo: loginUserNo, category: '전체' } }),
          api.get(`/users/inquiries`, { params: { userNo: loginUserNo } })
        ]);

        if (recipeRes.status === 200) setRecentRecipes(recipeRes.data.slice(0, 3));
        if (inquiryRes.status === 200) setRecentInquiries(inquiryRes.data.slice(0, 2));

      } catch (err) {
        console.error("마이페이지 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPageData();
  }, [loginUserNo, isMounted]);

  if (!isMounted) return null;

  if (!isLoggedIn || !loginUserNo) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <main className={styles.mainContent}>
          <div className={styles.mainSectionWrap}>
            
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>내가 만든 레시피</h2>
                <Link href="/boards/write">
                  <button className={styles.btnAction}>+ 레시피 작성</button>
                </Link>
              </div>
              
              <div className={styles.recipeGrid}>
                {recentRecipes.length > 0 ? (
                  recentRecipes.map(recipe => (
                    <Link href={`/boards/${recipe.boardNo}`} key={recipe.boardNo} className={styles.recipeCardLink}>
                      <div className={styles.recipeCard}>
                        <div className={styles.recipeThumb} style={{ overflow: 'hidden', position: 'relative' }}>
                          <span className={styles.openBadge}>
                            {recipe.open === 'Y' ? '공개' : '비공개'}
                          </span>
                          {recipe.imageUrl ? (
                            <img 
                              src={resolveRecipeImageUrl(recipe.imageUrl)} 
                              alt={recipe.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '100%', height: '100%', backgroundColor: '#c4dba4', color: '#1e381b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '900', fontSize: '1.2rem'
                            }}>
                              CookMate
                            </div>
                          )}
                        </div>
                        <div className={styles.recipeInfo}>
                          <div className={styles.recipeTitle}>{recipe.title}</div>
                          <div className={styles.recipeMeta}>
                            <span>⏱ {recipe.cookTime || '시간 미상'}</span>
                          </div>
                          <div className={styles.recipeFooter}>
                            <span className={styles.recipeTag}>{recipe.open === 'Y' ? '공개' : '비공개'}</span>
                            <span className={styles.recipeLikes}>❤️ {recipe.likesCount}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.emptyMsg}>아직 작성한 레시피가 없습니다.</div>
                )}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>문의 내역</h2>
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