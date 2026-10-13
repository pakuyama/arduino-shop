"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const field = (key: string) => String(formData.get(key) ?? "").trim() || null;
  const { error } = await supabase
    .from("profiles")
    .update({
      name: field("name"),
      phone: field("phone"),
      zipcode: field("zipcode"),
      address1: field("address1"),
      address2: field("address2"),
    })
    .eq("id", auth.user.id);
  if (error) return { error: "저장하지 못했습니다." };

  revalidatePath("/mypage");
  return { ok: true };
}
