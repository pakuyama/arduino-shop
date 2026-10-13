"use client";

import { useActionState, useState } from "react";
import { addReview } from "@/actions/review";
import SubmitButton from "@/components/ui/SubmitButton";

export default function ReviewForm({ productId, slug }: { productId: number; slug: string }) {
  const [state, formAction] = useActionState(addReview, undefined);
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="card space-y-3 p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-amber-500" : "text-gray-300"}`}
            aria-label={`${n}점`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">{rating}점</span>
      </div>
      <textarea name="content" rows={3} maxLength={1000} placeholder="상품을 사용해 본 경험을 남겨 주세요." className="input" required />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton pendingText="등록 중...">리뷰 등록</SubmitButton>
      </div>
    </form>
  );
}
