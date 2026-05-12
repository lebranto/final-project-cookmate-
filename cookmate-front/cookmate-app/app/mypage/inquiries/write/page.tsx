"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import styles from './write.module.css';

export default function InquiryWritePage() {
  const router = useRouter();
  // 🌟 URL의 ?edit=파라미터를 읽어오기 위해 useSearchParams 사용
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit'); 
  const isEditMode = !!editId; // editId가 있으면 수정 모드로 판단

  const [formData, setFormData] = useState({
    title: '',
    typeName: '', // 계정, 레시피, 기타
    content: ''
  });
  const [loading, setLoading] = useState(isEditMode); // 수정 모드면 초기 로딩을 true로

  const loginUserNo = 1; // 임시 로그인 유저 번호

  // 🌟 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
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

    if (isEditMode) {
      fetchExistingInquiry();
    }
  }, [editId, isEditMode, router]);

  // 필수 입력값 확인
  const isFormValid = formData.title.trim() !== '' && 
                      formData.typeName !== '' && 
                      formData.content.trim() !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🌟 등록 및 수정 (POST / PUT) API 호출
  const handleSubmit = async () => {
    try {
      const payload = { ...formData, userNo: loginUserNo }; 
      
      if (isEditMode) {
        const response = await api.put(`/users/inquiries/${editId}`, payload);
        if (response.status === 200) {
          alert('문의가 성공적으로 수정되었습니다.');
          router.push(`/mypage/inquiries/${editId}`); // 수정한 글 상세페이지로 이동
        }
      } else {
        // 신규 등록 모드: POST 요청
        const response = await api.post('/users/inquiries', payload);
        if (response.status === 200) {
          alert('문의가 성공적으로 등록되었습니다.');
          router.push('/mypage/inquiries');
        }
      }
    } catch (err) {
      console.error("등록/수정 실패", err);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className={styles.mainInner}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>
          {/* 🌟 모드에 따라 타이틀 변경 */}
          <span className={styles.pageTitleIcon}>💬</span> {isEditMode ? '문의 수정' : '문의 작성'}
        </h2>
      </div>

      <div className={styles.card}>
        <div className={styles.formSection}>
          {/* 제목 입력 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목 <span>*</span></label>
            <input 
              type="text" 
              name="title"
              className={styles.formInput} 
              placeholder="문의 제목을 입력해주세요"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* 문의 종류 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>문의 종류 <span>*</span></label>
            <select 
              name="typeName"
              className={styles.formInput}
              value={formData.typeName}
              onChange={handleChange}
            >
              <option value="">문의 종류를 선택해주세요</option>
              <option value="계정">계정</option>
              <option value="레시피">레시피</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 내용 입력 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>문의 내용 <span>*</span></label>
            <textarea 
              name="content"
              className={styles.formInput} 
              placeholder="문의 내용을 자세히 작성해주세요."
              value={formData.content}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 푸터 버튼 영역 */}
        <div className={styles.formFooter}>
          <button 
            className={`${styles.btn} ${styles.btnCancel}`} 
            onClick={() => router.back()}
          >
            취소
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSubmit}`}
            disabled={!isFormValid}
            onClick={handleSubmit}
          >
            {/* 🌟 모드에 따라 버튼 텍스트 변경 */}
            {isEditMode ? '수정 완료' : '문의 등록'}
          </button>
        </div>
      </div>
    </div>
  );
}