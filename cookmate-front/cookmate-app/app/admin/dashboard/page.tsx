'use client';

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface TopRecipe {
  boardNo: number;
  title: string;
  author: string;
  likeCount: number;
  typeNo: number;
}

interface RecentReport {
  reportId?: number;
  reportType: string;
  targetNickname?: string;
  status: string;
}

interface UnansweredInquiry {
  inquiryId?: number;
  title: string;
  writer: string;
  createdAt: string;
}

interface DashboardData {
  totalUsers: number;
  totalRecipes: number;

  todayUserDiff: number;
  todayRecipeDiff: number;

  pendingReports: number;
  unansweredInquiries: number;

  todayVisitors: number;
  todayLikes: number;
  todayComments: number;

  monthlyBannedUsers: number;
  activeNotices: number;

  recentReports: RecentReport[];
  topRecipes: TopRecipe[];
  unansweredInquiryList: UnansweredInquiry[];

  notice: string | null;
}

const EMPTY_DASHBOARD: DashboardData = {
  totalUsers: 0,
  totalRecipes: 0,

  todayUserDiff: 0,
  todayRecipeDiff: 0,

  pendingReports: 0,
  unansweredInquiries: 0,
  todayVisitors: 0,
  todayLikes: 0,
  todayComments: 0,
  monthlyBannedUsers: 0,
  activeNotices : 0,
  recentReports: [],
  topRecipes: [],
  unansweredInquiryList: [],
  notice: null,
};

const normalizeDashboard = (data: Partial<DashboardData>): DashboardData => ({
  ...EMPTY_DASHBOARD,
  ...data,
  recentReports: Array.isArray(data.recentReports) ? data.recentReports : [],
  topRecipes: Array.isArray(data.topRecipes) ? data.topRecipes : [],
  unansweredInquiryList: Array.isArray(data.unansweredInquiryList)
    ? data.unansweredInquiryList
    : [],
  notice: data.notice ?? null,
});

