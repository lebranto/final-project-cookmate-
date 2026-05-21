"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import styles from './scraps.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';
import '@/app/responsive.css';

interface Scrap {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  likesCount: number;
  authorNickname: string;
  thumbClass: string;
  imageUrl?: string;
}

function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}

const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '샐러드', '수프', '디저트'];
const PER_PAGE = 12;
const PAGE_GROUP_SIZE = 10;

export default function MyScrapsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [currentCategory, setCurrentCategory] = useState('전체');
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

    const fetchScraps = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/scraps', {
          params: { userNo: loginUserNo } 
        });
        if (response.status === 200) {
          setScraps(response.data);
        }
      } catch (err) {
        console.error("스크랩 목록 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScraps();
  }, [loginUserNo, isMounted]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory]);

  const filteredScraps = currentCategory === '전체' 
    ? scraps 
    : scraps.filter(scrap => scrap.category === currentCategory);

  const totalPages = Math.max(1, Math.ceil(filteredScraps.length / PER_PAGE));
  const pageItems = filteredScraps.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const pageGroup = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE);
    const startPage = pageGroup * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
          onClick={() => { 
            setCurrentPage(i); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
          }}
        >
          {i}
        </button>
      );
    }

    return (
      <div className={styles.pagination}>
        <button className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(c => Math.max(1, c - 1))}>&lsaquo;</button>
        {pages}
        <button className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}>&rsaquo;</button>
      </div>
    );
  };

  if (!isMounted) return null;

  if (!isLoggedIn || !loginUserNo) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>스크랩 목록</h2>
        <span className={styles.totalCount}>총 {filteredScraps.length}개</span>
      </div>

      <div className={styles.filterBar}>
        <div className={`${styles.categoryWrapper} mobile-swipe-menu`}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            className={`${styles.filterBtn} ${currentCategory === cat ? styles.active : ''}`}
            onClick={() => setCurrentCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>스크랩 목록을 불러오는 중...</div>
      ) : (
        <div className={styles.recipeGrid}>
          {pageItems.length > 0 ? (
            pageItems.map(scrap => (
              <Link href={`/boards/${scrap.boardNo}`} key={scrap.boardNo} className={styles.recipeCardLink}>
                <div className={styles.recipeCard}>
                  <div className={styles.recipeThumb} style={{ overflow: 'hidden' }}>
                    {scrap.imageUrl ? (
                      <img 
                        src={resolveRecipeImageUrl(scrap.imageUrl)} 
                        alt={scrap.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', backgroundColor: '#c4dba4', color: '#1e381b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px'
                      }}>
                        CookMate
                      </div>
                    )}
                  </div>

                  <div className={styles.recipeInfo}>
                    <div className={styles.recipeTitle}>{scrap.title}</div>
                    <div className={styles.recipeTags}>
                      <span className={styles.tagCategory}>{scrap.category}</span>
                    </div>
                    <div className={styles.recipeMeta}>
                      <span>⏱ {scrap.cookTime || '시간 미상'}</span>
                      <span style={{ marginLeft: '8px', color: '#e05252', fontSize: '12px' }}>
                        ❤️ {scrap.likesCount}
                      </span>
                    </div>
                    <div className={styles.recipeAuthor}>by {scrap.authorNickname}</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}></div>
              <p>해당 카테고리의 스크랩이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {renderPagination()}
    </div>
  );
}