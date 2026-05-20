"use client";

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import styles from './write.module.css';
import { useUserInfoActions } from '@/app/hooks/useUserInfoActions'; 

function InquiryWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit'); 
  const isEditMode = !!editId; 

  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    typeName: '', 
    content: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 훅을 사용하여 로그인 유저 정보 가져오기
  const { userInfo, isLoggedIn } = useUserInfoActions();
  const loginUserNo = userInfo?.userNo;

  // 마운트 상태 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (!isMounted || !isEditMode || !editId) return;

    const fetchExistingInquiry = async () => {
      try {
        const response = await api.get(`/users/inquiries/${editId}`);
        if (response.status === 200) {
          const data = response.data;
          setFormData({
            title: data.title,
            typeName: data.typeName,
            content: data.content
          });
        }
      } catch (error) {
        console.error("기존 문의 내역 불러오기 실패:", error);
        alert("데이터를 불러오지 못했습니다.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchExistingInquiry();
  }, [editId, isEditMode, isMounted, router]);

  const isFormValid = formData.title.trim() !== '' && 
                      formData.typeName !== '' && 
                      formData.content.trim() !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 등록 및 수정 제출
  const handleSubmit = async () => {
    if (!loginUserNo) {
      alert("로그인 정보가 유효하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, userNo: loginUserNo }; 
      
      if (isEditMode) {
        const response = await api.put(`/users/inquiries/${editId}`, payload);
        if (response.status === 200) {
          alert('문의가 성공적으로 수정되었습니다.');
          router.push(`/mypage/inquiries/${editId}`);
        }
      } else {
        const response = await api.post('/users/inquiries', payload);
        if (response.status === 200) {
          alert('문의가 성공적으로 등록되었습니다.');
          router.push('/mypage/inquiries');
        }
      }
    } catch (err) {
      console.error("등록/수정 실패", err);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  // 로그인 체크
  if (!isLoggedIn || !loginUserNo) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>로그인이 필요한 서비스입니다.</div>;
  }

  // 데이터 로딩 (수정 시)
  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>문의 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className={styles.mainInner}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>
          <span className={styles.pageTitleIcon}></span> {isEditMode ? '문의 수정' : '문의 작성'}
        </h2>
      </div>

      <div className={styles.card}>
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목 <span>*</span></label>
            <input 
              type="text" 
              name="title"
              className={styles.formInput} 
              placeholder="문의 제목을 입력해주세요"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>문의 종류 <span>*</span></label>
            <select 
              name="typeName"
              className={styles.formInput}
              value={formData.typeName}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">문의 종류를 선택해주세요</option>
              <option value="계정">계정</option>
              <option value="레시피">레시피</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>문의 내용 <span>*</span></label>
            <textarea 
              name="content"
              className={styles.formInput} 
              style={{ minHeight: '200px' }}
              placeholder="문의 내용을 자세히 작성해주세요."
              value={formData.content}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formFooter}>
          <button 
            className={`${styles.btn} ${styles.btnCancel}`} 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSubmit}`}
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? '처리 중...' : (isEditMode ? '수정 완료' : '문의 등록')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InquiryWritePage() {
  return (
    <Suspense fallback={null}>
      <InquiryWriteContent />
    </Suspense>
  );
}
