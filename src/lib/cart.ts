import { createClient } from "@/lib/supabase/server";
import { shippingFeeFor } from "@/lib/utils";

export async function getCart(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cart_items")
    .select("quantity, product:products(id, slug, name, price, image_url, stock, is_active)")
    .eq("user_id", userId)
    .order("created_at");

  const items = (data ?? []).filter((i) => i.product !== null) as {
    quantity: number;
    product: { id: number; slug: string; name: string; price: number; image_url: string | null; stock: number; is_active: boolean };
  }[];
  const itemsTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingFee = shippingFeeFor(itemsTotal);
  const unavailable = items.filter((i) => !i.product.is_active || i.product.stock < i.quantity);

  return { items, itemsTotal, shippingFee, total: itemsTotal + shippingFee, unavailable };
}
