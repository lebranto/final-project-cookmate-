'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import styles from './page.module.css';

interface Recipe {
  boardNo: number;
  title: string;
  author: string;
  likeCount: number;
  typeNo: number;
  status: 'N' | 'Y';
  createdAt: string;
}

interface RecipeResponse {
  recipeList: Recipe[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 10;
const PAGE_GROUP_SIZE = 5;

const CATEGORY_MAP: Record<number, string> = {
  1: '한식',
  2: '중식',
  3: '일식',
  4: '양식',
  5: '샐러드',
  6: '스프',
  7: '디저트',
  9: '기타',
};

const convertCategory = (typeNo: number) => CATEGORY_MAP[typeNo] || '기타';

export default function RecipeManagePage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orderBy, setOrderBy] = useState('latest');
  const [categoryFilter, setCategoryFilter] = useState('');

  const requestIdRef = useRef(0);
  const currentPageRef = useRef(1);

  const fetchRecipes = useCallback(
    async (page: number) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);

      try {
        const { data } = await api.get<RecipeResponse>('/admin/boards', {
          params: {
            page,
            size: ITEMS_PER_PAGE,
            keyword: searchKeyword.trim() || undefined,
            status: statusFilter || undefined,
            orderBy,
            typeNo: categoryFilter || undefined,
          },
          timeout: 8000,
        });

        if (requestId !== requestIdRef.current) return;

        setRecipes(data.recipeList ?? []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount ?? 0);
        setCurrentPage(data.currentPage || page);
        currentPageRef.current = data.currentPage || page;
      } catch (error) {
        if (requestId !== requestIdRef.current) return;

        console.error('게시글 목록 조회 실패', error);
        setRecipes([]);
        setTotalPages(1);
        setTotalCount(0);
        setCurrentPage(1);
        currentPageRef.current = 1;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [categoryFilter, orderBy, searchKeyword, statusFilter]
  );

  const handleToggleRecipeStatus = async (recipe: Recipe) => {
    const isHidden = recipe.status === 'Y';
    const message = isHidden
      ? '해당 게시글을 다시 게시하시겠습니까?'
      : '해당 게시글을 비공개 처리하시겠습니까?';

    if (!confirm(message)) return;

    try {
      await api.patch(
        `/admin/boards/${recipe.boardNo}/${isHidden ? 'restore' : 'hide'}`,
        undefined,
        { timeout: 8000 }
      );

      await fetchRecipes(currentPageRef.current);
      alert(isHidden ? '게시글을 다시 게시했습니다.' : '게시글을 비공개 처리했습니다.');
    } catch (error) {
      console.error('게시글 공개 상태 변경 실패', error);
      alert('공개 상태 변경 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchRecipes(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchRecipes]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void fetchRecipes(currentPageRef.current);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [fetchRecipes]);

  const visiblePages = useMemo(() => {
    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    return Array.from(
      { length: Math.max(endPage - startPage + 1, 0) },
      (_, index) => startPage + index
    );
  }, [currentPage, totalPages]);

  const startPage = visiblePages[0] ?? 1;
  const endPage = visiblePages[visiblePages.length - 1] ?? 1;

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <div className={styles.pageTitleBox}>
          <h1 className={styles.pageTitle}>게시글 관리</h1>
          <p className={styles.pageDescription}>
            전체 게시글을 조회하고 공개 상태를 관리합니다.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="게시글명, 작성자 검색"
              />
            </div>

            <div className={styles.filters}>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="">전체 카테고리</option>
                {Object.entries(CATEGORY_MAP).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">전체 상태</option>
                <option value="N">게시중</option>
                <option value="Y">비공개</option>
              </select>

              <select value={orderBy} onChange={(event) => setOrderBy(event.target.value)}>
                <option value="latest">최신 등록순</option>
                <option value="oldest">오래된순</option>
              </select>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>번호</th>
                <th>게시글명</th>
                <th>카테고리</th>
                <th>작성자</th>
                <th>좋아요</th>
                <th>등록일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    로딩중입니다.
                  </td>
                </tr>
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    조회된 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                recipes.map((recipe) => (
                  <tr key={recipe.boardNo}>
                    <td className={styles.number}>#{recipe.boardNo}</td>
                    <td className={styles.recipeTitle}>{recipe.title}</td>
                    <td>
                      <span className={styles.categoryBadge}>
                        {convertCategory(recipe.typeNo)}
                      </span>
                    </td>
                    <td>{recipe.author}</td>
                    <td>{recipe.likeCount.toLocaleString()}</td>
                    <td>{recipe.createdAt || '-'}</td>
                    <td>
                      <span
                        className={
                          recipe.status === 'Y' ? styles.hiddenBadge : styles.activeBadge
                        }
                      >
                        {recipe.status === 'Y' ? '비공개' : '게시중'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.viewButton}
                          onClick={() => router.push(`/boards/${recipe.boardNo}`)}
                        >
                          보기
                        </button>
                        <button
                          className={
                            recipe.status === 'Y' ? styles.restoreButton : styles.hideButton
                          }
                          onClick={() => handleToggleRecipeStatus(recipe)}
                        >
                          {recipe.status === 'Y' ? '복구' : '숨김'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={styles.footer}>
            <p className={styles.pageInfo}>
              {totalCount === 0
                ? '0 / 총 0개'
                : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    totalCount
                  )} / 총 ${totalCount.toLocaleString()}개`}
            </p>

            <div className={styles.pagination}>
              <button
                disabled={startPage === 1}
                onClick={() => fetchRecipes(Math.max(startPage - PAGE_GROUP_SIZE, 1))}
              >
                {'<'}
              </button>

              {visiblePages.map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? styles.activePage : ''}
                  onClick={() => fetchRecipes(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={endPage >= totalPages}
                onClick={() => fetchRecipes(startPage + PAGE_GROUP_SIZE)}
              >
                {'>'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
