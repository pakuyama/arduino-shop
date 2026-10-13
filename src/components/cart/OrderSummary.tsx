import { FREE_SHIPPING_THRESHOLD, won } from "@/lib/utils";

export default function OrderSummary({
  itemsTotal,
  shippingFee,
  total,
  children,
}: {
  itemsTotal: number;
  shippingFee: number;
  total: number;
  children?: React.ReactNode;
}) {
  const remain = FREE_SHIPPING_THRESHOLD - itemsTotal;
  return (
    <aside className="card h-fit space-y-3 p-5 text-sm lg:sticky lg:top-36">
      <h2 className="text-base font-bold">결제 금액</h2>
      <div className="flex justify-between">
        <span className="text-gray-500">상품 금액</span>
        <span>{won(itemsTotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">배송비</span>
        <span>{shippingFee ? won(shippingFee) : "무료"}</span>
      </div>
      {remain > 0 && itemsTotal > 0 && (
        <p className="rounded bg-brand-50 px-3 py-2 text-xs text-brand-700">{won(remain)} 더 담으면 무료배송!</p>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
        <span>총 결제 금액</span>
        <span className="text-brand-700">{won(total)}</span>
      </div>
      {children}
    </aside>
  );
}
