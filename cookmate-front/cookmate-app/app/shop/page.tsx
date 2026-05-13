"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import styles from "./ShopListPage.module.css";

interface ShoppingListItem {
  shoppingNo: number;
  boardNo: number;
  shoppingTitle: string;
  imageUrl: string;
  shoppingDate: string;
  totalCount: number;
  completedCount: number;
}

interface ShoppingListResponse {
  list: ShoppingListItem[];
  totalCount: number;
}

const cardClasses = [styles.c1, styles.c2, styles.c3, styles.c4];

export default function ShopListPage() {
  const router = useRouter();
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const [shoppingLists, setShoppingLists] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchShoppingLists = useCallback(async () => {
    if (!isLoggedIn || !userInfo) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get<ShoppingListResponse>("/shopping-lists", {
        params: { userNo: userInfo.userNo },
      });
      setShoppingLists(res.data.list ?? []);
    } catch (error) {
      console.error("장보기 목록 조회 실패:", error);
      setErrorMessage("장보기 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, userInfo]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchShoppingLists();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchShoppingLists, isLoggedIn, router]);

  const handleDelete = useCallback(async (shoppingNo: number) => {
    if (!userInfo) return;

    try {
      await api.delete(`/shopping-lists/${shoppingNo}`, {
        params: { userNo: userInfo.userNo },
      });
      setShoppingLists((items) => items.filter((item) => item.shoppingNo !== shoppingNo));
    } catch (error) {
      console.error("장보기 삭제 실패:", error);
      alert("장보기 카드를 삭제하지 못했습니다.");
    }
  }, [userInfo]);

  const content = useMemo(() => {
    if (loading) return <div className={styles.messageBox}>장보기 목록을 불러오는 중입니다.</div>;
    if (errorMessage) return <div className={styles.messageBox}>{errorMessage}</div>;

    return (
      <div className={styles.recipeCards}>
        {shoppingLists.map((item, index) => (
          <ShoppingCard
            key={item.shoppingNo}
            item={item}
            toneClass={cardClasses[index % cardClasses.length]}
            onOpen={() => router.push(`/shop/${item.shoppingNo}`)}
            onDelete={() => handleDelete(item.shoppingNo)}
          />
        ))}

        <button type="button" className={styles.addCard} onClick={() => router.push("/boards")}>
          <span className={styles.addIcon}>+</span>
          <span>
            레시피 상세에서
            <br />
            &quot;장보기 추가&quot; 버튼을 눌러요
          </span>
        </button>
      </div>
    );
  }, [errorMessage, handleDelete, loading, router, shoppingLists]);

  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>장보기 목록</h1>
        <p className={styles.pageSub}>추가한 레시피를 선택해서 재료를 확인하세요</p>
      </section>

      <section className={styles.howBanner}>
        <div className={styles.howTitle}>사용 방법</div>
        <div className={styles.howSteps}>
          <HowStep number={1} text="레시피 상세에서 장보기 추가 클릭" />
          <HowStep number={2} text="아래 레시피 카드를 클릭해서 재료 확인" />
          <HowStep number={3} text="필요한 재료를 체크하면서 장보기" />
          <HowStep number={4} text="집에 있는 재료는 이미 있어요 선택" />
        </div>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.colMain}>
          <div className={styles.sectionTitle}>
            <strong>추가한 레시피</strong>
            <span>{shoppingLists.length}개</span>
          </div>
          {content}
        </section>

        <aside className={styles.colMap}>
          <NearbyMarketCard />
        </aside>
      </div>
    </main>
  );
}

function HowStep({ number, text }: { number: number; text: string }) {
  return (
    <div className={styles.howStep}>
      <span className={styles.howStepNum}>{number}</span>
      <span>{text}</span>
    </div>
  );
}

function ShoppingCard({
  item,
  toneClass,
  onOpen,
  onDelete,
}: {
  item: ShoppingListItem;
  toneClass: string;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const percent = item.totalCount > 0 ? Math.round((item.completedCount / item.totalCount) * 100) : 0;
  const allDone = item.totalCount > 0 && item.completedCount >= item.totalCount;

  return (
    <article className={`${styles.recipeShopCard} ${allDone ? styles.allDone : ""}`}>
      <button type="button" className={styles.cardOpenArea} onClick={onOpen}>
        <div className={`${styles.rscImg} ${toneClass}`}>
          {item.imageUrl ? (
            <img src={resolveRecipeImageUrl(item.imageUrl)} alt={item.shoppingTitle} />
          ) : (
            <span>CookMate</span>
          )}
          {allDone && <div className={styles.doneOverlay}>✓</div>}
          <div className={`${styles.rscBadge} ${allDone ? styles.rscBadgeDone : ""}`}>
            {item.completedCount} / {item.totalCount}
          </div>
        </div>
        <div className={styles.rscBody}>
          <h2 className={styles.rscTitle}>{item.shoppingTitle}</h2>
          <div className={styles.rscAdded}>{item.shoppingDate} 추가</div>
          <div className={styles.rscBarWrap}>
            <div className={styles.rscBarBg}>
              <div className={styles.rscBarFill} style={{ width: `${percent}%` }} />
            </div>
            <div className={`${styles.rscBarPct} ${percent === 0 ? styles.mutedPct : ""}`}>
              {allDone ? "완료 ✓" : `${percent}%`}
            </div>
          </div>
        </div>
      </button>
      <div className={styles.rscFooter}>
        <button type="button" className={styles.rscBtnMain} onClick={onOpen}>
          재료 확인하기 →
        </button>
        <button type="button" className={styles.rscBtnDel} onClick={onDelete} aria-label="장보기 삭제">
          ×
        </button>
      </div>
    </article>
  );
}

function NearbyMarketCard() {
  return (
    <section className={styles.mapCard}>
      <div className={styles.mapCardTitle}>
        주변 마트 <span>카카오맵 API</span>
      </div>
      <div className={styles.mapPlaceholder}>
        <div className={styles.mapPinIcon}>📍</div>
        <div className={styles.mapTip}>현재 위치 기반 주변 마트</div>
      </div>
      <div className={styles.storeList}>
        <StoreRow name="이마트 서울역점" distance="도보 5분 · 350m" open />
        <StoreRow name="홈플러스 익스프레스" distance="도보 10분 · 720m" open />
        <StoreRow name="GS더프레시" distance="도보 17분 · 1.2km" open />
        <StoreRow name="롯데마트" distance="차량 5분 · 2.1km" />
      </div>
    </section>
  );
}

function StoreRow({ name, distance, open }: { name: string; distance: string; open?: boolean }) {
  return (
    <div className={styles.storeRow}>
      <div>
        <div className={styles.storeName}>{name}</div>
        <div className={styles.storeDist}>{distance}</div>
      </div>
      <div className={open ? styles.storeOpen : styles.storeClosed}>
        {open ? "영업중" : "영업종료"}
      </div>
    </div>
  );
}

function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}
