import Link from "next/link";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS, cn, formatDate, won } from "@/lib/utils";

export const metadata = { title: "주문 관리" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { status } = await searchParams;
  const filter = typeof status === "string" && status in ORDER_STATUS ? status : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, order_no, order_name, total, status, created_at, recipient, phone, address1, address2")
    .neq("status", "pending")
    .order("created_at", { ascending: false });
  if (filter) query = query.eq("status", filter);
  const { data: orders } = await query;

  const tabs = [["", "전체"], ...Object.entries(ORDER_STATUS).filter(([k]) => k !== "pending").map(([k, v]) => [k, v.label])];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">주문 관리</h1>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={key ? `/admin/orders?status=${key}` : "/admin/orders"}
            className={cn("rounded-full border px-3 py-1", (filter ?? "") === key ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white")}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2">주문일시 / 번호</th>
              <th className="px-3 py-2">상품</th>
              <th className="px-3 py-2">받는 분 / 주소</th>
              <th className="px-3 py-2 text-right">금액</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders?.map((o) => (
              <tr key={o.id}>
                <td className="whitespace-nowrap px-3 py-2">
                  <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>
                  <p className="font-mono text-xs">{o.order_no}</p>
                </td>
                <td className="px-3 py-2">{o.order_name}</td>
                <td className="px-3 py-2">
                  <p>{o.recipient} · {o.phone}</p>
                  <p className="text-xs text-gray-500">{o.address1} {o.address2}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">{won(o.total)}</td>
                <td className="px-3 py-2">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">주문이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
