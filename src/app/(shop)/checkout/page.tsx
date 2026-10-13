import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/cart/OrderSummary";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { won } from "@/lib/utils";

export const metadata: Metadata = { title: "주문/결제" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const profile = await getCurrentProfile();
  const { items, itemsTotal, shippingFee, total, unavailable } = await getCart(user.id);
  if (items.length === 0 || unavailable.length > 0) redirect("/cart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">주문/결제</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 font-bold">주문 상품 {items.length}개</h2>
            <ul className="divide-y divide-gray-100">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 py-2 text-sm">
                  <div className="relative h-12 w-12 shrink-0">
                    {product.image_url && <Image src={product.image_url} alt={product.name} fill sizes="48px" className="object-contain" />}
                  </div>
                  <span className="flex-1">{product.name} × {quantity}</span>
                  <span className="font-semibold">{won(product.price * quantity)}</span>
                </li>
              ))}
            </ul>
          </section>
          <CheckoutForm
            customerKey={user.id}
            defaults={{
              recipient: profile?.name ?? "",
              phone: profile?.phone ?? "",
              zipcode: profile?.zipcode ?? "",
              address1: profile?.address1 ?? "",
              address2: profile?.address2 ?? "",
            }}
          />
        </div>
        <OrderSummary itemsTotal={itemsTotal} shippingFee={shippingFee} total={total}>
          <button form="checkout-form" className="btn-primary w-full py-3">
            {won(total)} 결제하기
          </button>
          <p className="text-center text-xs text-gray-400">토스페이먼츠 테스트 결제 · 실제 청구되지 않습니다</p>
        </OrderSummary>
      </div>
    </div>
  );
}
