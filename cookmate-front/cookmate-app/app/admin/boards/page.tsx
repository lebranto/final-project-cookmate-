'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface Recipe {
  boardNo: number;
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

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderBy, setOrderBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("");

  const requestIdRef = useRef(0);
  const currentPageRef = useRef(1);

  // 카테고리 변환
  // 실제 DB 값 기준으로 수정 가능
  const convertCategory = (typeNo: number) => {
    // 한식
    if (typeNo >= 400 && typeNo < 410) {
      return "한식";
    }

    // 양식
    if (typeNo >= 410 && typeNo < 420) {
      return "양식";
    }

    // 기타
    return "기타";
  };

  // 레시피 조회
  const fetchRecipes = async (page: number) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);

    try {
      const { data } = await axios.get<RecipeResponse>(
        "http://localhost:8081/api/admin/boards",
        {
          params: {
            page,
            size: ITEMS_PER_PAGE,
            keyword: searchKeyword.trim() || undefined,
            status: statusFilter || undefined,
            orderBy,
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

  // 최초 조회
  useEffect(() => {
    fetchRecipes(1);
  }, []);

  // 검색/상태/정렬 변경 시 재조회
  useEffect(() => {
    fetchRecipes(1);
  }, [searchKeyword, statusFilter, orderBy]);

  // 뒤로가기 복원
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        fetchRecipes(currentPageRef.current);
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // 프론트 카테고리 필터
  const filteredRecipes = useMemo(() => {
    if (!categoryFilter) {
      return recipes;
    }

    return recipes.filter(recipe => {
      const category = convertCategory(recipe.typeNo);

      if (categoryFilter === "korean") {
        return category === "한식";
      }

      if (categoryFilter === "western") {
        return category === "양식";
      }

      if (categoryFilter === "etc") {
        return category === "기타";
      }

      return true;
    });
  }, [recipes, categoryFilter]);

  // 페이지네이션
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);

  const startPage =
    (currentGroup - 1) * PAGE_GROUP_SIZE + 1;

  const endPage = Math.min(
    startPage + PAGE_GROUP_SIZE - 1,
    totalPages
  );

  const visiblePages = Array.from(
    {
      length: Math.max(endPage - startPage + 1, 0),
    },
    (_, i) => startPage + i
  );

  // 게시글 숨김/복구
  const handleToggleRecipeStatus = async (
    boards: Recipe
  ) => {
    const isHidden = boards.status === "Y";

    const message = isHidden
      ? "해당 레시피를 다시 게시할까요?"
      : "해당 레시피를 비공개로 처리할까요?";

    if (!confirm(message)) return;

    try {
      await axios.patch(
        `http://localhost:8081/api/admin/boards/${boards.boardNo}/${isHidden ? "restore" : "hide"}`,
        undefined,
        {
          timeout: 8000,
        }
      );

      await fetchRecipes(currentPageRef.current);

      alert(
        isHidden
          ? "레시피를 다시 게시했습니다."
          : "레시피가 비공개 처리되었습니다."
      );
    } catch (error) {
      console.error(
        "레시피 공개 상태 변경 실패",
        error
      );

      alert("공개 상태 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <div className={styles.pageTitleBox}>
          <h1 className={styles.pageTitle}>
            레시피 관리
          </h1>

          <p className={styles.pageDescription}>
            전체 레시피를 조회하고 공개 상태를 관리합니다.
          </p>
        </div>

        <div className={styles.card}>
          {/* 상단 툴바 */}
          <div className={styles.toolbar}>
            {/* 검색 */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                🔎
              </span>

              <input
                type="text"
                value={searchKeyword}
                onChange={e =>
                  setSearchKeyword(e.target.value)
                }
                placeholder="레시피 이름, 작성자 검색.."
              />
            </div>

            {/* 필터 */}
            <div className={styles.filters}>
              {/* 카테고리 */}
              <select
                value={categoryFilter}
                onChange={e =>
                  setCategoryFilter(e.target.value)
                }
              >
                <option value="">
                  전체 카테고리
                </option>

                <option value="korean">
                  한식
                </option>

                <option value="western">
                  양식
                </option>

                <option value="etc">
                  기타
                </option>
              </select>

              {/* 상태 */}
              <select
                value={statusFilter}
                onChange={e =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">
                  전체 상태
                </option>

                <option value="N">
                  게시중
                </option>

                <option value="Y">
                  비공개
                </option>
              </select>

              {/* 정렬 */}
              <select
                value={orderBy}
                onChange={e =>
                  setOrderBy(e.target.value)
                }
              >
                <option value="latest">
                  최신 등록순
                </option>

                <option value="oldest">
                  오래된 순
                </option>
              </select>
            </div>
          </div>

          {/* 테이블 */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCol}>
                  <input type="checkbox" />
                </th>

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
                  <td
                    colSpan={9}
                    className={styles.empty}
                  >
                    로딩중..
                  </td>
                </tr>
              ) : filteredRecipes.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={styles.empty}
                  >
                    조회된 레시피가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredRecipes.map(boards => (
                  <tr key={boards.boardNo}>
                    <td>
                      <input type="checkbox" />
                    </td>

                    <td className={styles.number}>
                      #{boards.boardNo}
                    </td>

                    <td className={styles.recipeTitle}>
                      {boards.title}
                    </td>

                    <td>
                      <span
                        className={
                          styles.categoryBadge
                        }
                      >
                        {convertCategory(
                          boards.typeNo
                        )}
                      </span>
                    </td>

                    <td>{boards.author}</td>

                    <td>
                      {boards.likeCount.toLocaleString()}
                    </td>

                    <td>
                      {boards.createdAt || "-"}
                    </td>

                    <td>
                      <span
                        className={
                          boards.status === "Y"
                            ? styles.hiddenBadge
                            : styles.activeBadge
                        }
                      >
                        {boards.status === "Y"
                          ? "비공개"
                          : "게시중"}
                      </span>
                    </td>

                    <td>
                      <div
                        className={
                          styles.actionButtons
                        }
                      >
                        <button
                          className={
                            styles.viewButton
                          }
                          onClick={() =>
                            router.push(
                              `/boards/${boards.boardNo}`
                            )
                          }
                        >
                          보기
                        </button>

                        <button
                          className={
                            boards.status === "Y"
                              ? styles.restoreButton
                              : styles.hideButton
                          }
                          onClick={() =>
                            handleToggleRecipeStatus(
                              boards
                            )
                          }
                        >
                          {boards.status === "Y"
                            ? "복구"
                            : "숨김"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 하단 */}
          <div className={styles.footer}>
            <p className={styles.pageInfo}>
              {totalCount === 0
                ? "0 / 총 0개"
                : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,
                    totalCount
                  )} / 총 ${totalCount.toLocaleString()}개`}
            </p>

            {/* 페이지네이션 */}
            <div className={styles.pagination}>
              <button
                disabled={startPage === 1}
                onClick={() =>
                  fetchRecipes(
                    Math.max(
                      startPage -
                        PAGE_GROUP_SIZE,
                      1
                    )
                  )
                }
              >
                {"<"}
              </button>

              {visiblePages.map(page => (
                <button
                  key={page}
                  className={
                    currentPage === page
                      ? styles.activePage
                      : ""
                  }
                  onClick={() =>
                    fetchRecipes(page)
                  }
                >
                  {page}
                </button>
              ))}

              <button
                disabled={endPage >= totalPages}
                onClick={() =>
                  fetchRecipes(
                    startPage +
                      PAGE_GROUP_SIZE
                  )
                }
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