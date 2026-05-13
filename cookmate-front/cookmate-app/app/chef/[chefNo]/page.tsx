"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link'; // 🌟 이동을 위한 Link 컴포넌트 추가
import api from '@/lib/axios';
import styles from './detail.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

interface ChefDetail {
  userNo: number;
  userEmail: string;
  nickname: string;
  introduce: string;
  profileImageUrl?: string;
  enrollDate: string; 
  recipeCount: number;
  followerCount: number;
  followingCount: number;
  following: boolean;
}

interface RecipeComment {
  commentNo: number;
  commentContent: string;
  commentPostDate: string;
  boardNo: number;
  boardTitle: string;
  commenterNickname: string;
  commenterProfileUrl?: string;
}

interface Recipe {
  boardNo: number;
  title: string;
  category: string;
  cookTime: string;
  likesCount: number;
  thumbClass: string;
  boardPostdate: string;
  imageUrl?: string; // 🌟 이미지 URL 필드 추가
}

// 🌟 공통 이미지 URL 처리 함수
function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}

export default function ChefDetailPage() {
  const params = useParams();
  const chefNo = params.chefNo;
  
  // 🌟 하이드레이션 방지용 상태 추가
  const [isMounted, setIsMounted] = useState(false);

  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState('recipe'); 
  const [loading, setLoading] = useState(true);

  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (!isMounted) return;

    const fetchChefData = async () => {
      setLoading(true);
      try {
        const [chefRes, commentRes, recipeRes] = await Promise.all([
          api.get(`/users/chef/${chefNo}`, { params: { loginUserNo: loginUserNo || "" } }),
          api.get(`/users/chef/${chefNo}/recipe-comments`),
          api.get('/users/recipes', { params: { userNo: chefNo, category: '전체' } }) 
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
  }, [chefNo, loginUserNo, isMounted]);

  const handleFollow = async () => {
    if (!isLoggedIn || !loginUserNo) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

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

  if (!isMounted) return null;
  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>셰프 정보를 불러오는 중...</div>;
  if (!chef) return <div style={{padding: '100px', textAlign: 'center'}}>존재하지 않는 셰프입니다.</div>;

  return (
    <main className={styles.mainInner}>
      {/* 1. 프로필 상단 영역 */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {/* 🌟 1. 사람 이모지 제거 & 프로필 없으면 닉네임 첫 글자 렌더링 */}
          {chef.profileImageUrl ? (
            <img src={chef.profileImageUrl} alt="프로필" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit: 'cover'}}/>
          ) : (
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#666' }}>
              {chef.nickname.charAt(0)}
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.nameRow}>
            <div className={styles.nameWrap}>
              <h1 className={styles.chefName}>{chef.nickname}</h1>
              <span className={styles.chefMeta}>
                @{chef.userEmail.split('@')[0]} · {chef.enrollDate} 가입
              </span>
            </div>
            {loginUserNo !== chef.userNo && (
              <button 
                className={`${styles.btnFollow} ${chef.following ? styles.following : ''}`}
                onClick={handleFollow}
              >
                {chef.following ? '팔로잉' : '팔로우'}
              </button>
            )}
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
              /* 🌟 2. 클릭 시 레시피 상세 페이지 이동 처리 */
              <Link href={`/boards/${recipe.boardNo}`} key={recipe.boardNo} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.recipeCard}>
                  
                  {/* 🌟 3. 음식 이모지 제거 & 실제 이미지 or CookMate 바탕 적용 */}
                  <div className={styles.recipeThumb} style={{ overflow: 'hidden' }}>
                    {recipe.imageUrl ? (
                      <img 
                        src={resolveRecipeImageUrl(recipe.imageUrl)} 
                        alt={recipe.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', backgroundColor: '#c4dba4', color: '#1e381b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px'
                      }}>
                        CookMate
                      </div>
                    )}
                  </div>
                  
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
              </Link>
            ))
          ) : (
            <div style={{gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: '#888'}}>
              등록된 공개 레시피가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 4. 댓글 목록 렌더링 영역 */}
      {activeTab === 'comment' && (
        <div className={styles.commentList}>
          {comments.length > 0 ? (
            comments.map(c => (
              <div key={c.commentNo} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar}>
                    {/* 🌟 4. 댓글 프로필도 이모지 제거 & 닉네임 첫 글자 렌더링 */}
                    {c.commenterProfileUrl ? (
                      <img src={c.commenterProfileUrl} alt="프로필" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit: 'cover'}}/>
                    ) : (
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#666' }}>
                        {c.commenterNickname.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className={styles.commenter}>{c.commenterNickname}</span>
                    <span className={styles.commentDate}>{c.commentPostDate}</span>
                  </div>
                </div>
                <div className={styles.commentContent}>{c.commentContent}</div>
                
                {/* 🌟 5. 댓글의 원문(레시피) 클릭 시 바로가기 추가 */}
                <div className={styles.commentTarget}>
                  📌 원문: 
                  <Link href={`/boards/${c.boardNo}`} style={{ marginLeft: '4px', color: '#4a7c59', textDecoration: 'none' }}>
                    <strong>{c.boardTitle}</strong>
                  </Link>
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