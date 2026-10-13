// 토스페이먼츠 결제 승인 Edge Function
// 1) 로그인한 사용자의 주문인지, 금액이 DB 금액과 같은지 검증
// 2) 토스 결제 승인 API 호출 (시크릿 키는 서버에만 존재)
// 3) 주문 상태를 paid 로 바꾸고 재고 차감, 장바구니 비우기
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// 토스페이먼츠 공개 테스트 시크릿 키 (실서비스에서는 TOSS_SECRET_KEY 시크릿을 설정하세요)
const TOSS_SECRET_KEY = Deno.env.get("TOSS_SECRET_KEY") ?? "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ message: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { data: userData, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !userData.user) return json({ message: "로그인이 필요합니다." }, 401);
  const user = userData.user;

  let body: { paymentKey?: string; orderId?: string; amount?: number };
  try {
    body = await req.json();
  } catch {
    return json({ message: "잘못된 요청입니다." }, 400);
  }
  const { paymentKey, orderId } = body;
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount)) {
    return json({ message: "결제 정보가 올바르지 않습니다." }, 400);
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("*")
    .eq("order_no", orderId)
    .single();
  if (orderError || !order) return json({ message: "주문을 찾을 수 없습니다." }, 404);
  if (order.user_id !== user.id) return json({ message: "본인의 주문이 아닙니다." }, 403);

  // 새로고침 등으로 다시 호출된 경우
  if (order.status !== "pending") {
    if (order.payment_key === paymentKey) return json({ order });
    return json({ message: "이미 처리된 주문입니다." }, 409);
  }
  if (order.total !== amount) return json({ message: "결제 금액이 주문 금액과 다릅니다." }, 400);

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(TOSS_SECRET_KEY + ":"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const toss = await tossRes.json();
  if (!tossRes.ok) {
    return json({ message: toss.message ?? "결제 승인에 실패했습니다.", code: toss.code }, 400);
  }

  const { data: paidOrder, error: completeError } = await admin.rpc("complete_order_payment", {
    p_order_id: order.id,
    p_payment_key: paymentKey,
    p_method: toss.method ?? null,
  });
  if (completeError) return json({ message: completeError.message }, 500);

  const { data: items } = await admin.from("order_items").select("product_id").eq("order_id", order.id);
  const productIds = (items ?? []).map((i) => i.product_id).filter(Boolean);
  if (productIds.length) {
    await admin.from("cart_items").delete().eq("user_id", user.id).in("product_id", productIds);
  }

  return json({ order: paidOrder });
});
