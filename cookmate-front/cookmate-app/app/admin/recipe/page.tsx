'use client';

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface Recipe {
  recipeId: number;
  title: string;
  author: string;
  likeCount: number;
  typeNo: number;
  status: "N" | "Y";
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

export default function RecipeManagePage() {
  const router = useRouter();

  const [recipes,     setRecipes]     = useState<Recipe[]>([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading,     setLoading]     = useState(true);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [orderBy,       setOrderBy]       = useState("latest");

  // ── ref로 최신 필터 값 유지 (fetchRecipes가 클로저 문제 없이 참조) ──
  const searchRef  = useRef(searchKeyword);
  const statusRef  = useRef(statusFilter);
  const orderRef   = useRef(orderBy);
  const requestIdRef   = useRef(0);
  const currentPageRef = useRef(1);

  // 필터 state가 바뀔 때 ref도 동기화
  useEffect(() => { searchRef.current = searchKeyword; }, [searchKeyword]);
  useEffect(() => { statusRef.current = statusFilter;  }, [statusFilter]);
  useEffect(() => { orderRef.current  = orderBy;       }, [orderBy]);

  // ── fetchRecipes: deps 없이 ref만 참조 → 함수가 재생성되지 않음 ──
  const fetchRecipes = async (page: number) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const { data } = await axios.get<RecipeResponse>(
        "http://localhost:8081/api/admin/recipe",
        {
          params: {
            page,
            size:    ITEMS_PER_PAGE,
            keyword: searchRef.current.trim() || undefined,
            status:  statusRef.current || undefined,
            orderBy: orderRef.current,
          },
          timeout: 8000,
        }
      );

      if (requestId !== requestIdRef.current) return;

      setRecipes(data.recipeList ?? []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount ?? 0);
      setCurrentPage(data.currentPage || page);
      currentPageRef.current = data.currentPage || page;
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("레시피 목록 조회 실패", error);
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
  };

  // ── 최초 마운트 1회 ──────────────────────────────────
  useEffect(() => {
    fetchRecipes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 필터 변경 시 1페이지로 재조회 ───────────────────
  useEffect(() => {
    fetchRecipes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, statusFilter, orderBy]);

  // ── 뒤로가기(bfcache) 복원: persisted만 처리 ────────
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // bfcache 복원 시 로딩 상태 초기화 후 현재 페이지 재조회
        setLoading(false);
        fetchRecipes(currentPageRef.current);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 페이지 그룹 계산 ─────────────────────────────────
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
  const startPage    = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage      = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: Math.max(endPage - startPage + 1, 0) },
    (_, i) => startPage + i
  );

  const convertCategory = (typeNo: number) => {
    if (typeNo >= 400 && typeNo < 410) return "한식";
    if (typeNo >= 410 && typeNo < 420) return "양식";
    return "기타";
  };

  const handleToggleRecipeStatus = async (recipe: Recipe) => {
    const isHidden = recipe.status === "Y";
    const message  = isHidden
      ? "해당 레시피를 다시 게시할까요?"
      : "해당 레시피를 비공개로 처리할까요?";
    if (!confirm(message)) return;

    try {
      await axios.patch(
        `http://localhost:8081/api/admin/recipe/${recipe.recipeId}/${isHidden ? "restore" : "hide"}`,
        undefined,
        { timeout: 8000 }
      );
      await fetchRecipes(currentPageRef.current);
      alert(isHidden ? "레시피를 다시 게시했습니다." : "레시피가 비공개 처리되었습니다.");
    } catch (error) {
      console.error("레시피 공개 상태 변경 실패", error);
      alert("공개 상태 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <div className={styles.pageTitleBox}>
          <h1 className={styles.pageTitle}>레시피 관리</h1>
          <p className={styles.pageDescription}>
            전체 레시피를 조회하고 공개 상태를 관리합니다.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔎</span>
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="레시피 이름, 작성자 검색.."
              />
            </div>
            <div className={styles.filters}>
              <select disabled>
                <option>전체 카테고리</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">전체 상태</option>
                <option value="N">게시중</option>
                <option value="Y">비공개</option>
              </select>
              <select value={orderBy} onChange={e => setOrderBy(e.target.value)}>
                <option value="latest">최신 등록순</option>
                <option value="oldest">오래된 순</option>
              </select>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCol}><input type="checkbox" /></th>
                <th>번호</th>
                <th>레시피명</th>
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
                  <td colSpan={9} className={styles.empty}>로딩중..</td>
                </tr>
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.empty}>조회된 레시피가 없습니다.</td>
                </tr>
              ) : (
                recipes.map(recipe => (
                  <tr key={recipe.recipeId}>
                    <td><input type="checkbox" /></td>
                    <td className={styles.number}>#{recipe.recipeId}</td>
                    <td className={styles.recipeTitle}>{recipe.title}</td>
                    <td>
                      <span className={styles.categoryBadge}>
                        {convertCategory(recipe.typeNo)}
                      </span>
                    </td>
                    <td>{recipe.author}</td>
                    <td>{recipe.likeCount.toLocaleString()}</td>
                    <td>{recipe.createdAt || "-"}</td>
                    <td>
                      <span className={recipe.status === "Y" ? styles.hiddenBadge : styles.activeBadge}>
                        {recipe.status === "Y" ? "비공개" : "게시중"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.viewButton}
                          onClick={() => router.push(`/recipe/${recipe.recipeId}`)}
                        >
                          보기
                        </button>
                        <button
                          className={recipe.status === "Y" ? styles.restoreButton : styles.hideButton}
                          onClick={() => handleToggleRecipeStatus(recipe)}
                        >
                          {recipe.status === "Y" ? "복구" : "숨김"}
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
                ? "0 / 총 0개"
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
                {"<"}
              </button>
              {visiblePages.map(page => (
                <button
                  key={page}
                  className={currentPage === page ? styles.activePage : ""}
                  onClick={() => fetchRecipes(page)}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={endPage >= totalPages}
                onClick={() => fetchRecipes(startPage + PAGE_GROUP_SIZE)}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}