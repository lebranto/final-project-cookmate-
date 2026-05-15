'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import styles from './page.module.css';

interface Report {
  reportId: number;
  reportType: string;
  targetId: string;
  targetNickname?: string | null;
  reporterNickname?: string | null;
  reason: string;
  status: string;
  createdAt: string;
}

interface ReportDetail {
  reportId: number;
  reportType: string;
  reporterNo: number;
  reporterNickname: string | null;
  reporterEmail: string | null;
  reporteeNo: number;
  reporteeNickname: string | null;
  reporteeEmail: string | null;
  reporteeWarning: number;
  reason: string;
  status: string;
  createdAt: string;
  targetKind: 'BOARD' | 'COMMENT' | string | null;
  targetContentId: number | null;
  targetTitle: string | null;
  targetContent: string | null;
  processAction: string | null;
}

interface ReportResponse {
  reportList: Report[];
  totalPages: number;
  totalReportCount: number;
  totalUnansweredReportCount: number;
  currentPage: number;
}

type ProcessAction = 'HIDE' | 'DELETE' | 'WARN' | 'REJECT';

const ITEMS_PER_PAGE = 10;
const PAGE_GROUP_SIZE = 5;

const ACTION_LABELS: Record<ProcessAction, string> = {
  HIDE: '게시물 숨김',
  DELETE: '게시물 삭제',
  WARN: '작성자 경고',
  REJECT: '반려',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReportCount, setTotalCount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ProcessAction>('HIDE');
  const [processReason, setProcessReason] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [orderBy, setOrderBy] = useState('latest');

  const requestIdRef   = useRef(0);
  const currentPageRef = useRef(1);

  // ── fetchReports: 필터값을 직접 인자로 받아 타이밍 문제 없음 ──
  const fetchReports = async (
    page: number,
    keyword = searchKeyword,
    status  = statusFilter,
    type    = typeFilter,
    order   = orderBy,
  ) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const { data } = await axios.get<ReportResponse>(
        'http://localhost:8081/api/admin/reports',
        {
          params: {
            page,
            size:    ITEMS_PER_PAGE,
            keyword: keyword.trim() || undefined,
            status:  status || undefined,
            reportType:    type   || undefined,
            orderBy: order,
          },
          timeout: 8000,
        }
      );

      if (requestId !== requestIdRef.current) return;

      setReports(data.reportList || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalReportCount || 0);
      setTotalPendingCount(data.totalUnansweredReportCount || 0);
      setCurrentPage(data.currentPage || page);
      currentPageRef.current = data.currentPage || page;

    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('신고 목록 조회 실패', error);
      setReports([]);
      setTotalPages(1);
      setTotalCount(0);
      setCurrentPage(1);
      currentPageRef.current = 1;

    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  // ── 최초 마운트 1회 ──
  useEffect(() => {
    fetchReports(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 필터 변경 시 현재 state를 명시적으로 넘겨 1페이지 재조회 ──
  useEffect(() => {
    fetchReports(1, searchKeyword, statusFilter, typeFilter, orderBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, statusFilter, typeFilter, orderBy]);

  // ── bfcache 복원 ──
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setLoading(false);
        fetchReports(currentPageRef.current);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (reportId: number) => {
    setDetailLoading(true);
    setSelectedReport(null);
    setSelectedAction('HIDE');
    setProcessReason('');

    try {
      const { data } = await axios.get<ReportDetail>(`http://localhost:8081/api/admin/reports/${reportId}`);
      setSelectedReport(data);
      if (convertStatus(data.status) === '완료' || convertStatus(data.status) === '반려') {
        setSelectedAction('REJECT');
      }
    } catch (error) {
      console.error('신고 상세 조회 실패', error);
      alert('신고 상세 조회 중 오류가 발생했습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedReport(null);
    setDetailLoading(false);
    setSelectedAction('HIDE');
    setProcessReason('');
  };

  const handleProcess = async () => {
    if (!selectedReport) return;

    if ((selectedAction === 'HIDE' || selectedAction === 'DELETE') && !selectedReport.targetContentId) {
      alert('처리할 게시물 또는 댓글 정보를 찾을 수 없습니다.');
      return;
    }

    if (!processReason.trim()) {
      alert('처리 사유를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.patch(`http://localhost:8081/api/admin/reports/${selectedReport.reportId}/process`, {
        action: selectedAction,
        reason: processReason,
        targetKind: selectedReport.targetKind,
        targetContentId: selectedReport.targetContentId,
      });

      alert('신고 처리가 완료되었습니다.');
      await fetchReports(currentPageRef.current, searchKeyword, statusFilter, typeFilter, orderBy);
      await openDetail(selectedReport.reportId);
    } catch (error) {
      console.error('신고 처리 실패', error);
      alert('신고 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const convertStatus = (status: string | null | undefined) => {
    switch (status) {
      case 'W': return '대기';
      case 'C': return '완료';
      case 'R': return '반려';
      default:  return status || '-';
    }
  };

  const statusClass = (status: string) => {
    const statusText = convertStatus(status);
    if (statusText === '대기')   return styles.waiting;
    if (statusText === '반려')   return styles.rejected;
    return styles.complete;
  };

  const getTypeBadge = (type: string) => {
    if (type.includes('레시피'))                        return styles.recipeBadge;
    if (type.includes('스팸'))                         return styles.spamBadge;
    if (type.includes('저작권'))                       return styles.copyrightBadge;
    if (type.includes('욕설') || type.includes('혐오')) return styles.abuseBadge;
    return styles.falseBadge;
  };

  // ── 페이지 그룹 계산 ──
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
  const startPage    = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage      = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: Math.max(endPage - startPage + 1, 0) },
    (_, i) => startPage + i
  );

  const selectedStatus = selectedReport ? convertStatus(selectedReport.status) : '-';
  const canProcess     = selectedReport && selectedStatus !== '완료' && selectedStatus !== '반려';

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div>
          <h1 className={styles.title}>신고 관리</h1>
          <p className={styles.subtitle}>사용자 신고 내역을 검토하고 처리하세요</p>
        </div>
        <div className={styles.pendingBox}>미처리 {totalPendingCount}건</div>
      </div>

      <div className={styles.warningBanner}>신고 내역을 신속하게 검토해주세요.</div>

      <div className={styles.card}>
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="신고 내용, 신고자, 피신고자 검색..."
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <select className={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">전체 유형</option>
            <option value="욕설/혐오">욕설/혐오</option>
            <option value="스팸">스팸</option>
            <option value="저작권">저작권</option>
          </select>

          <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">전체 상태</option>
            <option value="W">대기</option>
            <option value="C">완료</option>
            <option value="R">반려</option>
          </select>

          <select className={styles.select} value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>번호</th>
              <th>신고유형</th>
              <th>내용</th>
              <th>신고자</th>
              <th>피신고자</th>
              <th>신고일</th>
              <th>상태</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>로딩중...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>신고 내역이 없습니다.</td>
              </tr>
            ) : (
              reports.map((report) => {
                const statusText = convertStatus(report.status);
                return (
                  <tr key={report.reportId}>
                    <td className={styles.number}>#{report.reportId}</td>
                    <td><span className={getTypeBadge(report.reportType)}>{report.reportType}</span></td>
                    <td>{report.reason}</td>
                    <td>{report.reporterNickname}</td>
                    <td className={styles.target}>{report.targetNickname || report.targetId}</td>
                    <td>{report.createdAt}</td>
                    <td><span className={statusClass(report.status)}>{statusText}</span></td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button className={styles.detailBtn} onClick={() => openDetail(report.reportId)}>
                          상세
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className={styles.footer}>
          <div className={styles.pageInfo}>
            {totalReportCount === 0
              ? '0 / 총 0건'
              : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  totalReportCount
                )} / 총 ${totalReportCount.toLocaleString()}건`}
          </div>

          <div className={styles.pagination}>
            <button
              disabled={startPage === 1}
              onClick={() => fetchReports(Math.max(startPage - PAGE_GROUP_SIZE, 1), searchKeyword, statusFilter, typeFilter, orderBy)}
            >
              &lsaquo;
            </button>
            {visiblePages.map((page) => (
              <button
                key={page}
                className={currentPage === page ? styles.activePage : ''}
                onClick={() => fetchReports(page, searchKeyword, statusFilter, typeFilter, orderBy)}
              >
                {page}
              </button>
            ))}
            <button
              disabled={endPage >= totalPages}
              onClick={() => fetchReports(startPage + PAGE_GROUP_SIZE, searchKeyword, statusFilter, typeFilter, orderBy)}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {(detailLoading || selectedReport) && (
        <div className={styles.overlay} onClick={closeDetail}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {detailLoading || !selectedReport ? (
              <div className={styles.modalLoading}>신고 상세를 불러오는 중...</div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div>
                    <div className={styles.modalMeta}>
                      <span>#{selectedReport.reportId}</span>
                      <span className={getTypeBadge(selectedReport.reportType)}>{selectedReport.reportType}</span>
                    </div>
                    <h2 className={styles.modalTitle}>{selectedReport.targetTitle || selectedReport.reason}</h2>
                  </div>
                  <button className={styles.closeBtn} onClick={closeDetail}>×</button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.infoGrid}>
                    <div>
                      <span>신고자</span>
                      <strong>{selectedReport.reporterNickname || `#${selectedReport.reporterNo}`}</strong>
                    </div>
                    <div>
                      <span>피신고자</span>
                      <strong className={styles.dangerText}>
                        {selectedReport.reporteeNickname || `#${selectedReport.reporteeNo}`}
                      </strong>
                    </div>
                    <div>
                      <span>신고일시</span>
                      <strong>{selectedReport.createdAt}</strong>
                    </div>
                    <div>
                      <span>누적 신고</span>
                      <strong>{selectedReport.reporteeWarning}회</strong>
                    </div>
                  </div>

                  <section className={styles.detailSection}>
                    <h3>신고된 게시물</h3>
                    <div className={styles.contentBox}>
                      <p className={styles.contentTitle}>
                        {selectedReport.targetKind === 'COMMENT' ? '댓글' : '게시글'} #{selectedReport.targetContentId || '-'}
                        {selectedReport.targetTitle ? ` · ${selectedReport.targetTitle}` : ''}
                      </p>
                      <pre>{selectedReport.targetContent || '신고 대상 내용을 찾을 수 없습니다.'}</pre>
                    </div>
                  </section>

                  <section className={styles.detailSection}>
                    <h3>신고 사유</h3>
                    <div className={styles.reasonBox}>{selectedReport.reason}</div>
                  </section>

                  {canProcess ? (
                    <section className={styles.detailSection}>
                      <h3>처리 작업</h3>
                      <div className={styles.actionCards}>
                        {(Object.keys(ACTION_LABELS) as ProcessAction[]).map((action) => (
                          <button
                            key={action}
                            className={`${styles.actionCard} ${selectedAction === action ? styles.actionCardActive : ''}`}
                            onClick={() => setSelectedAction(action)}
                          >
                            {ACTION_LABELS[action]}
                          </button>
                        ))}
                      </div>
                      <textarea
                        className={styles.processTextarea}
                        placeholder="처리 사유 또는 메모를 입력하세요"
                        value={processReason}
                        onChange={(e) => setProcessReason(e.target.value)}
                      />
                    </section>
                  ) : (
                    <section className={styles.detailSection}>
                      <h3>처리 결과</h3>
                      <div className={styles.resultBox}>
                        <strong>{selectedReport.processAction || selectedStatus}</strong>
                        <p>이미 처리된 신고입니다.</p>
                      </div>
                    </section>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <span>{canProcess ? '처리 대기 중' : '처리 완료'}</span>
                  <div className={styles.modalActions}>
                    <button className={styles.closeFooterBtn} onClick={closeDetail}>닫기</button>
                    {canProcess && (
                      <button className={styles.submitBtn} onClick={handleProcess} disabled={submitting}>
                        {submitting ? '처리 중...' : '처리 완료'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}