"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import styles from "./BoardWriteForm.module.css";

type Calory = "" | "저칼로리" | "보통" | "고칼로리";

interface IngredientRow {
  id: string;
  ingredientName: string;
  quantity: string;
  unit: string;
}

interface IngredientGroup {
  id: string;
  setName: string;
  ingredients: IngredientRow[];
}

interface CookStepForm {
  id: string;
  cookContent: string;
  imageFile: File | null;
  imagePreview: string;
}

interface UploadResponse {
  fileUrl: string;
}

const CATEGORIES = ["한식", "중식", "일식", "양식", "동남아식", "분식", "디저트", "음료", "기타"];
const DIFFICULTIES = ["초급", "중급", "고급"];
const COOK_TIMES = ["10분 이하", "10~20분", "20~30분", "30~45분", "45~60분", "1시간 이상"];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const createIngredient = (): IngredientRow => ({
  id: newId(),
  ingredientName: "",
  quantity: "",
  unit: "",
});

const createGroup = (setName = ""): IngredientGroup => ({
  id: newId(),
  setName,
  ingredients: [createIngredient(), createIngredient(), createIngredient()],
});

const createStep = (): CookStepForm => ({
  id: newId(),
  cookContent: "",
  imageFile: null,
  imagePreview: "",
});

function extractYoutubeId(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";

  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match?.[1] ?? "";
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data) {
      return String((data as { message: unknown }).message);
    }
  }

  return "레시피 저장에 실패했습니다.";
}

