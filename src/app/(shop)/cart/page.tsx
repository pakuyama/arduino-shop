import type { Metadata } from "next";
import Link from "next/link";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";

export const metadata: Metadata = { title: "장바구니" };

export default async function CartPage() {
  const user = await requireUser("/cart");
  const { items, itemsTotal, shippingFee, total, unavailable } = await getCart(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">장바구니</h1>
      {items.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-gray-500">장바구니가 비어 있습니다.</p>
          <Link href="/products" className="btn-primary mt-4">쇼핑 계속하기</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="card divide-y divide-gray-100">
            {items.map((item) => <CartItemRow key={item.product.id} item={item} />)}
          </ul>
          <OrderSummary itemsTotal={itemsTotal} shippingFee={shippingFee} total={total}>
            {unavailable.length > 0 ? (
              <p className="text-xs text-red-600">구매할 수 없는 상품이 있습니다. 수량을 조정하거나 삭제해 주세요.</p>
            ) : (
              <Link href="/checkout" className="btn-primary w-full py-3">주문하기</Link>
            )}
          </OrderSummary>
        </div>
      )}
    </div>
  );
}
