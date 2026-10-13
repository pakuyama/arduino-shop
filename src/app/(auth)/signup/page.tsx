import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">회원가입</h1>
      <div className="card p-6">
        <SignupForm />
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        이미 계정이 있으신가요? <Link href="/login" className="font-semibold text-brand-700">로그인</Link>
      </p>
    </div>
  );
}
