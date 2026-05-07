"use client"; // 클라이언트 컴포넌트 선언

import { useEffect, useState } from 'react';
import api from '@/lib/axios'; // 위에서 만든 api 불러오기

// 백엔드에서 받아올 데이터 타입 정의 (TypeScript니까!)
interface Chef {
  userNo: number;
  nickname: string;
  recipeCount: number;
}

export default function Home() {
  const [rankers, setRankers] = useState<Chef[]>([]);

  useEffect(() => {
    api.get('/users/ranking?filter=recipe')
      .then(res => setRankers(res.data))
      .catch(err => console.error("데이터 로딩 실패!", err));
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>👨‍🍳 Cookmate 실시간 랭킹</h1>
      <hr />
      <div style={{ marginTop: '1rem' }}>
        {rankers.length > 0 ? (
          rankers.map((chef) => (
            <div key={chef.userNo} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong>{chef.nickname}</strong> 셰프님 (레시피: {chef.recipeCount}개)
            </div>
          ))
        ) : (
          <p>데이터를 가져오는 중입니다...</p>
        )}
      </div>
    </main>
  );
}