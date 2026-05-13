'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import styles from './page.module.css';
import Loading from '../loading';

interface User {
  userId: number;
  profileImageUrl: string | null;
  nickname: string;
  email: string;
  role: string | null;
  recipeCount: number;
  enrollDate: string;
  status: string;
  withdraw?: string;
}

interface UserResponse {
  userList: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

type SuspendTarget = Pick<User, 'userId' | 'nickname' | 'email'>;
type WithdrawTarget = Pick<User, 'userId' | 'nickname' | 'email'>;

const ITEMS_PER_PAGE = 10;
const PAGE_GROUP_SIZE = 5;

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('latest');

  const [suspendTarget, setSuspendTarget] = useState<SuspendTarget | null>(null);
  const [suspendDays, setSuspendDays] = useState('7');
  const [suspendReason, setSuspendReason] = useState('');
  const [withdrawTarget, setWithdrawTarget] = useState<WithdrawTarget | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async (page: number, isInitialLoading = false) => {
    try {
      if (isInitialLoading) setLoading(true);

      const response = await axios.get<UserResponse>(
        'http://localhost:8081/api/admin/user',
        { params: { page, keyword, status, role, sort } },
      );

      setUsers(response.data.userList);
      setTotalCount(response.data.totalCount);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('회원 목록 조회 실패', error);
    } finally {
      if (isInitialLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(1);
    }, 300);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, status, role, sort]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(1, true);
    }, 0);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ko-KR');

  const convertRole = (value: string | null) => (value === 'ADMIN_ROLE' ? '관리자' : '일반');

  const convertStatus = (user: User) => {
    if (user.withdraw === 'Y') return '탈퇴';
    if (user.status === 'N') return '정상';
    if (user.status === 'B') return '정지';
    if (user.status === 'W') return '경고';
    return user.status;
  };

  const closeSuspendModal = () => {
    setSuspendTarget(null);
    setSuspendDays('7');
    setSuspendReason('');
  };

  const closeWithdrawModal = () => {
    setWithdrawTarget(null);
    setWithdrawReason('');
    setWithdrawConfirmed(false);
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    if (!suspendReason.trim()) {
      alert('정지 사유를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:8081/api/admin/user/${suspendTarget.userId}/suspend`, {
        days: Number(suspendDays),
        reason: suspendReason,
        banType: Number(suspendDays) === 0 ? 'PERMANENT' : 'TEMPORARY',
      });
      alert('정지 처리가 완료되었습니다.');
      closeSuspendModal();
      fetchUsers(currentPage);
    } catch (error) {
      console.error('정지 처리 실패', error);
      alert('정지 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async (user: User) => {
    if (!confirm(`${user.nickname} 회원의 정지를 해제할까요?`)) return;

    setSubmitting(true);
    try {
      await axios.patch(`http://localhost:8081/api/admin/user/${user.userId}/suspend/release`);
      alert('정지 해제가 완료되었습니다.');
      fetchUsers(currentPage);
    } catch (error) {
      console.error('정지 해제 실패', error);
      alert('정지 해제 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    if (!withdrawReason.trim()) {
      alert('처리 사유를 입력해주세요.');
      return;
    }
    if (!withdrawConfirmed) {
      alert('데이터 삭제 확인 체크박스를 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:8081/api/admin/user/${withdrawTarget.userId}/withdraw`, {
        reason: withdrawReason,
      });
      alert('강제 탈퇴 처리가 완료되었습니다.');
      closeWithdrawModal();
      fetchUsers(currentPage);
    } catch (error) {
      console.error('강제 탈퇴 실패', error);
      alert('강제 탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
  const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div>
          <h1 className={styles.title}>회원 관리</h1>
          <p className={styles.subtitle}>전체 회원을 조회하고 정지, 해제, 탈퇴 처리를 관리합니다</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="닉네임 또는 이메일로 검색..."
              className={styles.searchInput}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">전체 상태</option>
            <option value="N">정상</option>
            <option value="B">정지</option>
            <option value="W">경고</option>
          </select>

          <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">전체 등급</option>
            <option value="ADMIN_ROLE">관리자</option>
            <option value="USER_ROLE">일반</option>
          </select>

          <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="latest">가입일 최신순</option>
            <option value="oldest">가입일 오래된순</option>
            <option value="recipeDesc">레시피 많은순</option>
          </select>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>번호</th>
              <th>닉네임</th>
              <th>이메일</th>
              <th>등급</th>
              <th>레시피</th>
              <th>가입일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.emptyRow}>조회된 회원이 없습니다.</td>
              </tr>
            ) : users.map((user) => {
              const roleText = convertRole(user.role);
              const statusText = convertStatus(user);
              const isBanned = statusText === '정지';

              return (
                <tr key={user.userId}>
                  <td><input type="checkbox" /></td>
                  <td className={styles.number}>#{user.userId}</td>
                  <td className={styles.nickname}>{user.nickname}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={roleText === '관리자' ? styles.adminBadge : styles.normalBadge}>
                      {roleText}
                    </span>
                  </td>
                  <td>{user.recipeCount}</td>
                  <td>{formatDate(user.enrollDate)}</td>
                  <td>
                    <span
                      className={
                        statusText === '정상'
                          ? styles.normal
                          : statusText === '정지'
                            ? styles.banned
                            : styles.warning
                      }
                    >
                      {statusText}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        className={styles.detailBtn}
                        onClick={() => router.push(`/admin/user/${user.userId}`)}
                      >
                        상세
                      </button>

                      {isBanned ? (
                        <>
                          <button
                            className={styles.restoreBtn}
                            onClick={() => handleRelease(user)}
                            disabled={submitting}
                          >
                            해제
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setWithdrawTarget(user)}
                            disabled={submitting}
                          >
                            탈퇴
                          </button>
                        </>
                      ) : (
                        <button
                          className={styles.stopBtn}
                          onClick={() => setSuspendTarget(user)}
                          disabled={submitting || statusText === '탈퇴'}
                        >
                          정지
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.footer}>
          <div className={styles.pageInfo}>
            {totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            -
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
            / 총 {totalCount.toLocaleString()}명
          </div>

          <div className={styles.pagination}>
            <button disabled={startPage === 1} onClick={() => fetchUsers(startPage - PAGE_GROUP_SIZE)}>
              &lsaquo;
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                className={currentPage === page ? styles.activePage : ''}
                onClick={() => fetchUsers(page)}
              >
                {page}
              </button>
            ))}

            <button disabled={endPage === totalPages} onClick={() => fetchUsers(startPage + PAGE_GROUP_SIZE)}>
              &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {suspendTarget && (
        <div className={styles.overlay} onClick={closeSuspendModal}>
          <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalIcon}>!</div>
            <h2 className={styles.modalTitle}>회원을 정지할까요?</h2>
            <p className={styles.modalDesc}>정지 내용은 BANNED_USER에 처리 이력으로 기록됩니다.</p>

            <div className={styles.modalUserInfo}>
              <p><span>번호</span>#{suspendTarget.userId}</p>
              <p><span>닉네임</span>{suspendTarget.nickname}</p>
              <p><span>이메일</span>{suspendTarget.email}</p>
            </div>

            <label className={styles.formLabel}>정지 기간</label>
            <select className={styles.formSelect} value={suspendDays} onChange={(e) => setSuspendDays(e.target.value)}>
              <option value="1">1일</option>
              <option value="3">3일</option>
              <option value="7">7일</option>
              <option value="14">14일</option>
              <option value="30">30일</option>
              <option value="0">영구 정지</option>
            </select>

            <label className={styles.formLabel}>정지 사유</label>
            <textarea
              className={styles.formTextarea}
              placeholder="정지 사유를 입력하세요"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />

            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={closeSuspendModal}>취소</button>
              <button className={styles.confirmRedBtn} onClick={handleSuspend} disabled={submitting}>
                {submitting ? '처리 중...' : '정지하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {withdrawTarget && (
        <div className={styles.overlay} onClick={closeWithdrawModal}>
          <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalIconWithdraw}>⊘</div>
            <h2 className={styles.modalTitle}>회원을 강제 탈퇴할까요?</h2>
            <p className={styles.modalDesc}>탈퇴된 회원의 작성 레시피, 댓글이 모두 삭제됩니다.</p>

            <div className={styles.modalUserInfo}>
              <p><span>번호</span>#{withdrawTarget.userId}</p>
              <p><span>닉네임</span>{withdrawTarget.nickname}</p>
              <p><span>이메일</span>{withdrawTarget.email}</p>
            </div>

            <label className={styles.formLabel}>처리 사유</label>
            <textarea
              className={styles.formTextarea}
              placeholder="강제 탈퇴 사유를 입력하세요 (내부 기록용)"
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
            />

            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={withdrawConfirmed}
                onChange={(e) => setWithdrawConfirmed(e.target.checked)}
              />
              위 회원의 모든 데이터가 삭제됨을 확인했습니다
            </label>

            <p className={styles.irreversible}>이 작업은 되돌릴 수 없습니다</p>

            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={closeWithdrawModal}>취소</button>
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
