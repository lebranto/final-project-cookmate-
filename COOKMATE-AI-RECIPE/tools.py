import json
import os
import re
import uuid
from typing import Any

from openai import AuthenticationError, OpenAI, RateLimitError

from schema import (
    ALLOWED_CALORIES,
    ALLOWED_COOK_TIMES,
    ALLOWED_DIFFICULTIES,
    ALLOWED_TYPE_NAMES,
    DEFAULT_CALORY,
    DEFAULT_COOK_TIME,
    DEFAULT_DIFFICULTY,
    DEFAULT_TYPE_NAME,
    MAX_RECIPE_COUNT,
    MAX_STEP_COUNT,
    MIN_RECIPE_COUNT,
    MIN_STEP_COUNT,
    TARGET_RECIPE_COUNT,
)

MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-nano")
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


class AiRecipeError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def split_input_items(items: list[str] | None) -> list[str]:
    if not items:
        return []

    result: list[str] = []
    seen: set[str] = set()
    for item in items:
        for part in re.split(r"[,，、/|]+", str(item)):
            value = re.sub(r"\s+", " ", part).strip()
            key = value.replace(" ", "").lower()
            if value and key not in seen:
                result.append(value)
                seen.add(key)
    return result


def normalize_request(body: dict[str, Any]) -> dict[str, Any]:
    ingredients = split_input_items(body.get("ingredients"))
    allergies = split_input_items(body.get("allergies"))

    if not ingredients:
        raise AiRecipeError(400, "재료를 하나 이상 입력해 주세요.")

    return {
        "ingredients": ingredients,
        "allergies": allergies,
        "timeFilter": str(body.get("timeFilter") or "상관없음"),
        "calorieFilter": str(body.get("calorieFilter") or "상관없음"),
    }


def normalize_for_match(value: str | None) -> str:
    return re.sub(r"\s+", "", value or "").lower()


def contains_blocked_ingredient(value: str | None, blocked: list[str]) -> bool:
    normalized = normalize_for_match(value)
    if not normalized:
        return False

    for item in blocked:
        target = normalize_for_match(item)
        if target and (target in normalized or normalized in target):
            return True
    return False


def coerce_choice(value: Any, allowed: set[str], default: str) -> str:
    text = str(value or "").strip()
    return text if text in allowed else default


def coerce_int(value: Any, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def build_list_prompt(request: dict[str, Any]) -> str:
    allergy_text = ", ".join(request["allergies"]) if request["allergies"] else "없음"

    return f"""
사용자 재료로 만들 수 있는 한국어 레시피 후보를 정확히 {TARGET_RECIPE_COUNT}개 추천하세요.

사용자 입력 재료: {", ".join(request["ingredients"])}
제외 알레르기: {allergy_text}
조리 시간 조건: {request["timeFilter"]}
칼로리 조건: {request["calorieFilter"]}

규칙:
1. 음식, 식재료, 조미료가 아닌 입력은 사용하지 마세요.
2. 알레르기 재료와 같은 계열 재료는 사용하지 마세요.
3. 입력 재료가 1개뿐이어도 일반적인 재료를 추가해서 서로 다른 레시피 {TARGET_RECIPE_COUNT}개를 만드세요.
4. 레시피명과 조리 방식은 서로 달라야 합니다.
5. typeName은 한식, 중식, 일식, 양식, 샐러드, 수프, 디저트 중 하나만 사용하세요.
6. difficult는 쉬움, 보통, 어려움 중 하나만 사용하세요.
7. cookTime은 15분 이내, 30분 이내, 1시간 이내 중 하나만 사용하세요.
8. calory는 저칼로리, 보통, 고칼로리 중 하나만 사용하세요.
9. 목록 응답이므로 ingredientSets와 cookSteps는 만들지 마세요.
10. 반드시 JSON만 반환하세요.

JSON 형식:
{{
  "recipes": [
    {{
      "title": "레시피명",
      "introduce": "40자 이하의 짧은 소개",
      "typeName": "한식",
      "difficult": "쉬움",
      "cookTime": "30분 이내",
      "calory": "보통",
      "ingredients": ["대표 재료1", "대표 재료2"]
    }}
  ]
}}
"""


def build_detail_prompt(request: dict[str, Any], summary: dict[str, Any]) -> str:
    allergy_text = ", ".join(request["allergies"]) if request["allergies"] else "없음"

    return f"""
아래 레시피 후보 1개를 작성 페이지에 넣을 수 있는 상세 레시피 JSON으로 완성하세요.

사용자 입력 재료: {", ".join(request["ingredients"])}
제외 알레르기: {allergy_text}

레시피 후보:
{json.dumps(summary, ensure_ascii=False)}

규칙:
1. 알레르기 재료와 같은 계열 재료는 사용하지 마세요.
2. ingredientSets는 1개만 만들고, ingredients는 8개 이하로 작성하세요.
3. quantity는 1/2, 150, 약간처럼 문자열로 작성할 수 있습니다.
4. unit은 개, 컵, T, t, g, ml, 장, 통, 뿌리 등을 사용하고 어색하면 빈 문자열로 두세요.
5. cookSteps는 정확히 {MAX_STEP_COUNT}단계만 작성하세요.
6. 각 cookContent는 18자 이상 45자 이하로 짧고 명확하게 작성하세요.
7. 반드시 JSON만 반환하세요.

JSON 형식:
{{
  "recipe": {{
    "title": "레시피명",
    "introduce": "레시피 소개",
    "typeName": "한식",
    "difficult": "쉬움",
    "cookTime": "30분 이내",
    "calory": "보통",
    "ingredients": ["대표 재료1", "대표 재료2"],
    "ingredientSets": [
      {{
        "setName": "기본 재료",
        "ingredients": [
          {{"ingredientName": "양파", "quantity": "1/2", "unit": "개"}}
        ]
      }}
    ],
    "cookSteps": [
      {{"step": 1, "cookContent": "재료를 손질해 먹기 좋게 준비합니다."}}
    ],
    "tip": "선택 팁",
    "caution": "선택 주의사항"
  }}
}}
"""


def call_openai(prompt: str, max_tokens: int) -> dict[str, Any]:
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "당신은 CookMate의 한국어 레시피 생성 AI입니다. JSON만 반환하세요.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.55,
            response_format={"type": "json_object"},
            max_tokens=max_tokens,
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)
    except RateLimitError as exc:
        raise AiRecipeError(429, "OpenAI 사용량 한도 또는 결제 상태를 확인해 주세요.") from exc
    except AuthenticationError as exc:
        raise AiRecipeError(401, "OpenAI API 키가 올바르지 않습니다.") from exc
    except json.JSONDecodeError as exc:
        raise AiRecipeError(502, "AI 응답을 JSON으로 해석하지 못했습니다.") from exc


