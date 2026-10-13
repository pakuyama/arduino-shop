import Image from "next/image";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import type { Order, OrderItem } from "@/types/database";
import { formatDate, won } from "@/lib/utils";

export default function OrderDetail({ order, items }: { order: Order; items: OrderItem[] }) {
  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="font-bold">주문번호 {order.order_no}</h2>
          <OrderStatusBadge status={order.status} />
          <span className="text-sm text-gray-400">{formatDate(order.created_at)}</span>
        </div>
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
              <div className="relative h-14 w-14 shrink-0 rounded border border-gray-100">
                {item.image_url && <Image src={item.image_url} alt={item.product_name} fill sizes="56px" className="object-contain p-1" />}
              </div>
              <div className="flex-1">
                <span className="font-medium">{item.product_name}</span>
                <p className="text-gray-500">{won(item.price)} × {item.quantity}</p>
              </div>
              <span className="font-bold">{won(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card space-y-1 p-5 text-sm">
          <h2 className="mb-2 font-bold">배송지</h2>
          <p>{order.recipient} · {order.phone}</p>
          <p className="text-gray-600">
            {order.zipcode && `(${order.zipcode}) `}{order.address1} {order.address2}
          </p>
          {order.memo && <p className="text-gray-500">메모: {order.memo}</p>}
        </section>
        <section className="card space-y-2 p-5 text-sm">
          <h2 className="mb-2 font-bold">결제 정보</h2>
          <div className="flex justify-between"><span className="text-gray-500">상품 금액</span><span>{won(order.items_total)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">배송비</span><span>{order.shipping_fee ? won(order.shipping_fee) : "무료"}</span></div>
          <div className="flex justify-between border-t border-gray-100 pt-2 font-bold"><span>총 결제 금액</span><span className="text-brand-700">{won(order.total)}</span></div>
          {order.payment_method && (
            <p className="text-gray-500">결제수단: {order.payment_method}{order.paid_at && ` · ${formatDate(order.paid_at)}`}</p>
          )}
        </section>
      </div>
    </div>
  );
}
