"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios'; 
import styles from './chef.module.css';
import Link from 'next/link';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

interface Chef {
  userNo: number;
  nickname: string;
  userEmail: string; 
  recipeCount: number;
  scrapCount: number; 
  followerCount: number;
  profileImageUrl?: string; 
  following: boolean; 
}

export default function RankingPage() {
  const [rankers, setRankers] = useState<Chef[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("recipe");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const PER_PAGE = 10;
  
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/chef', {
          params: { filter: filter, loginUserNo: loginUserNo || "" } 
        });
        if (response.status === 200) {
          setRankers(response.data);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("데이터 로딩 실패!", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRanking();
  }, [filter, loginUserNo]);

  const filteredRankers = rankers.filter(chef => 
    chef.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRankers.length / PER_PAGE));
  const pageItems = filteredRankers.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleFollow = async (e: React.MouseEvent, targetEmail: string, currentStatus: boolean, chefIndex: number) => {
    e.preventDefault(); 
    
    if (!isLoggedIn || !loginUserNo) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      const res = await api.post('/users/follow', null, {
        params: { loginUserNo: loginUserNo, targetEmail: targetEmail }
      });

      if (res.status === 200) {
        setRankers(prev => {
          const newData = [...prev];
          newData[chefIndex] = {
            ...newData[chefIndex],
            following: !currentStatus,
            followerCount: newData[chefIndex].followerCount + (currentStatus ? -1 : 1)
          };
          return newData;
        });
      }
    } catch (err) {
      console.error("팔로우 실패", err);
      alert("팔로우 처리에 실패했습니다.");
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => setCurrentPage(i)} className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}>
          {i}
        </button>
      );
    }
    return (
      <div className={styles.pagination}>
        <button 
          className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
        >
          &lt;
        </button>
        {pages}
        <button 
          className={`${styles.pageBtn} ${styles.arrow}`} 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        {/* 🌟 1. 타이틀 이모지 제거 */}
        <h1 className={styles.pageTitle}>셰프 리스트</h1>
        <div className={styles.pageSubtitle}>CookMate의 인기 셰프들을 만나보세요</div>

        <div className={styles.controls}>
          <div className={styles.chefSearchWrap}>
            <input 
              type="text" 
              placeholder="셰프 닉네임을 검색하세요" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="recipe">레시피 많은 순</option>
            <option value="scrap">스크랩 많은 순</option>
            <option value="follower">팔로워 많은 순</option>
          </select>
          <span className={styles.resultCount}>총 {filteredRankers.length}명</span>
        </div>

        {loading ? (
          <div className={styles.chefEmpty}>데이터를 가져오는 중입니다...</div>
        ) : pageItems.length === 0 ? (
          <div className={styles.chefEmpty}>검색 결과가 없습니다.</div>
        ) : (
          <div className={styles.chefList}>
            {pageItems.map((chef) => {
              const rank = rankers.findIndex(r => r.userNo === chef.userNo) + 1;
              const realIndex = rankers.findIndex(r => r.userNo === chef.userNo);
              let rankClass = '';
              if (rank === 1) rankClass = styles.top1;
              else if (rank === 2) rankClass = styles.top2;
              else if (rank === 3) rankClass = styles.top3;

              return (
                <Link key={chef.userNo} href={`/chef/${chef.userNo}`} className={styles.chefCard} style={{textDecoration:'none'}}>
                  <div className={`${styles.chefRank} ${rankClass}`}>{rank}</div>
                  
                  {/* 🌟 2. 프로필 이미지 없을 때 이모지 대신 첫 글자 출력 */}
                  <div className={styles.chefAvatar}>
                    {chef.profileImageUrl ? (
                      <img src={chef.profileImageUrl} alt="프로필" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit: 'cover'}}/>
                    ) : (
                      <div className={styles.defaultAvatar}>{chef.nickname.charAt(0)}</div>
                    )}
                  </div>
                  
                  <div className={styles.chefInfo}>
                    <div className={styles.chefNameRow}>
                      <span className={styles.chefName}>{chef.nickname}</span>
                      {loginUserNo !== chef.userNo && (
                        <button 
                          className={`${styles.btnFollow} ${chef.following ? styles.following : ''}`} 
                          onClick={(e) => handleFollow(e, chef.userEmail, chef.following, realIndex)}
                        >
                          {chef.following ? '팔로잉' : '팔로우'}
                        </button>
                      )}
                    </div>
                    
                    {/* 🌟 3. 통계 영역 아이콘(🍳, 🔖, 👥) 제거 */}
                    <div className={styles.chefStats}>
                      <div className={styles.chefStat}>
                        <span className={styles.statLabel}>레시피</span>
                        <span className={styles.chefStatNum}>{chef.recipeCount?.toLocaleString()}</span>
                      </div>
                      <div className={styles.chefStat}>
                        <span className={styles.statLabel}>스크랩</span>
                        <span className={styles.chefStatNum}>{chef.scrapCount?.toLocaleString()}</span>
                      </div>
                      <div className={styles.chefStat}>
                        <span className={styles.statLabel}>팔로워</span>
                        <span className={styles.chefStatNum}>{chef.followerCount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {renderPagination()}
      </div>
    </main>
  );
}