"use client";

import { useActionState } from "react";
import { signup } from "@/actions/auth";
import SubmitButton from "@/components/ui/SubmitButton";

export default function SignupForm() {
  const [state, formAction] = useActionState(signup, undefined);

  if (state?.message) {
    return <p className="rounded-md bg-brand-50 px-4 py-6 text-center text-sm text-brand-700">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input name="name" placeholder="이름" className="input py-2.5" required maxLength={30} autoComplete="name" />
      <input name="email" type="email" placeholder="이메일" className="input py-2.5" required autoComplete="email" />
      <input name="password" type="password" placeholder="비밀번호 (6자 이상)" className="input py-2.5" required minLength={6} autoComplete="new-password" />
      <input name="passwordConfirm" type="password" placeholder="비밀번호 확인" className="input py-2.5" required minLength={6} autoComplete="new-password" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton className="btn-primary w-full py-3" pendingText="가입 중...">회원가입</SubmitButton>
    </form>
  );
}
