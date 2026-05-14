"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import {
  AI_RECIPE_DRAFT_KEY,
  AI_RECIPE_DRAFTS_KEY,
  AiIngredient,
  AiRecipeDraft,
  createAiRecipeDraft,
  toCaloryTag,
  toCookTimeTag,
} from "../aiRecipeDraft";
import styles from "./recommendDetail.module.css";

const fallbackDraft = createAiRecipeDraft({
  id: "sample",
  title: "사과 · 상추 샐러드",
  ingredients: ["사과", "상추"],
  time: 18,
  calories: 360,
  method: "손질한 재료에 산뜻한 드레싱을 더해 가볍게 버무립니다.",
});

function normalizeDraftImage(draft: AiRecipeDraft) {
  return {
    ...draft,
    imageUrl: draft.imageUrl?.startsWith("data:") ? "/ai-recipe-placeholder.svg" : draft.imageUrl,
  };
}

function readDraft(recipeId?: string) {
  if (typeof window === "undefined") return fallbackDraft;

  try {
    const raw = window.sessionStorage.getItem(AI_RECIPE_DRAFT_KEY);
    const sessionDraft = raw ? (JSON.parse(raw) as AiRecipeDraft) : null;

    if (sessionDraft?.id === recipeId || !recipeId) {
      return normalizeDraftImage(sessionDraft ?? fallbackDraft);
    }

    const rawDrafts = window.localStorage.getItem(AI_RECIPE_DRAFTS_KEY);
    const localDrafts = rawDrafts ? (JSON.parse(rawDrafts) as AiRecipeDraft[]) : [];
    const localDraft = localDrafts.find((draft) => draft.id === recipeId);

    return normalizeDraftImage(localDraft ?? sessionDraft ?? fallbackDraft);
  } catch {
    return fallbackDraft;
  }
}

function hasAllergy(ingredient: AiIngredient) {
  return Boolean(ingredient.allergy);
}

