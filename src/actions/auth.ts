"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === "string" ? next : "/";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "이메일과 비밀번호를 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "이메일 인증을 완료한 뒤 로그인해 주세요." };
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name || !email || !password) return { error: "모든 항목을 입력해 주세요." };
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };
  if (password !== passwordConfirm) return { error: "비밀번호가 일치하지 않습니다." };

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    if (error.code === "user_already_exists") return { error: "이미 가입된 이메일입니다." };
    if (error.code === "over_email_send_rate_limit") return { error: "잠시 후 다시 시도해 주세요. (인증 메일 발송 한도 초과)" };
    return { error: error.message };
  }

  // 이메일 인증이 꺼져 있으면 바로 세션이 생김
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }
  return { message: `${email} 으로 인증 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.` };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
