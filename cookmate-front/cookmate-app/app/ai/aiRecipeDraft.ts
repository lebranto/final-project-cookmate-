export type AiIngredient = {
  name: string;
  quantity: string;
  unit: string;
  group: "주재료" | "양념";
  owned: boolean;
  allergy?: boolean;
};

export type AiCookStep = {
  content: string;
  tip?: string;
};

export type AiRecipeDraft = {
  id: string;
  title: string;
  imageUrl: string;
  inputIngredients: string[];
  usedIngredients: string[];
  cookTimeMinutes: number;
  calories: number;
  difficult: "쉬움" | "보통" | "어려움";
  typeName: "한식" | "중식" | "일식" | "양식" | "샐러드" | "수프" | "디저트";
  ingredients: AiIngredient[];
  cookSteps: AiCookStep[];
  relatedRecipe: {
    title: string;
    meta: string;
  };
};

export const AI_RECIPE_DRAFT_KEY = "cookmate-ai-recipe-draft";
export const AI_RECIPE_DRAFTS_KEY = "cookmate-ai-recipe-drafts";

export function toCookTimeTag(minutes: number) {
  if (minutes <= 15) return "15분 이내";
  if (minutes <= 30) return "30분 이내";
  return "1시간 이내";
}

export function toCaloryTag(calories: number) {
  if (calories <= 400) return "저칼로리";
  if (calories <= 700) return "보통";
  return "고칼로리";
}

export function createAiRecipeImage(title: string, seed: string) {
  void title;
  void seed;
  return "/ai-recipe-placeholder.svg";
}

export function createAiRecipeDraft(
 recipe: {
    id: string;
    title: string;
    ingredients: string[];
    time: number;
    calories: number;
    method: string;
  },
  inputIngredients: string[] = recipe.ingredients
  ): AiRecipeDraft {
  const seasonings = [
    { name: "올리브오일", quantity: "1", unit: "큰술" },
    { name: "소금", quantity: "1", unit: "꼬집" },
    { name: "후추", quantity: "약간", unit: "" },
    { name: "다진 마늘", quantity: "1", unit: "작은술" },
  ];
  const category = recipe.title.includes("샐러드") ? "샐러드" : recipe.title.includes("수프") ? "수프" : "한식";
  const difficult = recipe.time <= 20 ? "쉬움" : recipe.time <= 35 ? "보통" : "어려움";
  const mainIngredients = recipe.ingredients.map((ingredient, index) => ({
    name: ingredient,
    quantity: index === 0 ? "1" : "1/2",
    unit: index === 0 ? "개" : "개",
    group: "주재료" as const,
    owned: inputIngredients.some(
    (input) =>
      input.replace(/\s/g, "").toLowerCase() ===
      ingredient.replace(/\s/g, "").toLowerCase()
    ),
    allergy: false,
  }));

  return {
    id: recipe.id,
    title: recipe.title,
    imageUrl: createAiRecipeImage(recipe.title, recipe.id),
    inputIngredients,
    usedIngredients: recipe.ingredients,
    cookTimeMinutes: recipe.time,
    calories: recipe.calories,
    difficult,
    typeName: category,
    ingredients: [
      ...mainIngredients,
      { name: "양파", quantity: "1/4", unit: "개", group: "주재료", owned: false },
      ...seasonings.map((seasoning) => ({
        ...seasoning,
        group: "양념" as const,
        owned: recipe.ingredients.includes(seasoning.name),
      })),
    ],
    cookSteps: [
      { content: "재료를 흐르는 물에 씻고 먹기 좋은 크기로 손질합니다." },
      { content: recipe.method, tip: "재료의 식감을 살리려면 너무 오래 익히지 않는 것이 좋아요." },
      { content: "간을 확인한 뒤 부족하면 소금과 후추로 마무리합니다." },
      { content: "접시에 담고 남은 재료를 곁들여 완성합니다.", tip: "따뜻한 음식은 바로 담아내면 향이 더 살아납니다." },
    ],
    relatedRecipe: {
      title: `${recipe.ingredients[0] ?? "AI"} 활용 인기 레시피`,
      meta: `${toCookTimeTag(recipe.time)} · ${toCaloryTag(recipe.calories)} · 유사도 높음`,
    },
  };
}
