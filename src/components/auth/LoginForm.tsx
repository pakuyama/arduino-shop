"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import SubmitButton from "@/components/ui/SubmitButton";

export default function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction] = useActionState(login, undefined);
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      {notice && <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{notice}</p>}
      <input name="email" type="email" placeholder="이메일" className="input py-2.5" required autoComplete="email" />
      <input name="password" type="password" placeholder="비밀번호" className="input py-2.5" required autoComplete="current-password" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton className="btn-primary w-full py-3" pendingText="로그인 중...">로그인</SubmitButton>
    </form>
  );
}
