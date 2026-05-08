"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import styles from "./RegisterPage.module.css";

type Step = {
  num: number;
  label: string;
};

type GlobalHeaderProps = {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
};

type StepBarProps = {
  currentStep: number;
};

type StepProps = {
  onNext: () => void;
};

type AgreeKey = "all" | "terms" | "privacy" | "age" | "marketing";

type AgreeState = Record<AgreeKey, boolean>;

type AllergyKey = string;

const STEPS: Step[] = [
  { num: 1, label: "동의 사항" },
  { num: 2, label: "기본 정보" },
  { num: 3, label: "알레르기 설정" },
  { num: 4, label: "완료" },
];

function GlobalHeader({ menuOpen, setMenuOpen }: GlobalHeaderProps) {
  return (
    <header className={styles.globalHeader}>
      <div className={styles.ghInner}>
        <span className={styles.ghLogo}>
          Cook<span>Mate</span>
        </span>

        <div className={styles.ghSearch}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="7" stroke="#aaa" strokeWidth="1.8" />
            <line x1="14.5" y1="14.5" x2="19" y2="19" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input placeholder="레시피 또는 재료 검색..." />
        </div>

        <nav className={styles.ghNav}>
          <a>레시피</a>
          <a>AI추천</a>
          <a>장보기</a>
        </nav>

        <div className={styles.ghActions}>
          <span className={styles.ghNavBtn}>셰프</span>
          <span className={styles.ghNavBtn}>공지사항</span>
          <button className={styles.ghBell} aria-label="알림">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="18" cy="6" r="4" fill="#e05a2b" />
            </svg>
          </button>
          <button className={styles.ghLoginBtn}>로그인</button>
          <button className={styles.ghStart}>시작하기</button>
          <button className={styles.ghMobileMenu} onClick={() => setMenuOpen((prev) => !prev)} aria-label="메뉴">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`${styles.ghMobileNav}${menuOpen ? ` ${styles.open}` : ""}`}>
        {["레시피", "AI추천", "장보기", "셰프", "공지사항", "로그인"].map((item) => (
          <a key={item}>{item}</a>
        ))}
      </div>
    </header>
  );
}

