"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import styles from "./ShopDetailPage.module.css";

type ItemStatus = "NEED" | "BOUGHT" | "OWNED" | "CANCEL";

interface ShoppingDetailItem {
  itemNo: number;
  shoppingNo: number;
  setName: string;
  ingredientName: string;
  quantity: string;
  unit: string;
  itemStatus: ItemStatus;
  itemOrder: number;
}

interface ShoppingDetail {
  shoppingNo: number;
  userNo: number;
  boardNo: number;
  shoppingTitle: string;
  imageUrl: string;
  shoppingDate: string;
  cookTime: string;
  difficult: string;
  calory: string;
  items: ShoppingDetailItem[];
}

export default function ShopDetailPage({ shoppingNo }: { shoppingNo: number }) {
  const router = useRouter();
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const [detail, setDetail] = useState<ShoppingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingItemNo, setSavingItemNo] = useState<number | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!isLoggedIn || !userInfo) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get<ShoppingDetail>(`/shopping-lists/${shoppingNo}`, {
        params: { userNo: userInfo.userNo },
      });
      setDetail(res.data);
    } catch (error) {
      console.error("장보기 상세 조회 실패:", error);
      setErrorMessage("장보기 상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, shoppingNo, userInfo]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchDetail();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchDetail, isLoggedIn, router]);

  const stats = useMemo(() => {
    const items = detail?.items ?? [];
    const total = items.length;
    const bought = items.filter((item) => item.itemStatus === "BOUGHT").length;
    const owned = items.filter((item) => item.itemStatus === "OWNED").length;
    const completed = bought + owned;
    const need = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, bought, owned, need, completed, percent };
  }, [detail]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ShoppingDetailItem[]>();

    (detail?.items ?? []).forEach((item) => {
      const key = item.setName || "재료";
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });

    return Array.from(groups.entries()).map(([setName, items]) => ({ setName, items }));
  }, [detail]);

  const updateItemStatus = async (item: ShoppingDetailItem, itemStatus: ItemStatus) => {
    if (!userInfo) return;

    setSavingItemNo(item.itemNo);
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((prevItem) =>
              prevItem.itemNo === item.itemNo ? { ...prevItem, itemStatus } : prevItem
            ),
          }
        : prev
    );

    try {
      await api.patch(`/shopping-lists/${shoppingNo}/items/${item.itemNo}/status`, {
        userNo: userInfo.userNo,
        itemStatus,
      });
    } catch (error) {
      console.error("장보기 상태 변경 실패:", error);
      alert("재료 상태를 저장하지 못했습니다.");
      await fetchDetail();
    } finally {
      setSavingItemNo(null);
    }
  };

  const handleItemClick = (item: ShoppingDetailItem) => {
    if (savingItemNo === item.itemNo || item.itemStatus === "OWNED") return;
    void updateItemStatus(item, item.itemStatus === "BOUGHT" ? "NEED" : "BOUGHT");
  };

  const handleOwnedClick = (item: ShoppingDetailItem) => {
    if (savingItemNo === item.itemNo) return;
    void updateItemStatus(item, item.itemStatus === "OWNED" ? "NEED" : "OWNED");
  };

  const updateAllStatus = async (itemStatus: ItemStatus) => {
    if (!userInfo || !detail) return;

    try {
      setBulkSaving(true);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) => ({ ...item, itemStatus })),
            }
          : prev
      );
      await api.patch(`/shopping-lists/${shoppingNo}/items/status`, {
        userNo: userInfo.userNo,
        itemStatus,
      });
    } catch (error) {
      console.error("장보기 전체 상태 변경 실패:", error);
      alert("전체 상태를 저장하지 못했습니다.");
      await fetchDetail();
    } finally {
      setBulkSaving(false);
    }
  };

  if (loading) {
    return <main className={styles.stateBox}>장보기 재료를 불러오는 중입니다.</main>;
  }

  if (errorMessage || !detail) {
    return <main className={styles.stateBox}>{errorMessage || "장보기 목록을 찾을 수 없습니다."}</main>;
  }

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/shop">장보기 목록</Link>
        <span>›</span>
        <strong>{detail.shoppingTitle}</strong>
      </nav>

      <section className={styles.headerCard}>
        <button type="button" className={styles.backButton} onClick={() => router.push("/shop")}>
          ←
        </button>
        <div className={styles.headerInfo}>
          <div className={styles.headerLabel}>장보기 재료 확인</div>
          <h1>{detail.shoppingTitle}</h1>
          <div className={styles.headerMeta}>
            {detail.cookTime && <span>{detail.cookTime}</span>}
            {detail.difficult && <span>{detail.difficult}</span>}
            {detail.calory && <span>{detail.calory}</span>}
            <span>{detail.shoppingDate} 추가</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.checkAllButton}
            disabled={bulkSaving}
            onClick={() => updateAllStatus("BOUGHT")}
          >
            전체 구매완료
          </button>
          <button
            type="button"
            className={styles.clearAllButton}
            disabled={bulkSaving}
            onClick={() => updateAllStatus("NEED")}
          >
            전체 초기화
          </button>
        </div>
      </section>

      <section className={styles.progressCard}>
        <div className={styles.progressFraction}>
          {stats.completed} <span>/ {stats.total}</span>
        </div>
        <div className={styles.progressArea}>
          <div className={styles.progressLabel}>
            <span>구매 진행률</span>
            <strong>{stats.percent}%</strong>
          </div>
          <div className={styles.progressBarBg}>
            <div className={styles.progressBarFill} style={{ width: `${stats.percent}%` }} />
          </div>
          <div className={styles.progressState}>
            <span><i className={styles.doneDot} />{stats.bought}개 구매 완료</span>
            <span><i className={styles.ownedDot} />{stats.owned}개 이미 있어요</span>
            <span><i className={styles.needDot} />{stats.need}개 구매 필요</span>
          </div>
        </div>
      </section>

      <section className={styles.guideBanner}>
        재료를 클릭하면 구매 완료 표시가 됩니다. 집에 이미 있는 재료는 &quot;이미 있어요&quot; 버튼을 누르면 별도로 처리됩니다.
      </section>

      <section className={styles.ingredientColumns}>
        {groupedItems.map((group) => (
          <div key={group.setName}>
            <h2 className={styles.groupTitle}>
              {group.setName} <span>{group.items.length}개</span>
            </h2>
            {group.items.map((item) => (
              <ShoppingIngredientItem
                key={item.itemNo}
                item={item}
                disabled={savingItemNo === item.itemNo}
                onClick={() => handleItemClick(item)}
                onOwnedClick={() => handleOwnedClick(item)}
              />
            ))}
          </div>
        ))}
      </section>

      <div className={styles.bottomLinks}>
        <Link href="/shop">← 장보기 목록으로</Link>
        <Link href={`/boards/${detail.boardNo}`}>레시피 상세 보기 ↗</Link>
      </div>
    </main>
  );
}

function ShoppingIngredientItem({
  item,
  disabled,
  onClick,
  onOwnedClick,
}: {
  item: ShoppingDetailItem;
  disabled: boolean;
  onClick: () => void;
  onOwnedClick: () => void;
}) {
  const amount = [item.quantity, item.unit].filter(Boolean).join("");
  const isBought = item.itemStatus === "BOUGHT";
  const isOwned = item.itemStatus === "OWNED";

  return (
    <button
      type="button"
      className={`${styles.checkItem} ${isBought ? styles.done : ""} ${isOwned ? styles.owned : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.checkBox}>{isBought ? "✓" : isOwned ? "—" : ""}</span>
      <span className={styles.checkName}>{item.ingredientName}</span>
      {amount && <span className={styles.checkAmount}>{amount}</span>}
      <span
        role="button"
        tabIndex={0}
        className={styles.ownedButton}
        onClick={(event) => {
          event.stopPropagation();
          onOwnedClick();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onOwnedClick();
          }
        }}
      >
        {isOwned ? "취소" : "이미 있어요"}
      </span>
    </button>
  );
}
