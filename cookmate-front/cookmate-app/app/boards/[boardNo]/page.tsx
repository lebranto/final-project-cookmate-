import BoardDetail from "@/app/components/board/BoardDetail";

type Props = {
  params: Promise<{
    boardNo: string;
  }>;
};

export default async function BoardDetailPage({ params }: Props) {
  const { boardNo } = await params;

  return <BoardDetail boardNo={Number(boardNo)} />;
}