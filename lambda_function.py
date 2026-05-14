import json
import os
import uuid
from datetime import datetime
from urllib.parse import quote
from botocore.config import Config

import boto3

REGION = os.environ.get("AWS_REGION_NAME", "ap-northeast-2")

s3 = boto3.client(
    "s3",
    region_name=REGION,
    endpoint_url=f"https://s3.{REGION}.amazonaws.com",
    config=Config(signature_version="s3v4")
)

BUCKET_NAME = os.environ["BUCKET_NAME"]
PUBLIC_BASE_URL = os.environ.get(
    "PUBLIC_BASE_URL",
    f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com"
).strip().split()[0]

ALLOWED_DIRS = {
    "recipes/covers",
    "recipes/steps",
    "users/profiles",
}

EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }


def lambda_handler(event, context):
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return response(200, {})

    try:
        body = json.loads(event.get("body") or "{}")

        directory = body.get("dir")
        content_type = body.get("contentType")
        original_name = body.get("fileName", "image")

        if directory not in ALLOWED_DIRS:
            return response(400, {"message": "허용되지 않은 업로드 경로입니다."})

        if content_type not in EXTENSIONS:
            return response(400, {"message": "이미지 파일만 업로드할 수 있습니다."})

        now = datetime.now().strftime("%Y%m%d%H%M%S%f")[:-3]
        ext = EXTENSIONS[content_type]
        safe_id = uuid.uuid4().hex[:12]
        file_key = f"{directory}/{now}_{safe_id}.{ext}"

        upload_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": file_key,
                "ContentType": content_type,
            },
            ExpiresIn=300,
        )

        file_url = f"{PUBLIC_BASE_URL.rstrip('/')}/{quote(file_key)}"

        return response(200, {
            "uploadUrl": upload_url,
            "fileKey": file_key,
            "fileUrl": file_url,
        })

    except Exception as e:
        print(e)
        return response(500, {"message": "업로드 URL 생성에 실패했습니다."})
