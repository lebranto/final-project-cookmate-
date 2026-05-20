"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/config";
import styles from "./find.module.css";

const PASSWORD_RULE_MESSAGE = "비밀번호는 8자 이상이며 영문자와 숫자를 모두 포함해야 합니다.";

function isValidPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export default function FindPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordValid = isValidPassword(newPassword);
  const passwordMatched = newPassword.length > 0 && newPassword === confirmPassword;
  const canReset = emailVerified && passwordValid && passwordMatched;

  const handleSendCode = async () => {
    if (!email.trim()) {
      setSuccess(false);
      setMessage("가입한 이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setSuccess(false);
        setMessage("인증 코드 발송에 실패했습니다.");
        return;
      }

      setCodeSent(true);
      setEmailVerified(false);
      setSuccess(true);
      setMessage("인증 코드가 발송되었습니다. 개발용 인증번호는 123456입니다.");
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setMessage("서버 연결에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    if (!email.trim() || !code.trim()) {
      setSuccess(false);
      setMessage("이메일과 인증 코드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        setEmailVerified(false);
        setSuccess(false);
        setMessage("인증 코드가 올바르지 않습니다.");
        return;
      }

      setEmailVerified(true);
      setSuccess(true);
      setMessage("이메일 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setMessage("서버 연결에 실패했습니다.");
    }
  };

  const handleResetPassword = async () => {
    if (!canReset) {
      setSuccess(false);
      setMessage("새 비밀번호를 조건에 맞게 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      if (!response.ok) {
        setSuccess(false);
        setMessage("비밀번호 재설정에 실패했습니다.");
        return;
      }

      alert("비밀번호 재설정이 완료됐습니다.");
      router.replace("/login");
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setMessage("서버 연결에 실패했습니다.");
    }
  };

  return (
    <main className={styles.pageWrap}>
      <div className={styles.formBox}>
        <div className={styles.logoArea}>
          <span className={styles.logoText}>
            Cook<span>Mate</span>
          </span>
          <div className={styles.logoSub}>비밀번호 찾기</div>
        </div>

        <div className={styles.card}>
          <div className={styles.pageTitle}>
            <h1>비밀번호를 잊으셨나요?</h1>
            <p>가입한 이메일을 인증한 뒤 새 비밀번호로 변경하세요.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <div className={styles.inputRow}>
              <input
                className={styles.formInput}
                type="email"
                placeholder="가입한 이메일 주소"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setCode("");
                  setCodeSent(false);
                  setEmailVerified(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage("");
                  setSuccess(false);
                }}
              />
              <button type="button" className={styles.btnOutline} onClick={handleSendCode}>
                인증 발송
              </button>
            </div>
            <div className={styles.formHint}>
              회원가입 때 사용한 이메일 주소를 입력해주세요.
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>인증 코드</label>
            <div className={styles.inputRow}>
              <input
                className={styles.formInput}
                type="text"
                placeholder="인증번호 6자리"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setEmailVerified(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage("");
                  setSuccess(false);
                }}
              />
              <button type="button" className={styles.btnSolid} onClick={handleVerifyCode}>
                확인
              </button>
            </div>
            {codeSent && (
              <div className={styles.formHint}>
                인증 코드를 입력한 뒤 확인 버튼을 눌러주세요.
              </div>
            )}
          </div>

          {emailVerified && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>새 비밀번호</label>
                <input
                  className={styles.formInput}
                  type="password"
                  placeholder="8자 이상, 영문+숫자 조합"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setMessage("");
                    setSuccess(false);
                  }}
                />
                {newPassword && !passwordValid && (
                  <div className={styles.errorHint}>{PASSWORD_RULE_MESSAGE}</div>
                )}
                {!newPassword && (
                  <div className={styles.formHint}>{PASSWORD_RULE_MESSAGE}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>새 비밀번호 확인</label>
                <input
                  className={styles.formInput}
                  type="password"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setMessage("");
                    setSuccess(false);
                  }}
                />
                {confirmPassword && !passwordMatched && (
                  <div className={styles.errorHint}>비밀번호가 일치하지 않습니다.</div>
                )}
              </div>
            </>
          )}

          {message && (
            <div className={success ? styles.successMessage : styles.resultMessage}>
              {message}
            </div>
          )}

          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!canReset}
            onClick={handleResetPassword}
          >
            비밀번호 재설정
          </button>

          <div className={styles.loginLink}>
            비밀번호가 기억나셨나요?{" "}
            <span onClick={() => router.push("/login")}>로그인</span>
          </div>
        </div>
      </div>
    </main>
  );
}
