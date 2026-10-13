import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ProfileForm from "@/components/mypage/ProfileForm";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, won } from "@/lib/utils";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/mypage");

  const supabase = await createClient();
  // 결제 대기(결제창에서 이탈한) 주문은 목록에서 제외
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_no, order_name, total, status, created_at")
    .eq("user_id", profile.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">마이페이지</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="card p-5">
          <h2 className="mb-4 font-bold">주문 내역</h2>
          {orders?.length ? (
            <ul className="divide-y divide-gray-100">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/mypage/orders/${o.id}`} className="flex items-center gap-3 py-3 hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{formatDate(o.created_at)} · {o.order_no}</p>
                      <p className="text-sm font-medium">{o.order_name}</p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                    <span className="w-24 text-right text-sm font-bold">{won(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-12 text-center text-sm text-gray-400">주문 내역이 없습니다.</p>
          )}
        </section>
        <section className="card h-fit p-5">
          <h2 className="mb-1 font-bold">회원 정보</h2>
          <p className="mb-4 text-sm text-gray-500">{profile.email}</p>
          <ProfileForm profile={profile} />
        </section>
      </div>
    </div>
  );
}
