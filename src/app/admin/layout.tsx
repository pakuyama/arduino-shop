import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: { default: "관리자", template: "%s | 아두몰 관리자" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[180px_1fr]">
      <aside className="card h-fit p-3 text-sm">
        <p className="px-2 pb-2 text-xs font-bold uppercase text-gray-400">관리자</p>
        <nav className="flex flex-col">
          <Link href="/admin" className="rounded px-2 py-2 hover:bg-gray-100">대시보드</Link>
          <Link href="/admin/products" className="rounded px-2 py-2 hover:bg-gray-100">상품 관리</Link>
          <Link href="/admin/orders" className="rounded px-2 py-2 hover:bg-gray-100">주문 관리</Link>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
