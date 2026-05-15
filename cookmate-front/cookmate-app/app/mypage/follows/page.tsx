"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import styles from './follow.module.css';
import Link from 'next/link';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';
import UserAvatar from '@/app/components/UserAvatar';

interface FollowUser {
  userNo: number;
  nickname: string;
  userEmail: string;
  recipeCount: number;
  followerCount: number;
  scrapCount: number;
  profileImageUrl?: string;
  following: boolean; 
}

export default function FollowManagementPage() {
  const [activeTab, setActiveTab] = useState<'following' | 'follower'>('following');
  const [filter, setFilter] = useState("newest");
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [followerList, setFollowerList] = useState<FollowUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const PER_PAGE = 10;
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!loginUserNo) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/follow/list`, { 
            params: { 
                userNo: loginUserNo ,
                filter: filter
            } });
        if (res.status === 200) {
          setFollowingList(res.data.following || []);
          setFollowerList(res.data.followers || []);
        }
      } catch (err) {
        console.error("팔로우 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowData();
  }, [loginUserNo,filter]);

  const currentList = activeTab === 'following' ? followingList : followerList;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PER_PAGE));
  const pageItems = currentList.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleFollowAction = async (e: React.MouseEvent, user: FollowUser) => {
    e.preventDefault(); 
    if (!isLoggedIn || !loginUserNo) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      const res = await api.post('/users/follow', null, {
        params: { loginUserNo: loginUserNo, targetEmail: user.userEmail }
      });

      if (res.status === 200) {
        const updateList = (list: FollowUser[]) => 
          list.map((item) => 
            item.userNo === user.userNo 
              ? { ...item, following: !item.following, followerCount: item.following ? item.followerCount - 1 : item.followerCount + 1 } 
              : item
          );

        setFollowingList(prev => updateList(prev));
        setFollowerList(prev => updateList(prev));
      }
    } catch (err) {
      alert("처리에 실패했습니다.");
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
        <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>&lt;</button>
        {pages}
        <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>&gt;</button>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>팔로우 관리</h1>
        <div className={styles.pageSubtitle}></div>

        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'following' ? styles.active : ''}`} 
              onClick={() => { setActiveTab('following'); setCurrentPage(1); }}
            >
              팔로잉 <span className={styles.tabCount}>{followingList.length}</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'follower' ? styles.active : ''}`} 
              onClick={() => { setActiveTab('follower'); setCurrentPage(1); }}
            >
              팔로워 <span className={styles.tabCount}>{followerList.length}</span>
            </button>
          </div>

          <select 
            className={styles.filterSelect} 
            value={filter} 
            onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="follower">팔로워 많은순</option>
            <option value="recipe">레시피 많은순</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.chefEmpty}>데이터를 가져오는 중입니다...</div>
        ) : pageItems.length === 0 ? (
          <div className={styles.chefEmpty}>
            {activeTab === 'following' ? "팔로잉 중인 셰프가 없습니다." : "나를 팔로우하는 사람이 없습니다."}
          </div>
        ) : (
          <div className={styles.chefList}>
            {pageItems.map((chef, idx) => (
              <Link key={chef.userNo} href={`/chef/${chef.userNo}`} className={styles.chefCard}>
                <div className={styles.chefRank}>{(currentPage - 1) * PER_PAGE + idx + 1}</div>
                
                <div className={styles.chefAvatar}>
                  <UserAvatar 
                    imageUrl={chef.profileImageUrl} 
                    name={chef.userEmail || chef.nickname} 
                    size="100%" 
                  />
                </div>
                
                <div className={styles.chefInfo}>
                  <div className={styles.chefNameRow}>
                    <span className={styles.chefName}>{chef.nickname}</span>
                    <button 
                      className={`${styles.btnFollow} ${chef.following ? styles.following : ''}`} 
                      onClick={(e) => handleFollowAction(e, chef)}
                    >
                      {chef.following ? '팔로잉' : '팔로우'}
                    </button>
                  </div>
                  
                  <div className={styles.chefStats}>
                    <div className={styles.chefStat}>
                      <span className={styles.statLabel}>레시피</span>
                      <span className={styles.chefStatNum}>{chef.recipeCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className={styles.chefStat}>
                      <span className={styles.statLabel}>스크랩</span>
                      <span className={styles.chefStatNum}>{chef.scrapCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className={styles.chefStat}>
                      <span className={styles.statLabel}>팔로워</span>
                      <span className={styles.chefStatNum}>{chef.followerCount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {renderPagination()}
      </div>
    </main>
  );
}