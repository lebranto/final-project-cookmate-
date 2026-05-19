ALLOWED_TYPE_NAMES = {"한식", "중식", "일식", "양식", "샐러드", "수프", "디저트"}
ALLOWED_DIFFICULTIES = {"쉬움", "보통", "어려움"}
ALLOWED_COOK_TIMES = {"15분 이내", "30분 이내", "1시간 이내"}
ALLOWED_CALORIES = {"저칼로리", "보통", "고칼로리"}

DEFAULT_TYPE_NAME = "한식"
DEFAULT_DIFFICULTY = "쉬움"
DEFAULT_COOK_TIME = "30분 이내"
DEFAULT_CALORY = "보통"

MIN_RECIPE_COUNT = 3
MAX_RECIPE_COUNT = 6
TARGET_RECIPE_COUNT = 3
MIN_STEP_COUNT = 4
MAX_STEP_COUNT = 5
MIN_STEP_LENGTH = 18

RECIPE_RESPONSE_SHAPE = {
    "recipes": [
        {
            "title": "레시피명",
            "introduce": "레시피 소개",
            "typeName": "한식",
            "difficult": "쉬움",
            "cookTime": "30분 이내",
            "calory": "보통",
            "ingredients": ["대표 재료1", "대표 재료2"],
            "ingredientSets": [
                {
                    "setName": "기본 재료",
                    "ingredients": [
                        {"ingredientName": "물", "quantity": "1/4", "unit": "컵"},
                        {"ingredientName": "양파", "quantity": "1/2", "unit": "개"},
                        {"ingredientName": "간장", "quantity": "1", "unit": "T"},
                        {"ingredientName": "후춧가루", "quantity": "약간", "unit": ""},
                        {"ingredientName": "떡볶이떡", "quantity": "150", "unit": "g"},
                    ],
                }
            ],
            "cookSteps": [
                {"step": 1, "cookContent": "초보자도 따라 할 수 있는 자세한 조리 설명"}
            ],
            "tip": "선택 팁",
            "caution": "선택 주의사항",
        }
    ]
}
