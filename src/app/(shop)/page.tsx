import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";

const CARD_FIELDS = "slug, name, price, image_url, stock, brand, summary";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: featured }, { data: best }, { data: categories }, { data: catProducts }] = await Promise.all([
    supabase.from("products").select(CARD_FIELDS).eq("is_featured", true).order("id").limit(8),
    supabase.from("products").select(CARD_FIELDS).order("sales_count", { ascending: false }).order("id").limit(4),
    supabase.from("categories").select("id, slug, name, description").order("sort_order"),
    supabase.from("products").select("category_id, image_url, name").order("id"),
  ]);

  // 카테고리 썸네일 = 해당 카테고리 첫 상품 사진
  const thumbByCategory = new Map<number, { image_url: string | null; name: string }>();
  catProducts?.forEach((p) => {
    if (!thumbByCategory.has(p.category_id)) thumbByCategory.set(p.category_id, p);
  });

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* 메인 배너 */}
      <section className="relative mt-6 overflow-hidden rounded-2xl">
        <Image
          src="/images/hero.jpg"
          alt="아두이노와 LCD를 브레드보드로 연결한 작업 모습"
          fill
          priority
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="object-cover"
        />
        <div className="relative bg-gradient-to-r from-black/80 via-black/55 to-transparent px-8 py-16 text-white sm:px-12 sm:py-24">
          <p className="mb-2 text-sm font-semibold text-brand-100">처음 시작하는 메이커를 위한</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            아이디어를 회로로,
            <br />
            아두이노 부품은 아두몰에서
          </h1>
          <p className="mt-3 max-w-md text-sm text-gray-200">
            정품 보드부터 센서·모터·키트까지. 3만원 이상 무료배송.
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/products?category=kits" className="btn-primary">입문 키트 보기</Link>
            <Link href="/products" className="btn border border-white/60 text-white hover:bg-white/10">전체상품</Link>
          </div>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">카테고리</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories?.map((c) => {
            const thumb = thumbByCategory.get(c.id);
            return (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="card group flex flex-col items-center gap-2 p-3 text-center transition hover:border-brand-500"
              >
                <div className="relative aspect-square w-full">
                  {thumb?.image_url && (
                    <Image src={thumb.image_url} alt={thumb.name} fill sizes="160px" className="object-contain" />
                  )}
                </div>
                <span className="text-sm font-semibold group-hover:text-brand-700">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 추천 상품 */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold">MD 추천 상품</h2>
          <Link href="/products" className="text-sm text-gray-500 hover:text-brand-700">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured?.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* 프로젝트 배너 */}
      <section className="mt-12 grid overflow-hidden rounded-2xl bg-brand-900 text-white sm:grid-cols-2">
        <div className="relative min-h-56">
          <Image
            src="/images/banner-projects.jpg"
            alt="아두이노 인체감지 센서 프로젝트"
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-3 p-8">
          <p className="text-sm font-semibold text-brand-100">이번 주 추천 프로젝트</p>
          <h3 className="text-2xl font-bold">사람이 오면 불이 켜지는 동작 감지 조명</h3>
          <p className="text-sm text-gray-300">
            우노 R3 + HC-SR501 인체감지 센서 + 릴레이 모듈만 있으면 30분 만에 완성할 수 있어요.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/products/arduino-uno-r3-compatible" className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20">우노 R3 호환보드</Link>
            <Link href="/products/hc-sr501" className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20">HC-SR501</Link>
            <Link href="/products/relay-1ch" className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20">릴레이 모듈</Link>
          </div>
        </div>
      </section>

      {/* 베스트 */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold">베스트 상품</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {best?.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </div>
  );
}
