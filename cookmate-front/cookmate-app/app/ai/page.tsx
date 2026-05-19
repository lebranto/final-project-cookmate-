"use client";

import { FormEvent, useEffect ,useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AI_RECIPE_DRAFT_KEY, AI_RECIPE_DRAFTS_KEY, createAiRecipeDraft } from "./aiRecipeDraft";
import api from "@/app/lib/api";
import styles from "./ai.module.css";

type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  time: number;
  calories: number;
  description: string;
  method: string;
};

const AI_RECIPE_RESULTS_KEY = "cookmate-ai-recipe-results";
const AI_RECIPE_SEARCH_STATE_KEY = "cookmate-ai-recipe-search-state";

const TIME_OPTIONS = [
  { label: "상관없음", value: "all" },
  { label: "15분 이하", value: "15" },
  { label: "30분 이하", value: "30" },
  { label: "1시간 이하", value: "60" },
] as const;

const CALORIE_OPTIONS = [
  { label: "상관없음", value: "all" },
  { label: "400kcal 이하", value: "400" },
  { label: "700kcal 이하", value: "700" },
  { label: "700kcal 초과", value: "over700" },
] as const;

type RecipeSearchState = {
  ingredients: string[];
  timeFilter: (typeof TIME_OPTIONS)[number]["value"];
  calorieFilter: (typeof CALORIE_OPTIONS)[number]["value"];
  recipes: Recipe[];
};

function readStoredDraft(recipeId: string) {
  try {
    const rawDrafts = window.localStorage.getItem(AI_RECIPE_DRAFTS_KEY);
    if (!rawDrafts) {
      return null;
    }

    const drafts = JSON.parse(rawDrafts) as ReturnType<typeof createAiRecipeDraft>[];
    return drafts.find((draft) => draft.id === recipeId) ?? null;
  } catch {
    window.localStorage.removeItem(AI_RECIPE_DRAFTS_KEY);
    return null;
  }
}

export default function AiRecipePage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [timeFilter, setTimeFilter] = useState<(typeof TIME_OPTIONS)[number]["value"]>("all");
  const [calorieFilter, setCalorieFilter] = useState<(typeof CALORIE_OPTIONS)[number]["value"]>("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const visibleRecipes = useMemo(() => (showAll ? recipes : recipes.slice(0, 3)), [recipes, showAll]);

  // 상세 보기 누르고 뒤로 가기 할때 리스트가 없어지는 현상
  useEffect(() => {
  try {
    const rawState = window.localStorage.getItem(AI_RECIPE_SEARCH_STATE_KEY);

    if (rawState) {
      const savedState = JSON.parse(rawState) as RecipeSearchState;
      const savedRecipes = savedState.recipes ?? [];

      setIngredients(savedState.ingredients ?? []);
      setTimeFilter(savedState.timeFilter ?? "all");
      setCalorieFilter(savedState.calorieFilter ?? "all");
      setRecipes(savedRecipes);
      setSearched(savedRecipes.length > 0);
      return;
    }

    const raw = window.localStorage.getItem(AI_RECIPE_RESULTS_KEY);
    if (!raw) return;

    const savedRecipes = JSON.parse(raw) as Recipe[];
    setRecipes(savedRecipes);
    setSearched(savedRecipes.length > 0);
  } catch {
    window.localStorage.removeItem(AI_RECIPE_SEARCH_STATE_KEY);
    window.localStorage.removeItem(AI_RECIPE_RESULTS_KEY);
  }
  }, []);

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

  try {
    setIsSearching(true);

    const response = await api.post("/ai/recipes", {
      ingredients,
      timeFilter,
      calorieFilter,
    });

    const nextRecipes = response.data.recipes as Recipe[];
    const nextDrafts = nextRecipes.map((recipe: Recipe) => createAiRecipeDraft(recipe , ingredients));
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
  } finally {
    setIsSearching(false);
  }
};

  const loadMoreRecipes = () => {
    setLoadingMore(true);

    window.setTimeout(() => {
      setShowAll(true);
      setLoadingMore(false);
    }, 2000);
  };

  const openRecipeDetail = (recipe: Recipe) => {
    const draft = readStoredDraft(recipe.id) ?? createAiRecipeDraft(recipe, ingredients);
    window.sessionStorage.setItem(AI_RECIPE_DRAFT_KEY, JSON.stringify(draft));
    router.push(`/ai/${encodeURIComponent(recipe.id)}`);
  };

  return (
    <main className={styles.page}>
      <section className={styles.inner} aria-label="AI 레시피 추천">
        <div className={styles.header}>
          <span className={styles.eyebrow}>AI Recipe Finder</span>
          <h1>재료로 찾는 AI 레시피</h1>
          <p>냉장고 속 재료를 추가하면 가능한 조합을 나누어 6개의 레시피를 추천합니다.</p>
        </div>

        <div className={styles.layout}>
          <form className={styles.panel} onSubmit={searchRecipes}>
            <div className={styles.panelHeader}>
              <h2>재료를 입력해주세요</h2>
              <p>가지고 있는 재료를 모두 추가할수록 조합이 더 다양해집니다.</p><br/>
              <p className={styles.warning}>주의!</p>
              <p>재료를 입력하실 때 따로 입력하지 않으면 필요한 음식을 정확히 파악할 수 없습니다 </p>
              <p>꼭 낱개로 입력해주세요!</p>
            </div>
            <div className={styles.ingredientBox} aria-label="추가된 재료">
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
                    <span aria-hidden="true">×</span>
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

            <button type="submit" className={styles.submitButton}>
              레시피 찾기
            </button>
          </form>

          <section className={styles.resultsPanel} aria-live="polite">
            <div className={styles.resultsHeader}>
              <h2>추천 레시피</h2>
              {searched && <span>{recipes.length}개 발견</span>}
            </div>

            {isSearching && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} aria-hidden="true" />
                <strong>잠시만 기다려 주세요</strong>
                <p>AI가 입력한 재료로 레시피를 찾고 있습니다.</p>
              </div>
            )}

            {!isSearching && !searched &&(
              <div className={styles.emptyState}>
                <strong>아직 검색 전입니다.</strong>
                <p>재료를 추가하고 레시피 찾기를 눌러주세요.</p>
              </div>
            )}

            {!isSearching && searched && recipes.length === 0 && (
              <div className={styles.emptyState}>
                <strong>조건에 맞는 레시피가 없습니다.</strong>
                <p>조리 시간이나 칼로리 조건을 조금 넓혀보세요.</p>
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
                  >
                    <div className={styles.recipeThumb} aria-hidden="true">
                      {recipe.ingredients.slice(0, 2).map((ingredient) => ingredient[0]).join("")}
                    </div>
                    <div className={styles.recipeBody}>
                      <span className={styles.rank}>Recipe {index + 1}</span>
                      <h3>{recipe.title}</h3>
                      <p>{recipe.description}</p>
                      <div className={styles.recipeMeta}>
                        <span>{recipe.time}분</span>
                        <span>{recipe.calories}kcal</span>
                        <span>{recipe.ingredients.length}개 재료</span>
                      </div>
                      <span className={styles.method}>{recipe.method}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searched && recipes.length > 3 && !showAll && (
              <button type="button" className={styles.moreButton} onClick={loadMoreRecipes} disabled={loadingMore}>
                {loadingMore ? "AI가 추가 레시피를 찾는 중..." : "결과 더보기"}
              </button>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
