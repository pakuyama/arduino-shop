import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 같은 요청 안에서는 한 번만 조회
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

export async function requireUser(next = "/") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") notFound();
  return profile;
}
