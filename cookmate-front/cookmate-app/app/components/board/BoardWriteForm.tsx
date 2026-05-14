"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { uploadImageWithPresignedUrl } from "@/app/lib/imageUpload";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import { Board } from "@/app/type/board";
import styles from "./BoardWriteForm.module.css";

type Calory = "" | "저칼로리" | "보통" | "고칼로리";

interface IngredientRow {
  id: string;
  ingredientNo?: number;
  ingredientName: string;
  quantity: string;
  unit: string;
}

interface IngredientGroup {
  id: string;
  setNo?: number;
  setName: string;
  ingredients: IngredientRow[];
}

interface CookStepForm {
  id: string;
  originalStep?: number;
  cookContent: string;
  cookImage?: string;
  imageFile: File | null;
  imagePreview: string;
}

interface BoardWriteFormProps {
  mode?: "create" | "edit";
  boardNo?: number;
}

interface FormErrors {
  cover?: string;
  boardTitle?: string;
  typeName?: string;
  difficult?: string;
  cookTime?: string;
  calory?: string;
  ingredients?: string;
  cookSteps?: string;
}

const CATEGORIES = ["한식", "중식", "일식", "양식", "셀러드", "디저트"];
const DIFFICULTIES = ["쉬움", "보통", "어려움"];
const COOK_TIMES = ["10분 이하", "10~20분", "20~30분", "30~45분", "45~60분", "1시간 이상"];
const CALORY_OPTIONS: { value: Exclude<Calory, "">; range: string }[] = [
  { value: "저칼로리", range: "~ 400kcal" },
  { value: "보통", range: "400~700kcal" },
  { value: "고칼로리", range: "700kcal ~" },
];

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
  cookImage: "",
  imageFile: null,
  imagePreview: "",
});

const hasErrors = (errors: FormErrors) => Object.values(errors).some(Boolean);

const toImageUrl = (imageUrl?: string | null) => {
  return imageUrl || "";
};

const splitIntroduce = (value?: string | null) => {
  const sections = (value ?? "").split(/\n{2,}/);
  const cautionSection = sections.find((section) => section.startsWith("주의점:"));
  const tipSection = sections.find((section) => section.startsWith("팁:"));

  return {
    introduce: sections
      .filter((section) => !section.startsWith("주의점:") && !section.startsWith("팁:"))
      .join("\n\n"),
    caution: cautionSection?.replace(/^주의점:\s*/, "") ?? "",
    tip: tipSection?.replace(/^팁:\s*/, "") ?? "",
  };
};

const buildIngredientPayload = (
  groups: IngredientGroup[],
  isEditMode: boolean,
  initialSetNos: number[]
) => {
  const currentGroups = groups
    .map((group) => ({
      setNo: isEditMode ? 0 : group.setNo,
      setName: group.setName.trim(),
      new: isEditMode,
      ingredients: group.ingredients
        .filter((ingredient) => ingredient.ingredientName.trim())
        .map((ingredient) => ({
          ingredientNo: isEditMode ? 0 : ingredient.ingredientNo ?? 0,
          ingredientName: ingredient.ingredientName.trim(),
          quantity: ingredient.quantity.trim(),
          unit: ingredient.unit.trim(),
        })),
    }))
    .filter((group) => group.ingredients.length > 0);

  if (!isEditMode) return currentGroups;

  const deletedGroups = initialSetNos
    .map((setNo) => ({
      setNo,
      deleted: true,
      ingredients: [],
    }));

  return [...deletedGroups, ...currentGroups];
};

const buildCookStepPayload = (
  steps: CookStepForm[],
  imageUrls: string[],
  isEditMode: boolean,
  initialStepNumbers: number[]
) => {
  const currentSteps = steps
    .map((step, index) => ({
      step: index + 1,
      cookContent: step.cookContent.trim(),
      cookImage: imageUrls[index] ?? "",
      new: isEditMode,
    }))
    .filter((step) => step.cookContent);

  if (!isEditMode) return currentSteps;

  const deletedSteps = initialStepNumbers
    .map((step) => ({
      step,
      deleted: true,
      cookContent: "",
      cookImage: "",
    }));

  return [...deletedSteps, ...currentSteps];
};

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