export default function DashboardPage() {

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const response = await fetch("http://localhost:8081/api/admin/dashboard");

        if (!response.ok) {
          throw new Error("대시보드 데이터를 불러오지 못했습니다.");
        }

        const data: Partial<DashboardData> = await response.json();

        setDashboard(normalizeDashboard(data));

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchDashboard();

  }, []);

  if (loading) {
    return <div className={styles.loading}>로딩중...</div>;
  }

  if (!dashboard) {
    return <div className={styles.error}>데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>

      {/* TOP */}
      <div className={styles.topSection}>

        <div>

          <h1 className={styles.title}>
            관리자 대시보드
          </h1>

          <p className={styles.subtitle}>
            CookMate 서비스 현황을 한눈에 확인하세요
          </p>

        </div>

        <div className={styles.date}>
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>

      </div>

      {/* MAIN STATS */}

      <div className={styles.mainStats}>

        <div className={`${styles.mainCard} ${styles.green}`}>

          <div className={styles.cardTop}>

            <span className={styles.cardLabel}>
              총 회원 수
            </span>

            <div className={styles.cardIcon}>
              👥
            </div>

          </div>

          <h2 className={styles.mainValue}>
            {dashboard.totalUsers.toLocaleString()}
          </h2>

          <p
            className={
              dashboard.todayUserDiff >= 0
                ? styles.increase
                : styles.decrease
            }
          >
            {dashboard.todayUserDiff >= 0 ? '▲' : '▼'}
            오늘 {Math.abs(dashboard.todayUserDiff)}명
          </p>

        </div>

        <div className={`${styles.mainCard} ${styles.orange}`}>

          <div className={styles.cardTop}>

            <span className={styles.cardLabel}>
              전체 레시피
            </span>

            <div className={styles.cardIcon}>
              🍽️
            </div>

          </div>

          <h2 className={styles.mainValue}>
            {dashboard.totalRecipes.toLocaleString()}
          </h2>

          <p
            className={
              dashboard.todayRecipeDiff >= 0
                ? styles.increase
                : styles.decrease
            }
          >
            {dashboard.todayRecipeDiff >= 0 ? '▲' : '▼'}
            오늘 {Math.abs(dashboard.todayRecipeDiff)}개
          </p>

        </div>

        <div className={`${styles.mainCard} ${styles.red}`}>

          <div className={styles.cardTop}>

            <span className={styles.cardLabel}>
              미처리 신고
            </span>

            <div className={styles.cardIcon}>
              🚨
            </div>

          </div>

          <h2 className={styles.mainValue}>
            {dashboard.pendingReports}
          </h2>

          <p className={styles.warning}>
            ⚠ 즉시 처리 필요
          </p>

        </div>

        <div className={`${styles.mainCard} ${styles.yellow}`}>

          <div className={styles.cardTop}>

            <span className={styles.cardLabel}>
              미답변 문의
            </span>

            <div className={styles.cardIcon}>
              💬
            </div>

          </div>

          <h2 className={styles.mainValue}>
            {dashboard.unansweredInquiries}
          </h2>

          <p className={styles.danger}>
            답변 대기 중
          </p>

        </div>

      </div>

      {/* MINI STATS */}

      <div className={styles.miniStats}>

        <div className={styles.miniCard}>

          <div className={styles.miniIcon}>🌞</div>

          <div>
            <p className={styles.miniLabel}>오늘 로그인한 회원 수</p>

            <h3 className={styles.miniValue}>
              {dashboard.todayVisitors}
            </h3>
          </div>

        </div>

        <div className={styles.miniCard}>

          <div className={styles.miniIcon}>💗</div>

          <div>
            <p className={styles.miniLabel}>오늘 스크랩</p>

            <h3 className={styles.miniValue}>
              {dashboard.todayLikes}
            </h3>
          </div>

        </div>

        <div className={styles.miniCard}>
          
          <div className={styles.miniIcon}>💭</div>

          <div>
            <p className={styles.miniLabel}>오늘 댓글</p>

            <h3 className={styles.miniValue}>
              {dashboard.todayComments}
            </h3>
          </div>

        </div>

        <div className={styles.miniCard}>
          <div className={styles.miniIcon}>🚫</div>

          <div>
            <p className={styles.miniLabel}>이달 제재 회원</p>

            <h3 className={styles.miniValue}>
              {dashboard.monthlyBannedUsers}
            </h3>
          </div>
        </div>

        <div className={styles.miniCard}>
          <div className={styles.miniIcon}>📌</div>
          <div>
            <p className={styles.miniLabel}>활성 공지사항</p>

            <h3 className={styles.miniValue}>
              {dashboard.activeNotices}
            </h3>
          </div>
        </div>
      </div>

      {/* TABLES */}
      <div className={styles.tableGrid}>
        {/* 신고 */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>

            <h3>
              🚨 최근 신고 현황
            </h3>

          </div>

          <table className={styles.table}>

            <thead>
              <tr>
                <th>#</th>
                <th>신고유형</th>
                <th>피신고자</th>
                <th>상태</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.recentReports.length === 0 ? (

                <tr>
                  <td colSpan={3} className={styles.empty}>
                    신고 내역이 없습니다.
                  </td>
                </tr>

              ) : (

                dashboard.recentReports.map((report, index) => (

                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{report.reportType}</td>
                    <td>{report.targetNickname}</td>
                    <td>
                      <span
                        className={
                          report.status === "W"
                            ? styles.pendingStatus
                            : styles.completeStatus
                        }
                      >
                        {report.status === "W"
                          ? "미처리"
                          : "처리완료"}
                      </span>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* 인기 레시피 */}

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>

            <h3>
              🏆 인기 레시피 TOP 5
            </h3>

          </div>

          <table className={styles.table}>

            <thead>
              <tr>
                <th>#</th>
                <th>레시피명</th>
                <th>작성자</th>
                <th>좋아요</th>
              </tr>
            </thead>
            <tbody>

              {dashboard.topRecipes.map((board, index) => (

                <tr key={board.boardNo}>
                  <td>{index + 1}</td>
                  <td className={styles.ellipsis}>
                  {board.title}
                  </td>
                  <td>{board.author}</td>
                  <td>💗{board.likeCount}</td>
                </tr>

              ))}

            </tbody>
          </table>
        </div>

        {/* 문의 */}

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3>
              💬 미답변 문의
            </h3>
          </div>

          <table className={styles.table}>

            <thead>
              <tr>
                <th>#</th>
                <th>제목</th>
                <th>작성자</th>
                <th>날짜</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.unansweredInquiryList.length === 0 ? (

                <tr>
                  <td colSpan={3} className={styles.empty}>
                    미답변 문의가 없습니다.
                  </td>
                </tr>

              ) : (

                dashboard.unansweredInquiryList.map((inquiry, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className={styles.ellipsis}>
                      {inquiry.title}
                    </td>
                    <td>{inquiry.writer}</td>
                    <td>{inquiry.createdAt}</td>
                  </tr>
                ))

              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


