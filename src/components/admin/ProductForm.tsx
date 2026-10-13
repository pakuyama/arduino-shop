"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveProduct } from "@/actions/admin";
import SubmitButton from "@/components/ui/SubmitButton";
import type { Category, Product } from "@/types/database";

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, formAction] = useActionState(saveProduct, undefined);
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null);
  const specsText = Object.entries((product?.specs ?? {}) as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  return (
    <form action={formAction} className="card space-y-4 p-5 text-sm">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="imageUrl" value={product?.image_url ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-gray-600">상품명 *</span>
          <input name="name" defaultValue={product?.name} className="input" required />
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">슬러그 (URL) *</span>
          <input name="slug" defaultValue={product?.slug} className="input" placeholder="arduino-uno-r3" required pattern="[a-z0-9-]+" />
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">카테고리 *</span>
          <select name="categoryId" defaultValue={product?.category_id ?? ""} className="input" required>
            <option value="" disabled>선택</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">브랜드</span>
          <input name="brand" defaultValue={product?.brand ?? ""} className="input" placeholder="Arduino / 호환" />
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">가격 (원) *</span>
          <input name="price" type="number" min={0} defaultValue={product?.price} className="input" required />
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">재고 *</span>
          <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} className="input" required />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-gray-600">한 줄 요약</span>
        <input name="summary" defaultValue={product?.summary ?? ""} className="input" />
      </label>
      <label className="block space-y-1">
        <span className="text-gray-600">사양 (한 줄에 하나, &quot;항목: 값&quot;)</span>
        <textarea name="specs" defaultValue={specsText} rows={5} className="input font-mono" placeholder={"MCU: ATmega328P\n동작 전압: 5V"} />
      </label>
      <label className="block space-y-1">
        <span className="text-gray-600">상세 설명</span>
        <textarea name="description" defaultValue={product?.description ?? ""} rows={4} className="input" />
      </label>

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="relative aspect-square rounded border border-gray-200 bg-white">
          {preview ? (
            <Image src={preview} alt="미리보기" fill sizes="160px" className="object-contain p-2" unoptimized={preview.startsWith("blob:")} />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-gray-400">이미지 없음</span>
          )}
        </div>
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-gray-600">상품 이미지 (JPG/PNG/WEBP, 5MB 이하)</span>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-gray-600">이미지 출처/라이선스</span>
              <input name="imageCredit" defaultValue={product?.image_credit ?? ""} className="input" placeholder="작성자 · CC BY 2.0" />
            </label>
            <label className="space-y-1">
              <span className="text-gray-600">출처 URL</span>
              <input name="imageCreditUrl" defaultValue={product?.image_credit_url ?? ""} className="input" />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-gray-600">가격 참고 URL</span>
            <input name="sourceUrl" defaultValue={product?.source_url ?? ""} className="input" placeholder="https://www.devicemart.co.kr/goods/view?no=..." />
          </label>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={product?.is_active ?? true} className="accent-brand-600" /> 판매중
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.is_featured ?? false} className="accent-brand-600" /> 메인 추천 상품
        </label>
      </div>

      {state?.error && <p className="font-semibold text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton pendingText="저장 중...">{product ? "수정 저장" : "상품 등록"}</SubmitButton>
      </div>
    </form>
  );
}
