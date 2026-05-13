"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import styles from './recipes.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

interface Recipe {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  open: string;
  likesCount: number;
  thumbClass: string;
  boardPostdate: string;
  imageUrl?: string; // 🌟 이미지 URL 추가
}

// 🌟 S3 이미지 처리 공통 함수
function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}

// 🌟 디저트를 후식으로 통일
const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '분식', '후식', '기타'];
const PER_PAGE = 10;
const PAGE_GROUP_SIZE = 10;

export default function MyRecipesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentCategory, setCurrentCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🌟 1. 전체 데이터를 한 번만 가져옵니다. (빠른 필터링을 위해)
  useEffect(() => {
    if (!isMounted || !loginUserNo) {
      if (isMounted && !loginUserNo) setLoading(false);
      return;
    }

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/recipes', {
          params: { userNo: loginUserNo } // category 파라미터 제거
        });
        if (response.status === 200) {
          setRecipes(response.data);
        }
      } catch (err) {
        console.error("레시피 목록 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [loginUserNo, isMounted]);

  // 카테고리 변경 시 1페이지로
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory]);

  // 🌟 2. 프론트엔드 자체 필터링
  const filteredRecipes = currentCategory === '전체' 
    ? recipes 
    : recipes.filter(recipe => recipe.category === currentCategory);

  // 🌟 3. 필터링된 데이터 기준으로 페이징
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / PER_PAGE));
  const pageItems = filteredRecipes.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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
          onClick={() => { setCurrentPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
        <h2 className={styles.sectionTitle}>📋 내가 만든 레시피</h2>
        {/* 필터링된 개수 표시 기능 추가 */}
        <span style={{marginLeft: '15px', color: '#666', fontSize: '14px'}}>총 {filteredRecipes.length}개</span>
        <Link href="/boards/write" style={{ marginLeft: 'auto' }}>
          <button className={styles.btnGreen}>+ 레시피 작성</button>
        </Link>
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
        <div className={styles.loadingBox}>레시피를 불러오는 중입니다...</div>
      ) : (
        <div className={styles.recipeGrid}>
          {pageItems.length > 0 ? (
            pageItems.map(recipe => (
              <Link href={`/boards/${recipe.boardNo}`} key={recipe.boardNo} className={styles.recipeCardLink}>
                <div className={styles.recipeCard}>
                  
                  {/* 🌟 4. 이미지 및 대체 바탕 출력 (이모지 삭제) */}
                  <div className={styles.recipeThumb} style={{ overflow: 'hidden' }}>
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
                        fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px'
                      }}>
                        CookMate
                      </div>
                    )}
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
              </Link>
            ))
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🍽️</div>
              <p>해당 카테고리에 작성된 레시피가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {renderPagination()}
    </div>
  );
}