export default function BoardWriteForm({ mode = "create", boardNo }: BoardWriteFormProps) {
  const router = useRouter();
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const isEditMode = mode === "edit";

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [appliedYoutubeUrl, setAppliedYoutubeUrl] = useState("");
  const [typeNo, setTypeNo] = useState(0);
  const [typeName, setTypeName] = useState("");
  const [difficult, setDifficult] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [calory, setCalory] = useState<Calory>("");
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([
    createGroup("주재료"),
    createGroup("양념"),
  ]);
  const [initialSetNos, setInitialSetNos] = useState<number[]>([]);
  const [cookSteps, setCookSteps] = useState<CookStepForm[]>([createStep()]);
  const [initialStepNumbers, setInitialStepNumbers] = useState<number[]>([]);
  const [caution, setCaution] = useState("");
  const [tip, setTip] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(isEditMode);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const youtubeId = useMemo(() => extractYoutubeId(appliedYoutubeUrl), [appliedYoutubeUrl]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!isEditMode || !boardNo || !isLoggedIn || !userInfo) return;

    let ignore = false;

    const fetchBoard = async () => {
      try {
        setLoadingInitialData(true);
        const res = await api.get<Board>(`/boards/${boardNo}`);
        const board = res.data;

        if (ignore) return;

        if (board.isApiData === "Y" || board.userNo !== userInfo.userNo) {
          alert("본인이 작성한 레시피만 수정할 수 있습니다.");
          router.replace(`/boards/${boardNo}`);
          return;
        }

        const parsedIntroduce = splitIntroduce(board.introduce);
        setInitialImageUrl(board.imageUrl || "");
        setCoverPreview(toImageUrl(board.imageUrl));
        setBoardTitle(board.boardTitle || "");
        setIntroduce(parsedIntroduce.introduce);
        setYoutubeUrl(board.url || "");
        setAppliedYoutubeUrl(board.url || "");
        setTypeNo(board.typeNo || 0);
        setTypeName(board.typeName || "");
        setDifficult(board.difficult || "");
        setCookTime(board.cookTime || "");
        setCalory((board.calory || "") as Calory);
        setCaution(parsedIntroduce.caution);
        setTip(parsedIntroduce.tip);
        setIsPublic(board.open === "Y");
        setInitialSetNos(board.ingredientSets?.map((group) => group.setNo).filter(Boolean) ?? []);
        setInitialStepNumbers(board.cookSteps?.map((step) => step.step).filter(Boolean) ?? []);
        setIngredientGroups(
          board.ingredientSets?.length
            ? board.ingredientSets.map((group, index) => ({
                id: newId(),
                setNo: group.setNo,
                setName: group.setName || (index === 0 ? "주재료" : ""),
                ingredients: group.ingredients?.length
                  ? group.ingredients.map((ingredient) => ({
                      id: newId(),
                      ingredientNo: ingredient.ingredientNo,
                      ingredientName: ingredient.ingredientName || "",
                      quantity: ingredient.quantity || "",
                      unit: ingredient.unit || "",
                    }))
                  : [createIngredient()],
              }))
            : [createGroup("주재료")]
        );
        setCookSteps(
          board.cookSteps?.length
            ? board.cookSteps.map((step) => ({
                id: newId(),
                originalStep: step.step,
                cookContent: step.cookContent || "",
                cookImage: step.cookImage || "",
                imageFile: null,
                imagePreview: toImageUrl(step.cookImage),
              }))
            : [createStep()]
        );
      } catch (error) {
        setMessage(getErrorMessage(error));
      } finally {
        if (!ignore) setLoadingInitialData(false);
      }
    };

    void fetchBoard();

    return () => {
      ignore = true;
    };
  }, [boardNo, isEditMode, isLoggedIn, router, userInfo]);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setFieldErrors((errors) => ({ ...errors, cover: undefined }));
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
    setFieldErrors((errors) => ({ ...errors, ingredients: undefined }));
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
    key: keyof Omit<IngredientRow, "id" | "ingredientNo">,
    value: string
  ) => {
    setFieldErrors((errors) => ({ ...errors, ingredients: undefined }));
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
              cookImage: file ? "" : "",
              imageFile: file,
              imagePreview: file ? URL.createObjectURL(file) : "",
            }
          : step
      )
    );
  };

  const uploadImage = async (file: File, dir: string) => {
    return uploadImageWithPresignedUrl(file, dir);
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!coverFile && !coverPreview) errors.cover = "대표 사진을 등록해 주세요.";
    if (!boardTitle.trim()) errors.boardTitle = "레시피 이름을 입력해 주세요.";
    if (!typeName) errors.typeName = "요리 종류를 선택해 주세요.";
    if (!difficult) errors.difficult = "난이도를 선택해 주세요.";
    if (!cookTime) errors.cookTime = "요리 시간을 선택해 주세요.";
    if (!calory) errors.calory = "칼로리 구간을 선택해 주세요.";
    if (
      !ingredientGroups.some((group) =>
        group.ingredients.some((ingredient) => ingredient.ingredientName.trim())
      )
    ) {
      errors.ingredients = "재료를 하나 이상 입력해 주세요.";
    }
    if (!cookSteps.some((step) => step.cookContent.trim())) {
      errors.cookSteps = "요리 순서를 하나 이상 입력해 주세요.";
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (hasErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setMessage("필수 입력 항목을 확인해 주세요.");
      return;
    }

    setFieldErrors({});

    if (!isLoggedIn || !userInfo) {
      setMessage(`로그인 후 레시피를 ${isEditMode ? "수정" : "작성"}할 수 있습니다.`);
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);
      setMessage(coverFile ? "이미지를 업로드하고 있습니다." : "레시피를 저장하고 있습니다.");

      const imageUrl = coverFile ? await uploadImage(coverFile, "recipes/covers") : initialImageUrl;
      const stepImageUrls = await Promise.all(
        cookSteps.map((step) =>
          step.imageFile
            ? uploadImage(step.imageFile, "recipes/steps")
            : Promise.resolve(step.cookImage || "")
        )
      );

      const payload = {
        userNo: userInfo.userNo,
        nickname: userInfo.nickname,
        typeNo: isEditMode ? typeNo : undefined,
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
        ingredientSets: buildIngredientPayload(ingredientGroups, isEditMode, initialSetNos),
        cookSteps: buildCookStepPayload(cookSteps, stepImageUrls, isEditMode, initialStepNumbers),
      };

      setMessage("레시피를 저장하고 있습니다.");
      const res = isEditMode && boardNo
        ? await api.put(`/boards/${boardNo}`, payload)
        : await api.post("/boards", payload);
      const location = res.headers.location as string | undefined;

      setMessage(isEditMode ? "레시피가 수정되었습니다." : "레시피가 저장되었습니다.");
      router.push(isEditMode && boardNo ? `/boards/${boardNo}` : location?.startsWith("/boards/") ? location : "/boards");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitialData) {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          <p className={styles.message}>레시피 정보를 불러오고 있습니다.</p>
        </section>
      </div>
    );
  }

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>대표 사진</h1>
          <span className={styles.required}>필수</span>
        </div>

        {coverPreview ? (
          <div className={`${styles.coverPreviewWrap} ${fieldErrors.cover ? styles.invalidBox : ""}`}>
            <img src={coverPreview} alt="대표 사진 미리보기" className={styles.coverPreview} />
            <button type="button" className={styles.removeFloating} onClick={removeCover}>
              ×
            </button>
          </div>
        ) : (
          <label className={`${styles.coverUpload} ${fieldErrors.cover ? styles.invalidBox : ""}`}>
            <input type="file" accept="image/*" onChange={handleCoverChange} />
            <span className={styles.uploadIcon}>+</span>
            <span>클릭하여 대표 사진 업로드</span>
          </label>
        )}
        {fieldErrors.cover && <p className={styles.fieldError}>{fieldErrors.cover}</p>}

        <div className={styles.fieldStack}>
          <label className={styles.field}>
            <span>레시피 이름</span>
            <input
              className={fieldErrors.boardTitle ? styles.invalidInput : ""}
              value={boardTitle}
              onChange={(event) => {
                setBoardTitle(event.target.value);
                setFieldErrors((errors) => ({ ...errors, boardTitle: undefined }));
              }}
              placeholder="예: 무조건 맛있는 김치찌개"
            />
            {fieldErrors.boardTitle && <small className={styles.fieldError}>{fieldErrors.boardTitle}</small>}
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
            영상 확인
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
            <select
              className={fieldErrors.typeName ? styles.invalidInput : ""}
              value={typeName}
              onChange={(event) => {
                setTypeName(event.target.value);
                setFieldErrors((errors) => ({ ...errors, typeName: undefined }));
              }}
            >
              <option value="">선택</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldErrors.typeName && <small className={styles.fieldError}>{fieldErrors.typeName}</small>}
          </label>

          <label className={styles.field}>
            <span>난이도</span>
            <select
              className={fieldErrors.difficult ? styles.invalidInput : ""}
              value={difficult}
              onChange={(event) => {
                setDifficult(event.target.value);
                setFieldErrors((errors) => ({ ...errors, difficult: undefined }));
              }}
            >
              <option value="">선택</option>
              {DIFFICULTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {fieldErrors.difficult && <small className={styles.fieldError}>{fieldErrors.difficult}</small>}
          </label>

          <label className={styles.field}>
            <span>요리 시간</span>
            <select
              className={fieldErrors.cookTime ? styles.invalidInput : ""}
              value={cookTime}
              onChange={(event) => {
                setCookTime(event.target.value);
                setFieldErrors((errors) => ({ ...errors, cookTime: undefined }));
              }}
            >
              <option value="">선택</option>
              {COOK_TIMES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {fieldErrors.cookTime && <small className={styles.fieldError}>{fieldErrors.cookTime}</small>}
          </label>
        </div>

        <div className={`${styles.caloryGrid} ${fieldErrors.calory ? styles.invalidChoiceGroup : ""}`}>
          {CALORY_OPTIONS.map((item) => (
            <label key={item.value} className={styles.caloryOption}>
              <input
                type="radio"
                name="calory"
                checked={calory === item.value}
                onChange={() => {
                  setCalory(item.value);
                  setFieldErrors((errors) => ({ ...errors, calory: undefined }));
                }}
              />
              <span className={styles.caloryOptionText}>
                <strong className={styles.caloryLabel}>{item.value}</strong>
                <small className={styles.caloryRange}>{item.range}</small>
              </span>
            </label>
          ))}
        </div>
        {fieldErrors.calory && <p className={styles.fieldError}>{fieldErrors.calory}</p>}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>재료</h2>
          <span className={styles.required}>필수</span>
        </div>

        <div className={`${styles.groupList} ${fieldErrors.ingredients ? styles.invalidSection : ""}`}>
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
        {fieldErrors.ingredients && <p className={styles.fieldError}>{fieldErrors.ingredients}</p>}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>요리 순서</h2>
          <span className={styles.required}>필수</span>
        </div>

        <div className={`${styles.stepList} ${fieldErrors.cookSteps ? styles.invalidSection : ""}`}>
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
                  className={fieldErrors.cookSteps ? styles.invalidInput : ""}
                  value={step.cookContent}
                  onChange={(event) =>
                    {
                      setCookSteps((steps) =>
                        steps.map((item) =>
                          item.id === step.id ? { ...item, cookContent: event.target.value } : item
                        )
                      );
                      setFieldErrors((errors) => ({ ...errors, cookSteps: undefined }));
                    }
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
        {fieldErrors.cookSteps && <p className={styles.fieldError}>{fieldErrors.cookSteps}</p>}
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
          {saving ? "저장 중" : isEditMode ? "수정하기" : "저장하기"}
        </button>
      </div>
    </form>
  );
}
