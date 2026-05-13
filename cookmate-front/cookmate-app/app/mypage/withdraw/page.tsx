"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import styles from './withdraw.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

export default function WithdrawPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // 🌟 하이드레이션 에러 방지
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 훅을 사용하여 로그인 정보 가져오기
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  // 마운트 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 탈퇴 조건: 비밀번호 입력(1자 이상) AND 체크박스 동의 AND 유저번호 존재
  const isSubmitDisabled = password.length === 0 || !agreed || isSubmitting || !loginUserNo;

  const handleWithdraw = async () => {
  if (!loginUserNo) {
    alert("로그인 정보가 유효하지 않습니다.");
    return;
  }

  if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;

  setIsSubmitting(true);

  try {
    // 1단계: 비밀번호 검증
    const verifyResponse = await api.post('/users/profile/verify-password', {
      userNo: loginUserNo,
      password: password
    });

    if (!verifyResponse.data.isValid) {
      alert("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      setIsSubmitting(false);
      return;
    }

    // 2단계: 실제 탈퇴 요청
    const withdrawResponse = await api.post('/users/withdraw', null, {
      params: { userNo: loginUserNo }
    });

    if (withdrawResponse.status === 200) {
      alert('탈퇴가 완료되었습니다. 그동안 CookMate를 이용해 주셔서 감사합니다.');

      // 🌟 3단계: 헤더가 체크하는 모든 저장소 청소 (로컬 스토리지 + 쿠키)
      
      // 1) 로컬 스토리지 청소
      const STORAGE_USER_KEYS = ["user", "loginUser", "member", "authUser", "accessToken", "role"];
      STORAGE_USER_KEYS.forEach(key => window.localStorage.removeItem(key));

      // 2) 쿠키 청소 (이게 빠져서 헤더가 안 바뀌었던 겁니다!)
      const COOKIE_KEYS = ["accessToken", "refreshToken", "userRoles"];
      COOKIE_KEYS.forEach(name => {
        document.cookie = `${name}=; Max-Age=0; path=/;`;
      });

      // 🌟 4단계: 'auth-state-changed' 이벤트 발생 (혹시 모를 즉시 반영용)
      window.dispatchEvent(new Event("auth-state-changed"));

      // 🌟 5단계: 메인으로 강제 이동
      window.location.href = '/'; 
    }
  } catch (err: any) {
    console.error("탈퇴 실패", err);
    alert("탈퇴 처리 중 오류가 발생했습니다.");
    setIsSubmitting(false);
  }
};

  // 하이드레이션 방어 및 로그인 체크
  if (!isMounted) return null;

  if (!isLoggedIn || !loginUserNo) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  return (
    <div className={styles.main}>
      <h2 className={styles.sectionTitle}>🚪 회원 탈퇴</h2>

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