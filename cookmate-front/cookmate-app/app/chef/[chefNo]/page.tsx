"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import styles from './detail.module.css';

// 1. 셰프 DTO 인터페이스 (가입일 추가)
interface ChefDetail {
  userNo: number;
  userEmail: string;
  nickname: string;
  introduce: string;
  profileImageUrl?: string;
  enrollDate: string; // 🌟 추가된 가입일
  recipeCount: number;
  followerCount: number;
  followingCount: number;
  following: boolean;
}

// 2. 댓글 인터페이스 (매퍼 반환값과 일치)
interface RecipeComment {
  commentNo: number;
  commentContent: string;
  commentPostDate: string;
  boardNo: number;
  boardTitle: string;
  commenterNickname: string;
  commenterProfileUrl?: string;
}

// 3. 레시피 인터페이스 (백엔드 RecipeDto 구조와 매칭)
interface Recipe {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  likesCount: number;
  thumbClass: string;
  boardPostdate: string;
}

export default function ChefDetailPage() {
  const params = useParams();
  const chefNo = params.chefNo;
  
  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState('recipe'); 
  const [loading, setLoading] = useState(true);

    //
  const loginUserNo = 1; // 임시 로그인 유저 번호
  //
  
  useEffect(() => {
    const fetchChefData = async () => {
      setLoading(true);
      try {
        // 🌟 셰프 정보와 댓글 목록을 Promise.all로 동시에 가져옵니다.
        const [chefRes, commentRes, recipeRes] = await Promise.all([
          api.get(`/users/chef/${chefNo}`, { params: { loginUserNo: loginUserNo } }),
          api.get(`/users/chef/${chefNo}/recipe-comments`),
          api.get('/users/recipes', { params: { userNo: chefNo, category: '전체' } }) // 🌟 레시피 호출
        ]);
        
        if (chefRes.status === 200) setChef(chefRes.data);
        if (commentRes.status === 200) setComments(commentRes.data);
        if (recipeRes.status === 200) setRecipes(recipeRes.data);
      } catch (err) {
        console.error("데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChefData();
  }, [chefNo]);

  // 팔로우 토글 핸들러
  const handleFollow = async () => {
    if (!chef) return;
    try {
      const res = await api.post('/users/follow', null, {
        params: { loginUserNo: loginUserNo, targetEmail: chef.userEmail }
      });
      if (res.status === 200) {
        setChef(prev => prev ? {
          ...prev,
          following: !prev.following,
          followerCount: prev.following ? prev.followerCount - 1 : prev.followerCount + 1
        } : null);
      }
    } catch (err) {
      alert("팔로우 처리에 실패했습니다.");
    }
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>셰프 정보를 불러오는 중...</div>;
  if (!chef) return <div style={{padding: '100px', textAlign: 'center'}}>존재하지 않는 셰프입니다.</div>;

  return (
    <main className={styles.mainInner}>
      {/* 1. 프로필 상단 영역 */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {chef.profileImageUrl ? <img src={chef.profileImageUrl} alt="프로필" style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : '🧑‍🍳'}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.nameRow}>
            <div className={styles.nameWrap}>
              <h1 className={styles.chefName}>{chef.nickname}</h1>
              {/* 🌟 닉네임 아래로 가입일 출력 */}
              <span className={styles.chefMeta}>
                @{chef.userEmail.split('@')[0]} · {chef.enrollDate} 가입
              </span>
            </div>
            <button 
              className={`${styles.btnFollow} ${chef.following ? styles.following : ''}`}
              onClick={handleFollow}
            >
              {chef.following ? '✓ 팔로잉' : '+ 팔로우'}
            </button>
          </div>
          
          <div className={styles.bio}>
            {chef.introduce || "소개글이 없습니다."}
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{chef.recipeCount}</span>
              <span className={styles.statLabel}>레시피</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{chef.followerCount.toLocaleString()}</span>
              <span className={styles.statLabel}>팔로워</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{chef.followingCount.toLocaleString()}</span>
              <span className={styles.statLabel}>팔로잉</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 탭 메뉴 영역 */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'recipe' ? styles.active : ''}`} onClick={() => setActiveTab('recipe')}>
          공개 레시피 <span className={styles.tabCount}>{chef.recipeCount}</span>
        </button>
        <button className={`${styles.tab} ${activeTab === 'comment' ? styles.active : ''}`} onClick={() => setActiveTab('comment')}>
          댓글 <span className={styles.tabCount}>{comments.length}</span>
        </button>
      </div>

      {/* 3. 공개 레시피 콘텐츠 영역 */}
      {activeTab === 'recipe' && (
        <div className={styles.recipeGrid}>
          {recipes.length > 0 ? (
            recipes.map(recipe => (
              <div key={recipe.boardNo} className={styles.recipeCard}>
                {/* 썸네일 영역 (CSS 클래스명과 백엔드 데이터 연결) */}
                <div className={`${styles.recipeThumb} ${styles[recipe.thumbClass] || styles.bgGreen}`}>
                  {recipe.category === '한식' ? '🍲' : 
                   recipe.category === '양식' ? '🍝' : 
                   recipe.category === '일식' ? '🍣' : 
                   recipe.category === '분식' ? '떡' : '🍳'}
                </div>
                
                {/* 레시피 정보 영역 */}
                <div className={styles.recipeInfo}>
                  <div className={styles.recipeMeta}>
                    <span>{recipe.boardPostdate.split('T')[0]}</span>
                  </div>
                  <div className={styles.recipeTitle}>{recipe.title}</div>
                  <div className={styles.recipeFooter}>
                    <span className={styles.recipeTag}>{recipe.category}</span>
                    <span className={styles.recipeLikes}>❤️ {recipe.likesCount}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: '#888'}}>
              등록된 공개 레시피가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 🌟 4. 댓글 목록 렌더링 영역 */}
      {activeTab === 'comment' && (
        <div className={styles.commentList}>
          {comments.length > 0 ? (
            comments.map(c => (
              <div key={c.commentNo} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar}>
                    {c.commenterProfileUrl ? <img src={c.commenterProfileUrl} alt="프로필"/> : '👤'}
                  </div>
                  <div>
                    <span className={styles.commenter}>{c.commenterNickname}</span>
                    <span className={styles.commentDate}>{c.commentPostDate}</span>
                  </div>
                </div>
                <div className={styles.commentContent}>{c.commentContent}</div>
                <div className={styles.commentTarget}>
                  📌 원문: <strong>{c.boardTitle}</strong>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyMsg}>아직 레시피에 달린 댓글이 없습니다.</div>
          )}
        </div>
      )}
    </main>
  );
}