function StepBar({ currentStep }: StepBarProps) {
  return (
    <div className={styles.stepBar}>
      {STEPS.map((step, idx) => (
        <div key={step.num} className={styles.stepWrap}>
          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${currentStep >= step.num ? styles.active : styles.inactive}`}>
              {currentStep > step.num ? "✓" : step.num}
            </div>
            <div className={`${styles.stepLabel} ${currentStep >= step.num ? styles.active : styles.inactive}`}>
              {step.label}
            </div>
          </div>
          {idx < STEPS.length - 1 && <div className={`${styles.stepLine} ${currentStep > step.num ? styles.active : ""}`} />}
        </div>
      ))}
    </div>
  );
}

function AgreeStep({ onNext }: StepProps) {
  const [agrees, setAgrees] = useState<AgreeState>({
    all: false,
    terms: false,
    privacy: false,
    age: false,
    marketing: false,
  });

  const toggleAll = () => {
    const nextValue = !agrees.all;
    setAgrees({ all: nextValue, terms: nextValue, privacy: nextValue, age: nextValue, marketing: nextValue });
  };

  const toggle = (key: Exclude<AgreeKey, "all">) => {
    const next = { ...agrees, [key]: !agrees[key] };
    next.all = next.terms && next.privacy && next.age && next.marketing;
    setAgrees(next);
  };

  const canNext = agrees.terms && agrees.privacy && agrees.age;

  const items: { key: Exclude<AgreeKey, "all">; label: string; required: boolean }[] = [
    { key: "terms", label: "이용약관 동의", required: true },
    { key: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
    { key: "age", label: "만 14세 이상 확인", required: true },
    { key: "marketing", label: "마케팅 정보 수신 동의", required: false },
  ];

  return (
    <>
      <div className={styles.agreeSection}>
        <div className={styles.agreeAll} onClick={toggleAll}>
          <div className={`${styles.checkbox} ${agrees.all ? styles.checked : ""}`}>{agrees.all && "✓"}</div>
          <span>전체 동의</span>
        </div>

        <div className={styles.innerCard}>
          {items.map((item) => (
            <div key={item.key} className={styles.agreeItem} onClick={() => toggle(item.key)}>
              <div className={`${styles.checkbox} ${agrees[item.key] ? styles.checked : ""}`}>{agrees[item.key] && "✓"}</div>
              <span>
                {item.label}
                {item.required ? <em className={styles.required}> (필수)</em> : <em className={styles.optional}> (선택)</em>}
              </span>
              <span className={styles.agreeArrow}>›</span>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.btnPrimary} disabled={!canNext} onClick={onNext}>
        다음 단계
      </button>

      <div className={styles.loginLink}>
        이미 계정이 있으신가요? <span>로그인</span>
      </div>
    </>
  );
}

function BasicInfoStep({ onNext }: StepProps) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    setCodeSent(true);
    alert("인증 코드가 발송되었습니다.");
  };

  const canNext = Boolean(nickname && email && code && password && confirm && password === confirm);

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>닉네임</label>
        <input className={styles.formInput} type="text" placeholder="사용할 닉네임을 입력하세요" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>이메일</label>
        <div className={styles.inputRow}>
          <input className={styles.formInput} type="email" placeholder="이메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="button" className={styles.btnOutline} onClick={handleSendCode}>
            인증 발송
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>인증 코드</label>
        <div className={styles.inputRow}>
          <input className={styles.formInput} type="text" placeholder="이메일로 받은 6자리 코드" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="button" className={styles.btnSolid}>확인</button>
        </div>
        {codeSent && <div className={styles.formHint}>인증 코드가 발송되었습니다. 5분 이내에 입력해주세요.</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>비밀번호</label>
        <input className={styles.formInput} type="password" placeholder="8자 이상, 영문+숫자 조합" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>비밀번호 확인</label>
        <input className={styles.formInput} type="password" placeholder="비밀번호를 다시 입력하세요" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {confirm && password !== confirm && <div className={styles.errorHint}>비밀번호가 일치하지 않습니다.</div>}
      </div>

      <button className={styles.btnPrimary} disabled={!canNext} onClick={onNext}>
        다음 단계
      </button>

      <div className={styles.loginLink}>
        이미 계정이 있으신가요? <span>로그인</span>
      </div>
    </>
  );
}

function AllergyStep({ onNext }: StepProps) {
  const [selected, setSelected] = useState<AllergyKey[]>(["chicken"]);
  const [customAllergies, setCustomAllergies] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const allergies: { key: AllergyKey; label: string }[] = [
    { key: "shrimp", label: "새우" },
    { key: "peanut", label: "땅콩" },
    { key: "milk", label: "우유" },
    { key: "chicken", label: "닭" },
    { key: "wheat", label: "밀" },
  ];

  const customItems = customAllergies.map((label) => ({
    key: `custom-${label}`,
    label,
  }));

  const toggleAllergy = (key: AllergyKey) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const addCustomAllergy = () => {
    const value = customInput.trim();

    if (!value) {
      alert("알레르기 재료를 입력해주세요.");
      return;
    }

    if (customAllergies.includes(value)) {
      alert("이미 추가된 알레르기 재료입니다.");
      return;
    }

    setCustomAllergies((prev) => [...prev, value]);
    setSelected((prev) => [...prev, `custom-${value}`]);
    setCustomInput("");
  };

  return (
    <>
      <section className={styles.allergyBox}>
        <h3 className={styles.allergyTitle}>알레르기 재료 설정 (선택)</h3>

        <div className={styles.allergyList}>
          {[...allergies, ...customItems].map((item) => {
            const isSelected = selected.includes(item.key);
            return (
              <button
                key={item.key}
                type="button"
                className={`${styles.allergyChip} ${isSelected ? styles.selected : ""}`}
                onClick={() => toggleAllergy(item.key)}
              >
                {item.label}
                {isSelected && <b>✓</b>}
              </button>
            );
          })}
        </div>

        <div className={styles.customInputRow}>
          <input
            className={styles.customInput}
            type="text"
            placeholder="알레르기 재료 직접 입력"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomAllergy();
              }
            }}
          />
          <button type="button" className={styles.customChip} onClick={addCustomAllergy}>
            추가
          </button>
        </div>
      </section>

      <button className={styles.btnPrimary} onClick={onNext}>
        회원가입 완료
      </button>

      <div className={styles.loginLink}>
        이미 계정이 있으신가요? <span>로그인</span>
      </div>
    </>
  );
}

function CompleteStep() {
  return (
    <div className={styles.completeBox}>
      <div className={styles.completeIcon}>🎉</div>
      <div className={styles.completeTitle}>회원가입이 완료되었습니다!</div>
      <div className={styles.completeText}>
        CookMate에 오신 것을 환영합니다.<br />
        이제 로그인 후 서비스를 이용할 수 있습니다.
      </div>
      <button className={styles.completeButton}>로그인하러 가기</button>
    </div>
  );
}

export default function RegisterPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const allowBackRef = useRef(false);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (allowBackRef.current) return;

      const confirmed = window.confirm("모든 입력된 값이 사라집니다. 뒤로 가시겠습니까?");

      if (confirmed) {
        allowBackRef.current = true;
        window.history.back();
        return;
      }

      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <>
      <GlobalHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className={styles.pageWrap}>
        <div className={styles.formBox}>
          <div className={styles.logoArea}>
            <span className={styles.logoText}>
              Cook<span>Mate</span>
            </span>
            <div className={styles.logoSub}>새 계정 만들기</div>
          </div>

          <div className={styles.card}>
            <StepBar currentStep={step} />
            {step === 1 && <AgreeStep onNext={() => setStep(2)} />}
            {step === 2 && <BasicInfoStep onNext={() => setStep(3)} />}
            {step === 3 && <AllergyStep onNext={() => setStep(4)} />}
            {step === 4 && <CompleteStep />}
          </div>
        </div>
      </main>

      <div className={styles.bottomNav}>
        <div className={styles.bottomNavInner}>
          {[
            { label: "홈", active: false },
            { label: "레시피", active: false },
            { label: "AI추천", active: false },
            { label: "내 정보", active: true },
          ].map((item) => (
            <span key={item.label} className={`${styles.bnavItem}${item.active ? ` ${styles.active}` : ""}`}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
