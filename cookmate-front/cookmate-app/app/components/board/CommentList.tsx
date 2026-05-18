"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/api";
import { Comment } from "@/app/type/board";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import CommentForm from "./CommentForm";
import styles from "./Comment.module.css";
import UserAvatar from "@/app/components/UserAvatar";

interface Props {
  boardNo: number;
  currentUserNo?: number;
}

const REPORT_TYPES = ["부적절한 레시피", "스팸/광고", "저작권 위반", "욕설/혐오", "허위정보"];

export default function CommentList({ boardNo, currentUserNo }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [reportTo, setReportTo] = useState<number | null>(null);
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

  const handleReport = async (comment: Comment, reportType: string, reportReason: string) => {
    if (!isLoggedIn || !currentUserNo) {
      alert("로그인 후 신고할 수 있습니다.");
      return;
    }

    if (currentUserNo === comment.userNo) {
      alert("본인 댓글은 신고할 수 없습니다.");
      return;
    }

    if (!reportType) {
      alert("신고 유형을 선택해 주세요.");
      return;
    }

    try {
      const res = await api.post(`/comments/${comment.commentNo}/reports`, {
        userNo: currentUserNo,
        reportType,
        reportReason: reportReason.trim().slice(0, 500),
      });
      alert(res.data || "댓글 신고가 접수되었습니다.");
      setReportTo(null);
    } catch (error) {
      console.error("댓글 신고 실패:", error);
      alert(getErrorMessage(error, "댓글 신고에 실패했습니다."));
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
            isReportOpen={reportTo === comment.commentNo}
            onReplyToggle={() =>
              setReplyTo(replyTo === comment.commentNo ? null : comment.commentNo)
            }
            onReportToggle={() =>
              setReportTo(reportTo === comment.commentNo ? null : comment.commentNo)
            }
            onDelete={handleDelete}
            onReport={handleReport}
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
                  isReportOpen={reportTo === reply.commentNo}
                  onReplyToggle={() => undefined}
                  onReportToggle={() =>
                    setReportTo(reportTo === reply.commentNo ? null : reply.commentNo)
                  }
                  onDelete={handleDelete}
                  onReport={handleReport}
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
  isReportOpen,
  onReplyToggle,
  onReportToggle,
  onDelete,
  onReport,
  onReplySuccess,
  boardNo,
}: {
  comment: Comment;
  currentUserNo?: number;
  isLoggedIn: boolean;
  isReply?: boolean;
  isReplyOpen: boolean;
  isReportOpen: boolean;
  onReplyToggle: () => void;
  onReportToggle: () => void;
  onDelete: (commentNo: number) => void;
  onReport: (comment: Comment, reportType: string, reportReason: string) => void;
  onReplySuccess: () => void;
  boardNo: number;
}) {
  const canDelete = currentUserNo === comment.userNo;

  return (
    <div className={isReply ? styles.replyItem : styles.commentItem}>
      <div className={isReply ? styles.replyAvatar : styles.commentAvatar}>
        <UserAvatar
          imageUrl={comment.profileImageUrl} 
          name={comment.nickname}
          size="100%"
        />
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
          <button
            type="button"
            className={styles.commentActionButton}
            onClick={onReportToggle}
          >
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

        {isReportOpen && (
          <CommentReportForm
            comment={comment}
            onSubmit={onReport}
            onCancel={onReportToggle}
          />
        )}
      </div>
    </div>
  );
}

function CommentReportForm({
  comment,
  onSubmit,
  onCancel,
}: {
  comment: Comment;
  onSubmit: (comment: Comment, reportType: string, reportReason: string) => void;
  onCancel: () => void;
}) {
  const [reportType, setReportType] = useState("");
  const [reportReason, setReportReason] = useState("");

  return (
    <div className={styles.reportBox}>
      <select
        value={reportType}
        onChange={(event) => setReportType(event.target.value)}
        className={styles.reportSelect}
      >
        <option value="">신고 유형 선택</option>
        {REPORT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <textarea
        value={reportReason}
        onChange={(event) => setReportReason(event.target.value)}
        className={styles.reportTextarea}
        rows={2}
        maxLength={500}
        placeholder="상세 사유를 입력해 주세요. (선택)"
      />
      <div className={styles.reportActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          취소
        </button>
        <button
          type="button"
          className={styles.submitButton}
          onClick={() => onSubmit(comment, reportType, reportReason)}
        >
          신고 접수
        </button>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && "message" in data) {
      return String(data.message);
    }
  }

  return fallback;
}