'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { useRouter } from "next/navigation";

import styles from "./page.module.css";

/* =========================
   타입 정의
========================= */

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

/* =========================
   상수
========================= */

const ITEMS_PER_PAGE = 10;

const PAGE_GROUP_SIZE = 5;

/**
 * 카테고리 매핑
 * DB TYPE_NO 기준
 */
const CATEGORY_MAP: Record<number, string> = {
  1: "한식",
  2: "중식",
  3: "일식",
  4: "양식",
  5: "샐러드",
  6: "수프",
  7: "디저트",

  9: "기타",
};

const convertCategory = (
  typeNo: number
) => {
  return CATEGORY_MAP[typeNo] || "기타";
};

/* =========================
   컴포넌트
========================= */

export default function RecipeManagePage() {
  const router = useRouter();

  /* =========================
     상태
  ========================= */

  const [recipes, setRecipes] = useState<
    Recipe[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [orderBy, setOrderBy] =
    useState("latest");

  /**
   * 카테고리 필터
   * ex) "", "1", "2"
   */
  const [categoryFilter, setCategoryFilter] =
    useState("");

  /* =========================
     Ref
  ========================= */

  const requestIdRef = useRef(0);

  const currentPageRef = useRef(1);

  /* =========================
     유틸 함수
  ========================= */

  /**
   * 카테고리명 변환
   */
  const convertCategory = (
    typeNo: number
  ) => {
    return CATEGORY_MAP[typeNo] || "기타";
  };

  /* =========================
     API
  ========================= */

  /**
   * 레시피 목록 조회
   */
  const fetchRecipes = async (
    page: number
  ) => {
    const requestId =
      ++requestIdRef.current;

    setLoading(true);

    try {
      const { data } =
        await axios.get<RecipeResponse>(
          "http://localhost:8081/api/admin/boards",
          {
            params: {
              page,
              size: ITEMS_PER_PAGE,
              keyword:
                searchKeyword.trim() ||
                undefined,
              status:
                statusFilter || undefined,
              orderBy,
              typeNo: 
                categoryFilter || undefined,
            },
            timeout: 8000,
          }
        );

      /**
       * 오래된 응답 무시
       */
      if (
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setRecipes(data.recipeList ?? []);

      setTotalPages(data.totalPages || 1);

      setTotalCount(data.totalCount ?? 0);

      setCurrentPage(
        data.currentPage || page
      );

      currentPageRef.current =
        data.currentPage || page;
    } catch (error) {
      /**
       * 오래된 요청 무시
       */
      if (
        requestId !== requestIdRef.current
      ) {
        return;
      }

      console.error(
        "레시피 목록 조회 실패",
        error
      );

      setRecipes([]);

      setTotalPages(1);

      setTotalCount(0);

      setCurrentPage(1);

      currentPageRef.current = 1;
    } finally {
      if (
        requestId === requestIdRef.current
      ) {
        setLoading(false);
      }
    }
  };

  /**
   * 게시글 숨김 / 복구
   */
  const handleToggleRecipeStatus =
    async (recipe: Recipe) => {
      const isHidden =
        recipe.status === "Y";

      const message = isHidden
        ? "해당 레시피를 다시 게시할까요?"
        : "해당 레시피를 비공개 처리할까요?";

      if (!confirm(message)) {
        return;
      }

      try {
        await axios.patch(
          `http://localhost:8081/api/admin/boards/${recipe.boardNo}/${isHidden ? "restore" : "hide"}`,
          undefined,
          {
            timeout: 8000,
          }
        );

        await fetchRecipes(
          currentPageRef.current
        );

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

        alert(
          "공개 상태 변경 중 오류가 발생했습니다."
        );
      }
    };

  /* =========================
     Effect
  ========================= */

  /**
   * 최초 조회
   */
  useEffect(() => {
    fetchRecipes(1);
  }, []);

  /**
   * 검색 / 상태 / 정렬 변경 시 재조회
   */
  useEffect(() => {
    fetchRecipes(1);
  }, [
    searchKeyword,
    statusFilter,
    orderBy,
    categoryFilter,
  ]);

  /**
   * 뒤로가기 복원
   */
  useEffect(() => {
    const handlePageShow = (
      e: PageTransitionEvent
    ) => {
      if (e.persisted) {
        fetchRecipes(
          currentPageRef.current
        );
      }
    };

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    return () => {
      window.removeEventListener(
        "pageshow",
        handlePageShow
      );
    };
  }, []);

  /* =========================
     카테고리 필터
  ========================= */

  /* =========================
     페이지네이션
  ========================= */

  const currentGroup = Math.ceil(
    currentPage / PAGE_GROUP_SIZE
  );

  const startPage =
    (currentGroup - 1) *
      PAGE_GROUP_SIZE +
    1;

  const endPage = Math.min(
    startPage + PAGE_GROUP_SIZE - 1,
    totalPages
  );

  const visiblePages = Array.from(
    {
      length: Math.max(
        endPage - startPage + 1,
        0
      ),
    },
    (_, i) => startPage + i
  );

  /* =========================
     렌더링
  ========================= */

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        {/* =========================
            페이지 타이틀
        ========================= */}

        <div className={styles.pageTitleBox}>
          <h1 className={styles.pageTitle}>
            레시피 관리
          </h1>

          <p
            className={
              styles.pageDescription
            }
          >
            전체 레시피를 조회하고
            공개 상태를 관리합니다.
          </p>
        </div>

        {/* =========================
            카드
        ========================= */}

        <div className={styles.card}>
          {/* =========================
              상단 툴바
          ========================= */}

          <div className={styles.toolbar}>
            {/* 검색 */}

            <div className={styles.searchBox}>
              <span
                className={styles.searchIcon}
              >
                🔎
              </span>

              <input
                type="text"
                value={searchKeyword}
                onChange={e =>
                  setSearchKeyword(
                    e.target.value
                  )
                }
                placeholder="레시피명, 작성자 검색"
              />
            </div>

            {/* 필터 */}

            <div className={styles.filters}>
              {/* 카테고리 */}

              <select
                value={categoryFilter}
                onChange={e =>
                  setCategoryFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  전체 카테고리
                </option>

                {Object.entries(
                  CATEGORY_MAP
                ).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>

              {/* 상태 */}

              <select
                value={statusFilter}
                onChange={e =>
                  setStatusFilter(
                    e.target.value
                  )
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
                  setOrderBy(
                    e.target.value
                  )
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

          {/* =========================
              테이블
          ========================= */}

          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={
                    styles.checkboxCol
                  }
                >
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
                    className={
                      styles.empty
                    }
                  >
                    로딩중..
                  </td>
                </tr>
              ) : recipes.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={
                      styles.empty
                    }
                  >
                    조회된 레시피가
                    없습니다.
                  </td>
                </tr>
              ) : (
                recipes.map(
                  recipe => (
                    <tr
                      key={recipe.boardNo}
                    >
                      <td>
                        <input type="checkbox" />
                      </td>

                      <td
                        className={
                          styles.number
                        }
                      >
                        #
                        {recipe.boardNo}
                      </td>

                      <td
                        className={
                          styles.recipeTitle
                        }
                      >
                        {recipe.title}
                      </td>

                      <td>
                        <span
                          className={
                            styles.categoryBadge
                          }
                        >
                          {convertCategory(
                            recipe.typeNo
                          )}
                        </span>
                      </td>

                      <td>
                        {recipe.author}
                      </td>

                      <td>
                        {recipe.likeCount.toLocaleString()}
                      </td>

                      <td>
                        {recipe.createdAt ||
                          "-"}
                      </td>

                      <td>
                        <span
                          className={
                            recipe.status ===
                            "Y"
                              ? styles.hiddenBadge
                              : styles.activeBadge
                          }
                        >
                          {recipe.status ===
                          "Y"
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
                          {/* 보기 */}

                          <button
                            className={
                              styles.viewButton
                            }
                            onClick={() =>
                              router.push(
                                `/boards/${recipe.boardNo}`
                              )
                            }
                          >
                            보기
                          </button>

                          {/* 숨김 / 복구 */}

                          <button
                            className={
                              recipe.status ===
                              "Y"
                                ? styles.restoreButton
                                : styles.hideButton
                            }
                            onClick={() =>
                              handleToggleRecipeStatus(
                                recipe
                              )
                            }
                          >
                            {recipe.status ===
                            "Y"
                              ? "복구"
                              : "숨김"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>

          {/* =========================
              하단
          ========================= */}

          <div className={styles.footer}>
            {/* 페이지 정보 */}

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

            <div
              className={styles.pagination}
            >
              {/* 이전 */}

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

              {/* 페이지 목록 */}

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

              {/* 다음 */}

              <button
                disabled={
                  endPage >= totalPages
                }
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