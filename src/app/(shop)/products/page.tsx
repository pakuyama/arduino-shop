import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "전체상품" };

const SORTS = {
  popular: { label: "인기순", column: "sales_count", ascending: false },
  new: { label: "최신순", column: "created_at", ascending: false },
  "price-asc": { label: "낮은 가격순", column: "price", ascending: true },
  "price-desc": { label: "높은 가격순", column: "price", ascending: false },
} as const;
type SortKey = keyof typeof SORTS;

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const sortKey: SortKey = typeof params.sort === "string" && params.sort in SORTS ? (params.sort as SortKey) : "popular";
  const sort = SORTS[sortKey];

  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, slug, name").order("sort_order");
  const current = categories?.find((c) => c.slug === category);

  let query = supabase.from("products").select("slug, name, price, image_url, stock, brand, summary");
  if (current) query = query.eq("category_id", current.id);
  if (q) {
    // PostgREST or() 문법을 깨뜨리는 문자 제거
    const term = q.replace(/[%,()*\\]/g, " ");
    query = query.or(`name.ilike.%${term}%,summary.ilike.%${term}%`);
  }
  const { data: products } = await query.order(sort.column, { ascending: sort.ascending }).order("id");

  const href = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { category, q: q || undefined, sort: sortKey === "popular" ? undefined : sortKey, ...next };
    Object.entries(merged).forEach(([k, v]) => v && sp.set(k, v));
    const s = sp.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        {q ? `"${q}" 검색 결과` : current ? current.name : "전체상품"}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href({ category: undefined })}
          className={cn("rounded-full border px-3 py-1 text-sm", !current ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white hover:border-gray-400")}
        >
          전체
        </Link>
        {categories?.map((c) => (
          <Link
            key={c.slug}
            href={href({ category: c.slug })}
            className={cn("rounded-full border px-3 py-1 text-sm", current?.slug === c.slug ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white hover:border-gray-400")}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-gray-200 pb-3 text-sm">
        <p className="text-gray-500">
          총 <b className="text-gray-900">{products?.length ?? 0}</b>개
        </p>
        <div className="flex gap-3">
          {(Object.keys(SORTS) as SortKey[]).map((key) => (
            <Link
              key={key}
              href={href({ sort: key === "popular" ? undefined : key })}
              className={cn(sortKey === key ? "font-bold text-gray-900" : "text-gray-500 hover:text-gray-800")}
            >
              {SORTS[key].label}
            </Link>
          ))}
        </div>
      </div>

      {products?.length ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      ) : (
        <div className="py-24 text-center text-gray-500">
          <p>검색 결과가 없습니다.</p>
          <Link href="/products" className="mt-3 inline-block text-brand-700 underline">전체상품 보기</Link>
        </div>
      )}
    </div>
  );
}
