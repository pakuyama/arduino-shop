import Link from "next/link";
import { deleteReview } from "@/actions/review";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import ReviewForm from "./ReviewForm";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500" aria-label={`별점 ${value}점`}>
      {"★".repeat(value)}
      <span className="text-gray-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default async function ReviewSection({ productId, slug }: { productId: number; slug: string }) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  const count = reviews?.length ?? 0;
  const avg = count ? reviews!.reduce((s, r) => s + r.rating, 0) / count : 0;
  const mine = reviews?.find((r) => r.user_id === user?.id);

  return (
    <section className="mt-12">
      <h2 className="mb-3 text-lg font-bold">
        상품 리뷰 <span className="text-gray-400">{count}</span>
        {count > 0 && (
          <span className="ml-3 text-base font-semibold">
            <Stars value={Math.round(avg)} /> {avg.toFixed(1)}
          </span>
        )}
      </h2>

      {user ? (
        !mine && <ReviewForm productId={productId} slug={slug} />
      ) : (
        <p className="card p-4 text-sm text-gray-500">
          <Link href={`/login?next=/products/${slug}`} className="font-semibold text-brand-700 underline">로그인</Link> 후 리뷰를 작성할 수 있습니다.
        </p>
      )}

      <ul className="mt-4 divide-y divide-gray-100 card">
        {reviews?.map((r) => (
          <li key={r.id} className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Stars value={r.rating} />
              <span className="font-semibold">{r.author_name}</span>
              <span className="text-gray-400">{formatDate(r.created_at)}</span>
              {r.user_id === user?.id && (
                <form action={deleteReview.bind(null, r.id, slug)} className="ml-auto">
                  <button className="text-xs text-gray-400 hover:text-red-600">삭제</button>
                </form>
              )}
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{r.content}</p>
          </li>
        ))}
        {count === 0 && <li className="p-8 text-center text-sm text-gray-400">아직 작성된 리뷰가 없습니다.</li>}
      </ul>
    </section>
  );
}
