"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import styles from './comments.module.css'; 
import Link from 'next/link';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';
import UserAvatar from '@/app/components/UserAvatar';
import '@/app/responsive.css';

interface MyComment {
  commentNo: number;
  commentContent: string;
  commentPostDate: string;
  boardNo: number;
  boardTitle: string;
  commenterNickname?: string; 
  commenterProfileUrl?: string;
  replyCount: number;
}

export default function MyCommentManagementPage() {
  const [activeTab, setActiveTab] = useState<'written' | 'received'>('written');
  const [filter, setFilter] = useState("newest");
  const [writtenComments, setWrittenComments] = useState<MyComment[]>([]);
  const [receivedComments, setReceivedComments] = useState<MyComment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const PER_PAGE = 5;
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    const fetchCommentData = async () => {
      if (!loginUserNo) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/comments/list`, { 
          params: { userNo: loginUserNo, filter: filter } 
        });
        if (res.status === 200) {
          setWrittenComments(res.data.written || []);
          setReceivedComments(res.data.received || []);
        }
      } catch (err) {
        console.error("댓글 데이터 로딩 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommentData();
  }, [loginUserNo, filter]);

  const currentList = activeTab === 'written' ? writtenComments : receivedComments;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PER_PAGE));
  const pageItems = currentList.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => setCurrentPage(i)} className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}>
          {i}
        </button>
      );
    }
    return (
      <div className={styles.pagination}>
        <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>&lt;</button>
        {pages}
        <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>&gt;</button>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>댓글 관리</h1>
        <div className={styles.pageSubtitle}></div>

        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'written' ? styles.active : ''} prevent-nowrap`} 
              onClick={() => { setActiveTab('written'); setCurrentPage(1); }}
            >
              내가 쓴 댓글 <span className={styles.tabCount}>{writtenComments.length}</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'received' ? styles.active : ''} prevent-nowrap`} 
              onClick={() => { setActiveTab('received'); setCurrentPage(1); }}
            >
              내 글에 달린 댓글 <span className={styles.tabCount}>{receivedComments.length}</span>
            </button>
          </div>

          <select 
            className={styles.filterSelect} 
            value={filter} 
            onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="popular">답글 많은순</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.emptyBox}>데이터를 가져오는 중입니다...</div>
        ) : pageItems.length === 0 ? (
          <div className={styles.emptyBox}>
            {activeTab === 'written' ? "작성한 댓글이 없습니다." : "내 게시물에 달린 댓글이 없습니다."}
          </div>
        ) : (
          
          <div className={`${styles.commentList} prevent-nowrap`} >
            {pageItems.map((comment) => (
              <div key={comment.commentNo} className={`${styles.commentCard} prevent-nowrap`}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatarWrap}>
                    <UserAvatar 
                      imageUrl={activeTab === 'received' ? comment.commenterProfileUrl : userInfo?.profileImageUrl} 
                      name={activeTab === 'received' ? comment.commenterNickname! : userInfo?.nickname!} 
                      size={42} 
                    />
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.nickname}>
                      {activeTab === 'received' ? comment.commenterNickname : userInfo?.nickname}
                    </span>
                    <span className={styles.date}>{comment.commentPostDate}</span>
                  </div>
                </div>

                <div className={`${styles.commentContent} prevent-nowrap`}>
                  {comment.commentContent}
                </div>

                <div className={styles.cardDivider} />  

                <div className={`${styles.cardFooter} prevent-nowrap`}>
                  <span className={styles.sourceLabel}>원문:</span>
                  <Link href={`/boards/${comment.boardNo}`} className={styles.boardLink}>
                    {comment.boardTitle}
                  </Link>
                  {comment.replyCount > 0 && (
                    <span className={styles.replyBadge}>답글 {comment.replyCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {renderPagination()}
      </div>
    </main>
  );
}