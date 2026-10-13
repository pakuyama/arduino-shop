"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { quickUpdateProduct } from "@/actions/admin";
import { cn } from "@/lib/utils";

// 상품 목록에서 가격/재고/판매여부를 바로 수정
export default function QuickEditRow({
  product,
  children,
}: {
  product: { id: number; price: number; stock: number; is_active: boolean };
  children: React.ReactNode;
}) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [pending, startTransition] = useTransition();
  const dirty = Number(price) !== product.price || Number(stock) !== product.stock;

  const save = () =>
    startTransition(() => quickUpdateProduct(product.id, { price: Math.max(0, Math.floor(Number(price))), stock: Math.max(0, Math.floor(Number(stock))) }));

  return (
    <tr className={cn(pending && "opacity-50", !product.is_active && "bg-gray-50 text-gray-400")}>
      {children}
      <td className="px-3 py-2">
        <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="input w-28 py-1" />
      </td>
      <td className="px-3 py-2">
        <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="input w-20 py-1" />
      </td>
      <td className="px-3 py-2">
        <button
          onClick={() => startTransition(() => quickUpdateProduct(product.id, { is_active: !product.is_active }))}
          className={cn("rounded px-2 py-0.5 text-xs font-semibold", product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600")}
        >
          {product.is_active ? "판매중" : "숨김"}
        </button>
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        {dirty && (
          <button onClick={save} disabled={pending} className="btn-primary mr-1 px-2 py-1 text-xs">저장</button>
        )}
        <Link href={`/admin/products/${product.id}`} className="btn-outline px-2 py-1 text-xs">수정</Link>
      </td>
    </tr>
  );
}
