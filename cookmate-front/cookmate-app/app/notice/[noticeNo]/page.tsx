"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import styles from "./noticeDetail.module.css";

type Notice = {
  noticeNo: number;
  noticeTitle: string;
  noticeContent?: string;
  noticeModifiedDate?: string;
  startDate?: string;
  endDate?: string | null;
  typeName?: string;
  progressStatus?: "진행전" | "진행중" | "종료";
};

type NoticeDetailResponse = {
  notice: Notice;
  previousNotice?: Notice | null;
  nextNotice?: Notice | null;
};

function getTypeClassName(typeName?: string) {
  switch (typeName) {
    case "중요":
      return styles.important;
    case "안내":
      return styles.info;
    case "점검":
      return styles.maintenance;
    case "업데이트":
      return styles.update;
    case "이벤트":
      return styles.event;
    default:
      return "";
  }
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10).replaceAll("-", ".");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function formatPeriod(startDate?: string, endDate?: string | null) {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "";

  if (start && end) {
    return `${start} ~ ${end}`;
  }

  if (start) {
    return `${start} ~`;
  }

  if (end) {
    return `~ ${end}`;
  }

  return "";
}

function AdjacentRow({ label, notice }: { label: string; notice?: Notice | null }) {
  if (!notice) {
    return (
      <div className={styles.adjacentRow}>
        <span className={styles.adjacentLabel}>{label}</span>
        <span className={styles.emptyText}>글이 없습니다.</span>
      </div>
    );
  }

  return (
    <Link className={styles.adjacentRow} href={`/notice/${notice.noticeNo}`}>
      <span className={styles.adjacentLabel}>{label}</span>
      <span className={styles.adjacentTitle}>{notice.noticeTitle}</span>
      <time dateTime={notice.noticeModifiedDate}>{formatDate(notice.noticeModifiedDate)}</time>
    </Link>
  );
}

export default function NoticeDetailPage() {
  const params = useParams<{ noticeNo: string }>();
  const [data, setData] = useState<NoticeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchNotice = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get<NoticeDetailResponse>(`/notice/${params.noticeNo}`);

        if (!ignore) {
          setData(response.data);
        }
      } catch (error) {
        console.error("공지사항 상세 조회 실패:", error);

        if (!ignore) {
          setData(null);
          setErrorMessage("공지사항을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (params.noticeNo) {
      void fetchNotice();
    }

    return () => {
      ignore = true;
    };
  }, [params.noticeNo]);

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.inner}>
          <div className={styles.state}>공지사항을 불러오는 중입니다.</div>
        </section>
      </main>
    );
  }

  if (errorMessage || !data?.notice) {
    return (
      <main className={styles.page}>
        <section className={styles.inner}>
          <Link className={styles.backLink} href="/notice">
            ← 공지사항 목록으로
          </Link>
          <div className={styles.state}>{errorMessage || "공지사항을 찾을 수 없습니다."}</div>
        </section>
      </main>
    );
  }

  const { notice, previousNotice, nextNotice } = data;
  const status = notice.progressStatus ?? "진행중";
  const period = formatPeriod(notice.startDate, notice.endDate);

  return (
    <main className={styles.page}>
      <section className={styles.inner}>
        <Link className={styles.backLink} href="/notice">
          ← 공지사항 목록으로
        </Link>

        <article className={styles.detailCard}>
          <header className={styles.detailHeader}>
            <div className={styles.badges}>
              {notice.typeName && (
                <span className={`${styles.typeBadge} ${getTypeClassName(notice.typeName)}`}>
                  {notice.typeName}
                </span>
              )}
              <span
                className={`${styles.statusBadge} ${
                  status === "종료" ? styles.closed : status === "진행전" ? styles.upcoming : styles.open
                }`}
              >
                {status}
              </span>
            </div>

            <time dateTime={notice.noticeModifiedDate}>{formatDate(notice.noticeModifiedDate)}</time>
            <div className={styles.titleLine}>
              <h1>{notice.noticeTitle}</h1>
              {period && <span className={styles.periodText}>{period}</span>}
            </div>
          </header>

          <div className={styles.content}>{notice.noticeContent}</div>

          <footer className={styles.cardFooter}>
            <Link className={styles.listButton} href="/notice">
              ← 목록으로
            </Link>
          </footer>
        </article>

        <nav className={styles.adjacentNav} aria-label="이전글 다음글">
          <AdjacentRow label="이전" notice={previousNotice} />
          <AdjacentRow label="다음" notice={nextNotice} />
        </nav>
      </section>
    </main>
  );
}
