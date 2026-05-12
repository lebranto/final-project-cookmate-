"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import styles from './withdraw.module.css';

export default function WithdrawPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 탈퇴 진행 중 중복 클릭 방지

  // 🌟 테스트용 유저 번호 (나중에 전역 상태/세션에서 가져오게 변경)
  const loginUserNo = 1; 

  // 탈퇴 조건: 비밀번호 입력(1자 이상) AND 체크박스 동의
  const isSubmitDisabled = password.length === 0 || !agreed || isSubmitting;

  const handleWithdraw = async () => {
    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;

    setIsSubmitting(true);

    try {
      // 🌟 1단계: 먼저 비밀번호가 맞는지 백엔드에 확인 요청
      const verifyResponse = await api.post('/users/profile/verify-password', {
        userNo: loginUserNo,
        password: password
      });

      if (!verifyResponse.data.isValid) {
        alert("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
        setIsSubmitting(false);
        return; // 비밀번호가 틀리면 여기서 중단
      }

      // 🌟 2단계: 비밀번호가 맞다면 실제 탈퇴 요청 (백엔드는 @RequestParam으로 받음)
      const withdrawResponse = await api.post('/users/withdraw', null, {
        params: { userNo: loginUserNo }
      });

      if (withdrawResponse.status === 200) {
        alert('탈퇴가 완료되었습니다. 그동안 CookMate를 이용해 주셔서 감사합니다.');
        
        // TODO: 나중에 로그인 기능이 붙으면 여기서 localStorage나 세션의 토큰(JWT)을 지워주는 코드를 추가해야 합니다.
        // 예: localStorage.removeItem('token');

        // 탈퇴 후 메인 페이지로 이동
        router.push('/');
      }
    } catch (err: any) {
      console.error("탈퇴 실패", err);
      // 백엔드에서 에러 메시지를 보내줬다면 출력, 아니면 기본 메시지
      const msg = err.response?.data || "탈퇴 처리 중 서버 오류가 발생했습니다.";
      alert(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.main}>
      <h2 className={styles.sectionTitle}>🚪 회원 탈퇴</h2>

      {/* ⚠️ 탈퇴 주의 사항 */}
      <div className={styles.warnBox}>
        <div className={styles.warnTitle}>⚠️ 탈퇴하기 전에 확인해 주세요</div>
        <div className={styles.warnList}>
          <div className={styles.warnItem}>
            <span className={styles.warnDot}>·</span>
            <span>탈퇴 시 작성한 레시피, 스크랩, 댓글 등 <strong>모든 데이터가 삭제</strong>됩니다.</span>
          </div>
          <div className={styles.warnItem}>
            <span className={styles.warnDot}>·</span>
            <span>삭제된 데이터는 <strong>복구할 수 없습니다.</strong></span>
          </div>
          <div className={styles.warnItem}>
            <span className={styles.warnDot}>·</span>
            <span>탈퇴 후 동일 이메일로 재가입 시 기존 데이터는 복원되지 않습니다.</span>
          </div>
          <div className={styles.warnItem}>
            <span className={styles.warnDot}>·</span>
            <span>진행 중인 문의가 있을 경우 처리가 중단될 수 있습니다.</span>
          </div>
        </div>
      </div>

      {/* 🔐 비밀번호 및 동의 확인 */}
      <div className={styles.confirmBox}>
        <div className={styles.confirmTitle}>탈퇴를 진행하려면 비밀번호를 입력해 주세요</div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>비밀번호</label>
          <input 
            className={styles.formInput} 
            type="password" 
            placeholder="현재 비밀번호 입력" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label className={styles.checkboxRow}>
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className={styles.checkboxLabel}>위의 안내 사항을 모두 확인하였으며, 탈퇴에 동의합니다.</span>
        </label>

        <div className={styles.btnRow}>
          <button 
            className={styles.btnDanger} 
            disabled={isSubmitDisabled}
            onClick={handleWithdraw}
          >
            {isSubmitting ? '처리 중...' : '탈퇴하기'}
          </button>
          <button 
            className={styles.btnCancel} 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}