import json
import os
import uuid
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import AuthenticationError, OpenAI, RateLimitError
from pydantic import BaseModel

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

app = FastAPI(title="Cookmate AI Recipe API")


class RecipeRecommendRequest(BaseModel):
    ingredients: List[str]
    timeFilter: str = "all"
    calorieFilter: str = "all"


class RecipeResponse(BaseModel):
    id: str
    title: str
    ingredients: List[str]
    time: int
    calories: int
    description: str
    method: str


class RecipeListResponse(BaseModel):
    recipes: List[RecipeResponse]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/recipe/recommend", response_model=RecipeListResponse)
def recommend_recipe(request: RecipeRecommendRequest):
    ingredients = [item.strip() for item in request.ingredients if item and item.strip()]

    if not ingredients:
        raise HTTPException(status_code=400, detail="재료를 하나 이상 입력해 주세요.")

    prompt = f"""
사용자가 입력한 목록에서 실제 음식 재료로 볼 수 있는 것만 사용하세요.

사용자 입력: {", ".join(ingredients)}
조리 시간 조건: {request.timeFilter}
칼로리 조건: {request.calorieFilter}

규칙:
1. 음식, 식재료, 조미료로 볼 수 없는 입력은 레시피에 사용하지 마세요.
2. 음식이 아닌 단어는 ingredients 배열에도 포함하지 마세요.
3. 위험하거나 먹을 수 없는 재료는 반드시 제외하세요.
4. 너무 괴상하거나 현실적으로 먹기 어려운 조합은 만들지 마세요.
5. 입력 재료 중 사용 가능한 식재료가 하나도 없다면 recipes를 빈 배열로 반환하세요. 있다면 recipes 배열에 최소 3개에서 6개까지 출력해주세요.
6. 레시피는 한국에서 일반적으로 먹을 수 있는 음식 위주로 추천하세요.
7. 없는 재료를 추가할 수는 있지만, 일반적인 식재료만 추가하세요.
8. 만약 이용자가 '사과, 배, 상추' 이렇게 한꺼번에 보냈다면 구분자로 나눠서 검색하세요.
9. 사용자가 입력한 재료는 메인 재료로만 사용하지 않아도 됩니다.
    예를 들어 "배"가 입력되면 배를 갈아 고기 양념이나 소스에 사용할 수 있고, "오이"가 입력되면 쫄면의 부재료나 고명으로 사용할 수 있습니다.
10. 사용 가능한 입력한 재료는 실제 레시피에 사용되어야 하며, 해당 재료의 조리 방법이 나와야 합니다.
11. 반드시 JSON만 반환하세요.


JSON format:
{{
  "recipes": [
    {{
      "title": "레시피명",
      "ingredients": ["재료1", "재료2"],
      "time": 20,
      "calories": 450,
      "description": "간단한 설명",
      "method": "조리 방법 요약"
    }}
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "당신은 한국어로 레시피를 추천하는 친절한 셰프 AI입니다. 음식재료가 아닌것들은 반드시 제외하고 현실적으로 먹을 수 있는 음식을 만들어 주세요. JSON만 반환하세요.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
            max_tokens=3000,
        )

        content = response.choices[0].message.content
        data = json.loads(content)

        recipes = []
        for item in data.get("recipes", [])[:6]:
            recipes.append(
                RecipeResponse(
                    id=str(uuid.uuid4()),
                    title=item["title"],
                    ingredients=item["ingredients"],
                    time=int(item["time"]),
                    calories=int(item["calories"]),
                    description=item["description"],
                    method=item["method"],
                )
            )

        if len(recipes) < 1:
            raise HTTPException(status_code=502, detail="AI가 레시피를 반환하지 않았습니다. 다시 시도해 주세요.")

        return RecipeListResponse(recipes=recipes)

    except RateLimitError:
        raise HTTPException(status_code=429, detail="OpenAI 사용량 한도 또는 결제 상태를 확인해 주세요.")
    except AuthenticationError:
        raise HTTPException(status_code=401, detail="OpenAI API 키가 올바르지 않습니다.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 추천 생성 실패: {str(e)}")
