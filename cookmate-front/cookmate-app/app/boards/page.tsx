import { Suspense } from "react";
import RecipeSearchPage from "@/app/components/board/RecipeSearchPage";

export default function BoardsPage() {
  return (
    <Suspense fallback={null}>
      <RecipeSearchPage />
    </Suspense>
  );
}
