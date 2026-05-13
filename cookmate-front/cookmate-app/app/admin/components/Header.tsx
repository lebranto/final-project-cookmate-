'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

import styles from "./header.module.css";

interface ReportResponse {
  totalUnansweredReportCount: number;
}

interface InquiryResponse {
  totalUnansweredInquiryCount: number;
}

// 헤더 포탈은 따로 구현 필요 왼쪽 상단 : 메인페이지 , 오른쪽 상단 : 프로필

export default function Header() {

  const [reportCount, setReportCount] = useState(0);

  const [inquiryCount, setInquiryCount] = useState(0);

 useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        const [reportRes, inquiryRes] = await Promise.all([
          axios.get("http://localhost:8081/api/admin/report"), // 여기서 404나 500 에러 가능성
          axios.get("http://localhost:8081/api/admin/inquiry")
        ]);

        // 데이터가 존재하는지 확인 후 세팅 (Optional Chaining 사용)
        setReportCount(reportRes.data?.totalUnansweredReportCount || 0);
        setInquiryCount(inquiryRes.data?.totalUnansweredInquiryCount || 0);

      } catch (error) {
        console.error("헤더 뱃지 조회 실패:", error);
      }
    };
    fetchBadgeData();
  }, []);

  const menus = [

    {
      name: "대시보드",
      icon: "📊",
      href: "/admin/dashboard",
    },

    {
      name: "회원관리",
      icon: "👥",
      href: "/admin/user",
    },

    {
      name: "신고관리",
      icon: "🚨",
      href: "/admin/report",
      badge: reportCount,
    },

    {
      name: "레시피관리",
      icon: "📋",
      href: "/admin/recipe",
    },

    {
      name: "공지사항",
      icon: "📢",
      href: "/admin/notice",
    },

    {
      name: "문의관리",
      icon: "💬",
      href: "/admin/inquiry",
      badge: inquiryCount,
    },

  ];

  return (

    <header className={styles.header}>

      <div className={styles.headerInner}>

        {/* LOGO */}

        <Link
          href="/admin/dashboard"
          className={styles.logo}
        >

          <div className={styles.logoIcon}>
            🍳
          </div>

          <span className={styles.logoText}>
            CookMate
          </span>

          <span className={styles.logoBadge}>
            ADMIN
          </span>

        </Link>

        {/* NAVIGATION */}

        <nav className={styles.nav}>

          {menus.map((menu) => (

            <Link
              key={menu.href}
              href={menu.href}
              className={styles.navBtn}
            >
              <span>
                {menu.icon}
              </span>

              <span>
                {menu.name}
              </span>

              {menu.badge !== undefined &&
                menu.badge > 0 && (

                <span className={styles.badge}>
                  {menu.badge}
                </span>

              )}

            </Link>

          ))}

        </nav>

        {/* 프로필 */}

        <div className={styles.headerRight}>

          <span className={styles.headerTime}>
            관리자 모드
          </span>

          <div className={styles.headerAvatar}>
            킹
          </div>

        </div>
      </div>
    </header>
  );
}