export interface Board {
  boardNo: number;
  userNo: number;
  typeNo: number;
  boardTitle: string;
  introduce: string;
  imageUrl: string;
  url: string;
  open: string;
  likesCount: number;
  nickname: string;
  profileImageUrl: string;
  typeName: string;
  difficult: string;
  cookTime: string;
  calory: string;
  ai: string;
  isApiData?: string;
  recipeCount?: number;
  followerCount?: number;
  followingCount?: number;
  ingredientSets: IngredientSet[];
  cookSteps: CookStep[];

  boardPostdate: string;
}

export interface IngredientSet {
  setNo: number;
  setName: string;
  ingredients: Ingredient[];
}

export interface Ingredient {
  ingredientNo: number;
  ingredientName: string;
  quantity: string;
  unit: string;
}

export interface CookStep {
  step: number;
  cookContent: string;
  cookImage: string;
}

export interface BoardCard {
  boardNo: number;
  boardTitle: string;
  imageUrl: string;
  nickname: string;
  typeName: string;
  cookTime: string;
  ai: string;
  likesCount: number;
  scrapped: boolean;
}

export interface Comment {
  commentNo: number;
  parentCommentNo: number | null;
  userNo: number;
  nickname: string;
  profileImageUrl: string;
  commentContent: string;
  commentPostdate: string;
  replies: Comment[];
}
