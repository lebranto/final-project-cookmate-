import BoardWriteForm from "@/app/components/board/BoardWriteForm";

type Props = {
  params: Promise<{
    boardNo: string;
  }>;
};

export default async function BoardEditPage({ params }: Props) {
  const { boardNo } = await params;

  return <BoardWriteForm mode="edit" boardNo={Number(boardNo)} />;
}
