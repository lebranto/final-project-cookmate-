"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/axios';
import styles from './mypage.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';
import UserAvatar from '@/app/components/UserAvatar';

interface UserData {
  nickname: string;
  userEmail: string;
  profileImageUrl?: string;
  recipeCount: number;
  scrapCount: number;
  inquiryCount: number;
}

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !loginUserNo) {
      if (isMounted && !loginUserNo) setLoading(false);
      return;
    }

    const fetchMyPageData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get(`/users/profile/${loginUserNo}`),
          api.get('/users/stats', { params: { userNo: loginUserNo } })
        ]);
        
        if (profileRes.status === 200 && statsRes.status === 200) {
          setUserData({
            nickname: profileRes.data.nickname,
            userEmail: profileRes.data.userEmail,
            profileImageUrl: profileRes.data.profileImageUrl,
            recipeCount: statsRes.data.recipeCount,
            scrapCount: statsRes.data.scrapCount,
            inquiryCount: statsRes.data.inquiryCount
          });
        }
      } catch (err) {
        console.error("사이드바 데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, [loginUserNo, isMounted]);

  const menuItems = [
    { name: '내가 만든 레시피', href: '/mypage/recipes' },
    { name: '스크랩 목록', href: '/mypage/scraps' },
    { name: '팔로우 관리', href: '/mypage/follows' },
    { name: '댓글 관리', href: '/mypage/comments' },
    { name: '문의 내역', href: '/mypage/inquiries' },
    { name: '회원 정보 수정', href: '/mypage/profile' },
    
  ];

  if (!isMounted) return null;

  if (!isLoggedIn || !loginUserNo) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', width: '100%', fontSize: '18px', color: '#666' }}>
        로그인이 필요한 서비스입니다.
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            
            <div className={styles.avatar}>
              <UserAvatar 
                imageUrl={userData?.profileImageUrl} 
                name={userData?.userEmail || userData?.nickname || 'user'} 
                size="100%" 
              />
            </div>
            
            <div className={styles.profileName}>
              {loading ? '로딩 중...' : userData?.nickname || '사용자'}
            </div>
            <div className={styles.profileEmail}>
              {loading ? '---' : userData?.userEmail}
            </div>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statVal}>{loading ? '-' : userData?.recipeCount}</div>
                <div className={styles.statLab}>레시피</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statVal}>{loading ? '-' : userData?.scrapCount}</div>
                <div className={styles.statLab}>스크랩</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statVal}>{loading ? '-' : userData?.inquiryCount}</div>
                <div className={styles.statLab}>문의</div>
              </div>
            </div>
            
          </div>

          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${pathname.includes(item.href) ? styles.active : ''}`}
              >
                {item.name}
              </Link>
            ))}
            <div className={styles.divider}></div>
            <Link 
              href="/mypage/withdraw" 
              className={`${styles.navItem} ${styles.danger} ${pathname === '/mypage/withdraw' ? styles.dangerActive : ''}`}
            >
              탈퇴
            </Link>
          </nav>
        </aside>

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}