"use server";

import { createClient } from "@/lib/supabase/server";

export type CreateOrderResult =
  | { ok: true; orderNo: string; orderName: string; total: number; customerName: string; customerEmail: string }
  | { ok: false; error: string };

// 장바구니 전체를 주문으로 만든다. 금액 계산은 DB 함수(create_order)가 담당.
export async function createOrder(formData: FormData): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "로그인이 필요합니다." };

  const { data: cart } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", auth.user.id);
  if (!cart?.length) return { ok: false, error: "장바구니가 비어 있습니다." };

  const field = (key: string) => String(formData.get(key) ?? "").trim();
  const recipient = field("recipient");
  const phone = field("phone");
  const address1 = field("address1");

  if (!recipient || !phone || !address1) return { ok: false, error: "받는 분, 연락처, 주소를 입력해 주세요." };
  if (!/^[0-9-]{9,13}$/.test(phone)) return { ok: false, error: "연락처 형식이 올바르지 않습니다." };

  const { data: order, error } = await supabase.rpc("create_order", {
    p_items: cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity })),
    p_recipient: recipient,
    p_phone: phone,
    p_zipcode: field("zipcode"),
    p_address1: address1,
    p_address2: field("address2"),
    p_memo: field("memo"),
  });
  if (error || !order) return { ok: false, error: error?.message ?? "주문을 만들지 못했습니다." };

  // 다음 주문을 위해 배송지 저장
  if (formData.get("saveAddress")) {
    await supabase
      .from("profiles")
      .update({ phone, zipcode: field("zipcode"), address1, address2: field("address2") })
      .eq("id", auth.user.id);
  }

  return {
    ok: true,
    orderNo: order.order_no,
    orderName: order.order_name,
    total: order.total,
    customerName: recipient,
    customerEmail: auth.user.email ?? "",
  };
}
