import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatDate, won } from "@/lib/utils";

export const metadata = { title: "대시보드" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ data: orders }, { data: lowStock }, { count: productCount }] = await Promise.all([
    supabase.from("orders").select("id, order_no, order_name, total, status, created_at, recipient").neq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, stock").lte("stock", 10).order("stock"),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  const valid = (orders ?? []).filter((o) => o.status !== "cancelled");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const todayKey = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
  const todayOrders = valid.filter((o) => new Date(o.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) === todayKey);
  const toShip = (orders ?? []).filter((o) => o.status === "paid" || o.status === "preparing").length;

  const stats = [
    { label: "누적 매출", value: won(revenue) },
    { label: "오늘 주문", value: `${todayOrders.length}건 · ${won(todayOrders.reduce((s, o) => s + o.total, 0))}` },
    { label: "출고 대기", value: `${toShip}건` },
    { label: "등록 상품", value: `${productCount ?? 0}개` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="card p-5">
          <div className="mb-3 flex justify-between">
            <h2 className="font-bold">최근 주문</h2>
            <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-brand-700">전체 →</Link>
          </div>
          <ul className="divide-y divide-gray-100 text-sm">
            {(orders ?? []).slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{formatDate(o.created_at)} · {o.recipient}</p>
                  <p>{o.order_name}</p>
                </div>
                <OrderStatusBadge status={o.status} />
                <span className="w-24 text-right font-semibold">{won(o.total)}</span>
              </li>
            ))}
            {!orders?.length && <li className="py-8 text-center text-gray-400">주문이 없습니다.</li>}
          </ul>
        </section>
        <section className="card h-fit p-5">
          <h2 className="mb-3 font-bold">재고 부족 (10개 이하)</h2>
          <ul className="space-y-2 text-sm">
            {lowStock?.map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <Link href={`/admin/products/${p.id}`} className="truncate hover:text-brand-700">{p.name}</Link>
                <span className={p.stock === 0 ? "font-bold text-red-600" : "text-amber-600"}>{p.stock}</span>
              </li>
            ))}
            {!lowStock?.length && <li className="text-gray-400">재고가 충분합니다.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
