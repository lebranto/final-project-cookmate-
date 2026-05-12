"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import styles from './scraps.module.css';

// 1. 백엔드 RecipeDto 구조에 맞춘 인터페이스
interface Scrap {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  likesCount: number;
  authorNickname: string;
  thumbClass: string;
}

const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '분식', '디저트', '기타'];
const PER_PAGE = 10;        // 한 페이지당 노출 아이템 수
const PAGE_GROUP_SIZE = 10;  // 한 번에 보여줄 페이지 번호 수

export default function MyScrapsPage() {
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [currentCategory, setCurrentCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loginUserNo = 1; // 임시 로그인 유저 번호

  // 🌟 카테고리 변경 시 데이터 fetch
  useEffect(() => {
    const fetchScraps = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/scraps', {
          params: { 
            userNo: loginUserNo,
            category: currentCategory 
          }
        });
        if (response.status === 200) {
          setScraps(response.data);
          setCurrentPage(1); // 카테고리 변경 시 페이지 리셋
        }
      } catch (err) {
        console.error("스크랩 목록 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScraps();
  }, [currentCategory]);

  // 이모지 매핑 헬퍼
  const getEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      '한식': '🍲', '양식': '🍝', '일식': '🍣', 
      '중식': '🥟', '분식': '🍢', '디저트': '🍰'
    };
    return emojiMap[category] || '🍳';
  };

  // --- 페이징 및 그룹 계산 로직 ---
  const totalPages = Math.max(1, Math.ceil(scraps.length / PER_PAGE));
  const pageItems = scraps.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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
        <button 
          className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
        >
          &lsaquo;
        </button>

        {pages}

        <button 
          className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
        >
          &rsaquo;
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>🤍 스크랩 목록</h2>
        <span className={styles.totalCount}>총 {scraps.length}개</span>
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
              <div key={scrap.boardNo} className={styles.recipeCard}>
                <div className={`${styles.recipeThumb} ${styles[scrap.thumbClass] || styles.thumbMint}`}>
                  {getEmoji(scrap.category)}
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