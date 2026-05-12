"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import styles from './recipes.module.css';

// 1. 데이터 구조 인터페이스
interface Recipe {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  open: string;      // 'Y' 또는 'N'
  likesCount: number;
  thumbClass: string;
  boardPostdate: string;
}

const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '분식', '디저트', '기타'];
const PER_PAGE = 10;       // 한 페이지당 노출 레시피 수
const PAGE_GROUP_SIZE = 10; // 한 번에 보여줄 페이지 버튼 수

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentCategory, setCurrentCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loginUserNo = 1; // 임시 로그인 유저 번호 (추후 세션 등으로 대체)

  // 🌟 카테고리 변경 시 데이터 fetch
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/recipes', {
          params: { 
            userNo: loginUserNo,
            category: currentCategory 
          }
        });
        if (response.status === 200) {
          setRecipes(response.data);
          setCurrentPage(1); // 카테고리 이동 시 1페이지로 강제 리셋
        }
      } catch (err) {
        console.error("레시피 목록 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
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
  const totalPages = Math.max(1, Math.ceil(recipes.length / PER_PAGE));
  const pageItems = recipes.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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
        {/* 이전 그룹/페이지 화살표 */}
        <button 
          className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
        >
          &lsaquo;
        </button>

        {pages}

        {/* 다음 그룹/페이지 화살표 */}
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
    <div className={styles.container}>
      {/* 헤더 영역 */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>📋 내가 만든 레시피</h2>
        <button className={styles.btnGreen}>+ 레시피 작성</button>
      </div>

      {/* 필터 바 */}
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

      {/* 레시피 그리드 영역 */}
      {loading ? (
        <div className={styles.loadingBox}>레시피를 불러오는 중입니다...</div>
      ) : (
        <div className={styles.recipeGrid}>
          {pageItems.length > 0 ? (
            pageItems.map(recipe => (
              <div key={recipe.boardNo} className={styles.recipeCard}>
                <div className={`${styles.recipeThumb} ${styles[recipe.thumbClass] || styles.thumbMint}`}>
                  {getEmoji(recipe.category)}
                </div>
                <div className={styles.recipeInfo}>
                  <div className={styles.recipeTitle}>{recipe.title}</div>
                  <div className={styles.recipeTags}>
                    <span className={`${styles.tag} ${styles.tagCategory}`}>{recipe.category}</span>
                  </div>
                  <div className={styles.recipeMeta}>
                    <span>⏱ {recipe.cookTime || '시간 미상'}</span>
                    <span className={styles.tagLikes}>❤️ {recipe.likesCount}</span>
                  </div>
                  <div className={styles.statusBox}>
                    <span className={`${styles.tag} ${recipe.open === 'Y' ? styles.tagPublic : styles.tagPrivate}`}>
                      {recipe.open === 'Y' ? '공개' : '비공개'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🍽️</div>
              <p>작성된 레시피가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
}