export default function AiRecipeDetailPage() {
  const router = useRouter();
  const params = useParams<{ recipeId?: string }>();
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const recipeId = params.recipeId ? decodeURIComponent(params.recipeId) : undefined;
  const draft = useMemo(() => readDraft(recipeId), [recipeId]);
  const mainIngredients = draft.ingredients.filter((ingredient) => ingredient.group === "주재료");
  const seasoningIngredients = draft.ingredients.filter((ingredient) => ingredient.group === "양념");
  const allergyIngredients = draft.ingredients.filter(hasAllergy);
  const ownedMainCount = mainIngredients.filter((ingredient) => ingredient.owned).length;
  const matchRate = Math.round((ownedMainCount / Math.max(mainIngredients.length, 1)) * 100);
  const introduce = `입력하신 재료(${draft.inputIngredients.join(", ")})를 기반으로 찾은 레시피예요.`;
  const aiTips = draft.cookSteps.map((step) => step.tip).filter(Boolean).join("\n");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const moveWriteForm = () => {
    window.sessionStorage.setItem(AI_RECIPE_DRAFT_KEY, JSON.stringify(draft));
    router.push("/boards/write?from=ai");
  };

  const saveRecipe = async () => {
    if (!isLoggedIn || !userInfo) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("레시피를 저장하고 있습니다.");

      const response = await api.post("/boards", {
        userNo: userInfo.userNo,
        nickname: userInfo.nickname,
        boardTitle: draft.title,
        introduce: [introduce, aiTips && `팁: ${aiTips}`].filter(Boolean).join("\n\n"),
        imageUrl: draft.imageUrl,
        url: "",
        open: "N",
        isApiData: "N",
        typeName: draft.typeName,
        difficult: draft.difficult,
        cookTime: toCookTimeTag(draft.cookTimeMinutes),
        calory: toCaloryTag(draft.calories),
        ai: "Y",
        ingredientSets: ["주재료", "양념"].map((setName) => ({
          setName,
          ingredients: draft.ingredients
            .filter((ingredient) => ingredient.group === setName)
            .map((ingredient) => ({
              ingredientName: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            })),
        })),
        cookSteps: draft.cookSteps.map((step, index) => ({
          step: index + 1,
          cookContent: step.content,
          cookImage: "",
        })),
      });

      const location = response.headers.location as string | undefined;
      setSaveMessage("내 레시피로 저장되었습니다.");
      router.push(location?.startsWith("/boards/") ? location : "/boards");
    } catch (error) {
      console.error("AI 추천 레시피 저장 실패:", error);
      setSaveMessage("레시피 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/ai">재료로 찾는 레시피</Link>
        <span>›</span>
        <strong>{draft.title}</strong>
      </div>

      <section className={styles.hero}>
        <img src={draft.imageUrl} alt={draft.title} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroTop}>
          <button type="button" onClick={() => router.back()}>
            ← 추천 결과로
          </button>
          <span>저장 후 수정 · 공유 · 장보기 가능</span>
        </div>
        <div className={styles.heroBottom}>
          <span>AI 추천 레시피</span>
          <strong>입력 재료 매칭률 {matchRate}%</strong>
        </div>
      </section>

      <div className={styles.content}>
        <div className={styles.layout}>
          <article className={styles.main}>
            <h1 className={styles.title}>{draft.title}</h1>

            <div className={styles.infoBanner}>
              <strong>{introduce}</strong>
              <span>아직 저장되지 않은 추천 결과입니다. 마음에 들면 내 레시피로 저장해보세요.</span>
            </div>

            {allergyIngredients.length > 0 && (
              <div className={styles.allergyAlert}>
                이 레시피에 <strong>{allergyIngredients.map((item) => item.name).join(", ")}</strong>가 포함되어 있어요.
                프로필에 등록된 알레르기 재료를 확인해주세요.
              </div>
            )}

            <div className={styles.stats}>
              <Meta label="조리시간" value={`${draft.cookTimeMinutes}`} unit="분" />
              <Meta label="칼로리" value={`${draft.calories}`} unit="kcal" />
              <Meta label="난이도" value={draft.difficult} />
              <Meta label="요리 종류" value={draft.typeName} />
            </div>

            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2>재료</h2>
              </div>
              <div className={styles.ingredientColumns}>
                <IngredientGroup title="주재료" ingredients={mainIngredients} />
                <IngredientGroup title="양념" ingredients={seasoningIngredients} />
              </div>
              <div className={styles.legend}>
                <span className={styles.have}>보유</span>
                <span className={styles.need}>필요</span>
                <span className={styles.allergy}>알레르기</span>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2>조리 방법</h2>
              </div>
              <div className={styles.steps}>
                {draft.cookSteps.map((step, index) => (
                  <div className={styles.step} key={`${step.content}-${index}`}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <div>
                      <p>{step.content}</p>
                      {step.tip && <div className={styles.stepTip}>{step.tip}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className={styles.aside}>
            <section className={styles.asideCard}>
              <h2>이 레시피 저장하기</h2>
              <div className={styles.saveInfo}>
                <strong>저장하면 할 수 있어요</strong>
                스크랩 · 장보기 추가 · 공유하기 · 리뷰 작성
              </div>
              <button type="button" className={styles.saveButton} onClick={saveRecipe} disabled={saving}>
                {saving ? "저장 중" : "내 레시피로 저장"}
              </button>
              <button type="button" className={styles.outlineButton} onClick={moveWriteForm}>
                레시피 작성 폼으로 수정하기
              </button>
              {saveMessage && <p className={styles.saveMessage}>{saveMessage}</p>}
              <p className={styles.saveNote}>
                작성 폼으로 이동하면 제목, 소개, 요리 정보, 재료, 조리 순서가 자동으로 입력됩니다.
              </p>
            </section>

            <section className={styles.asideCard}>
              <div className={styles.matchHead}>
                <h2>재료 매칭률</h2>
                <strong>{matchRate}%</strong>
              </div>
              {mainIngredients.map((ingredient) => (
                <div className={styles.matchItem} key={`${ingredient.group}-${ingredient.name}`}>
                  <div>
                    <span>{ingredient.name}</span>
                    <em>{ingredient.owned ? "보유" : "필요"}</em>
                  </div>
                  <div className={styles.matchBar}>
                    <span style={{ width: ingredient.owned ? "100%" : "0%" }} />
                  </div>
                </div>
              ))}
            </section>

            <section className={styles.asideCard}>
              <h2>비슷한 실제 레시피</h2>
              <button type="button" className={styles.relatedCard}>
                <span>등록 레시피</span>
                <strong>{draft.relatedRecipe.title}</strong>
                <em>{draft.relatedRecipe.meta}</em>
                <b>레시피 상세 보기 →</b>
              </button>
              <p className={styles.relatedNote}>DB의 BOARD에서 이름 유사도가 높은 레시피를 연결할 예정입니다.</p>
            </section>

          </aside>
        </div>
      </div>

      <div className={styles.mobileBar}>
        <button type="button" onClick={() => router.back()}>
          ← 결과로
        </button>
        <button type="button" onClick={saveRecipe} disabled={saving}>
          {saving ? "저장 중" : "내 레시피로 저장"}
        </button>
      </div>
    </main>
  );
}

function Meta({ label, value, unit = "" }: { label: string; value: string; unit?: string }) {
  return (
    <div className={styles.meta}>
      <span>{label}</span>
      <strong>
        {value}
        {unit && <em>{unit}</em>}
      </strong>
    </div>
  );
}

function IngredientGroup({ title, ingredients }: { title: string; ingredients: AiIngredient[] }) {
  return (
    <div className={styles.ingredientGroup}>
      <h3>{title}</h3>
      {ingredients.map((ingredient) => (
        <div className={styles.ingredientRow} key={`${title}-${ingredient.name}`}>
          <div className={styles.ingredientName}>
            {ingredient.allergy && <span className={styles.warningMark}>!</span>}
            <span>{ingredient.name}</span>
          </div>
          <div className={styles.ingredientRight}>
            {ingredient.allergy && <span className={styles.allergy}>알레르기</span>}
            <span className={ingredient.owned ? styles.have : styles.need}>{ingredient.owned ? "보유" : "필요"}</span>
            <em>{[ingredient.quantity, ingredient.unit].filter(Boolean).join(" ")}</em>
          </div>
        </div>
      ))}
    </div>
  );
}
