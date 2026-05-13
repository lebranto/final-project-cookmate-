"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import styles from './profile.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions';
import { uploadImageWithPresignedUrl } from "@/app/lib/imageUpload";

const ALLERGY_OPTIONS = [
  "새우", "땅콩", "우유", "달걀", "밀(글루텐)", 
  "대두(콩)", "복숭아", "토마토", "호두"
];

interface MemberProfile {
  userNo: number;
  userEmail: string;
  nickname: string;
  introduce: string;
  profileImageUrl: string;
  allergies: string[];
}

export default function ProfileEditPage() {
  const [isMounted, setIsMounted] = useState(false);

  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  const [member, setMember] = useState<MemberProfile>({
    userNo: 0,
    userEmail: "",
    nickname: "",
    introduce: "",
    profileImageUrl: "",
    allergies: []
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [currentPwStatus, setCurrentPwStatus] = useState('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  
  // 선택한 실제 파일 객체를 담을 상태 (현재 미사용, 백엔드 복구 시 사용)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [customAllergy, setCustomAllergy] = useState("");
  const [saveStatus, setSaveStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !loginUserNo) {
      if (isMounted && !loginUserNo) setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/profile/${loginUserNo}`);
        if (response.status === 200) {
          const data = response.data;
          setMember({
            userNo: data.userNo,
            userEmail: data.userEmail || "",
            nickname: data.nickname || "",
            introduce: data.introduce || "",
            profileImageUrl: data.profileImageUrl || "",
            allergies: data.allergies || []
          });
          setImgError(false);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [loginUserNo, isMounted]);

  const verifyCurrentPassword = async () => {
    if (!passwords.current || !loginUserNo) {
      setCurrentPwStatus('idle');
      return;
    }
    setCurrentPwStatus('checking');
    try {
      const response = await api.post('/users/profile/verify-password', {
        userNo: loginUserNo,
        password: passwords.current
      });
      if (response.data.isValid) {
        setCurrentPwStatus('matched');
      } else {
        setCurrentPwStatus('mismatched');
      }
    } catch (error) {
      console.error("비밀번호 검증 에러", error);
      setCurrentPwStatus('mismatched');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); 
      setPreviewUrl(URL.createObjectURL(file)); 
      setImgError(false); 
    }
  };

  const resetImageToDefault = () => {
    setSelectedFile(null); 
    setPreviewUrl(""); 
    setImgError(false);
    setMember(prev => ({ ...prev, profileImageUrl: "" })); 
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const toggleAllergy = (name: string) => {
    setMember(prev => ({
      ...prev,
      allergies: prev.allergies.includes(name)
        ? prev.allergies.filter(a => a !== name)
        : [...prev.allergies, name]
    }));
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim();
    if (!trimmed) return;
    if (!member.allergies.includes(trimmed)) {
      setMember(prev => ({ ...prev, allergies: [...prev.allergies, trimmed] }));
    }
    setCustomAllergy("");
  };

  const isNewPwTooShort = passwords.new.length > 0 && passwords.new.length < 8;
  const isPwMatch = passwords.new && passwords.confirm && passwords.new === passwords.confirm;

  const handleSave = async () => {
    if (!loginUserNo) return;

    if (passwords.current || passwords.new || passwords.confirm) {
      if (currentPwStatus !== 'matched') {
        alert("현재 비밀번호를 정확히 확인해 주세요.");
        return;
      }
      if (passwords.new.length < 8) {
        alert("새 비밀번호는 8자리 이상으로 설정해 주세요.");
        return;
      }
      if (!isPwMatch) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = member.profileImageUrl;

      if (selectedFile) {
        try {
          const uploadedUrl = await uploadImageWithPresignedUrl(selectedFile, "profiles");
          finalImageUrl = uploadedUrl;
        } catch (uploadErr) {
          console.error("이미지 업로드 실패:", uploadErr);
          alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
          setIsSubmitting(false);
          return; 
        }
      }

      const payload = {
        userNo: loginUserNo,
        nickname: member.nickname,
        introduce: member.introduce,
        profileImageUrl: finalImageUrl, 
        allergies: member.allergies,
        ...(passwords.new && { newPassword: passwords.new })
      };

      const response = await api.post('/users/profile/update', payload);

      if (response.status === 200) {
        setSaveStatus(true);
        setPasswords({ current: "", new: "", confirm: "" });
        setCurrentPwStatus('idle');
        setPreviewUrl(""); 
        setSelectedFile(null);
        setMember(prev => ({ ...prev, profileImageUrl: finalImageUrl }));
        
        alert("회원 정보가 성공적으로 수정되었습니다.");
        setTimeout(() => setSaveStatus(false), 2000);
      }
    } catch (err: any) {
      console.error("수정 실패", err);
      const msg = err.response?.data || "수정 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  if (!isLoggedIn || !loginUserNo) { 
    return <div style={{ padding: '50px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  if (loading) return <div className={styles.loader}>데이터를 불러오는 중입니다...</div>; 

  const displayImageUrl = previewUrl || member.profileImageUrl;

  return (
    <div className={styles.container}>
      <h2 className={styles.sectionTitle}>회원 정보 수정</h2>

      <div className={styles.formCard}>
        <div className={styles.formCardTitle}>프로필 이미지</div>
        <div className={styles.avatarRow}>
          <div className={styles.avatarBig}>
             {(!displayImageUrl || imgError) ? (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', width: '100%', height: '100%', backgroundColor: '#eee', color: '#666', fontWeight: 'bold' }}>
                 {member.nickname ? member.nickname.charAt(0) : 'U'}
               </div>
             ) : (
               <img src={displayImageUrl} alt="프로필" className={styles.avatarImg} onError={() => setImgError(true)} style={{ objectFit: 'cover' }} />
             )}
          </div>
          <div className={styles.avatarActions}>
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
            <button className={styles.avatarBtn} onClick={() => fileInputRef.current?.click()}>이미지 변경</button>
            <button className={styles.avatarBtn} onClick={resetImageToDefault}>기본으로 변경</button>
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardTitle}>기본 정보</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>닉네임</label>
            <input className={styles.formInput} type="text" value={member.nickname} onChange={(e) => setMember({...member, nickname: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <input className={styles.formInput} type="email" value={member.userEmail} readOnly style={{backgroundColor: '#f5f5f5'}} />
          </div>
          <div className={`${styles.formGroup} ${styles.full}`}>
            <label className={styles.formLabel}>한 줄 소개</label>
            <input className={styles.formInput} type="text" value={member.introduce} onChange={(e) => setMember({...member, introduce: e.target.value})} placeholder="소개글을 입력해 주세요." />
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardTitle}>비밀번호 변경 (선택)</div>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.full}`}>
            <label className={styles.formLabel}>현재 비밀번호</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                className={styles.formInput} type="password" placeholder="비밀번호 변경 시에만 입력" 
                style={{ maxWidth: '320px' }}
                value={passwords.current}
                onChange={(e) => {
                  setPasswords({...passwords, current: e.target.value});
                  setCurrentPwStatus('idle'); 
                }}
                onBlur={verifyCurrentPassword} 
              />
              {currentPwStatus === 'checking' && <span className={styles.formHint}>확인 중...</span>}
              {currentPwStatus === 'matched' && <span className={`${styles.formHint} ${styles.textSuccess}`}>✓ 확인됨</span>}
              {currentPwStatus === 'mismatched' && <span className={`${styles.formHint} ${styles.textError}`}>불일치</span>}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>새 비밀번호</label>
            <input className={styles.formInput} type="password" placeholder="새 비밀번호 (8자 이상)" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
            {isNewPwTooShort && <span className={`${styles.formHint} ${styles.textError}`}>8자리 이상이어야 합니다.</span>}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>새 비밀번호 확인</label>
            <input className={styles.formInput} type="password" placeholder="새 비밀번호 재입력" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
            {isPwMatch && <span className={`${styles.formHint} ${styles.textSuccess}`}>✓ 일치합니다</span>}
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardTitle}>알레르기 정보</div>
        <div className={styles.allergyGrid}>
          {ALLERGY_OPTIONS.map(name => (
            <div key={name} className={`${styles.allergyTag} ${member.allergies.includes(name) ? styles.selected : ''}`} onClick={() => toggleAllergy(name)}>
              {name}
              {member.allergies.includes(name) && <span className={styles.tagX}>✕</span>}
            </div>
          ))}
          {member.allergies.filter(a => !ALLERGY_OPTIONS.includes(a)).map(name => (
            <div key={name} className={`${styles.allergyTag} ${styles.selected}`} onClick={() => toggleAllergy(name)}>
              {name}<span className={styles.tagX}>✕</span>
            </div>
          ))}
        </div>
        <div className={styles.customRow}>
          <input className={styles.customInput} placeholder="직접 입력..." value={customAllergy} onChange={(e) => setCustomAllergy(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()} />
          <button className={styles.btnSave} style={{fontSize: '12px', padding: '7px 14px'}} onClick={addCustomAllergy}>+ 추가</button>
        </div>
      </div>

      <div className={styles.saveBar}>
        <button className={styles.btnSave} onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
        {saveStatus && <span className={styles.saveMsg}>✓ 저장되었습니다</span>}
      </div>
    </div>
  );
}