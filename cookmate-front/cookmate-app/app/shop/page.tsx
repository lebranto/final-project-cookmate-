"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const KAKAO_MAP_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

interface KakaoPlace {
  id: string;
  place_name: string;
  distance: string;
  road_address_name: string;
  address_name: string;
  place_url: string;
  x: string;
  y: string;
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMapInstance {
  relayout(): void;
  setCenter(latLng: KakaoLatLng): void;
}

interface KakaoMarker {
  setMap(map: KakaoMapInstance | null): void;
}

interface KakaoInfoWindow {
  close(): void;
  open(map: KakaoMapInstance, marker: KakaoMarker): void;
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load(callback: () => void): void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (
          container: HTMLElement,
          options: { center: KakaoLatLng; level: number }
        ) => KakaoMapInstance;
        Marker: new (options: { map: KakaoMapInstance; position: KakaoLatLng }) => KakaoMarker;
        InfoWindow: new (options: { content: string; removable?: boolean }) => KakaoInfoWindow;
        services: {
          Places: new () => {
            keywordSearch(
              keyword: string,
              callback: (data: KakaoPlace[], status: string) => void,
              options: { x: number; y: number; radius: number; size: number }
            ): void;
          };
          Status: {
            OK: string;
            ZERO_RESULT: string;
          };
        };
      };
    };
  }
}

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const markerByPlaceIdRef = useRef(new Map<string, KakaoMarker>());
  const infoWindowByPlaceIdRef = useRef(new Map<string, KakaoInfoWindow>());
  const positionByPlaceIdRef = useRef(new Map<string, KakaoLatLng>());
  const currentInfoWindowRef = useRef<KakaoInfoWindow | null>(null);
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [mapMessage, setMapMessage] = useState(
    KAKAO_MAP_APP_KEY ? "주변 마트를 불러오는 중입니다." : "카카오맵 JavaScript 키를 설정해 주세요."
  );

  const openPlaceInfo = useCallback((placeId: string) => {
    const map = mapInstanceRef.current;
    const marker = markerByPlaceIdRef.current.get(placeId);
    const infoWindow = infoWindowByPlaceIdRef.current.get(placeId);
    const position = positionByPlaceIdRef.current.get(placeId);

    if (!map || !marker || !infoWindow || !position) return;

    currentInfoWindowRef.current?.close();
    map.setCenter(position);
    infoWindow.open(map, marker);
    currentInfoWindowRef.current = infoWindow;
  }, []);

  useEffect(() => {
    const appKey = KAKAO_MAP_APP_KEY;
    const currentOrigin = window.location.origin;

    if (!appKey) {
      return;
    }

    if (!navigator.geolocation) {
      const timer = window.setTimeout(() => {
        setMapMessage("현재 위치를 사용할 수 없습니다.");
      }, 0);
      return () => window.clearTimeout(timer);
    }

    let ignore = false;

    const finishKakaoLoad = (resolve: () => void, reject: (error: Error) => void) => {
      if (!window.kakao?.maps) {
        reject(new Error(`Kakao map SDK is unavailable: ${currentOrigin}`));
        return;
      }

      window.kakao.maps.load(resolve);
    };

    const loadKakaoMap = () =>
      new Promise<void>((resolve, reject) => {
        if (window.kakao?.maps) {
          window.kakao.maps.load(resolve);
          return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>(
          "script[data-kakao-map-sdk='true']"
        );

        if (existingScript) {
          if (existingScript.dataset.loaded === "true") {
            finishKakaoLoad(resolve, reject);
            return;
          }

          existingScript.addEventListener(
            "load",
            () => {
              existingScript.dataset.loaded = "true";
              finishKakaoLoad(resolve, reject);
            },
            { once: true }
          );
          existingScript.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        const sdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
          appKey
        )}&libraries=services&autoload=false`;
        script.src = sdkUrl;
        script.async = true;
        script.dataset.kakaoMapSdk = "true";
        script.addEventListener(
          "load",
          () => {
            script.dataset.loaded = "true";
            finishKakaoLoad(resolve, reject);
          },
          { once: true }
        );
        script.addEventListener(
          "error",
          () => reject(new Error(`Kakao map SDK load failed: ${currentOrigin} / ${sdkUrl}`)),
          { once: true }
        );
        document.head.appendChild(script);
      });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await loadKakaoMap();
          if (ignore || !mapRef.current || !window.kakao?.maps) return;

          const { latitude, longitude } = position.coords;
          const center = new window.kakao.maps.LatLng(latitude, longitude);
          const map = new window.kakao.maps.Map(mapRef.current, {
            center,
            level: 5,
          });
          mapInstanceRef.current = map;

          window.setTimeout(() => {
            map.relayout();
            map.setCenter(center);
          }, 100);

          new window.kakao.maps.Marker({ map, position: center });

          const placesService = new window.kakao.maps.services.Places();
          placesService.keywordSearch(
            "마트",
            (data, status) => {
              if (ignore || !window.kakao?.maps) return;

              if (status === window.kakao.maps.services.Status.OK) {
                const nextPlaces = data.slice(0, 4);
                markerByPlaceIdRef.current.clear();
                infoWindowByPlaceIdRef.current.clear();
                positionByPlaceIdRef.current.clear();
                currentInfoWindowRef.current = null;
                setPlaces(nextPlaces);
                setMapMessage("");

                nextPlaces.forEach((place) => {
                  const position = new window.kakao!.maps.LatLng(Number(place.y), Number(place.x));
                  const marker = new window.kakao!.maps.Marker({
                    map,
                    position,
                  });
                  const placeName = escapeHtml(place.place_name);
                  const distance = escapeHtml(formatDistance(place.distance));
                  const placeUrl = escapeHtml(place.place_url);
                  const infoWindow = new window.kakao!.maps.InfoWindow({
                    content: `
                      <div class="${styles.mapInfoWindow}">
                        <strong>${placeName}</strong>
                        <span>${distance}</span>
                        <a href="${placeUrl}" target="_blank" rel="noopener noreferrer">지도 보기</a>
                      </div>
                    `,
                    removable: true,
                  });

                  markerByPlaceIdRef.current.set(place.id, marker);
                  infoWindowByPlaceIdRef.current.set(place.id, infoWindow);
                  positionByPlaceIdRef.current.set(place.id, position);
                });
                return;
              }

              if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                setPlaces([]);
                setMapMessage("주변 마트를 찾지 못했습니다.");
                return;
              }

              setPlaces([]);
              setMapMessage("주변 마트 검색에 실패했습니다.");
            },
            {
              x: longitude,
              y: latitude,
              radius: 2500,
              size: 4,
            }
          );

          map.setCenter(center);
        } catch (error) {
          console.error("카카오맵 로드 실패:", error);
          if (!ignore) {
            setMapMessage(`카카오 개발자 콘솔에 ${currentOrigin} 도메인을 등록해 주세요.`);
          }
        }
      },
      () => {
        if (!ignore) setMapMessage("위치 권한을 허용하면 주변 마트를 볼 수 있습니다.");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      }
    );

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className={styles.mapCard}>
      <div className={styles.mapCardTitle}>
        주변 마트 <span>카카오맵 API</span>
      </div>
      <div className={styles.mapPlaceholder}>
        <div className={styles.mapCanvas} ref={mapRef} />
        {mapMessage && (
          <div className={styles.mapOverlay}>
            <div className={styles.mapPinIcon}>📍</div>
            <div className={styles.mapTip}>{mapMessage}</div>
          </div>
        )}
      </div>
      <div className={styles.storeList}>
        {places.length > 0 ? (
          places.map((place) => (
            <StoreRow
              key={place.id}
              name={place.place_name}
              distance={formatDistance(place.distance)}
              url={place.place_url}
              onSelect={() => openPlaceInfo(place.id)}
            />
          ))
        ) : (
          <div className={styles.storeEmpty}>검색된 마트가 없습니다.</div>
        )}
      </div>
    </section>
  );
}

function StoreRow({
  name,
  distance,
  url,
  onSelect,
}: {
  name: string;
  distance: string;
  url: string;
  onSelect: () => void;
}) {
  return (
    <div className={styles.storeRow}>
      <button type="button" className={styles.storeSelect} onClick={onSelect}>
        <div className={styles.storeName}>{name}</div>
        <div className={styles.storeDist}>{distance}</div>
      </button>
      <a className={styles.storeOpen} href={url} target="_blank" rel="noopener noreferrer">
        지도 보기
      </a>
    </div>
  );
}

function formatDistance(distance: string) {
  const meters = Number(distance);
  if (!Number.isFinite(meters)) return "거리 정보 없음";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
  return `${meters}m`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}
