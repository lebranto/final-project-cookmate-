'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";

interface Inquiry {
  inquiryId: number;
  userNo: number;
  title: string;
  content: string;
  typeName: InquiryType;
  writer: string;
  email: string;
  createdAt: string;
  status: InquiryStatus;
  answer?: string | null;
  answerDate?: string | null;
}

interface InquiryResponse {
  inquiryList: Inquiry[];
  totalPages: number;
  totalInquiryCount: number;
  currentPage: number;
}

type InquiryStatus = "Y" | "N";
type InquiryType = "계정" | "레시피" | "기타";

const ITEMS_PER_PAGE = 10;
const PAGE_GROUP_SIZE = 5;
const API_BASE = "http://localhost:8081/api/admin/inquiry";
const INQUIRY_TYPES: InquiryType[] = ["계정", "레시피", "기타"];

export default function InquiryManagePage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const requestIdRef = useRef(0);

  const fetchInquiries = useCallback(async (page: number) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setLoading(true);

      const response = await axios.get<InquiryResponse>(API_BASE, {
        params: {
          page,
          size: ITEMS_PER_PAGE,
          keyword: keyword.trim() || undefined,
          typeName: typeFilter || undefined,
          status: statusFilter || undefined,
        },
        timeout: 8000,
      });

      if (requestId !== requestIdRef.current) return;

      setInquiries(response.data.inquiryList ?? []);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalInquiryCount ?? 0);
      setCurrentPage(response.data.currentPage || page);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      console.error("문의 목록 조회 실패", error);
      setInquiries([]);
      setTotalPages(1);
      setTotalCount(0);
      setCurrentPage(1);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [keyword, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchInquiries(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchInquiries]);

  const visiblePages = useMemo(() => {
    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    return Array.from(
      { length: Math.max(endPage - startPage + 1, 0) },
      (_, index) => startPage + index
    );
  }, [currentPage, totalPages]);

  const startPage = visiblePages[0] ?? 1;
  const endPage = visiblePages[visiblePages.length - 1] ?? 1;
  const isAnswered = (inquiry: Inquiry) => inquiry.status === "Y" && Boolean(inquiry.answer?.trim());
  const pendingCount = inquiries.filter((item) => !isAnswered(item)).length;

  const getCategoryType = (typeName: string) => {
    switch (typeName) {
      case "계정":
        return styles.account;
      case "레시피":
        return styles.recipe;
      default:
        return styles.etc;
    }
  };

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswerContent(inquiry.answer ?? "");
  };

  const closeInquiry = () => {
    setSelectedInquiry(null);
    setAnswerContent("");
  };

  const handleAnswer = async () => {
    if (!selectedInquiry) return;

    const answer = answerContent.trim();

    if (!answer) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.patch(`${API_BASE}/${selectedInquiry.inquiryId}/answer`, { answer }, {
        timeout: 8000,
      });
      alert("문의 답변이 등록되었습니다.");
      closeInquiry();
      await fetchInquiries(currentPage);
    } catch (error) {
      console.error("문의 답변 처리 실패", error);
      alert("답변 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>문의 관리</h1>
            <p className={styles.pageDescription}>회원 문의를 확인하고 답변을 등록하세요.</p>
          </div>

          <div className={styles.pendingBadge}>미답변 {pendingCount}건</div>
        </div>

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="내용, 작성자, 이메일 검색..."
              />
            </div>

            <div className={styles.filters}>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">전체 유형</option>
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">전체 상태</option>
                <option value="N">답변 대기</option>
                <option value="Y">답변 완료</option>
              </select>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>번호</th>
                <th>유형</th>
                <th>제목</th>
                <th>작성자</th>
                <th>문의일</th>
                <th>답변일</th>
                <th>상태</th>
                <th>답변</th>
              </tr>
            </thead>

            <tbody>
              {loading && inquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>로딩 중...</td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>등록된 문의가 없습니다.</td>
                </tr>
              ) : (
                inquiries.map((item) => {
                  const isPending = !isAnswered(item);

                  return (
                    <tr key={item.inquiryId}>
                      <td className={styles.number}>#{item.inquiryId}</td>
                      <td>
                        <span className={`${styles.categoryBadge} ${getCategoryType(item.typeName)}`}>
                          {item.typeName || "기타"}
                        </span>
                      </td>
                      <td className={styles.title}>{item.title || item.content}</td>
                      <td>{item.writer || `#${item.userNo}`}</td>
                      <td>{item.createdAt}</td>
                      <td>{item.answerDate || "-"}</td>
                      <td>
                        <span className={isPending ? styles.pendingStatus : styles.doneStatus}>
                          {isPending ? "답변 대기" : "답변 완료"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={isPending ? styles.answerButton : styles.viewButton}
                          onClick={() => openInquiry(item)}
                        >
                          {isPending ? "답변하기" : "보기"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className={styles.footer}>
            <p className={styles.pageInfo}>
              {totalCount === 0
                ? "총 0건"
                : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} / 총 ${totalCount.toLocaleString()}건`}
            </p>

            <div className={styles.pagination}>
              <button
                disabled={startPage === 1}
                onClick={() => fetchInquiries(Math.max(startPage - PAGE_GROUP_SIZE, 1))}
              >
                {"<"}
              </button>

              {visiblePages.map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? styles.activePage : ""}
                  onClick={() => fetchInquiries(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={endPage === totalPages}
                onClick={() => fetchInquiries(startPage + PAGE_GROUP_SIZE)}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedInquiry && (
        <div className={styles.modalOverlay}>
          <div className={styles.inquiryModal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalMetaLine}>
                  <span>#{selectedInquiry.inquiryId}</span>
                  <span className={`${styles.categoryBadge} ${getCategoryType(selectedInquiry.typeName)}`}>
                    {selectedInquiry.typeName || "기타"}
                  </span>
                </div>
                <h2>{selectedInquiry.title || selectedInquiry.content}</h2>
              </div>
              <button className={styles.closeButton} onClick={closeInquiry}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div>
                  <span>작성자</span>
                  <strong>{selectedInquiry.writer || `#${selectedInquiry.userNo}`}</strong>
                </div>
                <div>
                  <span>문의일</span>
                  <strong>{selectedInquiry.createdAt}</strong>
                </div>
                <div>
                  <span>이메일</span>
                  <strong>{selectedInquiry.email || "-"}</strong>
                </div>
              </div>

              <section className={styles.modalSection}>
                <h3>문의 내용</h3>
                <div className={styles.questionBox}>{selectedInquiry.content}</div>
              </section>

              {isAnswered(selectedInquiry) ? (
                <section className={styles.modalSection}>
                  <h3>답변 내역</h3>
                  <div className={styles.answerDoneBox}>
                    <div className={styles.answerDoneHeader}>
                      <strong>관리자 답변</strong>
                      <span>{selectedInquiry.answerDate || "-"}</span>
                    </div>
                    <p>{selectedInquiry.answer || "등록된 답변 내용이 없습니다."}</p>
                  </div>
                </section>
              ) : (
                <section className={styles.modalSection}>
                  <h3>답변 작성</h3>
                  <textarea
                    value={answerContent}
                    onChange={(event) => setAnswerContent(event.target.value)}
                    maxLength={1000}
                    placeholder="답변 내용을 입력하세요."
                  />
                  <div className={styles.answerHelper}>
                    <span>정중하고 명확하게 답변해주세요.</span>
                    <span>{answerContent.length} / 1000</span>
                  </div>
                </section>
              )}
            </div>

            <div className={styles.modalFooter}>
              <span>{isAnswered(selectedInquiry) ? "답변 완료" : "답변 대기 중"}</span>
              <div>
                <button className={styles.cancelButton} onClick={closeInquiry}>취소</button>
                {!isAnswered(selectedInquiry) && (
                  <button className={styles.submitButton} onClick={handleAnswer} disabled={submitting}>
                    {submitting ? "등록 중..." : "답변 등록"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
