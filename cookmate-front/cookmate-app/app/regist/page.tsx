"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./RegisterPage.module.css";
import { RegisterForm, RegisterStep } from "../type/register";

type Step = {
  num: number;
  label: string;
};

type StepBarProps = {
  currentStep: number;
};

type StepProps = {
  onNext: () => void;
  form: RegisterForm;
  setForm: React.Dispatch<React.SetStateAction<RegisterForm>>;
};

type AgreeKey = "all" | "terms" | "privacy" | "age" | "marketing";

type RequiredAgreeKey = Exclude<AgreeKey, "all">;

type AgreeState = Record<AgreeKey, boolean>;

type OpenTermsState = Record<RequiredAgreeKey, boolean>;

type AllergyKey = string;

const PASSWORD_RULE_MESSAGE = "비밀번호는 8자 이상이며 영문자와 숫자를 모두 포함해야 합니다.";

function isValidPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

const STEPS: Step[] = [
  { num: 1, label: "동의 사항" },
  { num: 2, label: "기본 정보" },
  { num: 3, label: "알레르기 설정" },
  { num: 4, label: "완료" },
];

const TERM_CONTENTS: Record<RequiredAgreeKey, string> = {
  terms:
    "CookMate 서비스 이용을 위해 필요한 기본 약관입니다. 회원은 서비스를 정상적인 목적에 맞게 이용해야 하며, 타인의 계정 도용, 서비스 방해, 부정 이용 행위를 해서는 안 됩니다.",
  privacy:
    "회원가입 및 서비스 제공을 위해 이메일, 닉네임 등 필요한 개인정보를 수집할 수 있습니다. 수집된 정보는 회원 관리, 본인 확인, 서비스 제공 목적으로만 사용됩니다.",
  age:
    "CookMate는 만 14세 이상 사용자를 대상으로 합니다. 만 14세 미만 사용자는 보호자의 동의 없이 회원가입을 진행할 수 없습니다.",
  marketing:
    "이벤트, 추천 레시피, 서비스 혜택 등 마케팅 정보를 이메일 또는 알림으로 받을 수 있습니다. 선택 항목이므로 동의하지 않아도 회원가입은 가능합니다.",
};

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

  const [openTerms, setOpenTerms] = useState<OpenTermsState>({
    terms: false,
    privacy: false,
    age: false,
    marketing: false,
  });

  const toggleAll = () => {
    const nextValue = !agrees.all;
    setAgrees({ all: nextValue, terms: nextValue, privacy: nextValue, age: nextValue, marketing: nextValue });
  };

  const toggle = (key: RequiredAgreeKey) => {
    const next = { ...agrees, [key]: !agrees[key] };
    next.all = next.terms && next.privacy && next.age && next.marketing;
    setAgrees(next);
  };

  const toggleTermDropdown = (key: RequiredAgreeKey) => {
    setOpenTerms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const canNext = agrees.terms && agrees.privacy && agrees.age;

  const items: { key: RequiredAgreeKey; label: string; required: boolean }[] = [
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
            <div key={item.key}>
              <div className={styles.agreeItem}>
                <button
                  type="button"
                  className={`${styles.checkbox} ${agrees[item.key] ? styles.checked : ""}`}
                  onClick={() => toggle(item.key)}
                  aria-label={`${item.label} 체크`}
                  style={{ border: 0 }}
                >
                  {agrees[item.key] && "✓"}
                </button>

                <span onClick={() => toggle(item.key)} style={{ cursor: "pointer" }}>
                  {item.label}
                  {item.required ? <em className={styles.required}> (필수)</em> : <em className={styles.optional}> (선택)</em>}
                </span>

                <button
                  type="button"
                  className={styles.agreeArrowBtn}
                  onClick={() => toggleTermDropdown(item.key)}
                  aria-label={`${item.label} 약관 보기`}
                  style={{
                    marginLeft: "auto",
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    transform: openTerms[item.key] ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "0.2s",
                  }}
                >
                  ›
                </button>
              </div>

              {openTerms[item.key] && (
                <div
                  style={{
                    margin: "0 14px 12px 46px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#fff7f1",
                    color: "#555",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {TERM_CONTENTS[item.key]}
                </div>
              )}
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

function BasicInfoStep({ onNext, setForm }: StepProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");   // 선택사항으로 이동
  const [intro, setIntro] = useState("");
  const [address, setAddress] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const passwordValid = isValidPassword(password);


  // 이메일로 인증 코드를 발송 할때

  const handleSendCode = async () => {
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
    const response = await fetch("http://localhost:8081/api/auth/signup/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        setCodeSent(false);
        setEmailVerified(false);
        alert("이미 존재하는 아이디 입니다.");
        return;
      }

      alert("인증 코드 발송 실패");
      return;
    }

    // 바꿔야할 부분!!
    setCodeSent(true);
    setEmailVerified(false);
    alert("인증 코드가 발송되었습니다.(인증번호 123456)");
  } catch (error) {
    console.error(error);
    alert("서버 연결 실패");
  }
  };


  //인증코드가 맞는지 확인 하기 위해 사용하는 코드

  const handleVerifyCode = async () => {
  if (!email || !code) {
    alert("이메일과 인증 코드를 입력해주세요.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8081/api/auth/email/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
      }),
    });

    if (!response.ok) {
      alert("인증 코드가 올바르지 않습니다.");
      setEmailVerified(false);
      return;
    }

    setEmailVerified(true);
    alert("이메일 인증이 완료되었습니다.");
  } catch (error) {
    console.error(error);
    alert("서버 연결 실패");
  }
};

  // 닉네임은 선택사항이므로 canNext 조건에서 제외
  const canNext = Boolean(
    email &&
    emailVerified &&
    password &&
    passwordValid &&
    confirm &&
    password === confirm
  );

  // 닉네임을 적지 않고 넘어가면 앞의 닉네임을 자신의 닉네임으로 만드는 코드
  const handleNext = () => {
  const defaultNickname = email.split("@")[0];

  setForm((prev) => ({
    ...prev,
    email,
    code,
    password,
    confirmPassword: confirm,
    nickname: nickname.trim() || defaultNickname,
    introduce: intro,
    address,
  }));

  onNext();
};


  return (
    <>
      {/* 이메일 */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>이메일</label>
        <div className={styles.inputRow}>
          <input
            className={styles.formInput}
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailVerified(false);
              setCodeSent(false);
            }}
          />
          <button type="button" className={styles.btnOutline} onClick={handleSendCode}>
            인증 발송
          </button>
        </div>
      </div>

      {/* 인증 코드 */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>인증 코드</label>
        <div className={styles.inputRow}>
          <input
            className={styles.formInput}
            type="text"
            placeholder="이메일로 받은 6자리 코드"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setEmailVerified(false);
            }}
          />
          <button type="button" className={styles.btnSolid} onClick={handleVerifyCode}>확인</button>
        </div>
        {codeSent && (
          <div className={styles.formHint}>
            인증 코드가 발송되었습니다. 5분 이내에 입력해주세요.
          </div>
        )}
      </div>

      {/* 비밀번호 */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>비밀번호</label>
        <input
          className={styles.formInput}
          type="password"
          placeholder="8자 이상, 영문+숫자 조합"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password && !passwordValid && (
          <div className={styles.errorHint}>{PASSWORD_RULE_MESSAGE}</div>
        )}
        {!password && (
          <div className={styles.formHint}>{PASSWORD_RULE_MESSAGE}</div>
        )}
      </div>

      {/* 비밀번호 확인 */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>비밀번호 확인</label>
        <input
          className={styles.formInput}
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {confirm && password !== confirm && (
          <div className={styles.errorHint}>비밀번호가 일치하지 않습니다.</div>
        )}
      </div>

      {/* 닉네임 (선택) — 비밀번호 확인 아래로 이동 */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          닉네임 <span className={styles.optional}>(선택)</span>
        </label>
        <input
          className={styles.formInput}
          type="text"
          placeholder="사용할 닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      {/* 자기소개 (선택) */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          자기소개 <span className={styles.optional}>(선택)</span>
        </label>
        <textarea
          className={styles.formInput}
          placeholder="간단한 자기소개를 입력하세요"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          style={{ resize: "none", height: "auto", paddingTop: "12px" }}
        />
      </div>

      {/* 주소 (선택) */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          주소 <span className={styles.optional}>(선택)</span>
        </label>
        <input
          className={styles.formInput}
          type="text"
          placeholder="주소를 입력하세요"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <button
        className={styles.btnPrimary}
        disabled={!canNext}
        onClick={handleNext}
      >
        다음 단계
      </button>

      <div className={styles.loginLink}>
        이미 계정이 있으신가요? <span>로그인</span>
      </div>
    </>
  );
}


function AllergyStep({ onNext, form }: StepProps) {
  const [selected, setSelected] = useState<AllergyKey[]>([]);
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

  // DB로 값 보내는 코드

  const handleSignup = async () => {
  const selectedLabels = selected
    .map((key) => {
      const found = [...allergies, ...customItems].find((item) => item.key === key);
      return found?.label;
    })
    .filter((label): label is string => Boolean(label));

  const signupData = {
    userEmail: form.email,
    userPw: form.password,
    nickname: form.nickname || form.email.split("@")[0],
    introduce: form.introduce,
    address: form.address,
    allergies: selectedLabels,
  };

  console.log("회원가입 요청 데이터:", signupData);

  try {
    const response = await fetch("http://localhost:8081/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(signupData),
    });

    console.log("회원가입 응답 상태:", response.status);

    if (!response.ok) {
      alert("회원가입 실패");
      return;
    }

    alert("회원가입이 완료되었습니다.");
    onNext();
  } catch (error) {
    console.error(error);
    alert("서버 연결 실패");
  }
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

      <button className={styles.btnPrimary} onClick={handleSignup}>
        회원가입 완료
      </button>

      <div className={styles.loginLink}>
        이미 계정이 있으신가요? <span>로그인</span>
      </div>
    </>
  );
}

