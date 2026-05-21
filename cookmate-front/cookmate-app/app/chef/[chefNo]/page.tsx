"use client";

import { useEffect, useState } from 'react';
import { useParams , useRouter} from 'next/navigation';
import Link from 'next/link'; 
import api from '@/lib/axios';
import styles from './detail.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';
import UserAvatar from '@/app/components/UserAvatar';

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
  imageUrl?: string; 
}

function resolveRecipeImageUrl(imageUrl?: string | null) {
  return imageUrl || "";
}

export default function ChefDetailPage() {
  const params = useParams();
  const chefNo = params.chefNo;
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState('recipe'); 
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const RECIPES_PER_PAGE = 12; 
  const PAGES_PER_BLOCK = 10;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
    } catch (err: any) {
      console.error("팔로우 실패", err);
      
      if (err.response && err.response.status === 400) {
        alert(err.response.data); 
      } else {
        alert("팔로우 처리에 실패했습니다.");
      }
    }
  };

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const indexOfLastRecipe = currentPage * RECIPES_PER_PAGE;
  const indexOfFirstRecipe = indexOfLastRecipe - RECIPES_PER_PAGE;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const currentBlock = Math.ceil(currentPage / PAGES_PER_BLOCK);
  const startPage = (currentBlock - 1) * PAGES_PER_BLOCK + 1;
  const endPage = Math.min(startPage + PAGES_PER_BLOCK - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handlePrevBlock = () => {
    if (startPage > 1) {
      setCurrentPage(startPage - 1);
    }
  };

  const handleNextBlock = () => {
    if (endPage < totalPages) {
      setCurrentPage(endPage + 1);
    }
  };

  if (!isMounted) 
    return null;
  if (loading) 
    return 
      <div style={{padding: '100px', textAlign: 'center'}}>
        셰프 정보를 불러오는 중...
      </div>;
  if (!chef) 
    return 
      <div style={{padding: '100px', textAlign: 'center'}}>
        존재하지 않는 셰프입니다.
      </div>;

  return (
    <main className={styles.mainInner}>
      <div className={styles.mobileSubHeader}>
        <button onClick={() => router.push('/chef')} className={styles.btnBack}>
          ← 목록으로
        </button>
      </div>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          <UserAvatar 
            imageUrl={chef.profileImageUrl} 
            name={chef.nickname} 
            email={chef.userEmail}
            size={120} 
          />
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

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'recipe' ? styles.active : ''}`} 
          onClick={() => setActiveTab('recipe')}>
          공개 레시피 <span className={styles.tabCount}>{chef.recipeCount}</span>
        </button>
        <button className={`${styles.tab} ${activeTab === 'comment' ? styles.active : ''}`} 
          onClick={() => setActiveTab('comment')}>
          댓글 <span className={styles.tabCount}>{comments.length}</span>
        </button>
      </div>

      {activeTab === 'recipe' && (
        <>
          <div className={styles.recipeGrid}>
            {currentRecipes.length > 0 ? (
              currentRecipes.map(recipe => (
                <Link href={`/boards/${recipe.boardNo}`} key={recipe.boardNo} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.recipeCard}>
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

          {totalPages > 0 && (
            <div className={styles.pagination}>
              <button 
                className={styles.navButton} 
                onClick={handlePrevBlock} 
                disabled={startPage === 1}
              >
                &lt;
              </button>
              
              {pageNumbers.map(num => (
                <button
                  key={num}
                  className={`${styles.pageButton} ${currentPage === num ? styles.activePage : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button 
                className={styles.navButton} 
                onClick={handleNextBlock} 
                disabled={endPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'comment' && (
        <div className={styles.commentList}>
          {comments.length > 0 ? (
            comments.map(c => (
              <div key={c.commentNo} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar}>
                    <UserAvatar 
                      imageUrl={c.commenterProfileUrl} 
                      name={c.commenterNickname} 
                      size={36} 
                    />
                  </div>
                  <div>
                    <span className={styles.commenter}>{c.commenterNickname}</span>
                    <span className={styles.commentDate}>{c.commentPostDate}</span>
                  </div>
                </div>
                <div className={styles.commentContent}>{c.commentContent}</div>
                
                <div className={styles.commentTarget}>
                  원문: 
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