def clean_summary(raw: Any, request: dict[str, Any]) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None

    blocked = request["allergies"]
    title = str(raw.get("title") or "").strip()
    if not title or contains_blocked_ingredient(title, blocked):
        return None

    ingredients = [
        str(item).strip()
        for item in (raw.get("ingredients") or [])
        if str(item).strip() and not contains_blocked_ingredient(str(item), blocked)
    ]

    if not ingredients:
        return None

    return {
        "id": str(raw.get("id") or uuid.uuid4()),
        "title": title,
        "introduce": str(raw.get("introduce") or raw.get("description") or "").strip(),
        "typeName": coerce_choice(raw.get("typeName"), ALLOWED_TYPE_NAMES, DEFAULT_TYPE_NAME),
        "difficult": coerce_choice(raw.get("difficult"), ALLOWED_DIFFICULTIES, DEFAULT_DIFFICULTY),
        "cookTime": coerce_choice(raw.get("cookTime"), ALLOWED_COOK_TIMES, DEFAULT_COOK_TIME),
        "calory": coerce_choice(raw.get("calory"), ALLOWED_CALORIES, DEFAULT_CALORY),
        "ingredients": list(dict.fromkeys(ingredients))[:8],
        "ingredientSets": [],
        "cookSteps": [],
        "tip": "",
        "caution": "",
        "detailReady": False,
    }


def clean_ingredient_item(item: Any, blocked: list[str]) -> dict[str, str] | None:
    if not isinstance(item, dict):
        return None

    name = str(item.get("ingredientName") or item.get("name") or "").strip()
    if not name or contains_blocked_ingredient(name, blocked):
        return None

    return {
        "ingredientName": name,
        "quantity": str(item.get("quantity") or "").strip(),
        "unit": str(item.get("unit") or "").strip(),
    }


def clean_detail(raw: Any, request: dict[str, Any]) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None

    recipe = raw.get("recipe") if isinstance(raw.get("recipe"), dict) else raw
    summary = clean_summary(recipe, request)
    if not summary:
        return None

    blocked = request["allergies"]
    ingredient_sets: list[dict[str, Any]] = []
    flat_ingredients: list[str] = []

    for set_item in recipe.get("ingredientSets") or []:
        if not isinstance(set_item, dict):
            continue

        items = [
            cleaned
            for cleaned in (
                clean_ingredient_item(item, blocked)
                for item in (set_item.get("ingredients") or [])
            )
            if cleaned
        ][:8]
        if not items:
            continue

        set_name = str(set_item.get("setName") or "기본 재료").strip() or "기본 재료"
        ingredient_sets.append({"setName": set_name, "ingredients": items})
        flat_ingredients.extend(item["ingredientName"] for item in items)
        break

    cook_steps: list[dict[str, Any]] = []
    for index, step in enumerate(recipe.get("cookSteps") or [], start=1):
        if not isinstance(step, dict):
            continue
        content = str(step.get("cookContent") or step.get("content") or "").strip()
        if len(content) < 10:
            continue
        cook_steps.append({"step": coerce_int(step.get("step"), index), "cookContent": content})

    if not ingredient_sets or len(cook_steps) < MIN_STEP_COUNT:
        return None

    cook_steps = cook_steps[:MAX_STEP_COUNT]
    for index, step in enumerate(cook_steps, start=1):
        step["step"] = index

    summary.update(
        {
            "ingredients": list(dict.fromkeys(flat_ingredients))[:8],
            "ingredientSets": ingredient_sets,
            "cookSteps": cook_steps,
            "tip": str(recipe.get("tip") or "").strip(),
            "caution": str(recipe.get("caution") or "").strip(),
            "detailReady": True,
        }
    )
    return summary


def unique_recipes(recipes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    seen: set[str] = set()

    for recipe in recipes:
        key = normalize_for_match(recipe.get("title"))
        if not key or key in seen:
            continue
        result.append(recipe)
        seen.add(key)
        if len(result) >= MAX_RECIPE_COUNT:
            break

    return result
