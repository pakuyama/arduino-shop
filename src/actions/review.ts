"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewState = { error?: string; ok?: boolean } | undefined;

export async function addReview(_: ReviewState, formData: FormData): Promise<ReviewState> {
  const productId = Number(formData.get("productId"));
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating"));
  const content = String(formData.get("content") ?? "").trim();

  if (!(rating >= 1 && rating <= 5)) return { error: "별점을 선택해 주세요." };
  if (content.length < 2) return { error: "리뷰 내용을 2자 이상 입력해 주세요." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "로그인 후 리뷰를 작성할 수 있습니다." };

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", auth.user.id).single();

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: auth.user.id,
    author_name: profile?.name ?? "구매자",
    rating,
    content: content.slice(0, 1000),
  });
  if (error) {
    if (error.code === "23505") return { error: "이미 이 상품에 리뷰를 작성했습니다." };
    return { error: "리뷰를 등록하지 못했습니다." };
  }

  revalidatePath(`/products/${slug}`);
  return { ok: true };
}

export async function deleteReview(reviewId: number, slug: string) {
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", reviewId);
  revalidatePath(`/products/${slug}`);
}
