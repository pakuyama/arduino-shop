import type { Metadata } from "next";
import Link from "next/link";
import ConfirmPayment from "@/components/checkout/ConfirmPayment";

export const metadata: Metadata = { title: "결제 완료" };

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { paymentKey, orderId, amount } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      {typeof paymentKey === "string" && typeof orderId === "string" && typeof amount === "string" ? (
        <ConfirmPayment paymentKey={paymentKey} orderId={orderId} amount={Number(amount)} />
      ) : (
        <div className="card p-12 text-center">
          <p className="font-semibold">잘못된 접근입니다.</p>
          <Link href="/" className="btn-primary mt-6">홈으로</Link>
        </div>
      )}
    </div>
  );
}
