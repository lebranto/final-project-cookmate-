import { NextRequest, NextResponse } from "next/server";

const AI_RECIPE_API_URL = process.env.AI_RECIPE_API_URL || process.env.NEXT_PUBLIC_AI_RECIPE_API_URL;

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  if (!AI_RECIPE_API_URL) {
    return NextResponse.json({ message: "AI 추천 API 주소가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(AI_RECIPE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("AI Lambda 호출 실패:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    const cause =
      error instanceof Error && "cause" in error && error.cause
        ? String(error.cause)
        : "";

    return NextResponse.json(
      {
        message: "AI 추천 요청에 실패했습니다.",
        detail: cause ? `${message} (${cause})` : message,
        target: AI_RECIPE_API_URL,
      },
      { status: 502 }
    );
  }
}
