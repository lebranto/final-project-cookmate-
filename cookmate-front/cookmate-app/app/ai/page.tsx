"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AI_RECIPE_DRAFT_KEY, AI_RECIPE_DRAFTS_KEY, createAiRecipeDraft } from "./aiRecipeDraft";
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

const RECIPE_STYLES = [
  { name: "샐러드", method: "손질한 재료에 산뜻한 드레싱을 더해 가볍게 버무립니다.", time: 12, calories: 230 },
  { name: "브런치 볼", method: "재료를 한입 크기로 썰어 곡물 토핑과 함께 담아냅니다.", time: 18, calories: 360 },
  { name: "오픈 토스트", method: "구운 빵 위에 재료를 올리고 짭짤한 소스로 균형을 맞춥니다.", time: 25, calories: 430 },
  { name: "가벼운 무침", method: "얇게 썬 재료를 양념에 잠깐 재워 식감을 살립니다.", time: 20, calories: 280 },
  { name: "따뜻한 볶음", method: "센 불에 빠르게 볶아 단맛과 향을 살린 뒤 마무리합니다.", time: 34, calories: 520 },
  { name: "든든한 플레이트", method: "단백질과 곁들임을 더해 한 끼 식사처럼 구성합니다.", time: 45, calories: 650 },
] as const;

function buildCombinations(items: string[]) {
  const combinations: string[][] = [];

  for (let size = 1; size <= items.length; size += 1) {
    const pick = (start: number, selected: string[]) => {
      if (selected.length === size) {
        combinations.push(selected);
        return;
      }

      for (let index = start; index < items.length; index += 1) {
        pick(index + 1, [...selected, items[index]]);
      }
    };

    pick(0, []);
  }

  return combinations;
}

function makeRecipes(ingredients: string[], timeFilter: string, calorieFilter: string) {
  const uniqueIngredients = Array.from(new Set(ingredients.map((item) => item.trim()).filter(Boolean)));
  const combinations = uniqueIngredients.length > 0 ? buildCombinations(uniqueIngredients) : [];
  const timeLimit = timeFilter === "all" ? Infinity : Number(timeFilter);

  return combinations
    .flatMap((combination, index) => {
      const style = RECIPE_STYLES[index % RECIPE_STYLES.length];
      const time = style.time + Math.max(combination.length - 1, 0) * 4;
      const calories = style.calories + Math.max(combination.length - 1, 0) * 55;

      return {
        id: `${combination.join("-")}-${style.name}`,
        title: `${combination.join(" · ")} ${style.name}`,
        ingredients: combination,
        time,
        calories,
        description: `${combination.join(", ")} 조합으로 만들 수 있는 ${style.name} 레시피입니다.`,
        method: style.method,
      };
    })
    .filter((recipe) => {
      const matchesCalories =
        calorieFilter === "all"
          ? true
          : calorieFilter === "over700"
            ? recipe.calories > 700
            : recipe.calories <= Number(calorieFilter);

      return recipe.time <= timeLimit && matchesCalories;
    })
    .slice(0, 6);
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

  const visibleRecipes = useMemo(() => (showAll ? recipes : recipes.slice(0, 3)), [recipes, showAll]);

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

  const searchRecipes = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextRecipes = makeRecipes(ingredients, timeFilter, calorieFilter);
    const nextDrafts = nextRecipes.map((recipe) => createAiRecipeDraft(recipe));

    window.localStorage.setItem(AI_RECIPE_DRAFTS_KEY, JSON.stringify(nextDrafts));
    setRecipes(nextRecipes);
    setSearched(true);
    setShowAll(false);
    setLoadingMore(false);
  };

  const loadMoreRecipes = () => {
    setLoadingMore(true);

    window.setTimeout(() => {
      setShowAll(true);
      setLoadingMore(false);
    }, 2000);
  };

  const openRecipeDetail = (recipe: Recipe) => {
    const draft = createAiRecipeDraft(recipe);
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
              <p>가지고 있는 재료를 모두 추가할수록 조합이 더 다양해집니다.</p>
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

            {!searched && (
              <div className={styles.emptyState}>
                <strong>아직 검색 전입니다.</strong>
                <p>재료를 추가하고 레시피 찾기를 눌러주세요.</p>
              </div>
            )}

            {searched && recipes.length === 0 && (
              <div className={styles.emptyState}>
                <strong>조건에 맞는 레시피가 없습니다.</strong>
                <p>조리 시간이나 칼로리 조건을 조금 넓혀보세요.</p>
              </div>
            )}

            {visibleRecipes.length > 0 && (
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
