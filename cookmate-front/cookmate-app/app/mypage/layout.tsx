"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/axios';
import styles from './mypage.module.css';

// 프로필과 통계를 모두 합친 인터페이스
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
  
  // 🌟 통합된 유저 데이터 상태
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loginUserNo = 1; 

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        // 🌟 Promise.all을 사용해 프로필 정보와 통계 숫자를 동시에 가져옵니다!
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
  }, []);

  const menuItems = [
    { name: '내가 만든 레시피', href: '/mypage/recipes', icon: '📋' },
    { name: '스크랩 목록', href: '/mypage/scraps', icon: '🤍' },
    { name: '문의 내역', href: '/mypage/inquiries', icon: '💬' },
    { name: '회원 정보 수정', href: '/mypage/profile', icon: '✏️' },
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            
            {/* 🌟 1. 프로필 이미지 렌더링 (꽃 사진이 나오도록!) */}
            <div className={styles.avatar}>
              {userData?.profileImageUrl ? (
                <img 
                  src={userData.profileImageUrl} 
                  alt="프로필" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                /> 
              ) : '🧑‍🍳'}
            </div>
            
            {/* 🌟 2. 닉네임과 이메일 렌더링 */}
            <div className={styles.profileName}>
              {loading ? '로딩 중...' : userData?.nickname || '사용자'}
            </div>
            <div className={styles.profileEmail}>
              {loading ? '---' : userData?.userEmail}
            </div>
            
            {/* 🌟 3. 통계 숫자 렌더링 (기존처럼 잘 나옴!) */}
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
                <span className={styles.navIcon}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className={styles.divider}></div>
            <Link 
              href="/mypage/withdraw" 
              className={`${styles.navItem} ${styles.danger} ${pathname === '/mypage/withdraw' ? styles.dangerActive : ''}`}
            >
              <span className={styles.navIcon}>🚪</span>
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