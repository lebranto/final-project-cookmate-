"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import styles from './scraps.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

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

// 🌟 1. '디저트' 대신 DB에 있는 '후식'으로 이름 통일 (또는 둘 다 넣기)
const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '분식', '후식', '기타'];
const PER_PAGE = 10;
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

  // 🌟 2. 데이터를 '한 번만' 전체 다 가져오도록 수정 (의존성 배열에서 currentCategory 제거)
  useEffect(() => {
    if (!isMounted || !loginUserNo) {
      if (isMounted && !loginUserNo) setLoading(false);
      return;
    }

    const fetchScraps = async () => {
      setLoading(true);
      try {
        // category 파라미터 없이 무조건 유저의 전체 스크랩을 다 가져옵니다.
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

  // 🌟 3. 카테고리가 바뀔 때마다 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory]);

  // 🌟 4. 프론트엔드 자체 필터링 로직 추가! (서버에 요청 안 하고 여기서 거름)
  const filteredScraps = currentCategory === '전체' 
    ? scraps 
    : scraps.filter(scrap => scrap.category === currentCategory);

  // 🌟 5. 페이징 계산을 scraps가 아닌 'filteredScraps' 기준으로 변경
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
        <button className={`${styles.pageBtn} ${styles.arrow}`} disabled={currentPage === 1} onClick={() => setCurrentPage(c => Math.max(1, c - 1))}>&lsaquo;</button>
        {pages}
        <button className={`${styles.pageBtn} ${styles.arrow}`} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}>&rsaquo;</button>
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
        <h2 className={styles.sectionTitle}>🤍 스크랩 목록</h2>
        {/* 🌟 개수도 필터링된 개수로 표시 */}
        <span className={styles.totalCount}>총 {filteredScraps.length}개</span>
      </div>

      <div className={styles.filterBar}>
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
              <div className={styles.emptyIcon}>🤍</div>
              <p>해당 카테고리의 스크랩이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {renderPagination()}
    </div>
  );
}