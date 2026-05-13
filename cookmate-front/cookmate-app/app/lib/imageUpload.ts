interface PresignedImageResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
}

const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL;

export async function uploadImageWithPresignedUrl(file: File, dir: string) {
  if (!IMAGE_API_URL) {
    throw new Error("이미지 업로드 API 주소가 설정되지 않았습니다.");
  }

  const presignedRes = await fetch(`${IMAGE_API_URL}/images/presigned-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dir,
      contentType: file.type,
      fileName: file.name,
    }),
  });

  if (!presignedRes.ok) {
    const message = await readErrorMessage(presignedRes);
    throw new Error(message || "이미지 업로드 URL 생성에 실패했습니다.");
  }

  const presigned = (await presignedRes.json()) as PresignedImageResponse;

  const uploadRes = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("이미지 업로드에 실패했습니다.");
  }

  return presigned.fileUrl;
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (data && typeof data === "object" && "message" in data) {
      return String(data.message);
    }
  } catch {
    return "";
  }

  return "";
}
