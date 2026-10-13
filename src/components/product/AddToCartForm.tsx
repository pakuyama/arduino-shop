"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addToCart } from "@/actions/cart";
import SubmitButton from "@/components/ui/SubmitButton";
import { won } from "@/lib/utils";

export default function AddToCartForm({
  productId,
  slug,
  price,
  stock,
}: {
  productId: number;
  slug: string;
  price: number;
  stock: number;
}) {
  const [state, formAction] = useActionState(addToCart, undefined);
  const [quantity, setQuantity] = useState(1);
  const max = Math.min(stock, 99);

  if (stock <= 0) {
    return <button disabled className="btn mt-6 w-full bg-gray-200 py-3 text-gray-500">품절된 상품입니다</button>;
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="flex items-center justify-between rounded-md bg-gray-50 p-4">
        <div className="flex items-center rounded-md border border-gray-300 bg-white">
          <button type="button" className="px-3 py-1.5 text-lg" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="수량 감소">
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <button type="button" className="px-3 py-1.5 text-lg" onClick={() => setQuantity((q) => Math.min(max, q + 1))} aria-label="수량 증가">
            +
          </button>
        </div>
        <p className="text-lg font-bold">{won(price * quantity)}</p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && (
        <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          장바구니에 담았습니다. <Link href="/cart" className="font-semibold underline">장바구니 보기</Link>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <SubmitButton className="btn-outline py-3" pendingText="담는 중...">장바구니</SubmitButton>
        <SubmitButton className="btn-primary py-3" name="buyNow" value="1" pendingText="이동 중...">
          바로 구매
        </SubmitButton>
      </div>
    </form>
  );
}
