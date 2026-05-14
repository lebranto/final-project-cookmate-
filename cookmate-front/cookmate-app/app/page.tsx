import Link from "next/link";
import styles from "./page.module.css";

const categories = [
  {
    name: "한식",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80",
  },
  {
    name: "파스타 · 양식",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80",
    wide: true,
  },
  {
    name: "일식",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&q=80",
  },
  {
    name: "샐러드",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
  },
  {
    name: "수프",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80",
  },
  {
    name: "브런치",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80",
  },
  {
    name: "디저트 · 베이킹",
    image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80",
    wide: true,
  },
];

const recipes = [
  {
    title: "구수한 된장찌개",
    category: "한식",
    time: "30분",
    likes: "4,821",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80",
  },
  {
    title: "크리미 까르보나라",
    category: "양식",
    time: "20분",
    likes: "6,982",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80",
  },
  {
    title: "그린 퀴노아 볼",
    category: "샐러드",
    time: "10분",
    likes: "2,184",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
  },
  {
    title: "말차 크림 롤케이크",
    category: "디저트",
    time: "90분",
    likes: "3,547",
    image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80",
  },
];

const popularRecipes = [
  {
    title: "구수한 된장찌개 — 냉장고 남은 채소로 완성하는 법",
    category: "한식",
    chef: "김민준 셰프",
    time: "30분",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=220&q=80",
  },
  {
    title: "크리미 까르보나라 — 생크림 없이 만드는 정통 레시피",
    category: "양식",
    chef: "박수진 셰프",
    time: "20분",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=220&q=80",
  },
  {
    title: "그린 퀴노아 볼 : 단백질 42g을 담은 한 그릇",
    category: "샐러드",
    chef: "정유나 셰프",
    time: "10분",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=220&q=80",
  },
  {
    title: "말차 크림 롤케이크 — 집에서도 카페 수준으로",
    category: "디저트",
    chef: "이서연 셰프",
    time: "90분",
    image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=220&q=80",
  },
  {
    title: "토마토 미네스트로네 — 채소를 맛있게 먹는 방법",
    category: "양식",
    chef: "최동현 셰프",
    time: "25분",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=220&q=80",
  },
];

const chefs = [
  { name: "김민준 셰프", desc: "한식 · 레시피 84개" },
  { name: "박수진 셰프", desc: "양식 · 레시피 62개" },
  { name: "이서연 셰프", desc: "디저트 · 레시피 103개" },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=85"
            alt="따뜻한 주방에서 요리하는 모습"
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroBody}>
          <span className={styles.heroTag}>CookMate Pick</span>
          <h1>오늘 뭐 먹지 고민될 때, CookMate</h1>
          <p>
            집에 있는 재료와 취향에 맞춰 레시피를 찾고, 필요한 재료는 바로 장보기 목록으로
            이어가세요.
          </p>
          <Link href="/boards" className={styles.heroButton}>
            레시피 둘러보기
          </Link>
        </div>
      </section>

      <section className={styles.searchBand} aria-label="레시피 검색">
        <div className={styles.searchBox}>
          <input placeholder="어떤 요리가 먹고 싶으세요? 레시피명 또는 재료를 입력하세요" />
          <button type="button">검색</button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.kicker}>카테고리별 레시피</div>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <Link
              href="/boards"
              className={`${styles.categoryCard} ${category.wide ? styles.categoryWide : ""}`}
              key={category.name}
            >
              <img src={category.image} alt={category.name} />
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>새로 올라온 레시피</h2>
          <Link href="/boards">더보기</Link>
        </div>
        <div className={styles.recipeGrid}>
          {recipes.map((recipe) => (
            <Link href="/boards" className={styles.recipeCard} key={recipe.title}>
              <div className={styles.recipeImage}>
                <img src={recipe.image} alt={recipe.title} />
              </div>
              <div className={styles.recipeBody}>
                <div className={styles.recipeTags}>
                  <span>{recipe.category}</span>
                  <span>{recipe.time}</span>
                </div>
                <h3>{recipe.title}</h3>
                <p>{recipe.time} · 좋아요 {recipe.likes}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.featured}>
        <div className={styles.featuredImage}>
          <img
            src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=85"
            alt="까르보나라"
          />
        </div>
        <div className={styles.featuredBody}>
          <span>이달의 추천 레시피</span>
          <h2>생크림 없이 만드는 정통 크리미 까르보나라</h2>
          <p>
            달걀노른자와 파르메산 치즈만으로 완성하는 이탈리아식 까르보나라. 팬의 온도가
            핵심입니다.
          </p>
          <div className={styles.featuredMeta}>
            <strong>20분</strong>
            <strong>보통</strong>
            <strong>~520kcal</strong>
          </div>
          <Link href="/boards" className={styles.primaryButton}>
            레시피 보기
          </Link>
        </div>
      </section>

      <section className={styles.steps}>
        <h2>CookMate를 이렇게 활용하세요</h2>
        <p>레시피 검색부터 장보기까지 한 곳에서</p>
        <div className={styles.stepGrid}>
          {["레시피 탐색", "AI 추천 받기", "장보기 목록 생성", "재료 체크"].map((step, index) => (
            <div className={styles.stepItem} key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
              <p>필요한 흐름을 빠르게 이어가는 준비용 화면입니다.</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div>
          <div className={styles.sectionHeader}>
            <h2>이번 주 인기 레시피</h2>
            <Link href="/boards">더보기</Link>
          </div>
          <div className={styles.popularList}>
            {popularRecipes.map((recipe, index) => (
              <Link href="/boards" className={styles.popularItem} key={recipe.title}>
                <span className={styles.rank}>{index + 1}</span>
                <div className={styles.popularImage}>
                  <img src={recipe.image} alt={recipe.title} />
                </div>
                <div>
                  <span className={styles.popularTag}>{recipe.category}</span>
                  <strong>{recipe.title}</strong>
                  <p>{recipe.chef} · {recipe.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.widget}>
            <div className={styles.kicker}>Chef Pick</div>
            {chefs.map((chef) => (
              <Link href="/chef" className={styles.chefItem} key={chef.name}>
                <span>{chef.name.slice(0, 1)}</span>
                <div>
                  <strong>{chef.name}</strong>
                  <p>{chef.desc}</p>
                </div>
              </Link>
            ))}
            <Link href="/chef" className={styles.outlineButton}>
              셰프 전체 보기
            </Link>
          </div>
        </aside>
      </section>

      <section className={styles.aiBanner}>
        <div>
          <span>AI 추천</span>
          <h2>냉장고 재료로 만드는 오늘의 레시피</h2>
          <p>갖고 있는 재료를 입력하면 만들 수 있는 레시피를 추천하는 영역입니다.</p>
        </div>
        <Link href="/ai">AI 추천 받으러 가기</Link>
      </section>

    </main>
  );
}
