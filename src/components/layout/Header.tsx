import Link from "next/link";
import { logout } from "@/actions/auth";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SearchBar from "./SearchBar";

export default async function Header() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: categories }, cartCount] = await Promise.all([
    supabase.from("categories").select("slug, name").order("sort_order"),
    profile
      ? supabase
          .from("cart_items")
          .select("quantity")
          .eq("user_id", profile.id)
          .then(({ data }) => (data ?? []).reduce((sum, i) => sum + i.quantity, 0))
      : Promise.resolve(0),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="bg-brand-900 py-1.5 text-center text-xs text-brand-50">
        3만원 이상 구매 시 무료배송 · 평일 오후 3시 이전 결제 시 당일 출고
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 text-xl font-bold text-brand-700">
          <span className="rounded bg-brand-600 px-1.5 py-0.5 text-sm text-white">∞</span>
          아두몰
        </Link>
        <SearchBar />
        <nav className="ml-auto flex shrink-0 items-center gap-1 text-sm">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Link href="/admin" className="rounded px-2 py-1.5 font-semibold text-brand-700 hover:bg-brand-50">
                  관리자
                </Link>
              )}
              <Link href="/mypage" className="rounded px-2 py-1.5 hover:bg-gray-100">
                {profile.name ?? "마이페이지"}님
              </Link>
              <form action={logout}>
                <button className="rounded px-2 py-1.5 text-gray-500 hover:bg-gray-100">로그아웃</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded px-2 py-1.5 hover:bg-gray-100">로그인</Link>
              <Link href="/signup" className="rounded px-2 py-1.5 hover:bg-gray-100">회원가입</Link>
            </>
          )}
          <Link href="/cart" className="relative ml-1 rounded-md bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700">
            장바구니
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
        <Link href="/products" className="whitespace-nowrap rounded-full px-3 py-1 text-gray-700 hover:bg-gray-100">
          전체상품
        </Link>
        {categories?.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="whitespace-nowrap rounded-full px-3 py-1 text-gray-700 hover:bg-gray-100"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
