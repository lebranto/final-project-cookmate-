'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import styles from './page.module.css';
import UserAvatar from '@/app/components/UserAvatar';

// ── 타입 ──────────────────────────────────────────────
interface UserDetail {
  userId: number;
  profileImageUrl: string | null;
  nickname: string;
  email: string;
  enrollDate: string;
  lastLogin: string | null;
  role: string | null;
  status: string;
  withdraw?: string;

  reportCount: number;
  boardCount: number;
  commentCount: number;
  scrapCount: number;
}

interface BoardItem {
  boardId: number;
  title: string;
  likeCount: number;
  createdAt: string;
  status : string;
}

interface CommentItem {
  commentId: number;
  content: string;
  createdAt: string;
  status : string;
}

interface ReportItem {
  reportId: number;
  reportType: string;
  reason: string;
  state: string;
  createdAt: string;
}

interface BanHistoryItem {
  banId: number;
  userNo: number;
  reason: string;
  banType: string;
  banStart: string;
  banEnd: string | null;
  banActice?: string;
  banActive?: string;
}

interface PageResponse<T> {
  content?: T[];
  list?: T[];
  totalPages?: number;
  totalElements?: number;
  totalCount?: number;
  number?: number; // 현재 페이지 (0-based)
  currentPage?: number;
}

type Tab   = 'board' | 'comment' | 'report' | 'log';
type Modal = 'none' | 'suspend' | 'withdraw';

const PAGE_SIZE = 10;
const GROUP_SIZE = 5; // 페이지 번호 그룹 크기

const getPageItems = <T,>(data: PageResponse<T>) => data.content ?? data.list ?? [];
const getPageTotal = <T,>(data: PageResponse<T>) =>
  data.totalPages ?? Math.ceil((data.totalCount ?? data.totalElements ?? 0) / PAGE_SIZE);

