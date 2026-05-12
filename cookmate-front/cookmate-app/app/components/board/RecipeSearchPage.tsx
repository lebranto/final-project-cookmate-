"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import styles from "./RecipeSearchPage.module.css";

type Source = "user" | "official";
type Sort = "popular" | "latest" | "likes" | "cookTime";

interface SearchRecipe {
  boardNo: number;
  userNo: number;
  boardTitle: string;
  introduce: string;
  imageUrl: string;
  likesCount: number;
  nickname: string;
  typeName: string;
  difficult: string;
  cookTime: string;
  calory: string;
  ai: string;
  isApiData: string;
  boardPostdate: string;
}

interface SearchResponse {
  list: SearchRecipe[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

const USER_CATEGORIES = ["한식", "중식", "일식", "양식", "샐러드", "디저트"];
const OFFICIAL_CATEGORIES = ["국·찌개", "반찬", "밥", "면·만두", "구이", "찜·조림", "기타"];
const COOK_TIMES = ["15분 이내", "30분 이내", "1시간 이내"];
const DIFFICULTIES = ["쉬움", "보통", "어려움"];
const KEYWORDS = ["김치찌개", "된장찌개", "파스타", "샐러드", "계란요리"];
const PAGE_SIZE = 12;

export default function RecipeSearchPage() {
  const [source, setSource] = useState<Source>("user");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficult, setDifficult] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [data, setData] = useState<SearchResponse>({
    list: [],
    totalCount: 0,
    page: 1,
    size: PAGE_SIZE,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrappedBoardNos, setScrappedBoardNos] = useState<Set<number>>(new Set());
  const [scrapPendingBoardNos, setScrapPendingBoardNos] = useState<Set<number>>(new Set());
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const router = useRouter();

  const categories = source === "official" ? OFFICIAL_CATEGORIES : USER_CATEGORIES;
  const activeFilters = useMemo(
    () =>
      [
        submittedKeyword && { key: "keyword", label: `검색어: ${submittedKeyword}` },
        category && { key: "category", label: category },
        source === "user" && cookTime && { key: "cookTime", label: cookTime },
        source === "user" && difficult && { key: "difficult", label: difficult },
      ].filter(Boolean) as Array<{ key: string; label: string }>,
    [category, cookTime, difficult, source, submittedKeyword]
  );

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get<SearchResponse>("/boards/search", {
        params: {
          source,
          keyword: submittedKeyword || undefined,
          category: category || undefined,
          cookTime: source === "user" ? cookTime || undefined : undefined,
          difficult: source === "user" ? difficult || undefined : undefined,
          sort,
          page,
          size: PAGE_SIZE,
        },
      });
      setData(res.data);
    } catch (error) {
      console.error("레시피 검색 실패:", error);
      setErrorMessage("레시피를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [category, cookTime, difficult, page, sort, source, submittedKeyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchRecipes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchRecipes]);

  useEffect(() => {
    if (!isLoggedIn || !userInfo || data.list.length === 0) {
      return;
    }

    let ignore = false;

    const fetchScrapStatuses = async () => {
      const statuses = await Promise.all(
        data.list.map(async (recipe) => {
          try {
            const res = await api.get<{ scrapped: boolean }>(
              `/boards/${recipe.boardNo}/scrap/status?userNo=${userInfo.userNo}`
            );
            return [recipe.boardNo, res.data.scrapped] as const;
          } catch {
            return [recipe.boardNo, false] as const;
          }
        })
      );

      if (ignore) return;

      setScrappedBoardNos(
        new Set(statuses.filter(([, scrapped]) => scrapped).map(([boardNo]) => boardNo))
      );
    };

    void fetchScrapStatuses();

    return () => {
      ignore = true;
    };
  }, [data.list, isLoggedIn, userInfo]);

  const handleSourceChange = (nextSource: Source) => {
    setSource(nextSource);
    setCategory("");
    setCookTime("");
    setDifficult("");
    setSort("popular");
    setPage(1);
  };

  const handleSearch = () => {
    setSubmittedKeyword(keyword.trim());
    setPage(1);
  };

  const handleQuickSearch = (value: string) => {
    setKeyword(value);
    setSubmittedKeyword(value);
    setPage(1);
  };

  const clearFilter = (key: string) => {
    if (key === "keyword") {
      setKeyword("");
      setSubmittedKeyword("");
    }
    if (key === "category") setCategory("");
    if (key === "cookTime") setCookTime("");
    if (key === "difficult") setDifficult("");
    setPage(1);
  };

  const clearAll = () => {
    setKeyword("");
    setSubmittedKeyword("");
    setCategory("");
    setCookTime("");
    setDifficult("");
    setPage(1);
  };

  const handleScrap = async (recipe: SearchRecipe) => {
    if (!isLoggedIn || !userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (recipe.userNo === userInfo.userNo) {
      alert("본인 게시글은 스크랩할 수 없습니다.");
      return;
    }

    setScrapPendingBoardNos((prev) => new Set(prev).add(recipe.boardNo));

    try {
      await api.post(`/boards/${recipe.boardNo}/scrap?userNo=${userInfo.userNo}`);
      setScrappedBoardNos((prev) => {
        const next = new Set(prev);
        if (next.has(recipe.boardNo)) {
          next.delete(recipe.boardNo);
        } else {
          next.add(recipe.boardNo);
        }
        return next;
      });
    } catch (error) {
      console.error("스크랩 처리 실패:", error);
      alert(getErrorMessage(error, "스크랩 처리에 실패했습니다."));
    } finally {
      setScrapPendingBoardNos((prev) => {
        const next = new Set(prev);
        next.delete(recipe.boardNo);
        return next;
      });
    }
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    router.push("/boards/write");
  };

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${filterOpen ? styles.filterOpen : ""}`}>
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setFilterOpen((prev) => !prev)}
            aria-expanded={filterOpen}
          >
            <span>필터</span>
            <span>{filterOpen ? "닫기" : "열기"}</span>
          </button>

          <div className={styles.filterPanel}>
            <FilterSection title="카테고리">
              {categories.map((item) => (
                <FilterButton
                  key={item}
                  label={item}
                  active={category === item}
                  onClick={() => {
                    setCategory(category === item ? "" : item);
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>

            <FilterSection title="조리시간">
              {COOK_TIMES.map((item) => (
                <FilterButton
                  key={item}
                  label={item}
                  disabled={source === "official"}
                  active={cookTime === item}
                  onClick={() => {
                    setCookTime(cookTime === item ? "" : item);
                    setPage(1);
                  }}
                />
              ))}
              {source === "official" && (
                <p className={styles.disabledText}>공식 레시피는 조리시간 정보가 없습니다.</p>
              )}
            </FilterSection>

            <FilterSection title="난이도">
              {DIFFICULTIES.map((item) => (
                <FilterButton
                  key={item}
                  label={item}
                  disabled={source === "official"}
                  active={difficult === item}
                  onClick={() => {
                    setDifficult(difficult === item ? "" : item);
                    setPage(1);
                  }}
                />
              ))}
              {source === "official" && (
                <p className={styles.disabledText}>공식 레시피는 난이도 정보가 없습니다.</p>
              )}
            </FilterSection>

          </div>
        </aside>

        <section className={styles.main}>
          <div className={styles.tabWrap}>
            <button
              type="button"
              className={`${styles.tabButton} ${source === "user" ? styles.active : ""}`}
              onClick={() => handleSourceChange("user")}
            >
              사용자 레시피
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${source === "official" ? styles.active : ""}`}
              onClick={() => handleSourceChange("official")}
            >
              공식 레시피
            </button>
          </div>

          {source === "official" && (
            <div className={styles.officialBanner}>
              식품의약품안전처 공식 레시피입니다. 공식 레시피는 요리 종류 중심으로 검색됩니다.
            </div>
          )}

          <section className={styles.searchHero}>
            <div className={styles.searchRow}>
              <div className={styles.searchInput}>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch();
                  }}
                  placeholder="레시피 이름이나 재료를 입력하세요."
                />
              </div>
              <button type="button" className={styles.searchButton} onClick={handleSearch}>
                검색하기
              </button>
            </div>

            <div className={styles.keywordRow}>
              <span className={styles.keywordLabel}>인기 검색어</span>
              {KEYWORDS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={styles.keywordChip}
                  onClick={() => handleQuickSearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          {activeFilters.length > 0 && (
            <div className={styles.activeFilters}>
              <span className={styles.keywordLabel}>선택한 필터</span>
              {activeFilters.map((filter) => (
                <span key={filter.key} className={styles.filterChip}>
                  {filter.label}
                  <button type="button" onClick={() => clearFilter(filter.key)}>X</button>
                </span>
              ))}
              <button type="button" className={styles.clearButton} onClick={clearAll}>
                전체 초기화
              </button>
            </div>
          )}

          <div className={styles.resultsHead}>
            <div className={styles.resultsCount}>
              총 <strong>{data.totalCount}</strong>개의 레시피
            </div>
            <div className={styles.resultActions}>
              <button type="button" className={styles.writeButton} onClick={handleWriteClick}>
                레시피 작성
              </button>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as Sort);
                  setPage(1);
                }}
                className={styles.sortSelect}
              >
                <option value="popular">인기순</option>
                <option value="latest">최신순</option>
                <option value="likes">좋아요순</option>
                {source === "user" && <option value="cookTime">조리시간순</option>}
              </select>
            </div>
          </div>

