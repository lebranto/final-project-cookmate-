"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import styles from "./notice.module.css";

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

type NoticePageResponse = {
  notices: Notice[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

const PAGE_SIZE = 10;
const PAGE_BLOCK_SIZE = 10;
const TYPE_OPTIONS = ["중요", "안내", "점검", "업데이트", "이벤트"];
const STATUS_OPTIONS = ["진행전", "진행중", "종료"];

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

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [typeName, setTypeName] = useState("");
  const [progressStatus, setProgressStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchNotices = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get<NoticePageResponse>("/notice", {
          params: {
            page,
            size: PAGE_SIZE,
            keyword,
            typeName,
            progressStatus,
          },
        });

        if (ignore) {
          return;
        }

        setNotices(response.data.notices ?? []);
        setTotalPages(response.data.totalPages ?? 0);
        setTotalCount(response.data.totalCount ?? 0);
      } catch (error) {
        console.error("공지사항 목록 조회 실패:", error);

        if (!ignore) {
          setNotices([]);
          setTotalPages(0);
          setTotalCount(0);
          setErrorMessage("공지사항을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchNotices();

    return () => {
      ignore = true;
    };
  }, [keyword, page, progressStatus, typeName]);

  const pageNumbers = useMemo(() => {
    const currentBlock = Math.floor((page - 1) / PAGE_BLOCK_SIZE);
    const start = currentBlock * PAGE_BLOCK_SIZE + 1;
    const end = Math.min(start + PAGE_BLOCK_SIZE - 1, totalPages);

    return Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index);
  }, [page, totalPages]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchText.trim());
    setPage(1);
  };

  const movePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <main className={styles.page}>
      <section className={styles.inner} aria-label="공지사항">
        <div className={styles.header}>
          <div>
            <h1>공지사항</h1>
            <p>CookMate의 새로운 소식과 업데이트를 알려드립니다.</p>
          </div>

          <form className={styles.filters} onSubmit={handleSearch}>
            <label className={styles.selectWrap}>
              <span className={styles.srOnly}>공지 유형</span>
              <select
                value={typeName}
                onChange={(event) => {
                  setTypeName(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">전체 유형</option>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.selectWrap}>
              <span className={styles.srOnly}>진행 상태</span>
              <select
                value={progressStatus}
                onChange={(event) => {
                  setProgressStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">전체 상태</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.searchForm}>
              <span className={styles.srOnly}>공지사항 검색어</span>
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="제목, 내용 검색"
              />
              <button type="submit" aria-label="검색">
                검색
              </button>
            </label>
          </form>
        </div>

        <div className={styles.noticeCard}>
          <div className={styles.cardHead}>
            <div className={styles.cardHeadTitle}>
              <span>공지 목록</span>
              <strong>{totalCount}</strong>
            </div>
            <div className={styles.cardHeadMeta}>
              <span>진행 상태</span>
              <span>게시 날짜</span>
            </div>
          </div>

          <div className={styles.list} aria-busy={loading}>
            {loading && <div className={styles.state}>공지사항을 불러오는 중입니다.</div>}

            {!loading && errorMessage && <div className={styles.state}>{errorMessage}</div>}

            {!loading && !errorMessage && notices.length === 0 && (
              <div className={styles.state}>
                {keyword || typeName || progressStatus ? "검색 결과가 없습니다." : "등록된 공지사항이 없습니다."}
              </div>
            )}

            {!loading &&
              !errorMessage &&
              notices.map((notice) => {
                const status = notice.progressStatus ?? "진행중";

                return (
                  <article key={notice.noticeNo} className={styles.noticeRow}>
                    <div className={styles.noticeMain}>
                      {notice.typeName && (
                        <span className={`${styles.typeName} ${getTypeClassName(notice.typeName)}`}>
                          {notice.typeName}
                        </span>
                      )}
                      <h2>
                        <Link className={styles.noticeTitleLink} href={`/notice/${notice.noticeNo}`}>
                          {notice.noticeTitle}
                        </Link>
                      </h2>
                    </div>

                    <div className={styles.noticeMeta}>
                      <span
                        className={`${styles.statusBadge} ${
                          status === "종료" ? styles.closed : status === "진행전" ? styles.upcoming : styles.open
                        }`}
                      >
                        {status}
                      </span>
                      <div className={styles.dateBox}>
                        <time dateTime={notice.noticeModifiedDate}>{formatDate(notice.noticeModifiedDate)}</time>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>

        {totalCount > 0 && (
          <nav className={styles.pagination} aria-label="공지사항 페이지">
            <button
              type="button"
              className={styles.arrow}
              onClick={() => movePage(page - 1)}
              disabled={page <= 1}
              aria-label="이전 페이지"
            >
              ‹
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={`${styles.pageButton} ${pageNumber === page ? styles.active : ""}`}
                onClick={() => movePage(pageNumber)}
                aria-current={pageNumber === page ? "page" : undefined}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              className={styles.arrow}
              onClick={() => movePage(page + 1)}
              disabled={page >= totalPages}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
