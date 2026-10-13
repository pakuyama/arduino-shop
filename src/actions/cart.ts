"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CartState = { error?: string; ok?: boolean } | undefined;

export async function addToCart(_: CartState, formData: FormData): Promise<CartState> {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(1, Math.min(99, Number(formData.get("quantity") ?? 1)));
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);

  const { data: product } = await supabase.from("products").select("stock").eq("id", productId).single();
  if (!product) return { error: "상품을 찾을 수 없습니다." };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", auth.user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const nextQty = Math.min(99, (existing?.quantity ?? 0) + quantity);
  if (nextQty > product.stock) return { error: `재고가 부족합니다. (남은 수량 ${product.stock}개)` };

  const { error } = await supabase
    .from("cart_items")
    .upsert({ user_id: auth.user.id, product_id: productId, quantity: nextQty });
  if (error) return { error: "장바구니에 담지 못했습니다." };

  revalidatePath("/", "layout");
  if (formData.get("buyNow")) redirect("/checkout");
  return { ok: true };
}

export async function updateCartQuantity(productId: number, quantity: number) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const qty = Math.max(1, Math.min(99, quantity));
  await supabase.from("cart_items").update({ quantity: qty }).eq("user_id", auth.user.id).eq("product_id", productId);
  revalidatePath("/", "layout");
}

export async function removeFromCart(productId: number) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("cart_items").delete().eq("user_id", auth.user.id).eq("product_id", productId);
  revalidatePath("/", "layout");
}
