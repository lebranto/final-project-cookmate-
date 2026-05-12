"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/api";
import { Comment } from "@/app/type/board";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import CommentForm from "./CommentForm";
import styles from "./Comment.module.css";

interface Props {
  boardNo: number;
  currentUserNo?: number;
}

export default function CommentList({ boardNo, currentUserNo }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { isLoggedIn } = useUserInfoActions();

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/boards/${boardNo}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error("댓글 조회 실패:", error);
    }
  }, [boardNo]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchComments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchComments]);

  const handleDelete = async (commentNo: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/comments/${commentNo}`);
      await fetchComments();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.commentList}>
      {comments.length === 0 && (
        <p className={styles.emptyText}>첫 댓글을 남겨보세요.</p>
      )}

      {comments.map((comment) => (
        <div key={comment.commentNo} className={styles.commentBlock}>
          <CommentItem
            comment={comment}
            currentUserNo={currentUserNo}
            isLoggedIn={isLoggedIn}
            isReplyOpen={replyTo === comment.commentNo}
            onReplyToggle={() =>
              setReplyTo(replyTo === comment.commentNo ? null : comment.commentNo)
            }
            onDelete={handleDelete}
            onReplySuccess={() => {
              void fetchComments();
              setReplyTo(null);
            }}
            boardNo={boardNo}
          />

          {comment.replies?.length > 0 && (
            <div className={styles.replyList}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.commentNo}
                  comment={reply}
                  currentUserNo={currentUserNo}
                  isLoggedIn={isLoggedIn}
                  isReply
                  isReplyOpen={false}
                  onReplyToggle={() => undefined}
                  onDelete={handleDelete}
                  onReplySuccess={fetchComments}
                  boardNo={boardNo}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  currentUserNo,
  isLoggedIn,
  isReply = false,
  isReplyOpen,
  onReplyToggle,
  onDelete,
  onReplySuccess,
  boardNo,
}: {
  comment: Comment;
  currentUserNo?: number;
  isLoggedIn: boolean;
  isReply?: boolean;
  isReplyOpen: boolean;
  onReplyToggle: () => void;
  onDelete: (commentNo: number) => void;
  onReplySuccess: () => void;
  boardNo: number;
}) {
  const initial = comment.nickname?.trim().charAt(0) || "C";
  const canDelete = currentUserNo === comment.userNo;

  return (
    <div className={isReply ? styles.replyItem : styles.commentItem}>
      <div className={isReply ? styles.replyAvatar : styles.commentAvatar}>
        {comment.profileImageUrl ? (
          <img
            src={comment.profileImageUrl}
            alt={comment.nickname}
            className={styles.avatarImage}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className={isReply ? styles.replyBody : styles.commentBody}>
        <div className={isReply ? styles.replyNameRow : styles.commentNameRow}>
          <span className={isReply ? styles.replyName : styles.commentName}>
            {comment.nickname}
          </span>
          <span className={isReply ? styles.replyTime : styles.commentTime}>
            {comment.commentPostdate}
          </span>
        </div>
        <p className={isReply ? styles.replyText : styles.commentText}>
          {comment.commentContent}
        </p>
        <div className={isReply ? styles.replyActions : styles.commentActions}>
          {!isReply && isLoggedIn && (
            <button
              type="button"
              onClick={onReplyToggle}
              className={styles.commentActionButton}
            >
              답글
            </button>
          )}
          <button type="button" className={styles.commentActionButton}>
            신고
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(comment.commentNo)}
              className={styles.commentActionButtonDanger}
            >
              삭제
            </button>
          )}
        </div>

        {isReplyOpen && (
          <CommentForm
            boardNo={boardNo}
            parentCommentNo={comment.commentNo}
            onSuccess={onReplySuccess}
            onCancel={onReplyToggle}
          />
        )}
      </div>
    </div>
  );
}
