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

export type LambdaIngredient = {
  ingredientName: string;
  quantity: string;
  unit: string;
};

export type LambdaIngredientSet = {
  setName: string;
  ingredients: LambdaIngredient[];
};

export type LambdaCookStep = {
  step: number;
  cookContent: string;
};

export type LambdaRecipe = {
  id: string;
  title: string;
  introduce: string;
  typeName: "한식" | "중식" | "일식" | "양식" | "샐러드" | "수프" | "디저트";
  difficult: "쉬움" | "보통" | "어려움";
  cookTime: "15분 이내" | "30분 이내" | "1시간 이내";
  calory: "저칼로리" | "보통" | "고칼로리";
  ingredients: string[];
  ingredientSets: LambdaIngredientSet[];
  cookSteps: LambdaCookStep[];
  tip?: string;
  caution?: string;
  detailReady?: boolean;
};

export type AiRecipeDraft = {
  id: string;
  title: string;
  introduce: string;
  imageUrl: string;
  inputIngredients: string[];
  usedIngredients: string[];
  cookTime: LambdaRecipe["cookTime"];
  cookTimeMinutes: number;
  calory: LambdaRecipe["calory"];
  calories: number;
  difficult: LambdaRecipe["difficult"];
  typeName: LambdaRecipe["typeName"];
  ingredients: AiIngredient[];
  cookSteps: AiCookStep[];
  relatedRecipe: {
    title: string;
    meta: string;
  };
};

export const AI_RECIPE_DRAFT_KEY = "cookmate-ai-recipe-draft";
export const AI_RECIPE_DRAFTS_KEY = "cookmate-ai-recipe-drafts";

const DEFAULT_IMAGE = "/ai-recipe-placeholder.svg";

export function toCookTimeMinutes(cookTime: LambdaRecipe["cookTime"]) {
  if (cookTime === "15분 이내") return 15;
  if (cookTime === "30분 이내") return 30;
  return 60;
}

export function toCalories(calory: LambdaRecipe["calory"]) {
  if (calory === "저칼로리") return 400;
  if (calory === "고칼로리") return 701;
  return 550;
}

export function toCookTimeTag(value: number | LambdaRecipe["cookTime"]) {
  if (typeof value === "string") return value;
  if (value <= 15) return "15분 이내";
  if (value <= 30) return "30분 이내";
  return "1시간 이내";
}

export function toCaloryTag(value: number | LambdaRecipe["calory"]) {
  if (typeof value === "string") return value;
  if (value <= 400) return "저칼로리";
  if (value <= 700) return "보통";
  return "고칼로리";
}

export function createAiRecipeImage(title: string, seed: string) {
  void title;
  void seed;
  return DEFAULT_IMAGE;
}

function isSeasoningSet(setName: string) {
  const normalized = setName.replace(/\s/g, "");
  return ["양념", "소스", "조미료"].some((keyword) => normalized.includes(keyword));
}

export function createAiRecipeDraft(recipe: LambdaRecipe, inputIngredients: string[] = recipe.ingredients): AiRecipeDraft {
  const normalizedInputs = inputIngredients.map((item) => item.replace(/\s/g, "").toLowerCase());
  const ingredients = (recipe.ingredientSets.length > 0
    ? recipe.ingredientSets.flatMap((set) => {
    const group: AiIngredient["group"] = isSeasoningSet(set.setName) ? "양념" : "주재료";

    return set.ingredients.map((ingredient) => {
      const normalizedName = ingredient.ingredientName.replace(/\s/g, "").toLowerCase();

      return {
        name: ingredient.ingredientName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        group,
        owned: normalizedInputs.some(
          (input) => input === normalizedName || input.includes(normalizedName) || normalizedName.includes(input)
        ),
        allergy: false,
      };
    });
  })
    : recipe.ingredients.map((ingredient) => ({
        name: ingredient,
        quantity: "",
        unit: "",
        group: "주재료" as const,
        owned: normalizedInputs.some((input) => {
          const normalizedName = ingredient.replace(/\s/g, "").toLowerCase();
          return input === normalizedName || input.includes(normalizedName) || normalizedName.includes(input);
        }),
        allergy: false,
      })));

  const cookSteps: AiCookStep[] = (recipe.cookSteps.length > 0
    ? recipe.cookSteps
    .sort((a, b) => a.step - b.step)
    .map((step) => ({
      content: step.cookContent,
    }))
    : [{ content: "레시피 카드를 선택하면 상세 조리법을 생성합니다." }]);

  const tipParts = [recipe.tip, recipe.caution && `주의: ${recipe.caution}`].filter(Boolean);
  if (tipParts.length > 0 && cookSteps.length > 0) {
    cookSteps[cookSteps.length - 1] = {
      ...cookSteps[cookSteps.length - 1],
      tip: tipParts.join("\n"),
    };
  }

  return {
    id: recipe.id,
    title: recipe.title,
    introduce: recipe.introduce,
    imageUrl: createAiRecipeImage(recipe.title, recipe.id),
    inputIngredients,
    usedIngredients: recipe.ingredients,
    cookTime: recipe.cookTime,
    cookTimeMinutes: toCookTimeMinutes(recipe.cookTime),
    calory: recipe.calory,
    calories: toCalories(recipe.calory),
    difficult: recipe.difficult,
    typeName: recipe.typeName,
    ingredients,
    cookSteps,
    relatedRecipe: {
      title: `${recipe.ingredients[0] ?? "AI"} 활용 레시피`,
      meta: `${recipe.cookTime} · ${recipe.calory} · ${recipe.difficult}`,
    },
  };
}
