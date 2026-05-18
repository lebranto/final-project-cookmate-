"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import { Board } from "@/app/type/board";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import styles from "./BoardDetail.module.css";
import UserAvatar from "@/app/components/UserAvatar";

interface Props {
  boardNo: number;
}

interface ProfileResponse {
  allergies?: string[];
}

const CALORY_RANGES: Record<string, string> = {
  저칼로리: "~ 400kcal",
  보통: "400~700kcal",
  고칼로리: "700kcal ~",
};

export default function BoardDetail({ boardNo }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScrapped, setIsScrapped] = useState(false);
  
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [shoppingAdding, setShoppingAdding] = useState(false);
  const [selectedServingCount, setSelectedServingCount] = useState(1);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const loadingRef = useRef(loading);
  const didInitialLoadRef = useRef(false);
  const servingBoardNoRef = useRef<number | null>(null);
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;
  const router = useRouter();

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get(`/boards/${boardNo}`, {
        params: { loginUserNo: loginUserNo || "" }
      });
      setBoard(res.data);
      
      setIsFollowing(res.data.following || false);
      
      if (servingBoardNoRef.current !== boardNo) {
        setSelectedServingCount(1);
        servingBoardNoRef.current = boardNo;
      }
    } catch (error) {
      console.error("레시피 조회 실패:", error);
      setErrorMessage(getErrorMessage(error, "레시피를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [boardNo, loginUserNo]);

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

  const isOwner = isLoggedIn && userInfo?.userNo === board?.userNo;
  const isOfficialPost = board?.isApiData === "Y" || board?.userNo === 0;
  const canFollowAuthor = isLoggedIn && !isOwner && !isOfficialPost;
  const youtubeVideoId = useMemo(() => getYoutubeVideoId(board?.url), [board?.url]);
  const ingredientScale = selectedServingCount;
  const effectiveAllergies = useMemo(
    () => (isLoggedIn ? userAllergies : []),
    [isLoggedIn, userAllergies]
  );
  
  const allergyMatches = useMemo(
    () => findAllergyMatches(board, effectiveAllergies),
    [board, effectiveAllergies]
  );

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

  useEffect(() => {
    if (!isLoggedIn || !userInfo || !board) {
      return;
    }

    const fetchScrapStatus = async () => {
      try {
        const res = await api.get<{ scrapped: boolean }>(
          `/boards/${boardNo}/scrap/status?userNo=${userInfo.userNo}`
        );
        setIsScrapped(res.data.scrapped);
      } catch {
        setIsScrapped(false);
      }
    };

    void fetchScrapStatus();
  }, [board, boardNo, isLoggedIn, userInfo]);

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
      setIsScrapped((prev) => !prev);
    } catch (error) {
      console.error("스크랩 처리 실패:", error);
      alert(getErrorMessage(error, "스크랩 처리에 실패했습니다."));
    }
  };

  const handleFollow = async () => {
  if (!isLoggedIn || !loginUserNo || !board) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const res = await api.post('/users/follow', null, {
      params: { loginUserNo: loginUserNo, targetEmail: board.userEmail }
    });

    if (res.status === 200) {
      const newStatus = res.data; 
      setIsFollowing(newStatus);
      setBoard(prev => prev ? { ...prev, followerCount: (prev.followerCount ?? 0) + (newStatus ? 1 : -1) } : null);
    }
  } catch (err: any) {
    if (err.response?.status === 400) alert(err.response.data);
    else alert("팔로우 처리에 실패했습니다.");
  }
};

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/boards/${boardNo}`);
      alert("삭제했습니다.");
      router.push("/boards");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(getErrorMessage(error, "삭제에 실패했습니다."));
    }
  };

  const handleAddShoppingList = async () => {
    if (!isLoggedIn || !userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!board?.ingredientSets?.some((set) => set.ingredients?.length > 0)) {
      alert("장보기에 추가할 재료가 없습니다.");
      return;
    }

    if (allergyMatches.length > 0) {
      const canContinue = confirm(
        `이 레시피에는 설정한 알레르기 재료가 포함될 수 있습니다.\n\n포함 가능 재료: ${allergyMatches.join(
          ", "
        )}\n\n그래도 장보기에 추가할까요?`
      );

      if (!canContinue) return;
    }

    try {
      setShoppingAdding(true);
      const res = await api.post<{ shoppingNo: number; created: boolean }>("/shopping-lists", {
        userNo: userInfo.userNo,
        boardNo,
      });

      alert(res.data.created ? "장보기 목록에 추가되었습니다." : "이미 장보기 목록에 추가된 레시피입니다.");
    } catch (error) {
      console.error("장보기 추가 실패:", error);
      alert(getErrorMessage(error, "장보기 추가에 실패했습니다."));
    } finally {
      setShoppingAdding(false);
    }
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
                src={resolveRecipeImageUrl(board.imageUrl)}
                alt={board.boardTitle}
                className={styles.heroImage}
              />
            ) : (
              <div className={styles.heroFallback}>CookMate</div>
            )}
            {isOwner && (
              <span className={styles.heroBadge}>
                {board.open === "Y" ? "공개" : "비공개"}
              </span>
            )}
          </section>

          <section className={styles.reactionBar}>
            <button
              type="button"
              onClick={handleScrap}
              className={`${styles.reactionButton} ${
                isScrapped ? styles.reactionButtonActive : ""
              }`}
            >
              <span>{isScrapped ? "스크랩 중" : "스크랩"}</span>
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
              
              <Link 
                href={`/chef/${board.userNo}`} 
                className={styles.authorLink} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              > 
                <UserAvatar
                  imageUrl={board.profileImageUrl} 
                  name={board.nickname}
                  email={board.userEmail}
                  size={48} 
                />
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{board.nickname}</span>
                  <span className={styles.authorSub}>
                    레시피 {board.recipeCount ?? 0}
                    {!isOfficialPost && ` · 팔로워 ${board.followerCount ?? 0}`}
                  </span>
                </div>
              </Link>

              {canFollowAuthor && (
                <button
                  type="button"
                  onClick={handleFollow}
                  className={`${styles.btnFollow} ${isFollowing ? styles.following : ""}`}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              )}

              <span className={styles.dateText}>
                작성일 {board.boardPostdate || "-"}
              </span>
            </div>

            {board.introduce && (
              <p className={styles.description}>{board.introduce}</p>
            )}

            <div className={styles.metaPills}>
              <MetaPill label="종류" value={board.typeName} />
              <MetaPill label="난이도" value={board.difficult} />
              <MetaPill label="조리시간" value={board.cookTime} />
              <MetaPill label="칼로리" value={formatCaloryValue(board.calory)} />
            </div>
          </section>

          <section className={styles.sectionCard}>
            <SectionTitle
              title="재료"
              action={
                <div className={styles.ingredientActions}>
                  <div className={styles.detailServingStepper} aria-label="재료 인분 조절">
                    <button
                      type="button"
                      onClick={() => setSelectedServingCount((value) => Math.max(1, value - 1))}
                      aria-label="인분 줄이기"
                    >
                      -
                    </button>
                    <strong>{selectedServingCount}인분</strong>
                    <button
                      type="button"
                      onClick={() => setSelectedServingCount((value) => Math.min(5, value + 1))}
                      aria-label="인분 늘리기"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddShoppingList}
                    className={styles.cartButton}
                    disabled={shoppingAdding}
                  >
                    {shoppingAdding ? "추가 중" : "장보기 추가"}
                  </button>
                </div>
              }
            />

            {allergyMatches.length > 0 && (
              <div className={styles.allergyWarning}>
                <strong>알레르기 주의</strong>
                <span>
                  이 레시피에는 설정한 알레르기 재료가 포함될 수 있습니다.
                </span>
                <em>{allergyMatches.join(", ")}</em>
              </div>
            )}

            <div className={styles.ingredientColumns}>
              {board.ingredientSets?.map((set) => (
                <div key={set.setNo} className={styles.ingredientGroup}>
                  <div className={styles.groupTitle}>
                    {set.setName || "재료"}
                  </div>
                  {set.ingredients?.map((ingredient) => (
                    <div
                      key={ingredient.ingredientNo}
                      className={styles.ingredientRow}
                    >
                      <span className={styles.ingredientName}>{ingredient.ingredientName}</span>
                      <span className={styles.ingredientAmount}>
                        {[formatScaledQuantity(ingredient.quantity, ingredientScale), ingredient.unit]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
          
          {board.url && (
            <section className={styles.sectionCard}>
              <SectionTitle title="동영상" />
              {youtubeVideoId && (
                <div className={styles.videoEmbedWrap}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title={`${board.boardTitle} 동영상`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
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
            <SectionTitle title="요리 순서" />
            <ol className={styles.stepList}>
              {board.cookSteps?.map((step, index) => (
                <li key={step.step} className={styles.stepItem}>
                  <span className={styles.stepNumber}>{step.step}</span>
                  <div className={styles.stepContent}>
                    <p className={styles.stepText}>{step.cookContent}</p>
                    {step.cookImage && (
                      <img
                        src={resolveRecipeImageUrl(step.cookImage)}
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

function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}

function findAllergyMatches(board: Board | null, allergies: string[]) {
  if (!board || allergies.length === 0) return [];

  const normalizedAllergies = allergies
    .map((allergy) => allergy.trim())
    .filter(Boolean);

  if (normalizedAllergies.length === 0) return [];

  const matched = new Set<string>();

  board.ingredientSets?.forEach((set) => {
    set.ingredients?.forEach((ingredient) => {
      const ingredientName = normalizeForMatch(ingredient.ingredientName);
      if (!ingredientName) return;

      normalizedAllergies.forEach((allergy) => {
        const normalizedAllergy = normalizeForMatch(allergy);
        if (
          normalizedAllergy &&
          (ingredientName.includes(normalizedAllergy) ||
            normalizedAllergy.includes(ingredientName))
        ) {
          matched.add(allergy);
        }
      });
    });
  });

  return Array.from(matched);
}

function normalizeForMatch(value?: string | null) {
  return (value ?? "").replace(/\s/g, "").toLowerCase();
}

function formatCaloryValue(value?: string | null) {
  if (!value) return "";

  const range = CALORY_RANGES[value];
  return range ? `${value} · ${range}` : value;
}

function formatScaledQuantity(quantity?: string | null, scale = 1) {
  const value = quantity?.trim() ?? "";
  if (!value || scale === 1) return value;

  const match = value.match(/^(\d+(?:\.\d+)?|\d+\s+\d+\/\d+|\d+\/\d+)(.*)$/);
  if (!match) return value;

  const parsed = parseQuantity(match[1]);
  if (parsed == null) return value;

  const scaled = parsed * scale;
  const formatted = Number.isInteger(scaled)
    ? String(scaled)
    : Number(scaled.toFixed(2)).toString();

  return `${formatted}${match[2] ?? ""}`;
}

function parseQuantity(value: string) {
  const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    return denominator === 0 ? null : whole + numerator / denominator;
  }

  const fraction = value.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    return denominator === 0 ? null : numerator / denominator;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getYoutubeVideoId(url?: string | null) {
  if (!url) return "";

  const match = url.trim().match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );

  return match?.[1] ?? "";
}

function getFollowStorageKey(userNo: number, authorNo: number) {
  return `cookmate-follow-${userNo}-${authorNo}`;
}
