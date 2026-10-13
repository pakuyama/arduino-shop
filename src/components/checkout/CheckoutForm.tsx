"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useState } from "react";
import { createOrder } from "@/actions/order";
import AddressFields from "./AddressFields";

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function CheckoutForm({
  customerKey,
  defaults,
}: {
  customerKey: string;
  defaults: { recipient: string; phone: string; zipcode: string; address1: string; address2: string };
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);

    try {
      // 1) 서버에서 주문 생성 (금액은 DB 가격으로 계산)
      const result = await createOrder(new FormData(e.currentTarget));
      if (!result.ok) {
        setError(result.error);
        return;
      }

      // 2) 토스페이먼츠 결제창 호출 → 성공 시 /checkout/success 로 이동
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: result.total },
        orderId: result.orderNo,
        orderName: result.orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerEmail: result.customerEmail || undefined,
        customerName: result.customerName,
        card: { useEscrow: false, flowMode: "DEFAULT", useCardPoint: false, useAppCardOnly: false },
      });
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(code === "USER_CANCEL" ? "결제를 취소했습니다." : (err as Error).message || "결제 요청 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h2 className="font-bold">배송 정보</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-gray-600">받는 분 *</span>
          <input name="recipient" defaultValue={defaults.recipient} className="input" required maxLength={30} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-gray-600">연락처 *</span>
          <input name="phone" defaultValue={defaults.phone} placeholder="010-1234-5678" className="input" required inputMode="tel" />
        </label>
      </div>
      <div className="space-y-1 text-sm">
        <span className="text-gray-600">주소 *</span>
        <AddressFields defaults={defaults} />
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-gray-600">배송 메모</span>
        <select name="memo" className="input" defaultValue="">
          <option value="">선택 안 함</option>
          <option>문 앞에 놓아 주세요</option>
          <option>경비실에 맡겨 주세요</option>
          <option>배송 전 연락 바랍니다</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" name="saveAddress" defaultChecked className="accent-brand-600" />
        이 배송지를 기본 배송지로 저장
      </label>

      <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
        테스트 결제입니다. 결제창에서 아무 카드나 선택해 진행해도 실제로 청구되지 않습니다.
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {pending && <p className="text-sm text-gray-500">결제창을 여는 중...</p>}
    </form>
  );
}
