import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderDetail from "@/components/OrderDetail";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "주문 상세" };

export default async function MyOrderPage({ params }: PageProps<"/mypage/orders/[id]">) {
  const { id } = await params;
  await requireUser(`/mypage/orders/${id}`);
  const supabase = await createClient();

  // RLS 로 본인 주문만 조회됨
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id).order("id");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/mypage" className="text-sm text-gray-500 hover:text-gray-800">← 마이페이지</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">주문 상세</h1>
      <OrderDetail order={order} items={items ?? []} />
    </div>
  );
}
