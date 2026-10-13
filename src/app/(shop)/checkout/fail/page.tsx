import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "결제 실패" };

export default async function CheckoutFailPage({ searchParams }: PageProps<"/checkout/fail">) {
  const { code, message } = await searchParams;
  const cancelled = code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL";

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="card p-12 text-center">
        <p className="text-lg font-bold">{cancelled ? "결제를 취소했습니다" : "결제에 실패했습니다"}</p>
        {!cancelled && typeof message === "string" && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        {typeof code === "string" && <p className="mt-1 text-xs text-gray-400">오류 코드: {code}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/checkout" className="btn-primary">다시 결제하기</Link>
          <Link href="/cart" className="btn-outline">장바구니</Link>
        </div>
      </div>
    </div>
  );
}
