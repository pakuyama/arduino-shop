export const FREE_SHIPPING_THRESHOLD = 30000;
export const SHIPPING_FEE = 3000;

export function won(value: number) {
  return value.toLocaleString("ko-KR") + "원";
}

export function shippingFeeFor(itemsTotal: number) {
  return itemsTotal >= FREE_SHIPPING_THRESHOLD || itemsTotal === 0 ? 0 : SHIPPING_FEE;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "결제 대기", className: "bg-gray-100 text-gray-700" },
  paid: { label: "결제 완료", className: "bg-blue-100 text-blue-700" },
  preparing: { label: "배송 준비중", className: "bg-amber-100 text-amber-700" },
  shipped: { label: "배송중", className: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "배송 완료", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "주문 취소", className: "bg-red-100 text-red-700" },
};

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
