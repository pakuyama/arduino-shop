import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartForm from "@/components/product/AddToCartForm";
import ProductCard from "@/components/product/ProductCard";
import ProductImage from "@/components/product/ProductImage";
import ReviewSection from "@/components/product/ReviewSection";
import { createClient } from "@/lib/supabase/server";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, won } from "@/lib/utils";

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, slug, name)")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return product ? { title: product.name, description: product.summary ?? undefined } : {};
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const { data: related } = await supabase
    .from("products")
    .select("slug, name, price, image_url, stock, brand, summary")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .order("sales_count", { ascending: false })
    .limit(4);

  const specs = Object.entries((product.specs ?? {}) as Record<string, string>);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/products" className="hover:text-gray-800">전체상품</Link>
        {product.category && (
          <>
            {" › "}
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-gray-800">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="card relative aspect-square overflow-hidden">
            <ProductImage src={product.image_url} alt={product.name} sizes="(max-width: 768px) 100vw, 560px" priority />
          </div>
          {product.image_credit && (
            <p className="mt-2 text-xs text-gray-400">
              사진:{" "}
              {product.image_credit_url ? (
                <a href={product.image_credit_url} target="_blank" rel="noreferrer" className="underline">
                  {product.image_credit}
                </a>
              ) : (
                product.image_credit
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          {product.brand && (
            <span className="mb-2 w-fit rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {product.brand === "Arduino" ? "Arduino 정품" : product.brand}
            </span>
          )}
          <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
          {product.summary && <p className="mt-2 text-sm text-gray-600">{product.summary}</p>}
          <p className="mt-5 text-3xl font-bold">{won(product.price)}</p>

          <dl className="mt-5 space-y-2 border-y border-gray-200 py-4 text-sm">
            <div className="flex gap-4">
              <dt className="w-16 shrink-0 text-gray-500">배송비</dt>
              <dd>{won(SHIPPING_FEE)} ({won(FREE_SHIPPING_THRESHOLD)} 이상 무료)</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-16 shrink-0 text-gray-500">재고</dt>
              <dd className={product.stock > 0 ? "" : "font-semibold text-red-600"}>
                {product.stock > 0 ? `${product.stock}개` : "품절"}
              </dd>
            </div>
            {product.source_url && (
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 text-gray-500">가격 기준</dt>
                <dd>
                  <a href={product.source_url} target="_blank" rel="noreferrer" className="text-brand-700 underline">
                    디바이스마트 판매가
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <AddToCartForm productId={product.id} slug={product.slug} price={product.price} stock={product.stock} />
        </div>
      </div>

      {specs.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-bold">상품 사양</h2>
          <table className="card w-full overflow-hidden text-sm">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-gray-100 last:border-0">
                  <th className="w-40 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">{k}</th>
                  <td className="px-4 py-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {product.description && <p className="mt-4 whitespace-pre-line text-sm text-gray-700">{product.description}</p>}
        </section>
      )}

      <ReviewSection productId={product.id} slug={product.slug} />

      {related && related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold">같은 카테고리 상품</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
