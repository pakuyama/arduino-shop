"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { removeFromCart, updateCartQuantity } from "@/actions/cart";
import { cn, won } from "@/lib/utils";

export default function CartItemRow({
  item,
}: {
  item: {
    quantity: number;
    product: { id: number; slug: string; name: string; price: number; image_url: string | null; stock: number; is_active: boolean };
  };
}) {
  const [pending, startTransition] = useTransition();
  const { product, quantity } = item;
  const max = Math.min(product.stock, 99);
  const problem = !product.is_active ? "판매 중지된 상품입니다." : product.stock < quantity ? `재고 부족 (남은 수량 ${product.stock}개)` : null;

  const setQty = (q: number) => startTransition(() => updateCartQuantity(product.id, q));

  return (
    <li className={cn("flex gap-4 p-4", pending && "opacity-50")}>
      <Link href={`/products/${product.slug}`} className="relative h-20 w-20 shrink-0 rounded border border-gray-100 bg-white">
        {product.image_url && <Image src={product.image_url} alt={product.name} fill sizes="80px" className="object-contain p-1" />}
      </Link>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:text-brand-700">{product.name}</Link>
          <p className="text-sm text-gray-500">{won(product.price)}</p>
          {problem && <p className="text-xs font-semibold text-red-600">{problem}</p>}
        </div>
        <div className="flex items-center rounded-md border border-gray-300 bg-white w-fit">
          <button className="px-2.5 py-1" disabled={pending || quantity <= 1} onClick={() => setQty(quantity - 1)} aria-label="수량 감소">−</button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button className="px-2.5 py-1" disabled={pending || quantity >= max} onClick={() => setQty(quantity + 1)} aria-label="수량 증가">+</button>
        </div>
        <p className="w-24 text-right font-bold">{won(product.price * quantity)}</p>
        <button
          className="text-sm text-gray-400 hover:text-red-600"
          disabled={pending}
          onClick={() => startTransition(() => removeFromCart(product.id))}
        >
          삭제
        </button>
      </div>
    </li>
  );
}
