import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <p className="mt-3 font-semibold">페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="btn-primary mt-6">홈으로</Link>
    </div>
  );
}
