"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios'; 
import styles from './chef.module.css';
import Link from 'next/link';

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
  const loginUserNo = 1; // 임시 유저 번호

  // 백엔드에서 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/chef', {
          params: { filter: filter, loginUserNo: loginUserNo }
        });
        if (response.status === 200) {
          // 서버에서 오는 데이터 구조에 맞춰 상태 저장
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
  }, [filter]);

  // 검색어 필터링
  const filteredRankers = rankers.filter(chef => 
    chef.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRankers.length / PER_PAGE));
  const pageItems = filteredRankers.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // 2. 진짜 팔로우 API 호출 핸들러
  const handleFollow = async (e: React.MouseEvent, targetEmail: string, currentStatus: boolean, chefIndex: number) => {
    e.preventDefault(); // 카드 클릭(상세페이지 이동) 방지
    
    try {
      // 서버의 @PostMapping("/follow") 호출
      const res = await api.post('/users/follow', null, {
        params: { loginUserNo: loginUserNo, targetEmail: targetEmail }
      });

      if (res.status === 200) {
        // 화면 상태 즉시 업데이트 (Optimistic UI)
        setRankers(prev => {
          const newData = [...prev];
          newData[chefIndex] = {
            ...newData[chefIndex], // 기존 셰프 데이터 복사
            following: !currentStatus, // 팔로우 상태 반전
            followerCount: newData[chefIndex].followerCount + (currentStatus ? -1 : 1) // 1만 더하거나 빼기
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
        <button className={`${styles.pageBtn} ${styles.arrow}`} disabled={currentPage === 1} onClick={() => setCurrentPage(c => Math.max(1, c - 1))}>‹</button>
        {pages}
        <button className={`${styles.pageBtn} ${styles.arrow}`} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}>›</button>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>👨‍🍳 셰프 리스트</h1>
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
              // 랭킹 인덱스 계산
              const rank = rankers.findIndex(r => r.userNo === chef.userNo) + 1;
              const realIndex = rankers.findIndex(r => r.userNo === chef.userNo);
              let rankClass = '';
              if (rank === 1) rankClass = styles.top1;
              else if (rank === 2) rankClass = styles.top2;
              else if (rank === 3) rankClass = styles.top3;

              return (
                // 카드 전체를 Link로 감싸되, 버튼 이벤트는 전파되지 않게 처리합니다
                <Link key={chef.userNo} href={`/chef/${chef.userNo}`} className={styles.chefCard} style={{textDecoration:'none'}}>
                  <div className={`${styles.chefRank} ${rankClass}`}>{rank}</div>
                  <div className={styles.chefAvatar}>
                    {chef.profileImageUrl ? <img src={chef.profileImageUrl} alt="프로필" style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : '🧑‍🍳'}
                  </div>
                  
                  <div className={styles.chefInfo}>
                    <div className={styles.chefNameRow}>
                      <span className={styles.chefName}>{chef.nickname}</span>
                      {/* 팔로우 버튼 클릭 시 handleFollow 호출 */}
                      <button 
                        className={`${styles.btnFollow} ${chef.following ? styles.following : ''}`} 
                        onClick={(e) => handleFollow(e, chef.userEmail, chef.following, realIndex)}
                      >
                        {chef.following ? '✓ 팔로잉' : '+ 팔로우'}
                      </button>
                    </div>
                    <div className={styles.chefStats}>
                      <div className={styles.chefStat}>
                        <span className={styles.chefStatIcon}>🍳</span><span>레시피</span>
                        <span className={styles.chefStatNum}>{chef.recipeCount?.toLocaleString()}</span>
                      </div>
                      <div className={styles.chefStat}>
                        <span className={styles.chefStatIcon}>🔖</span><span>스크랩</span>
                        <span className={styles.chefStatNum}>{chef.scrapCount?.toLocaleString()}</span>
                      </div>
                      <div className={styles.chefStat}>
                        <span className={styles.chefStatIcon}>👥</span><span>팔로워</span>
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