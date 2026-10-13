import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";
  if (await getCurrentUser()) redirect(next);

  const notice =
    params.confirmed === "1" ? "이메일 인증이 완료되었습니다. 로그인해 주세요." :
    params.error === "auth" ? "인증 링크가 만료되었거나 올바르지 않습니다." : undefined;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">로그인</h1>
      <div className="card p-6">
        <LoginForm next={next} notice={notice} />
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        아직 회원이 아니신가요? <Link href="/signup" className="font-semibold text-brand-700">회원가입</Link>
      </p>
    </div>
  );
}
