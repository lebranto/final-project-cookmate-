import { Suspense } from "react";
import BoardWriteForm from "@/app/components/board/BoardWriteForm";

export default function BoardWritePage() {
  return (
    <Suspense fallback={null}>
      <BoardWriteForm />
    </Suspense>
  );
}
