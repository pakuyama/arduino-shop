"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { won } from "@/lib/utils";

type Status = { state: "loading" } | { state: "done"; orderId: string; total: number } | { state: "error"; message: string };

// 결제창에서 돌아오면 Edge Function(confirm-payment)으로 결제 승인 요청
export default function ConfirmPayment({ paymentKey, orderId, amount }: { paymentKey: string; orderId: string; amount: number }) {
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const requested = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("confirm-payment", {
        body: { paymentKey, orderId, amount },
      });
      if (error) {
        let message = "결제 승인에 실패했습니다.";
        try {
          const body = await (error as { context?: Response }).context?.json();
          if (body?.message) message = body.message;
        } catch {}
        setStatus({ state: "error", message });
        return;
      }
      setStatus({ state: "done", orderId: data.order.id, total: data.order.total });
      router.refresh(); // 헤더 장바구니 개수 갱신
    })();
  }, [paymentKey, orderId, amount, router]);

  if (status.state === "loading") {
    return (
      <div className="card p-12 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        <p className="font-semibold">결제를 승인하고 있습니다...</p>
        <p className="mt-1 text-sm text-gray-500">창을 닫지 말고 잠시만 기다려 주세요.</p>
      </div>
    );
  }

  if (status.state === "error") {
    return (
      <div className="card p-12 text-center">
        <p className="text-lg font-bold text-red-600">결제 승인 실패</p>
        <p className="mt-2 text-sm text-gray-600">{status.message}</p>
        <Link href="/cart" className="btn-primary mt-6">장바구니로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="card p-12 text-center">
      <p className="text-4xl">🎉</p>
      <p className="mt-3 text-xl font-bold">주문이 완료되었습니다</p>
      <p className="mt-2 text-sm text-gray-600">
        주문번호 <b>{orderId}</b> · 결제금액 <b>{won(status.total)}</b>
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href={`/mypage/orders/${status.orderId}`} className="btn-primary">주문 상세 보기</Link>
        <Link href="/products" className="btn-outline">쇼핑 계속하기</Link>
      </div>
    </div>
  );
}