function CompleteStep() {
 const router = useRouter();

  return (
    <div className={styles.completeBox}>
      <div className={styles.completeIcon}>🎉</div>
      <div className={styles.completeTitle}>회원가입이 완료되었습니다!</div>
      <div className={styles.completeText}>
        CookMate에 오신 것을 환영합니다.<br />
        이제 로그인 후 서비스를 이용할 수 있습니다.
      </div>
      <button className={styles.completeButton} onClick={() => router.push("/login")}>
        로그인하러 가기
      </button>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>(1);

  const [form, setForm] = useState<RegisterForm>({
    agreements: {
      terms: false,
      privacy: false,
      age: false,
      marketing: false,
    },

    nickname: "",
    email: "",
    code: "",
    password: "",
    confirmPassword: "",

    introduce: "",
    address: "",

    allergies: [],
  });

  const allowBackRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    window.history.replaceState({ registerBase: true }, "", window.location.href);
    window.history.pushState({ registerGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (allowBackRef.current) return;

      const confirmed = window.confirm(
        "모든 입력된 값이 사라집니다. 뒤로 가시겠습니까?"
      );

      if (confirmed) {
        allowBackRef.current = true;
        window.removeEventListener("popstate", handlePopState);
        window.history.go(-1);
        return;
      }

      window.history.pushState({ registerGuard: true }, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
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

          {step === 1 && (
            <AgreeStep
              form={form}
              setForm={setForm}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <BasicInfoStep
              form={form}
              setForm={setForm}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <AllergyStep
              form={form}
              setForm={setForm}
              onNext={() => setStep(4)}
            />
          )}

          {step === 4 && <CompleteStep />}
        </div>
      </div>
    </main>
  );
}