// ── 컴포넌트 ──────────────────────────────────────────
export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);

  const [user,     setUser]    = useState<UserDetail | null>(null);
  const [loading,  setLoading] = useState(true);
  const [modal,    setModal]   = useState<Modal>('none');

  // 탭
  const [tab, setTab] = useState<Tab>('board');

  // 탭별 데이터
  const [boards,   setBoards]   = useState<BoardItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [reports,  setReports]  = useState<ReportItem[]>([]);
  const [logs,     setLogs]     = useState<BanHistoryItem[]>([]);

  // 탭별 페이지 (0-based)
  const [boardPage,   setBoardPage]   = useState(0);
  const [commentPage, setCommentPage] = useState(0);
  const [reportPage,  setReportPage]  = useState(0);
  const [logPage,     setLogPage]     = useState(0);

  // 탭별 전체 페이지 수
  const [boardTotal,   setBoardTotal]   = useState(0);
  const [commentTotal, setCommentTotal] = useState(0);
  const [reportTotal,  setReportTotal]  = useState(0);
  const [logTotal,     setLogTotal]     = useState(0);

  const [tabLoading, setTabLoading] = useState(false);

  // 정지 폼
  const [suspendDays,       setSuspendDays]       = useState('7');
  const [suspendReason,     setSuspendReason]     = useState('');
  // 탈퇴 폼
  const [withdrawReason,    setWithdrawReason]    = useState('');
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);
  const [submitting,        setSubmitting]        = useState(false);
  const [reloadKey,         setReloadKey]         = useState(0);

  // ── 회원 기본 정보 ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get<UserDetail>(
          `http://localhost:8081/api/admin/users/${userId}`
        );
        setUser(data);
      } catch (e) {
        console.error('회원 상세 조회 실패', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // ── 탭별 데이터 로드 ──────────────────────────────────
  useEffect(() => {
    const loadTab = async () => {
      setTabLoading(true);
      try {
        if (tab === 'board') {
          //setBoardPage(0);
          const { data } = await axios.get<PageResponse<BoardItem>>(
            `http://localhost:8081/api/admin/users/${userId}/boards`,
            { params: { page: boardPage + 1 , size: PAGE_SIZE } }
          );
          setBoards(getPageItems(data));
          setBoardTotal(getPageTotal(data));
        }
        if (tab === 'comment') {
          const { data } = await axios.get<PageResponse<CommentItem>>(
            `http://localhost:8081/api/admin/users/${userId}/comments`,
            { params: { page: commentPage + 1, size: PAGE_SIZE } }
          );
          setComments(getPageItems(data));
          setCommentTotal(getPageTotal(data));
        }
        if (tab === 'report') {
          const { data } = await axios.get<PageResponse<ReportItem>>(
            `http://localhost:8081/api/admin/users/${userId}/reports`,
            { params: { page: reportPage + 1, size: PAGE_SIZE } }
          );
          setReports(getPageItems(data));
          setReportTotal(getPageTotal(data));
        }
        if (tab === 'log') {
          const { data } = await axios.get<PageResponse<BanHistoryItem>>(
            `http://localhost:8081/api/admin/users/${userId}/logs`,
            { params: { page: logPage + 1 , size: PAGE_SIZE } }
          );
          setLogs(getPageItems(data));
          setLogTotal(getPageTotal(data));
        }
      } catch (e) {
        console.error(`${tab} 탭 데이터 조회 실패`, e);
      } finally {
        setTabLoading(false);
      }
    };
    loadTab();
  }, [tab, boardPage, commentPage, reportPage, logPage, userId, reloadKey]);

  // ── 페이지네이션 헬퍼 ─────────────────────────────────
  const currentPage  = tab === 'board' ? boardPage   : tab === 'comment' ? commentPage  : tab === 'report' ? reportPage  : logPage;
  const totalPages   = tab === 'board' ? boardTotal  : tab === 'comment' ? commentTotal : tab === 'report' ? reportTotal : logTotal;
  const setPage      = tab === 'board' ? setBoardPage : tab === 'comment' ? setCommentPage : tab === 'report' ? setReportPage : setLogPage;

  // 현재 그룹의 시작 페이지
  const groupStart = Math.floor(currentPage / GROUP_SIZE) * GROUP_SIZE;
  const groupEnd   = Math.min(groupStart + GROUP_SIZE, totalPages);
  const pageNumbers = Array.from({ length: groupEnd - groupStart }, (_, i) => groupStart + i);

  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab);

    if (nextTab === 'board') setBoardPage(0);
    if (nextTab === 'comment') setCommentPage(0);
    if (nextTab === 'report') setReportPage(0);
    if (nextTab === 'log') setLogPage(0);
  };

  // ── 정지 처리 ─────────────────────────────────────────
  const handleSuspend = async () => {
    if (!suspendReason.trim()) { alert('정지 사유를 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:8081/api/admin/users/${userId}/suspend`, {
        days: Number(suspendDays),
        reason: suspendReason,
        banType: Number(suspendDays) === 0 ? 'PERMANENT' : 'TEMPORARY',
      });
      alert('정지 처리가 완료되었습니다.');
      setModal('none');
      setSuspendReason('');
      setUser(prev => prev ? { ...prev, status: 'B' } : prev);
      if (tab === 'log') setReloadKey(prev => prev + 1);
    } catch (e) {
      console.error('정지 처리 실패', e);
      alert('정지 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 강제 탈퇴 처리 ────────────────────────────────────
  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) { alert('처리 사유를 입력해주세요.'); return; }
    if (!withdrawConfirmed)     { alert('데이터 삭제 확인 체크박스를 선택해주세요.'); return; }
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:8081/api/admin/users/${userId}/withdraw`, {
        reason: withdrawReason,
      });
      alert('강제 탈퇴 처리가 완료되었습니다.');
      setModal('none');
      setWithdrawReason('');
      setWithdrawConfirmed(false);
      setUser(prev => prev ? { ...prev, status: 'Y', withdraw: 'Y' } : prev);
    } catch (e) {
      console.error('강제 탈퇴 실패', e);
      alert('강제 탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 유틸 ──────────────────────────────────────────────
  const fmt   = (d: string | null) => d ? new Date(d).toLocaleDateString('ko-KR') : '-';
  const fmtDt = (d: string | null) => d ? new Date(d).toLocaleString('ko-KR')     : '-';

  const statusInfo = (target: UserDetail) => {
    if (target.withdraw === 'Y' || target.status === 'Y') return { text: '탈퇴', cls: styles.statusWithdrawn };
    if (target.status === 'N') return { text: '정상', cls: styles.statusNormal };
    if (target.status === 'B') return { text: '정지', cls: styles.statusBanned };
    if (target.status === 'W') return { text: '경고', cls: styles.statusWarning };
    return { text: target.status, cls: '' };
  };

  const roleText = (r: string | null) => r === 'ADMIN_ROLE' ? '관리자' : '일반회원';
  const banActiveValue = (item: BanHistoryItem) => item.banActive ?? item.banActice ?? 'N';
  const banTypeText = (value: string) => {
    if (value === 'PERMANENT') return '영구 정지';
    if (value === 'TEMPORARY') return '기간 정지';
    return value;
  };

  // ── 렌더 ──────────────────────────────────────────────
  if (loading) return <div className={styles.loading}>로딩중...</div>;
  if (!user)   return <div className={styles.loading}>회원 정보를 찾을 수 없습니다.</div>;

  const { text: stText, cls: stCls } = statusInfo(user);

  const TAB_LABELS: Record<Tab, string> = {
    board:   '📋 게시글',
    comment: '💬 댓글',
    report:  '🚩 신고 내역',
    log:     '📝 처리 이력',
  };

  // ── 페이지네이션 컴포넌트 ─────────────────────────────
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className={styles.pagination}>
        {/* 이전 그룹 */}
        <button
          className={styles.pageBtn}
          disabled={groupStart === 0}
          onClick={() => setPage(groupStart - 1)}
        >
          &lsaquo;
        </button>

        {/* 페이지 번호 */}
        {pageNumbers.map(p => (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
            onClick={() => setPage(p)}
          >
            {p + 1}
          </button>
        ))}

        {/* 다음 그룹 */}
        <button
          className={styles.pageBtn}
          disabled={groupEnd >= totalPages}
          onClick={() => setPage(groupEnd)}
        >
          &rsaquo;
        </button>
      </div>
    );
  };

  return (
    <div className={styles.container}>

      {/* ── 헤더 ── */}
      <div className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            회원관리 &rsaquo; {user.nickname} #{user.userId}
          </p>
          <h1 className={styles.title}>회원 상세</h1>
          <p className={styles.subtitle}>회원의 활동 내역과 처리 이력을 확인합니다</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.suspendBtn}  onClick={() => setModal('suspend')}>🚫 정지</button>
          <button className={styles.withdrawBtn} onClick={() => setModal('withdraw')}>⊘ 강제 탈퇴</button>
        </div>
      </div>

      {/* ── 본문 2컬럼 ── */}
      <div className={styles.body}>

        {/* 왼쪽: 프로필 카드 */}
        <aside className={styles.profileCard}>
          <div className={styles.avatarWrap}>
           <UserAvatar 
              imageUrl={user.profileImageUrl} 
              name={user.nickname} 
              email={user.email} 
              size={72} 
          />
              </div>
          
          <p className={styles.profileName}>{user.nickname}</p>
          <p className={styles.profileEmail}>{user.email}</p>
          <div className={styles.badges}>
            <span className={styles.roleBadge}>{roleText(user.role)}</span>
            <span className={`${styles.stateBadge} ${stCls}`}>{stText}</span>
          </div>
          <dl className={styles.infoList}>
            <dt>회원번호</dt><dd>#{user.userId}</dd>
            <dt>가입일</dt>  <dd>{fmt(user.enrollDate)}</dd>
            <dt>최근 접속</dt><dd>{fmtDt(user.lastLogin)}</dd>
            <dt>누적 신고</dt>
            <dd className={user.reportCount > 0 ? styles.reportCount : ''}>
              {user.reportCount}건
            </dd>
          </dl>
        </aside>

        {/* 오른쪽 */}
        <div className={styles.main}>

          {/* 통계 카드 */}
          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{user.boardCount}</span>
              <span className={styles.statLabel}>게시글</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{user.commentCount}</span>
              <span className={styles.statLabel}>댓글</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{user.scrapCount}</span>
              <span className={styles.statLabel}>스크랩</span>
            </div>
            <div className={`${styles.statCard} ${user.reportCount > 0 ? styles.statCardAlert : ''}`}>
              <span className={`${styles.statNum} ${user.reportCount > 0 ? styles.statNumAlert : ''}`}>
                {user.reportCount}
              </span>
              <span className={styles.statLabel}>신고당함</span>
            </div>
          </div>

          {/* 탭 버튼 */}
          <div className={styles.tabs}>
            {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className={styles.tabContent}>
            {tabLoading ? (
              <p className={styles.empty}>불러오는 중...</p>
            ) : (
              <>
                {/* 게시글 */}
                {tab === 'board' && (
                  <>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>번호</th>
                          <th>제목</th>
                          <th>작성일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boards.length === 0
                          ? <tr><td colSpan={3} className={styles.empty}>게시글이 없습니다.</td></tr>
                          : boards.map(b => (
                            <tr key={b.boardId}>
                              <td>#{b.boardId}</td>
                              <td>{b.title}</td>
                              <td>{fmt(b.createdAt)}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    {renderPagination()}
                  </>
                )}

                {/* 댓글 */}
                {tab === 'comment' && (
                  <>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>번호</th>
                          <th>내용</th>
                          <th>작성일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comments.length === 0
                          ? <tr><td colSpan={3} className={styles.empty}>댓글이 없습니다.</td></tr>
                          : comments.map(c => (
                            <tr key={c.commentId}>
                              <td>#{c.commentId}</td>
                              <td>{c.content}</td>
                              <td>{fmt(c.createdAt)}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    {renderPagination()}
                  </>
                )}

                {/* 신고 내역 */}
                {tab === 'report' && (
                  <>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>번호</th>
                          <th>유형</th>
                          <th>사유</th>
                          <th>처리상태</th>
                          <th>신고일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.length === 0
                          ? <tr><td colSpan={5} className={styles.empty}>신고 내역이 없습니다.</td></tr>
                          : reports.map(r => (
                            <tr key={r.reportId}>
                              <td>#{r.reportId}</td>
                              <td>{r.reportType}</td>
                              <td>{r.reason}</td>
                              <td>
                                <span className={r.state === 'Y' ? styles.stateDone : styles.statePending}>
                                  {r.state === 'Y' ? '처리완료' : '대기중'}
                                </span>
                              </td>
                              <td>{fmt(r.createdAt)}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    {renderPagination()}
                  </>
                )}

                {/* 처리 이력 */}
                {tab === 'log' && (
                  <>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>번호</th>
                          <th>밴 유형</th>
                          <th>사유</th>
                          <th>시작일</th>
                          <th>종료일</th>
                          <th>상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.length === 0
                          ? <tr><td colSpan={6} className={styles.empty}>처리 이력이 없습니다.</td></tr>
                          : logs.map(l => (
                            <tr key={l.banId}>
                              <td>#{l.banId}</td>
                              <td>{banTypeText(l.banType)}</td>
                              <td>{l.reason}</td>
                              <td>{fmtDt(l.banStart)}</td>
                              <td>{l.banEnd ? fmtDt(l.banEnd) : '영구 정지'}</td>
                              <td>
                                <span className={banActiveValue(l) === 'Y' ? styles.statePending : styles.stateDone}>
                                  {banActiveValue(l) === 'Y' ? '정지중' : '해제'}
                                </span>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    {renderPagination()}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          모달: 정지
      ══════════════════════════════ */}
      {modal === 'suspend' && (
        <div className={styles.overlay} onClick={() => setModal('none')}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>🚫</div>
            <h2 className={styles.modalTitle}>회원을 정지할까요?</h2>
            <p className={styles.modalDesc}>정지 기간 동안 로그인 및 활동이 제한됩니다.</p>
            <div className={styles.modalUserInfo}>
              <p><span>번호</span>#{user.userId}</p>
              <p><span>닉네임</span>{user.nickname}</p>
              <p><span>이메일</span>{user.email}</p>
            </div>
            <label className={styles.formLabel}>정지 기간</label>
            <select className={styles.formSelect} value={suspendDays} onChange={e => setSuspendDays(e.target.value)}>
              <option value="1">1일</option>
              <option value="3">3일</option>
              <option value="7">7일</option>
              <option value="14">14일</option>
              <option value="30">30일</option>
              <option value="0">영구 정지</option>
            </select>
            <label className={styles.formLabel}>사유</label>
            <textarea
              className={styles.formTextarea}
              placeholder="회원에게 안내될 정지 사유를 입력하세요"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
            />
            <p className={styles.mailNotice}>⚠ 회원에게 정지 안내 메일이 발송됩니다</p>
            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={() => setModal('none')}>취소</button>
              <button className={styles.confirmRedBtn} onClick={handleSuspend} disabled={submitting}>
                {submitting ? '처리 중...' : '정지하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          모달: 강제 탈퇴
      ══════════════════════════════ */}
      {modal === 'withdraw' && (
        <div className={styles.overlay} onClick={() => setModal('none')}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIconWithdraw}>⊘</div>
            <h2 className={styles.modalTitle}>회원을 강제 탈퇴할까요?</h2>
            {/*<p className={styles.modalDesc}>탈퇴된 회원의 작성 레시피, 댓글이 모두 삭제됩니다.</p>*/}
            <div className={styles.modalUserInfo}>
              <p><span>번호</span>#{user.userId}</p>
              <p><span>닉네임</span>{user.nickname}</p>
              <p><span>이메일</span>{user.email}</p>
            </div>
            <label className={styles.formLabel}>처리 사유</label>
            <textarea
              className={styles.formTextarea}
              placeholder="강제 탈퇴 사유를 입력하세요 (내부 기록용)"
              value={withdrawReason}
              onChange={e => setWithdrawReason(e.target.value)}
            />
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={withdrawConfirmed}
                onChange={e => setWithdrawConfirmed(e.target.checked)}
              />
              위 회원을 탈퇴시킴을 확인했습니다
            </label>
            <p className={styles.irreversible}>⚠ 이 작업은 되돌릴 수 없습니다</p>
            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={() => setModal('none')}>취소</button>
              <button className={styles.confirmRedBtn} onClick={handleWithdraw} disabled={submitting}>
                {submitting ? '처리 중...' : '탈퇴 처리'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
