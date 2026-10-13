"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS } from "@/lib/utils";

export type AdminState = { error?: string; ok?: boolean } | undefined;

function parseSpecs(text: string) {
  // "키: 값" 한 줄에 하나
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

export async function saveProduct(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const field = (key: string) => String(formData.get(key) ?? "").trim();

  const name = field("name");
  const slug = field("slug").toLowerCase();
  const price = Number(field("price"));
  const stock = Number(field("stock"));
  const categoryId = Number(field("categoryId"));

  if (!name || !slug) return { error: "상품명과 슬러그(URL)를 입력해 주세요." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "슬러그는 영문 소문자, 숫자, - 만 사용할 수 있습니다." };
  if (!Number.isInteger(price) || price < 0) return { error: "가격을 올바르게 입력해 주세요." };
  if (!Number.isInteger(stock) || stock < 0) return { error: "재고를 올바르게 입력해 주세요." };
  if (!categoryId) return { error: "카테고리를 선택해 주세요." };

  let imageUrl = field("imageUrl") || null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) return { error: "이미지는 5MB 이하만 업로드할 수 있습니다." };
    const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, image, { contentType: image.type, upsert: true });
    if (uploadError) return { error: "이미지 업로드 실패: " + uploadError.message };
    imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const values = {
    name,
    slug,
    price,
    stock,
    category_id: categoryId,
    brand: field("brand") || null,
    summary: field("summary") || null,
    description: field("description") || null,
    specs: parseSpecs(field("specs")),
    image_url: imageUrl,
    image_credit: field("imageCredit") || null,
    image_credit_url: field("imageCreditUrl") || null,
    source_url: field("sourceUrl") || null,
    is_featured: formData.get("isFeatured") === "on",
    is_active: formData.get("isActive") === "on",
  };

  const { error } = id
    ? await supabase.from("products").update(values).eq("id", id)
    : await supabase.from("products").insert(values);
  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 슬러그입니다." };
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function quickUpdateProduct(id: number, values: { price?: number; stock?: number; is_active?: boolean }) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("products").update(values).eq("id", id);
  revalidatePath("/", "layout");
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (!(status in ORDER_STATUS)) return;
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
