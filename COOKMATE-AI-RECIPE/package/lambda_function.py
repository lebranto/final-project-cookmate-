import base64
import json
import traceback

from agent import recommend_recipes
from tools import AiRecipeError

ALLOWED_ORIGIN = "http://localhost:3000"


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }


def parse_body(event):
    raw_body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw_body = base64.b64decode(raw_body).decode("utf-8")
    return json.loads(raw_body)


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    if method == "OPTIONS":
        return response(200, {})

    try:
        body = parse_body(event)
        result = recommend_recipes(body)
        return response(200, result)

    except AiRecipeError as error:
        return response(error.status_code, {"message": error.message})

    except Exception as error:
        print(traceback.format_exc())
        return response(500, {"message": f"AI 레시피 생성에 실패했습니다: {error}"})
