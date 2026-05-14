"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import styles from './withdraw.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';

export default function WithdrawPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); 
  
  const [password, setPassword] = useState("");
  const [withdrawText, setWithdrawText] = useState(""); // 카카오 유저용 입력 텍스트
  const [provider, setProvider] = useState(""); // 카카오 유저 판별용
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마운트 시 유저 프로필을 조회하여 카카오 로그인 유저인지 확인
  useEffect(() => {
    if (!isMounted || !loginUserNo) return;
    const fetchProvider = async () => {
      try {
        const response = await api.get(`/users/profile/${loginUserNo}`);
        if (response.status === 200) {
          setProvider(response.data.provider || "");
        }
      } catch (err) {
        console.error("유저 정보 로드 실패", err);
      }
    };
    fetchProvider();
  }, [loginUserNo, isMounted]);

  const isKakaoUser = provider.toLowerCase() === 'kakao';

  // 탈퇴 조건 분기 처리 (카카오 vs 일반)
  const isSubmitDisabled = isKakaoUser 
    ? (withdrawText !== "탈퇴하겠습니다" || !agreed || isSubmitting || !loginUserNo)
    : (password.length === 0 || !agreed || isSubmitting || !loginUserNo);

  const handleWithdraw = async () => {
    if (!loginUserNo) {
      alert("로그인 정보가 유효하지 않습니다.");
      return;
    }

    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;

    setIsSubmitting(true);
    let isWithdrawSuccess = false; // 공통 성공 처리용 플래그

    try {
      if (isKakaoUser) {
        // ==========================================
        // 1. 카카오 유저 탈퇴 로직
        // ==========================================
        // (참고: api 객체의 인터셉터가 헤더에 자동으로 토큰을 넣어준다고 가정합니다)
        const withdrawResponse = await api.post(`/users/withdraw/kakao/${loginUserNo}`);
        
        if (withdrawResponse.status === 200) {
          isWithdrawSuccess = true;
        }
      } else {
        // ==========================================
        // 2. 일반 유저 탈퇴 로직 (기존 코드 유지)
        // ==========================================
        const verifyResponse = await api.post('/users/profile/verify-password', {
          userNo: loginUserNo,
          password: password
        });

        if (!verifyResponse.data.isValid) {
          alert("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
          setIsSubmitting(false);
          return;
        }

        const withdrawResponse = await api.post('/users/withdraw', null, {
          params: { userNo: loginUserNo }
        });

        if (withdrawResponse.status === 200) {
          isWithdrawSuccess = true;
        }
      }

      // ==========================================
      // 3. 공통: 탈퇴 성공 후 클린업 로직
      // ==========================================
      if (isWithdrawSuccess) {
        alert('탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.');
        
        const STORAGE_USER_KEYS = ["user", "loginUser", "member", "authUser", "accessToken", "role"];
        STORAGE_USER_KEYS.forEach(key => window.localStorage.removeItem(key));

        const COOKIE_KEYS = ["accessToken", "refreshToken", "userRoles"];
        COOKIE_KEYS.forEach(name => {
          document.cookie = `${name}=; Max-Age=0; path=/;`;
        });

        window.dispatchEvent(new Event("auth-state-changed"));
        window.location.href = '/'; 
      }

    } catch (err: any) {
      console.error("탈퇴 실패", err);
      // 백엔드에서 던진 401 에러(TOKEN_EXPIRED) 처리
      if (err.response?.status === 401) {
        alert("보안을 위해 다시 로그인한 후 탈퇴를 진행해 주세요.");
        const STORAGE_USER_KEYS = ["user", "loginUser", "member", "authUser", "accessToken", "role"];
        STORAGE_USER_KEYS.forEach(key => window.localStorage.removeItem(key));

        const COOKIE_KEYS = ["accessToken", "refreshToken", "userRoles"];
        COOKIE_KEYS.forEach(name => {
          document.cookie = `${name}=; Max-Age=0; path=/;`;
        });

        // 헤더초기화
        window.dispatchEvent(new Event("auth-state-changed"));
        
        window.location.href = '/login';
      } else {
        alert("탈퇴 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  if (!isLoggedIn || !loginUserNo) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  return (
    <div className={styles.main}>
      <h2 className={styles.sectionTitle}>회원 탈퇴</h2>

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
        <div className={styles.confirmTitle}>
          {isKakaoUser ? '안전한 탈퇴를 위해 아래 문구를 입력해 주세요' : '탈퇴를 진행하려면 비밀번호를 입력해 주세요'}
        </div>
        
        {/* 🌟 카카오 유저 vs 일반 유저 폼 분기 */}
        {isKakaoUser ? (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>탈퇴 확인 문구</label>
            <input 
              className={styles.formInput} 
              type="text" 
              placeholder="'탈퇴하겠습니다' 를 정확히 입력해 주세요" 
              value={withdrawText}
              onChange={(e) => setWithdrawText(e.target.value)}
            />
          </div>
        ) : (
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
        )}

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