          {errorMessage && <div className={styles.messageBox}>{errorMessage}</div>}
          {loading && <div className={styles.messageBox}>검색 중...</div>}

          {!loading && data.list.length === 0 && (
            <div className={styles.messageBox}>검색 결과가 없습니다.</div>
          )}

          <div className={styles.recipeGrid}>
            {data.list.map((recipe) => (
              <RecipeCard
                key={recipe.boardNo}
                recipe={recipe}
                scrapped={isLoggedIn && scrappedBoardNos.has(recipe.boardNo)}
                scrapPending={scrapPendingBoardNos.has(recipe.boardNo)}
                onScrap={() => handleScrap(recipe)}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageButton}
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                이전
              </button>
              {Array.from({ length: data.totalPages }, (_, index) => index + 1)
                .slice(Math.max(0, page - 3), Math.max(5, page + 2))
                .map((pageNo) => (
                  <button
                    key={pageNo}
                    type="button"
                    className={`${styles.pageButton} ${page === pageNo ? styles.pageActive : ""}`}
                    onClick={() => setPage(pageNo)}
                  >
                    {pageNo}
                  </button>
                ))}
              <button
                type="button"
                className={styles.pageButton}
                disabled={page >= data.totalPages}
                onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
              >
                다음
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.sideSection}>
      <h2 className={styles.sideTitle}>{title}</h2>
      {children}
    </section>
  );
}

function FilterButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`${styles.sideItem} ${active ? styles.sideActive : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function RecipeCard({
  recipe,
  scrapped,
  scrapPending,
  onScrap,
}: {
  recipe: SearchRecipe;
  scrapped: boolean;
  scrapPending: boolean;
  onScrap: () => void;
}) {
  const isOfficial = recipe.isApiData === "Y";

  return (
    <article className={`${styles.recipeCard} ${isOfficial ? styles.officialCard : ""}`}>
      <Link href={`/boards/${recipe.boardNo}`} className={styles.recipeLink}>
        <div className={styles.recipeImage}>
          {recipe.imageUrl ? (
            <img src={resolveRecipeImageUrl(recipe.imageUrl)} alt={recipe.boardTitle} />
          ) : (
            <span>CookMate</span>
          )}
        </div>
        <div className={styles.recipeInfo}>
          <h3 className={styles.recipeTitle}>{recipe.boardTitle}</h3>
          <div className={styles.recipeMeta}>
            {recipe.cookTime && <span>{recipe.cookTime}</span>}
            <span>좋아요 {recipe.likesCount}</span>
          </div>
          <div className={styles.recipeTags}>
            {recipe.typeName && <span className={styles.recipeTag}>{recipe.typeName}</span>}
            {isOfficial && <span className={styles.officialTag}>공식</span>}
            {recipe.ai === "Y" && <span className={styles.aiTag}>AI추천</span>}
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={`${styles.bookmark} ${scrapped ? styles.bookmarkActive : ""}`}
        disabled={scrapPending}
        aria-label={scrapped ? "스크랩 취소" : "스크랩"}
        aria-pressed={scrapped}
        onClick={onScrap}
      >
        {scrapped ? "★" : "☆"}
      </button>
    </article>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && "message" in data) {
      return String(data.message);
    }
  }

  return fallback;
}

function resolveRecipeImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return "";

  try {
    const url = new URL(imageUrl);
    if (url.hostname.includes(".s3.") && url.hostname.endsWith("amazonaws.com")) {
      const key = url.pathname.replace(/^\/+/, "");
      return `http://localhost:8081/api/files/images?key=${encodeURIComponent(key)}`;
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
}
