import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "이미지 출처 및 라이선스" };

const SITE_IMAGES = [
  { src: "/images/hero.jpg", title: "메인 배너", credit: "Matt Biddulph (Flickr) · CC BY-SA 2.0", url: "https://www.flickr.com/photos/51035707449@N01/353389659" },
  { src: "/images/banner-projects.jpg", title: "프로젝트 배너", credit: "plamoni (Flickr) · CC BY-SA 2.0", url: "https://www.flickr.com/photos/29973568@N07/4819467337" },
];

export default async function CreditsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug, name, image_url, image_credit, image_credit_url")
    .not("image_credit", "is", null)
    .order("id");

  const rows: { src: string; title: string; credit: string; url: string; href?: string }[] = [
    ...SITE_IMAGES,
    ...(products ?? []).map((p) => ({ src: p.image_url!, title: p.name, credit: p.image_credit!, url: p.image_credit_url ?? "", href: `/products/${p.slug}` })),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">이미지 출처 및 라이선스</h1>
      <p className="mt-2 text-sm text-gray-600">
        이 사이트의 사진은 Wikimedia Commons와 Flickr에 크리에이티브 커먼즈(CC) 라이선스로 공개된 사진을 사용했습니다.
        일부 사진은 크기를 줄였으며, 원본과 라이선스 전문은 각 출처 링크에서 확인할 수 있습니다.
      </p>
      <ul className="card mt-6 divide-y divide-gray-100">
        {rows.map((r) => (
          <li key={r.src} className="flex items-center gap-4 p-3 text-sm">
            <div className="relative h-14 w-14 shrink-0">
              <Image src={r.src} alt="" fill sizes="56px" className="object-contain" />
            </div>
            <div className="flex-1">
              {r.href ? <Link href={r.href} className="font-medium hover:text-brand-700">{r.title}</Link> : <p className="font-medium">{r.title}</p>}
              <p className="text-gray-500">{r.credit}</p>
            </div>
            {r.url && (
              <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-brand-700 underline">원본</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
