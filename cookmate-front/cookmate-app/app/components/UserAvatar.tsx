"use client";

import Avatar from "boring-avatars";

const AVATAR_COLORS = ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"];

interface UserAvatarProps {
  imageUrl?: string | null; // DB에서 가져온 이미지 URL (또는 boring: 식별자)
  name: string;             // 이미지가 없을 때 시드로 쓸 값 (이메일이나 닉네임)
  size?: number | string;   // 아바타 크기 (기본값 40)
}

export default function UserAvatar({ imageUrl, name, size = 40 }: UserAvatarProps) {
  // imageUrl이 존재하면서 && "boring:"으로 시작하는지 확인
  const isBoringAvatar = imageUrl && imageUrl.startsWith("boring:");

  // 아바타를 동그랗게 유지하는 공통 스타일
  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#eee", 
  };

  // 1. 유저가 '기본으로 변경'으로 저장한 랜덤 아바타
  if (isBoringAvatar) {
    return (
      <div style={wrapperStyle}>
        <Avatar 
          size="100%" 
          // !를 붙여서 TypeScript에게 "이건 절대 null 아님"을 한 번 더 보장해줌
          name={imageUrl!.replace("boring:", "")} 
          variant="beam" 
          colors={AVATAR_COLORS} 
        />
      </div>
    );
  }

  // 2. 유저가 직접 사진을 업로드한 경우
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt="프로필" 
        style={{ ...wrapperStyle, objectFit: "cover" }} 
      />
    );
  }

  // 3. 아무것도 설정 안 한 기본 유저
  return (
    <div style={wrapperStyle}>
      <Avatar 
        size="100%" 
        name={name} 
        variant="beam" 
        colors={AVATAR_COLORS} 
      />
    </div>
  );
}