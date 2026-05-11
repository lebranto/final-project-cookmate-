"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import { Board, Ingredient } from "@/app/type/board";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import styles from "./BoardDetail.module.css";

interface Props {
  boardNo: number;
}

export default function BoardDetail({ boardNo }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const loadingRef = useRef(loading);
  const didInitialLoadRef = useRef(false);
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const router = useRouter();

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get(`/boards/${boardNo}`);
      setBoard(res.data);
    } catch (error) {
      console.error("레시피 조회 실패:", error);
      setErrorMessage(getErrorMessage(error, "레시피를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [boardNo]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      didInitialLoadRef.current = true;
    }
  }, [loading]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBoard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchBoard]);

  useEffect(() => {
    const reloadOnBackForwardRestore = (event: PageTransitionEvent) => {
      if (event.persisted || (didInitialLoadRef.current && loadingRef.current)) {
        window.location.reload();
      }
    };

    const refreshOnVisible = () => {
      if (didInitialLoadRef.current && loadingRef.current) {
        window.location.reload();
        return;
      }

      if (document.visibilityState === "visible") {
        void fetchBoard();
      }
    };

    const reloadOnHistoryMove = () => {
      window.setTimeout(() => {
        if (didInitialLoadRef.current && loadingRef.current) {
          window.location.reload();
        }
      }, 100);
    };

    window.addEventListener("pageshow", reloadOnBackForwardRestore);
    window.addEventListener("focus", fetchBoard);
    window.addEventListener("popstate", reloadOnHistoryMove);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      window.removeEventListener("pageshow", reloadOnBackForwardRestore);
      window.removeEventListener("focus", fetchBoard);
      window.removeEventListener("popstate", reloadOnHistoryMove);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [fetchBoard]);

  useEffect(() => {
    if (!loading) return;

    const reloadKey = `board-detail-reloaded-${boardNo}`;
    const timer = window.setTimeout(() => {
      const lastReloadedAt = Number(sessionStorage.getItem(reloadKey) ?? 0);
      const canReload = Date.now() - lastReloadedAt > 5000;
      if (!canReload) return;

      sessionStorage.setItem(reloadKey, String(Date.now()));
      window.location.reload();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [boardNo, loading]);

  useEffect(() => {
    if (!loading && board) {
      sessionStorage.removeItem(`board-detail-reloaded-${boardNo}`);
    }
  }, [board, boardNo, loading]);

  const ingredients = useMemo(
    () =>
      board?.ingredientSets?.flatMap((set) =>
        set.ingredients.map((ingredient) => ({
          ...ingredient,
          groupName: set.setName || "재료",
        }))
      ) ?? [],
    [board]
  );

  const checkedItems = useMemo(
    () =>
      ingredients.filter((ingredient) =>
        checkedIngredients.has(ingredient.ingredientNo)
      ),
    [checkedIngredients, ingredients]
  );

  const isOwner = isLoggedIn && userInfo?.userNo === board?.userNo;
  const isOfficialPost = board?.isApiData === "Y" || board?.userNo === 0;
  const canFollowAuthor = isLoggedIn && !isOwner && !isOfficialPost;

  const toggleIngredient = (ingredientNo: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientNo)) {
        next.delete(ingredientNo);
      } else {
        next.add(ingredientNo);
      }
      return next;
    });
  };

  const handleLikes = async () => {
    if (!isLoggedIn || !userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await api.post(
        `/boards/${boardNo}/likes?userNo=${userInfo.userNo}`
      );
      alert(res.data);
      await fetchBoard();
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert(getErrorMessage(error, "좋아요 처리에 실패했습니다."));
    }
  };

  const handleScrap = async () => {
    if (!isLoggedIn || !userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await api.post(
        `/boards/${boardNo}/scrap?userNo=${userInfo.userNo}`
      );
      alert(res.data);
    } catch (error) {
      console.error("스크랩 처리 실패:", error);
      alert(getErrorMessage(error, "스크랩 처리에 실패했습니다."));
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/boards/${boardNo}`);
      alert("삭제되었습니다.");
      router.push("/boards");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(getErrorMessage(error, "삭제에 실패했습니다."));
    }
  };

  const handleAddCart = () => {
    if (checkedItems.length === 0) {
      alert("추가할 재료를 선택해주세요.");
      return;
    }

    alert(`${checkedItems.length}개 재료가 장보기 목록에 추가되었습니다.`);
    setCheckedIngredients(new Set());
  };

  if (loading && !board) {
    return (
      <div className={styles.stateBox}>
        <span>로딩 중...</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={styles.stateBox}>
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (!board) {
    return (
      <div className={styles.stateBox}>
        <span>레시피를 찾을 수 없습니다.</span>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.contentWrap}>
          <Link href="/boards" className={styles.backButton}>
            목록으로 돌아가기
          </Link>

          <section className={styles.hero} aria-label="대표 이미지">
            {board.imageUrl ? (
              <img
                src={board.imageUrl}
                alt={board.boardTitle}
                className={styles.heroImage}
              />
            ) : (
              <div className={styles.heroFallback}>CookMate</div>
            )}
            {board.open === "Y" && (
              <span className={styles.heroBadge}>공개</span>
            )}
          </section>

          <section className={styles.reactionBar}>
            <button
              type="button"
              onClick={handleScrap}
              className={styles.reactionButton}
            >
              <span>스크랩</span>
            </button>
            <span className={styles.reactionDivider} aria-hidden="true" />
            <a href="#comments-section" className={styles.reactionButton}>
              <span>댓글</span>
            </a>
            <span className={styles.reactionDivider} aria-hidden="true" />
            <button
              type="button"
              onClick={handleLikes}
              className={styles.reactionButton}
            >
              <span>좋아요</span>
              <strong>{board.likesCount}</strong>
            </button>
          </section>

          {isOwner && (
            <div className={styles.ownerActions}>
              <button
                type="button"
                onClick={() => router.push(`/boards/${boardNo}/edit`)}
                className={styles.editButton}
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={styles.deleteButton}
              >
                삭제
              </button>
            </div>
          )}

          <section className={styles.headerCard}>
            <h1 className={styles.title}>{board.boardTitle}</h1>

            <div className={styles.authorRow}>
              <div className={styles.authorLink}>
                <Avatar
                  imageUrl={board.profileImageUrl}
                  name={board.nickname}
                  size="large"
                />
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{board.nickname}</span>
                  <span className={styles.authorSub}>
                    레시피 {board.recipeCount ?? 5} · 팔로워{" "}
                    {board.followerCount ?? 128}
                  </span>
                </div>
              </div>

              {canFollowAuthor && (
                <button type="button" className={styles.followButton}>
                  팔로우
                </button>
              )}

              <span className={styles.dateText}>
                {board.boardPostdate || "2025년 4월 10일"}
              </span>
            </div>

            {board.introduce && (
              <p className={styles.description}>{board.introduce}</p>
            )}

            <div className={styles.metaPills}>
              <MetaPill label="종류" value={board.typeName} />
              <MetaPill label="난이도" value={board.difficult} />
              <MetaPill label="조리시간" value={board.cookTime} />
              <MetaPill label="칼로리" value={board.calory} />
            </div>
          </section>

          {board.url && (
            <section className={styles.sectionCard}>
              <SectionTitle title="동영상" />
              <a
                href={board.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoLink}
              >
                영상 보러가기
              </a>
            </section>
          )}

          <section className={styles.sectionCard}>
            <SectionTitle
              title="재료"
              aside={`${checkedItems.length}개 선택`}
              action={
                <button
                  type="button"
                  onClick={handleAddCart}
                  className={styles.cartButton}
                >
                  장보기 추가
                </button>
              }
            />

            <div className={styles.ingredientColumns}>
              {board.ingredientSets?.map((set) => (
                <div key={set.setNo} className={styles.ingredientGroup}>
                  <div className={styles.groupTitle}>
                    {set.setName || "재료"}
                  </div>
                  {set.ingredients?.map((ingredient) => (
                    <IngredientRow
                      key={ingredient.ingredientNo}
                      ingredient={ingredient}
                      checked={checkedIngredients.has(
                        ingredient.ingredientNo
                      )}
                      onToggle={toggleIngredient}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sectionCard}>
            <SectionTitle title="요리 순서" />
            <ol className={styles.stepList}>
              {board.cookSteps?.map((step, index) => (
                <li key={step.step} className={styles.stepItem}>
                  <span className={styles.stepNumber}>{step.step}</span>
                  <div className={styles.stepContent}>
                    <p className={styles.stepText}>{step.cookContent}</p>
                    {step.cookImage && (
                      <img
                        src={step.cookImage}
                        alt={`조리 순서 ${step.step}`}
                        className={styles.stepImage}
                      />
                    )}
                  </div>
                  {index < board.cookSteps.length - 1 && (
                    <span className={styles.stepDivider} aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.sectionCard} id="comments-section">
            <SectionTitle title="댓글" />
            <CommentForm boardNo={boardNo} onSuccess={fetchBoard} />
            <CommentList boardNo={boardNo} currentUserNo={userInfo?.userNo} />
          </section>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({
  title,
  aside,
  action,
}: {
  title: string;
  aside?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sectionTitle}>
      <div className={styles.sectionTitleLeft}>
        <span>{title}</span>
        {aside && <em>{aside}</em>}
      </div>
      {action}
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className={styles.metaPill}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}

function IngredientRow({
  ingredient,
  checked,
  onToggle,
}: {
  ingredient: Ingredient;
  checked: boolean;
  onToggle: (ingredientNo: number) => void;
}) {
  const amount = [ingredient.quantity, ingredient.unit].filter(Boolean).join(" ");

  return (
    <label
      className={`${styles.ingredientRow} ${
        checked ? styles.ingredientRowChecked : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(ingredient.ingredientNo)}
        className={styles.ingredientCheck}
      />
      <span className={styles.ingredientName}>{ingredient.ingredientName}</span>
      <span className={styles.ingredientAmount}>{amount}</span>
    </label>
  );
}

function Avatar({
  imageUrl,
  name,
  size = "default",
}: {
  imageUrl?: string;
  name?: string;
  size?: "default" | "large";
}) {
  const initial = name?.trim().charAt(0) || "C";

  return (
    <div
      className={`${styles.avatar} ${
        size === "large" ? styles.avatarLarge : ""
      }`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name || "프로필"} className={styles.avatarImg} />
      ) : (
        <span>{initial}</span>
      )}
    </div>
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