export default function BoardWriteForm() {
  const router = useRouter();
  const { userInfo, isLoggedIn } = useUserInfoActions();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [appliedYoutubeUrl, setAppliedYoutubeUrl] = useState("");
  const [typeName, setTypeName] = useState("");
  const [difficult, setDifficult] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [calory, setCalory] = useState<Calory>("");
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([
    createGroup("주재료"),
    createGroup("양념"),
  ]);
  const [cookSteps, setCookSteps] = useState<CookStepForm[]>([createStep()]);
  const [caution, setCaution] = useState("");
  const [tip, setTip] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const youtubeId = useMemo(() => extractYoutubeId(appliedYoutubeUrl), [appliedYoutubeUrl]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
  };

  const applyYoutubeUrl = () => {
    if (!youtubeUrl.trim()) {
      setAppliedYoutubeUrl("");
      return;
    }

    if (!extractYoutubeId(youtubeUrl)) {
      setMessage("올바른 YouTube URL을 입력해 주세요.");
      return;
    }

    setAppliedYoutubeUrl(youtubeUrl.trim());
    setMessage("");
  };

  const updateGroup = (groupId: string, value: string) => {
    setIngredientGroups((groups) =>
      groups.map((group) => (group.id === groupId ? { ...group, setName: value } : group))
    );
  };

  const addGroup = () => setIngredientGroups((groups) => [...groups, createGroup()]);

  const removeGroup = (groupId: string) => {
    setIngredientGroups((groups) =>
      groups.length === 1 ? groups : groups.filter((group) => group.id !== groupId)
    );
  };

  const updateIngredient = (
    groupId: string,
    ingredientId: string,
    key: keyof Omit<IngredientRow, "id">,
    value: string
  ) => {
    setIngredientGroups((groups) =>
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              ingredients: group.ingredients.map((ingredient) =>
                ingredient.id === ingredientId ? { ...ingredient, [key]: value } : ingredient
              ),
            }
      )
    );
  };

  const addIngredient = (groupId: string) => {
    setIngredientGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? { ...group, ingredients: [...group.ingredients, createIngredient()] }
          : group
      )
    );
  };

  const removeIngredient = (groupId: string, ingredientId: string) => {
    setIngredientGroups((groups) =>
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              ingredients:
                group.ingredients.length === 1
                  ? group.ingredients
                  : group.ingredients.filter((ingredient) => ingredient.id !== ingredientId),
            }
      )
    );
  };

  const updateStepImage = (stepId: string, file: File | null) => {
    setCookSteps((steps) =>
      steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              imageFile: file,
              imagePreview: file ? URL.createObjectURL(file) : "",
            }
          : step
      )
    );
  };

  const uploadImage = async (file: File, dir: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dir", dir);

    const res = await api.post<UploadResponse>("/files/images", formData);
    return res.data.fileUrl;
  };

  const validateForm = () => {
    if (!coverFile) return "대표 사진을 등록해 주세요.";
    if (!boardTitle.trim()) return "레시피 이름을 입력해 주세요.";
    if (!typeName) return "요리 종류를 선택해 주세요.";
    if (!difficult) return "난이도를 선택해 주세요.";
    if (!cookTime) return "요리 시간을 선택해 주세요.";
    if (!calory) return "칼로리 구간을 선택해 주세요.";
    if (
      !ingredientGroups.some((group) =>
        group.ingredients.some((ingredient) => ingredient.ingredientName.trim())
      )
    ) {
      return "재료를 하나 이상 입력해 주세요.";
    }
    if (!cookSteps.some((step) => step.cookContent.trim())) return "요리 순서를 하나 이상 입력해 주세요.";
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    if (!isLoggedIn || !userInfo) {
      setMessage("로그인 후 레시피를 작성할 수 있습니다.");
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);
      setMessage("이미지를 업로드하고 있습니다.");

      const imageUrl = await uploadImage(coverFile as File, "recipes/covers");
      const stepImageUrls = await Promise.all(
        cookSteps.map((step) =>
          step.imageFile ? uploadImage(step.imageFile, "recipes/steps") : Promise.resolve("")
        )
      );

      const payload = {
        userNo: userInfo.userNo,
        nickname: userInfo.nickname,
        boardTitle: boardTitle.trim(),
        introduce: [introduce, caution && `주의점: ${caution}`, tip && `팁: ${tip}`]
          .filter(Boolean)
          .join("\n\n"),
        imageUrl,
        url: appliedYoutubeUrl || youtubeUrl.trim(),
        open: isPublic ? "Y" : "N",
        isApiData: "N",
        typeName,
        difficult,
        cookTime,
        calory,
        ai: "N",
        ingredientSets: ingredientGroups
          .map((group) => ({
            setName: group.setName.trim(),
            ingredients: group.ingredients
              .filter((ingredient) => ingredient.ingredientName.trim())
              .map((ingredient) => ({
                ingredientName: ingredient.ingredientName.trim(),
                quantity: ingredient.quantity.trim(),
                unit: ingredient.unit.trim(),
              })),
          }))
          .filter((group) => group.ingredients.length > 0),
        cookSteps: cookSteps
          .map((step, index) => ({
            step: index + 1,
            cookContent: step.cookContent.trim(),
            cookImage: stepImageUrls[index] ?? "",
          }))
          .filter((step) => step.cookContent),
      };

      setMessage("레시피를 저장하고 있습니다.");
      const res = await api.post("/boards", payload);
      const location = res.headers.location as string | undefined;

      setMessage("레시피가 저장되었습니다.");
      router.push(location?.startsWith("/boards/") ? location : "/boards");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>대표 사진</h1>
          <span className={styles.required}>필수</span>
        </div>

        {coverPreview ? (
          <div className={styles.coverPreviewWrap}>
            <img src={coverPreview} alt="대표 사진 미리보기" className={styles.coverPreview} />
            <button type="button" className={styles.removeFloating} onClick={removeCover}>
              ×
            </button>
          </div>
        ) : (
          <label className={styles.coverUpload}>
            <input type="file" accept="image/*" onChange={handleCoverChange} />
            <span className={styles.uploadIcon}>+</span>
            <span>클릭하여 대표 사진 업로드</span>
          </label>
        )}

        <div className={styles.fieldStack}>
          <label className={styles.field}>
            <span>레시피 이름</span>
            <input
              value={boardTitle}
              onChange={(event) => setBoardTitle(event.target.value)}
              placeholder="예: 무조건 맛있는 김치찌개"
            />
          </label>

          <label className={styles.field}>
            <span>레시피 소개</span>
            <textarea
              value={introduce}
              onChange={(event) => setIntroduce(event.target.value)}
              rows={3}
              placeholder="요리의 맛, 특징, 함께 먹으면 좋은 음식 등을 적어보세요."
            />
          </label>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>동영상</h2>
          <span className={styles.optional}>선택</span>
        </div>

        <div className={styles.videoRow}>
          <input
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="YouTube URL을 입력하세요."
          />
          <button type="button" onClick={applyYoutubeUrl}>
            적용
          </button>
        </div>

        {youtubeId && (
          <button type="button" className={styles.videoPreview} onClick={() => setAppliedYoutubeUrl("")}>
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt="YouTube 썸네일"
              className={styles.videoThumbnail}
            />
            <span className={styles.playButton}>▶</span>
            <span className={styles.videoRemove}>×</span>
          </button>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>요리 정보</h2>
          <span className={styles.required}>필수</span>
        </div>

        <div className={styles.metaGrid}>
          <label className={styles.field}>
            <span>요리 종류</span>
            <select value={typeName} onChange={(event) => setTypeName(event.target.value)}>
              <option value="">선택</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>난이도</span>
            <select value={difficult} onChange={(event) => setDifficult(event.target.value)}>
              <option value="">선택</option>
              {DIFFICULTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>요리 시간</span>
            <select value={cookTime} onChange={(event) => setCookTime(event.target.value)}>
              <option value="">선택</option>
              {COOK_TIMES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.caloryGrid}>
          {(["저칼로리", "보통", "고칼로리"] as Calory[]).map((item) => (
            <label key={item} className={styles.caloryOption}>
              <input
                type="radio"
                name="calory"
                checked={calory === item}
                onChange={() => setCalory(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>재료</h2>
          <span className={styles.required}>필수</span>
        </div>

        <div className={styles.groupList}>
          {ingredientGroups.map((group) => (
            <div className={styles.ingredientGroup} key={group.id}>
              <div className={styles.groupHeader}>
                <input
                  value={group.setName}
                  onChange={(event) => updateGroup(group.id, event.target.value)}
                  placeholder="재료 묶음 이름"
                />
                <button type="button" onClick={() => removeGroup(group.id)}>
                  ×
                </button>
              </div>

              <div className={styles.ingredientHeader}>
                <span>재료명</span>
                <span>수량</span>
                <span>단위</span>
                <span />
              </div>

              {group.ingredients.map((ingredient) => (
                <div className={styles.ingredientRow} key={ingredient.id}>
                  <input
                    value={ingredient.ingredientName}
                    onChange={(event) =>
                      updateIngredient(group.id, ingredient.id, "ingredientName", event.target.value)
                    }
                    placeholder="돼지고기"
                  />
                  <input
                    value={ingredient.quantity}
                    onChange={(event) =>
                      updateIngredient(group.id, ingredient.id, "quantity", event.target.value)
                    }
                    placeholder="200"
                  />
                  <input
                    value={ingredient.unit}
                    onChange={(event) =>
                      updateIngredient(group.id, ingredient.id, "unit", event.target.value)
                    }
                    placeholder="g"
                  />
                  <button type="button" onClick={() => removeIngredient(group.id, ingredient.id)}>
                    ×
                  </button>
                </div>
              ))}

              <button type="button" className={styles.ghostButton} onClick={() => addIngredient(group.id)}>
                + 재료 추가
              </button>
            </div>
          ))}
        </div>

        <button type="button" className={styles.addButton} onClick={addGroup}>
          + 재료 묶음 추가
        </button>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>요리 순서</h2>
          <span className={styles.required}>필수</span>
        </div>

        <div className={styles.stepList}>
          {cookSteps.map((step, index) => (
            <div className={styles.stepCard} key={step.id}>
              <div className={styles.stepHeader}>
                <strong>Step {index + 1}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setCookSteps((steps) =>
                      steps.length === 1 ? steps : steps.filter((item) => item.id !== step.id)
                    )
                  }
                >
                  ×
                </button>
              </div>

              <div className={styles.stepBody}>
                <textarea
                  value={step.cookContent}
                  onChange={(event) =>
                    setCookSteps((steps) =>
                      steps.map((item) =>
                        item.id === step.id ? { ...item, cookContent: event.target.value } : item
                      )
                    )
                  }
                  rows={3}
                  placeholder="재료 손질부터 조리 과정까지 순서대로 적어주세요."
                />

                <label className={`${styles.stepPhoto} ${step.imagePreview ? styles.hasImage : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateStepImage(step.id, event.target.files?.[0] ?? null)}
                  />
                  {step.imagePreview ? (
                    <>
                      <img src={step.imagePreview} alt={`Step ${index + 1} 사진`} />
                      <button type="button" onClick={() => updateStepImage(step.id, null)}>
                        ×
                      </button>
                    </>
                  ) : (
                    <span>+</span>
                  )}
                </label>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className={styles.addButton} onClick={() => setCookSteps((steps) => [...steps, createStep()])}>
          + 요리 순서 추가
        </button>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>주의점 & 팁</h2>
          <span className={styles.optional}>선택</span>
        </div>

        <div className={styles.tipsGrid}>
          <label className={styles.field}>
            <span>주의점</span>
            <textarea
              value={caution}
              onChange={(event) => setCaution(event.target.value)}
              rows={4}
              placeholder="조리 중 주의해야 할 점을 적어주세요."
            />
          </label>
          <label className={styles.field}>
            <span>팁</span>
            <textarea
              value={tip}
              onChange={(event) => setTip(event.target.value)}
              rows={4}
              placeholder="더 맛있게 만드는 요령을 적어주세요."
            />
          </label>
        </div>
      </section>

      <div className={styles.saveBar}>
        <label className={styles.publicToggle}>
          <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
          <span>공개하기</span>
        </label>
        {message && <p className={styles.message}>{message}</p>}
        <button className={styles.saveButton} type="submit" disabled={saving}>
          {saving ? "저장 중" : "저장하기"}
        </button>
      </div>
    </form>
  );
}
