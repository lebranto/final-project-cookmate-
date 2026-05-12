"use client";

import axios from "axios";
import { useState } from "react";
import api from "@/app/lib/api";
import { useUserInfoActions } from "@/app/hooks/useUserInfoActions";
import styles from "./Comment.module.css";

interface Props {
  boardNo: number;
  parentCommentNo?: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function CommentForm({
  boardNo,
  parentCommentNo,
  onSuccess,
  onCancel,
}: Props) {
  const [content, setContent] = useState("");
  const { userInfo, isLoggedIn } = useUserInfoActions();

  const handleSubmit = async () => {
    if (!isLoggedIn || !userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      alert("댓글 내용을 입력해 주세요.");
      return;
    }

    try {
      const res = await api.post(`/boards/${boardNo}/comments`, {
        userNo: userInfo.userNo,
        commentContent: content,
        parentCommentNo: parentCommentNo ?? null,
      });
      setContent("");
      alert(res.data || "댓글을 등록했습니다.");
      onSuccess();
      onCancel?.();
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert(getErrorMessage(error, "댓글 등록에 실패했습니다."));
    }
  };

  return (
    <div
      className={
        parentCommentNo ? styles.replyInputRow : styles.commentInputRow
      }
    >
      {!parentCommentNo && (
        <div className={styles.commentAvatar}>
          {userInfo?.nickname?.charAt(0) || "C"}
        </div>
      )}
      <div className={styles.commentInputWrap}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            parentCommentNo ? "답글을 입력하세요..." : "댓글을 남겨주세요..."
          }
          rows={parentCommentNo ? 1 : 2}
          className={styles.commentInput}
        />
        <div className={styles.commentSubmitRow}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              취소
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className={styles.submitButton}
          >
            등록
          </button>
        </div>
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
