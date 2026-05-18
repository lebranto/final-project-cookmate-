"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import UserAvatar from "@/app/components/UserAvatar";
import styles from "./page.module.css";

interface MainRecipe {
  boardNo: number;
  boardTitle: string;
  introduce: string;
  imageUrl: string;
  likesCount: number;
  nickname: string;
  typeName: string;
  difficult: string;
  cookTime: string;
  calory: string;
}

interface SearchResponse {
  list: MainRecipe[];
}

interface MainChef {
  userNo: number;
  nickname: string;
  userEmail: string;
  recipeCount: number;
  scrapCount: number;
  followerCount: number;
  profileImageUrl?: string;
}

const categories = [
  {
    name: "한식",
    category: "한식",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80",
  },
  {
    name: "양식",
    category: "양식",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80",
    wide: true,
  },
  {
    name: "일식",
    category: "일식",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&q=80",
  },
  {
    name: "샐러드",
    category: "샐러드",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
  },
  {
    name: "수프",
    category: "수프",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80",
  },
  {
    name: "브런치",
    category: "",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80",
  },
  {
    name: "디저트 · 베이킹",
    category: "디저트",
    image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80",
    wide: true,
  },
];

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [latestRecipes, setLatestRecipes] = useState<MainRecipe[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [featuredRecipe, setFeaturedRecipe] = useState<MainRecipe | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [weeklyPopularRecipes, setWeeklyPopularRecipes] = useState<MainRecipe[]>([]);
  const [weeklyPopularLoading, setWeeklyPopularLoading] = useState(true);
  const [chefs, setChefs] = useState<MainChef[]>([]);
  const [chefsLoading, setChefsLoading] = useState(true);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();

    router.push(trimmed ? `/boards?keyword=${encodeURIComponent(trimmed)}` : "/boards");
  };

  useEffect(() => {
    const fetchLatestRecipes = async () => {
      try {
        setLatestLoading(true);
        const res = await api.get<SearchResponse>("/boards/search", {
          params: {
            source: "user",
            sort: "latest",
            page: 1,
            size: 4,
          },
        });

        setLatestRecipes(res.data.list ?? []);
      } catch (error) {
        console.error("새로 올라온 레시피 조회 실패:", error);
        setLatestRecipes([]);
      } finally {
        setLatestLoading(false);
      }
    };

    void fetchLatestRecipes();
  }, []);

  useEffect(() => {
    const fetchFeaturedRecipe = async () => {
      try {
        setFeaturedLoading(true);
        const res = await api.get<SearchResponse>("/boards/search", {
          params: {
            source: "user",
            sort: "likes",
            page: 1,
            size: 1,
          },
        });

        setFeaturedRecipe(res.data.list?.[0] ?? null);
      } catch (error) {
        console.error("이달의 추천 레시피 조회 실패:", error);
        setFeaturedRecipe(null);
      } finally {
        setFeaturedLoading(false);
      }
    };

    void fetchFeaturedRecipe();
  }, []);

  useEffect(() => {
    const fetchWeeklyPopularRecipes = async () => {
      try {
        setWeeklyPopularLoading(true);
        const res = await api.get<SearchResponse>("/boards/weekly-popular", {
          params: { size: 5 },
        });

        setWeeklyPopularRecipes(res.data.list ?? []);
      } catch (error) {
        console.error("이번 주 인기 레시피 조회 실패:", error);
        setWeeklyPopularRecipes([]);
      } finally {
        setWeeklyPopularLoading(false);
      }
    };

    void fetchWeeklyPopularRecipes();
  }, []);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        setChefsLoading(true);
        const res = await api.get<MainChef[]>("/users/chef", {
          params: { filter: "recipe" },
        });

        setChefs((res.data ?? []).slice(0, 3));
      } catch (error) {
        console.error("셰프 데이터 조회 실패:", error);
        setChefs([]);
      } finally {
        setChefsLoading(false);
      }
    };

    void fetchChefs();
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=85"
            alt="따뜻한 주방에서 요리하는 모습"
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroBody}>
          <span className={styles.heroTag}>CookMate Pick</span>
          <h1>오늘 뭐 먹지 고민될 때, CookMate</h1>
          <p>
            집에 있는 재료와 취향에 맞춰 레시피를 찾고, 필요한 재료는 바로 장보기 목록으로
            이어가세요.
          </p>
          <Link href="/boards" className={styles.heroButton}>
            레시피 둘러보기
          </Link>
        </div>
      </section>

      <section className={styles.searchBand} aria-label="레시피 검색">
        <form className={styles.searchBox} onSubmit={handleSearch}>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="어떤 요리가 먹고 싶으세요? 레시피명 또는 재료를 입력하세요"
          />
          <button type="submit">검색</button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.kicker}>카테고리별 레시피</div>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <Link
              href={category.category ? `/boards?category=${encodeURIComponent(category.category)}` : "/boards"}
              className={`${styles.categoryCard} ${category.wide ? styles.categoryWide : ""}`}
              key={category.name}
            >
              <img src={category.image} alt={category.name} />
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>새로 올라온 레시피</h2>
          <Link href="/boards?sort=latest">더보기</Link>
        </div>
        <div className={styles.recipeGrid}>
          {latestLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div className={`${styles.recipeCard} ${styles.recipeSkeleton}`} key={index}>
                  <div className={styles.recipeImage} />
                  <div className={styles.recipeBody}>
                    <span />
                    <h3 />
                    <p />
                  </div>
                </div>
              ))
            : latestRecipes.map((recipe) => (
                <Link href={`/boards/${recipe.boardNo}`} className={styles.recipeCard} key={recipe.boardNo}>
                  <div className={styles.recipeImage}>
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt={recipe.boardTitle} />
                    ) : (
                      <span>CookMate</span>
                    )}
                  </div>
                  <div className={styles.recipeBody}>
                    <div className={styles.recipeTags}>
                      {recipe.typeName && <span>{recipe.typeName}</span>}
                    </div>
                    <h3>{recipe.boardTitle}</h3>
                    <p>{recipe.cookTime ? `${recipe.cookTime} · ` : ""}좋아요 {recipe.likesCount}</p>
                  </div>
                </Link>
              ))}
        </div>
        {!latestLoading && latestRecipes.length === 0 && (
          <div className={styles.recipeEmpty}>새로 올라온 레시피가 없습니다.</div>
        )}
      </section>

      {featuredLoading ? (
        <section className={`${styles.featured} ${styles.featuredSkeleton}`}>
          <div className={styles.featuredImage} />
          <div className={styles.featuredBody}>
            <span />
            <h2 />
            <p />
            <div className={styles.featuredMeta}>
              <strong />
              <strong />
              <strong />
            </div>
          </div>
        </section>
      ) : featuredRecipe ? (
        <section className={styles.featured}>
          <div className={styles.featuredImage}>
            {featuredRecipe.imageUrl ? (
              <img src={featuredRecipe.imageUrl} alt={featuredRecipe.boardTitle} />
            ) : (
              <span>CookMate</span>
            )}
          </div>
          <div className={styles.featuredBody}>
            <span>이달의 추천 레시피</span>
            <h2>{featuredRecipe.boardTitle}</h2>
            <p>{getFeaturedDescription(featuredRecipe)}</p>
            <div className={styles.featuredMeta}>
              {featuredRecipe.cookTime && <strong>{featuredRecipe.cookTime}</strong>}
              {featuredRecipe.difficult && <strong>{featuredRecipe.difficult}</strong>}
              {featuredRecipe.calory && <strong>{formatCaloryValue(featuredRecipe.calory)}</strong>}
              <strong>좋아요 {featuredRecipe.likesCount}</strong>
            </div>
            <Link href={`/boards/${featuredRecipe.boardNo}`} className={styles.primaryButton}>
              레시피 보기
            </Link>
          </div>
        </section>
      ) : (
        <section className={styles.featuredEmpty}>
          이달의 추천으로 보여줄 레시피가 없습니다.
        </section>
      )}

      <section className={styles.steps}>
        <h2>CookMate를 이렇게 활용하세요</h2>
        <p>레시피 검색부터 장보기까지 한 곳에서</p>
        <div className={styles.stepGrid}>
          {["레시피 탐색", "AI 추천 받기", "장보기 목록 생성", "재료 체크"].map((step, index) => (
            <div className={styles.stepItem} key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
              <p>필요한 흐름을 빠르게 이어가는 준비용 화면입니다.</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div>
          <div className={styles.sectionHeader}>
            <h2>이번 주 인기 레시피</h2>
            <Link href="/boards">더보기</Link>
          </div>
          <div className={styles.popularList}>
            {weeklyPopularLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <div className={`${styles.popularItem} ${styles.popularSkeleton}`} key={index}>
                    <span className={styles.rank}>{index + 1}</span>
                    <div className={styles.popularImage} />
                    <div>
                      <span className={styles.popularTag} />
                      <strong />
                      <p />
                    </div>
                  </div>
                ))
              : weeklyPopularRecipes.map((recipe, index) => (
                  <Link href={`/boards/${recipe.boardNo}`} className={styles.popularItem} key={recipe.boardNo}>
                    <span className={styles.rank}>{index + 1}</span>
                    <div className={styles.popularImage}>
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.boardTitle} />
                      ) : (
                        <span>CookMate</span>
                      )}
                    </div>
                    <div>
                      {recipe.typeName && <span className={styles.popularTag}>{recipe.typeName}</span>}
                      <strong>{recipe.boardTitle}</strong>
                      <p>
                        {[recipe.nickname, recipe.cookTime, `좋아요 ${recipe.likesCount}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </Link>
                ))}
          </div>
          {!weeklyPopularLoading && weeklyPopularRecipes.length === 0 && (
            <div className={styles.popularEmpty}>최근 7일 인기 레시피가 없습니다.</div>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.widget}>
            <div className={styles.kicker}>Chef Pick</div>
            {chefsLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div className={`${styles.chefItem} ${styles.chefSkeleton}`} key={index}>
                    <span />
                    <div>
                      <strong />
                      <p />
                    </div>
                  </div>
                ))
              : chefs.map((chef) => (
                  <Link href={`/chef/${chef.userNo}`} className={styles.chefItem} key={chef.userNo}>
                    <div className={styles.chefAvatar}>
                      <UserAvatar
                        imageUrl={chef.profileImageUrl} 
                        name={chef.nickname} 
                        email={chef.userEmail}
                        size="100%"
                      />
                    </div>
                    <div>
                      <strong>{chef.nickname}</strong>
                      <p>
                        레시피 {chef.recipeCount?.toLocaleString() ?? 0}개 · 팔로워{" "}
                        {chef.followerCount?.toLocaleString() ?? 0}
                      </p>
                    </div>
                  </Link>
                ))}
            {!chefsLoading && chefs.length === 0 && (
              <div className={styles.chefEmpty}>보여줄 셰프가 없습니다.</div>
            )}
            <Link href="/chef" className={styles.outlineButton}>
              셰프 전체 보기
            </Link>
          </div>
        </aside>
      </section>

      <section className={styles.aiBanner}>
        <div>
          <span>AI 추천</span>
          <h2>냉장고 재료로 만드는 오늘의 레시피</h2>
          <p>갖고 있는 재료를 입력하면 만들 수 있는 레시피를 추천하는 영역입니다.</p>
        </div>
        <Link href="/find">AI 추천 받으러 가기</Link>
      </section>

    </main>
  );
}

function getFeaturedDescription(recipe: MainRecipe) {
  const trimmed = recipe.introduce?.replace(/\s+/g, " ").trim();
  if (trimmed) return trimmed;

  const meta = [recipe.typeName, recipe.cookTime, recipe.difficult].filter(Boolean).join(" · ");
  return meta
    ? `${meta} 레시피입니다. 많은 사용자가 좋아한 CookMate 추천 레시피를 확인해보세요.`
    : "많은 사용자가 좋아한 CookMate 추천 레시피를 확인해보세요.";
}

function formatCaloryValue(value: string) {
  const ranges: Record<string, string> = {
    저칼로리: "~ 400kcal",
    보통: "400~700kcal",
    고칼로리: "700kcal ~",
  };

  return ranges[value] ? `${value} · ${ranges[value]}` : value;
}
