"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import {
  AI_RECIPE_DRAFT_KEY,
  AI_RECIPE_DRAFTS_KEY,
  LambdaRecipe,
  createAiRecipeDraft,
} from "./aiRecipeDraft";
import styles from "./ai.module.css";

const AI_RECIPE_RESULTS_KEY = "cookmate-ai-recipe-results";
const AI_RECIPE_SEARCH_STATE_KEY = "cookmate-ai-recipe-search-state";

const TIME_OPTIONS = [
  { label: "상관없음", value: "상관없음" },
  { label: "15분 이내", value: "15분 이내" },
  { label: "30분 이내", value: "30분 이내" },
  { label: "1시간 이내", value: "1시간 이내" },
] as const;

const CALORIE_OPTIONS = [
  { label: "상관없음", value: "상관없음" },
  { label: "저칼로리", value: "저칼로리" },
  { label: "보통", value: "보통" },
  { label: "고칼로리", value: "고칼로리" },
] as const;

type RecipeSearchState = {
  ingredients: string[];
  timeFilter: (typeof TIME_OPTIONS)[number]["value"];
  calorieFilter: (typeof CALORIE_OPTIONS)[number]["value"];
  recipes: LambdaRecipe[];
};

type ProfileResponse = {
  allergies?: string[];
};

const EMPTY_SEARCH_STATE: RecipeSearchState = {
  ingredients: [],
  timeFilter: "상관없음",
  calorieFilter: "상관없음",
  recipes: [],
};

function readInitialSearchState(): RecipeSearchState {
  try {
    const rawState = window.localStorage.getItem(AI_RECIPE_SEARCH_STATE_KEY);
    if (rawState) {
      const savedState = JSON.parse(rawState) as RecipeSearchState;
      return {
        ingredients: savedState.ingredients ?? [],
        timeFilter: savedState.timeFilter ?? "상관없음",
        calorieFilter: savedState.calorieFilter ?? "상관없음",
        recipes: savedState.recipes ?? [],
      };
    }

    const rawRecipes = window.localStorage.getItem(AI_RECIPE_RESULTS_KEY);
    if (rawRecipes) {
      return {
        ...EMPTY_SEARCH_STATE,
        recipes: JSON.parse(rawRecipes) as LambdaRecipe[],
      };
    }
  } catch {
    window.localStorage.removeItem(AI_RECIPE_SEARCH_STATE_KEY);
    window.localStorage.removeItem(AI_RECIPE_RESULTS_KEY);
  }

  return EMPTY_SEARCH_STATE;
}

function readStoredDraft(recipeId: string) {
  try {
    const rawDrafts = window.localStorage.getItem(AI_RECIPE_DRAFTS_KEY);
    if (!rawDrafts) return null;

    const drafts = JSON.parse(rawDrafts) as ReturnType<typeof createAiRecipeDraft>[];
    return drafts.find((draft) => draft.id === recipeId) ?? null;
  } catch {
    window.localStorage.removeItem(AI_RECIPE_DRAFTS_KEY);
    return null;
  }
}

async function requestAiRecipes(payload: {
  ingredients: string[];
  allergies: string[];
  timeFilter: string;
  calorieFilter: string;
}) {
  const response = await fetch("/api/ai/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, mode: "list" }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "AI 추천 요청에 실패했습니다.");
  }

  return data as { recipes: LambdaRecipe[] };
}

async function requestAiRecipeDetail(payload: {
  ingredients: string[];
  allergies: string[];
  timeFilter: string;
  calorieFilter: string;
  recipe: LambdaRecipe;
}) {
  const response = await fetch("/api/ai/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, mode: "detail" }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "AI 상세 레시피 생성에 실패했습니다.");
  }

  return data as { recipe: LambdaRecipe };
}

