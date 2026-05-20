from typing import Any

from schema import MAX_RECIPE_COUNT, MIN_RECIPE_COUNT
from tools import (
    AiRecipeError,
    build_detail_prompt,
    build_list_prompt,
    call_openai,
    clean_detail,
    clean_summary,
    normalize_request,
    unique_recipes,
)


def recommend_recipe_list(body: dict[str, Any]) -> dict[str, Any]:
    request = normalize_request(body)
    if not request["ingredients"]:
        return {
            "recipes": [],
            "ignoredIngredients": request["ignoredIngredients"],
            "message": "식재료로 볼 수 있는 입력이 없습니다.",
            "minRecipeCount": MIN_RECIPE_COUNT,
            "maxRecipeCount": MAX_RECIPE_COUNT,
            "detailMode": "onClick",
        }

    data = call_openai(build_list_prompt(request), max_tokens=700)
    recipes = unique_recipes(
        [
            recipe
            for recipe in (clean_summary(item, request) for item in (data.get("recipes") or []))
            if recipe
        ]
    )

    return {
        "recipes": recipes[:MAX_RECIPE_COUNT],
        "ignoredIngredients": request["ignoredIngredients"],
        "minRecipeCount": MIN_RECIPE_COUNT,
        "maxRecipeCount": MAX_RECIPE_COUNT,
        "detailMode": "onClick",
    }


def recommend_recipe_detail(body: dict[str, Any]) -> dict[str, Any]:
    request = normalize_request(body)
    if not request["ingredients"]:
        raise AiRecipeError(400, "식재료로 볼 수 있는 입력이 없습니다.")

    summary = body.get("recipe") if isinstance(body.get("recipe"), dict) else {}
    if not summary:
        raise AiRecipeError(400, "상세 생성할 레시피 정보가 없습니다.")

    data = call_openai(build_detail_prompt(request, summary), max_tokens=1800)
    recipe = clean_detail(data, request)
    if not recipe:
        raise AiRecipeError(502, "AI가 상세 레시피를 완성하지 못했습니다.")

    recipe["id"] = str(summary.get("id") or recipe["id"])
    return {"recipe": recipe}


def recommend_recipes(body: dict[str, Any]) -> dict[str, Any]:
    mode = str(body.get("mode") or "list").lower()
    if mode == "detail":
        return recommend_recipe_detail(body)
    return recommend_recipe_list(body)
