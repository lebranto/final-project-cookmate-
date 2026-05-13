import ShopDetailPage from "./ShopDetailPage";

type Props = {
  params: Promise<{
    shoppingNo: string;
  }>;
};

export default async function ShoppingDetailRoute({ params }: Props) {
  const { shoppingNo } = await params;

  return <ShopDetailPage shoppingNo={Number(shoppingNo)} />;
}