export default function AiRecipePage() {
  const router = useRouter();
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [timeFilter, setTimeFilter] = useState<(typeof TIME_OPTIONS)[number]["value"]>("상관없음");
  const [calorieFilter, setCalorieFilter] = useState<(typeof CALORIE_OPTIONS)[number]["value"]>("상관없음");
  const [recipes, setRecipes] = useState<LambdaRecipe[]>([]);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  const visibleRecipes = useMemo(() => (showAll ? recipes : recipes.slice(0, 3)), [recipes, showAll]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      const savedState = readInitialSearchState();
      setIngredients(savedState.ingredients);
      setTimeFilter(savedState.timeFilter);
      setCalorieFilter(savedState.calorieFilter);
      setRecipes(savedState.recipes);
      setSearched(savedState.recipes.length > 0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !userInfo) {
      return;
    }

    const fetchUserAllergies = async () => {
      try {
        const res = await api.get<ProfileResponse>(`/users/profile/${userInfo.userNo}`);
        setUserAllergies(res.data.allergies ?? []);
      } catch (error) {
        console.error("알레르기 정보 조회 실패:", error);
        setUserAllergies([]);
      }
    };

    void fetchUserAllergies();
  }, [isLoggedIn, userInfo]);

  const addIngredient = () => {
    const nextIngredient = inputValue.trim();

    if (!nextIngredient || ingredients.includes(nextIngredient)) {
      setInputValue("");
      return;
    }

    setIngredients((prev) => [...prev, nextIngredient]);
    setInputValue("");
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients((prev) => prev.filter((item) => item !== ingredient));
  };

  const searchRecipes = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (ingredients.length === 0) {
      setErrorMessage("재료를 하나 이상 입력해 주세요.");
      return;
    }

    try {
      setIsSearching(true);

      const response = await requestAiRecipes({
        ingredients,
        allergies: userAllergies,
        timeFilter,
        calorieFilter,
      });

      const nextRecipes = response.recipes ?? [];
      const nextDrafts = nextRecipes.map((recipe) => createAiRecipeDraft(recipe, ingredients));
      const nextSearchState: RecipeSearchState = {
        ingredients,
        timeFilter,
        calorieFilter,
        recipes: nextRecipes,
      };

      window.localStorage.setItem(AI_RECIPE_RESULTS_KEY, JSON.stringify(nextRecipes));
      window.localStorage.setItem(AI_RECIPE_SEARCH_STATE_KEY, JSON.stringify(nextSearchState));
      window.localStorage.setItem(AI_RECIPE_DRAFTS_KEY, JSON.stringify(nextDrafts));
      setRecipes(nextRecipes);
      setSearched(true);
      setShowAll(false);
    } catch (error) {
      console.error("AI 레시피 추천 실패:", error);
      setRecipes([]);
      setSearched(true);
      setErrorMessage(error instanceof Error ? error.message : "AI 추천 요청에 실패했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreRecipes = () => {
    setLoadingMore(true);

    window.setTimeout(() => {
      setShowAll(true);
      setLoadingMore(false);
    }, 500);
  };

  const openRecipeDetail = async (recipe: LambdaRecipe) => {
    try {
      setLoadingDetailId(recipe.id);
      setErrorMessage("");

      const storedDraft = readStoredDraft(recipe.id);
      const detailRecipe = recipe.detailReady
        ? recipe
        : (await requestAiRecipeDetail({
            ingredients,
            allergies: userAllergies,
            timeFilter,
            calorieFilter,
            recipe,
          })).recipe;
      const draft = storedDraft && recipe.detailReady ? storedDraft : createAiRecipeDraft(detailRecipe, ingredients);

      const nextRecipes = recipes.map((item) => (item.id === recipe.id ? detailRecipe : item));
      const nextDrafts = nextRecipes.map((item) => createAiRecipeDraft(item, ingredients));

      window.localStorage.setItem(AI_RECIPE_RESULTS_KEY, JSON.stringify(nextRecipes));
      window.localStorage.setItem(
        AI_RECIPE_SEARCH_STATE_KEY,
        JSON.stringify({ ingredients, timeFilter, calorieFilter, recipes: nextRecipes })
      );
      window.localStorage.setItem(AI_RECIPE_DRAFTS_KEY, JSON.stringify(nextDrafts));
      window.sessionStorage.setItem(AI_RECIPE_DRAFT_KEY, JSON.stringify(draft));
      setRecipes(nextRecipes);
      router.push(`/ai/${encodeURIComponent(recipe.id)}`);
    } catch (error) {
      console.error("AI 상세 레시피 생성 실패:", error);
      setErrorMessage(error instanceof Error ? error.message : "AI 상세 레시피 생성에 실패했습니다.");
    } finally {
      setLoadingDetailId("");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.inner} aria-label="AI 레시피 추천">
        <div className={styles.header}>
          <span className={styles.eyebrow}>AI Recipe Finder</span>
          <h1>재료로 찾는 AI 레시피</h1>
          <p>가지고 있는 재료와 알레르기 설정을 함께 반영해서 만들 수 있는 레시피를 추천합니다.</p>
        </div>

        <div className={styles.layout}>
          <form className={styles.panel} onSubmit={searchRecipes}>
            <div className={styles.panelHeader}>
              <h2>재료를 입력해주세요</h2>
              <p>따로 입력할수록 AI가 필요한 음식을 더 정확히 파악할 수 있습니다.</p>
              <br />
              <p className={styles.warning}>주의!</p>
              <p>음식이 아닌 단어는 추천 과정에서 제외됩니다. 재료명은 하나씩 입력해주세요.</p>
              <div className={styles.allergyBox}>
                <strong>현재 알레르기 설정</strong>
                {!mounted ? (
                  <p>알레르기 설정을 확인하고 있습니다.</p>
                ) : isLoggedIn ? (
                  userAllergies.length > 0 ? (
                    <div className={styles.allergyList}>
                      {userAllergies.map((allergy) => (
                        <span key={allergy}>{allergy}</span>
                      ))}
                    </div>
                  ) : (
                    <p>설정된 알레르기 재료가 없습니다.</p>
                  )
                ) : (
                  <p>로그인하면 프로필에 저장한 알레르기 재료를 제외하고 추천합니다.</p>
                )}
              </div>
            </div>

            <div className={styles.ingredientBox} aria-label="추가한 재료">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    type="button"
                    className={styles.ingredientPill}
                    onClick={() => removeIngredient(ingredient)}
                    aria-label={`${ingredient} 삭제`}
                  >
                    {ingredient}
                    <span aria-hidden="true">x</span>
                  </button>
                ))
              ) : (
                <span className={styles.placeholder}>재료를 추가해주세요.</span>
              )}
            </div>

            <div className={styles.inputRow}>
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addIngredient();
                  }
                }}
                placeholder="재료명 입력 후 Enter"
              />
              <button type="button" onClick={addIngredient}>
                추가
              </button>
            </div>

            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>조리 시간</span>
              <div className={styles.chips}>
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.chip}${timeFilter === option.value ? ` ${styles.selected}` : ""}`}
                    onClick={() => setTimeFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>칼로리</span>
              <div className={styles.chips}>
                {CALORIE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.chip}${calorieFilter === option.value ? ` ${styles.selected}` : ""}`}
                    onClick={() => setCalorieFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSearching}>
              {isSearching ? "레시피 찾는 중" : "레시피 찾기"}
            </button>
            {errorMessage && <p className={styles.warning}>{errorMessage}</p>}
          </form>

          <section className={styles.resultsPanel} aria-live="polite">
            <div className={styles.resultsHeader}>
              <h2>추천 레시피</h2>
              {searched && <span>{recipes.length}개 발견</span>}
            </div>

            {isSearching && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} aria-hidden="true" />
                <strong>잠시만 기다려 주세요.</strong>
                <p>AI가 입력한 재료와 알레르기 설정을 반영해서 레시피를 찾고 있습니다.</p>
              </div>
            )}

            {!isSearching && !searched && (
              <div className={styles.emptyState}>
                <strong>아직 검색 전입니다.</strong>
                <p>재료를 추가하고 레시피 찾기를 눌러주세요.</p>
              </div>
            )}

            {!isSearching && searched && recipes.length === 0 && (
              <div className={styles.emptyState}>
                <strong>조건에 맞는 레시피가 없습니다.</strong>
                <p>재료를 더 추가하거나 조건을 조금 넓혀보세요.</p>
              </div>
            )}

            {!isSearching && visibleRecipes.length > 0 && (
              <div className={styles.recipeList}>
                {visibleRecipes.map((recipe, index) => (
                  <button
                    key={recipe.id}
                    type="button"
                    className={styles.recipeCard}
                    onClick={() => openRecipeDetail(recipe)}
                    disabled={loadingDetailId === recipe.id}
                  >
                    <div className={styles.recipeThumb} aria-hidden="true">
                      {recipe.ingredients.slice(0, 2).map((ingredient) => ingredient[0]).join("")}
                    </div>
                    <div className={styles.recipeBody}>
                      <span className={styles.rank}>Recipe {index + 1}</span>
                      <h3>{recipe.title}</h3>
                      <p>{recipe.introduce}</p>
                      <div className={styles.recipeMeta}>
                        <span>{recipe.cookTime}</span>
                        <span>{recipe.calory}</span>
                        <span>{recipe.ingredients.length}개 재료</span>
                      </div>
                      <span className={styles.method}>{recipe.cookSteps[0]?.cookContent ?? "상세 조리법 확인하기"}</span>
                      {loadingDetailId === recipe.id && <span className={styles.method}>상세 레시피 생성 중...</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searched && recipes.length > 3 && !showAll && (
              <button type="button" className={styles.moreButton} onClick={loadMoreRecipes} disabled={loadingMore}>
                {loadingMore ? "결과를 펼치는 중..." : "결과 더보기"}
              </button>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
