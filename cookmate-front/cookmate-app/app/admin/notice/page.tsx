'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";

interface Notice {
  noticeId: number;
  userNo?: number;
  title: string;
  content: string;
  typeName: NoticeType;
  startDate: string;
  endDate: string | null;
  modifiedDate?: string;
  status: NoticeStatus;
}

interface NoticeResponse {
  noticeList: Notice[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

type NoticeStatus = "Y" | "N";
type NoticeType = "중요" | "안내" | "점검" | "업데이트" | "이벤트";
type ViewMode = "list" | "create" | "edit";

const ITEMS_PER_PAGE = 10;
const PAGE_GROUP_SIZE = 5;
const API_BASE = "http://localhost:8081/api/admin/notice";

const NOTICE_TYPES: NoticeType[] = ["중요", "안내", "점검", "업데이트", "이벤트"];

const EMPTY_FORM: Omit<Notice, "noticeId"> = {
  title: "",
  content: "",
  typeName: "중요",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  status: "Y",
};

export default function NoticePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState<Omit<Notice, "noticeId">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const requestIdRef = useRef(0);

  const fetchNotices = useCallback(async (page: number) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setLoading(true);
      const response = await axios.get<NoticeResponse>(API_BASE, {
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

      setNotices(response.data.noticeList ?? []);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalCount ?? 0);
      setCurrentPage(response.data.currentPage || page);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      console.error("공지사항 목록 조회 실패", error);
      setNotices([]);
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
    if (viewMode !== "list") return;

    const timer = window.setTimeout(() => {
      fetchNotices(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchNotices, viewMode]);

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

  const getNoticeIcon = (typeName: string) => {
    switch (typeName) {
      case "점검":
        return "🔧";
      case "이벤트":
        return "🎉";
      case "안내":
        return "📢";
      case "업데이트":
        return "📝";
      default:
        return "📌";
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setViewMode("create");
  };

  const openEdit = (notice: Notice) => {
    setForm({
      userNo: notice.userNo,
      title: notice.title,
      content: notice.content,
      typeName: notice.typeName || "중요",
      startDate: notice.startDate || new Date().toISOString().slice(0, 10),
      endDate: notice.endDate || "",
      status: notice.status || "Y",
    });
    setEditingId(notice.noticeId);
    setViewMode("edit");
  };

  const closeForm = () => {
    setViewMode("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("공지 제목을 입력해주세요.");
      return;
    }
    if (!form.content.trim()) {
      alert("공지 내용을 입력해주세요.");
      return;
    }
    if (form.endDate && form.startDate > form.endDate) {
      alert("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        endDate: form.endDate || null,
      };

      if (viewMode === "edit" && editingId !== null) {
        await axios.put(`${API_BASE}/${editingId}`, payload, { timeout: 8000 });
        alert("공지사항이 수정되었습니다.");
      } else {
        await axios.post(API_BASE, payload, { timeout: 8000 });
        alert("공지사항이 작성되었습니다.");
      }

      closeForm();
      await fetchNotices(currentPage);
    } catch (error) {
      console.error("공지사항 저장 실패", error);
      alert("공지사항 저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);

    try {
      await axios.patch(`${API_BASE}/${deleteTarget.noticeId}/delete`, undefined, {
        timeout: 8000,
      });
      setDeleteTarget(null);
      alert("공지사항이 삭제되었습니다.");
      if (viewMode !== "list") {
        closeForm();
      }
      await fetchNotices(currentPage);
    } catch (error) {
      console.error("공지사항 삭제 실패", error);
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (viewMode !== "list") {
    const title = viewMode === "edit" ? "공지사항 수정" : "새 공지사항 작성";
    const description = viewMode === "edit" ? "기존 공지 내용을 수정합니다" : "사용자에게 안내할 공지를 작성합니다";
    const editingNotice = editingId !== null
      ? notices.find((notice) => notice.noticeId === editingId) ?? null
      : null;

    return (
      <main className={styles.container}>
        <section className={styles.formContent}>
          <div className={styles.formHeaderRow}>
            <div>
              <p className={styles.breadcrumb}>공지사항 &rsaquo; {viewMode === "edit" ? "공지 수정" : "새 공지 작성"}</p>
              <h1 className={styles.formTitle}>{title}</h1>
              <p className={styles.pageDescription}>{description}</p>
            </div>
            {editingNotice && (
              <button
                type="button"
                className={styles.topDeleteButton}
                onClick={() => setDeleteTarget(editingNotice)}
              >
                삭제
              </button>
            )}
          </div>

          <form className={styles.noticeForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <label>유형 <span>*</span></label>
              <div className={styles.radioGroup}>
                {NOTICE_TYPES.map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="typeName"
                      value={type}
                      checked={form.typeName === type}
                      onChange={() => setForm((prev) => ({ ...prev, typeName: type }))}
                    />
                    {getNoticeIcon(type)} {type}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formRow}>
              <label>제목 <span>*</span></label>
              <input
                value={form.title}
                maxLength={100}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="공지 제목을 입력하세요"
              />
              <p className={styles.helperText}>{form.title.length} / 100자</p>
            </div>

            <div className={styles.formRow}>
              <label>내용 <span>*</span></label>
              <textarea
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="공지 내용을 입력하세요."
                rows={10}
              />
            </div>

            <div className={styles.formRow}>
              <label>게시 기간</label>
              <div className={styles.dateGroup}>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => {
                    const nextStartDate = event.target.value;

                    setForm((prev) => ({
                      ...prev,
                      startDate: nextStartDate,
                      endDate: prev.endDate && prev.endDate < nextStartDate ? nextStartDate : prev.endDate,
                    }));
                  }}
                />
                <span>-</span>
                <input
                  type="date"
                  min={form.startDate}
                  value={form.endDate ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                />
                <label className={styles.inlineCheck}>
                  <input
                    type="checkbox"
                    checked={!form.endDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.checked ? "" : prev.startDate }))}
                  />
                  종료일 없음
                </label>
              </div>
            </div>

            <div className={styles.formRow}>
              <label>상태</label>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Y"
                    checked={form.status === "Y"}
                    onChange={() => setForm((prev) => ({ ...prev, status: "Y" }))}
                  />
                  게시중
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="N"
                    checked={form.status === "N"}
                    onChange={() => setForm((prev) => ({ ...prev, status: "N" }))}
                  />
                  종료
                </label>
              </div>
            </div>

            <div className={styles.previewBox}>
              <span>{getNoticeIcon(form.typeName)}</span>
              <div>
                <strong>{form.title || "제목 미리보기"}</strong>
                <p>CookMate 공지사항</p>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={closeForm}>
                취소
              </button>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                {submitting ? "저장중..." : viewMode === "edit" ? "변경사항 저장" : "게시하기"}
              </button>
            </div>
          </form>
        </section>

        {deleteTarget && (
          <div className={styles.modalOverlay}>
            <div className={styles.deleteModal}>
              <div className={styles.modalIcon}>🗑</div>
              <h2>공지사항을 삭제할까요?</h2>
              <p>삭제된 공지사항은 목록에서 노출되지 않습니다.</p>
              <div className={styles.deleteSummary}>
                <span>번호 #{deleteTarget.noticeId}</span>
                <strong>{deleteTarget.title}</strong>
              </div>
              <p className={styles.warningText}>이 작업은 되돌릴 수 없습니다.</p>
              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={() => setDeleteTarget(null)}>
                  취소
                </button>
                <button className={styles.deleteConfirmButton} onClick={handleDelete} disabled={submitting}>
                  {submitting ? "삭제중..." : "삭제"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>공지사항 관리</h1>
            <p className={styles.pageDescription}>사용자에게 공지사항을 게시하고 관리하세요</p>
          </div>
          <button className={styles.createButton} onClick={openCreate}>
            + 공지 작성
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔎</span>
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="공지 제목으로 검색..."
              />
            </div>

            <div className={styles.filters}>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">전체 유형</option>
                {NOTICE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">전체 상태</option>
                <option value="Y">게시중</option>
                <option value="N">종료</option>
              </select>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>번호</th>
                <th>유형</th>
                <th>제목</th>
                <th>게시일</th>
                <th>종료일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && notices.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>로딩중...</td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>등록된 공지사항이 없습니다.</td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.noticeId}>
                    <td className={styles.number}>#{notice.noticeId}</td>
                    <td className={styles.icon}>{getNoticeIcon(notice.typeName)}</td>
                    <td className={styles.title}>{notice.title}</td>
                    <td>{notice.startDate || "-"}</td>
                    <td>{notice.endDate || "-"}</td>
                    <td>
                      <span className={notice.status === "Y" ? styles.activeBadge : styles.endBadge}>
                        {notice.status === "Y" ? "게시중" : "종료"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.editButton} onClick={() => openEdit(notice)}>
                          수정
                        </button>
                        <button className={styles.deleteButton} onClick={() => setDeleteTarget(notice)}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={styles.footer}>
            <p className={styles.totalText}>
              {totalCount === 0
                ? "총 0건"
                : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} / 총 ${totalCount.toLocaleString()}건`}
            </p>

            <div className={styles.pagination}>
              <button
                disabled={startPage === 1}
                onClick={() => fetchNotices(Math.max(startPage - PAGE_GROUP_SIZE, 1))}
              >
                {"<"}
              </button>

              {visiblePages.map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? styles.activePage : ""}
                  onClick={() => fetchNotices(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={endPage === totalPages}
                onClick={() => fetchNotices(startPage + PAGE_GROUP_SIZE)}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.modalIcon}>🗑</div>
            <h2>공지사항을 삭제할까요?</h2>
            <p>삭제된 공지사항은 목록에서 노출되지 않습니다.</p>
            <div className={styles.deleteSummary}>
              <span>번호 #{deleteTarget.noticeId}</span>
              <strong>{deleteTarget.title}</strong>
            </div>
            <p className={styles.warningText}>이 작업은 되돌릴 수 없습니다.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setDeleteTarget(null)}>
                취소
              </button>
              <button className={styles.deleteConfirmButton} onClick={handleDelete} disabled={submitting}>
                {submitting ? "삭제중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
