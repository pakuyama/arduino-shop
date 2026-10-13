import Link from "next/link";
import type { Product } from "@/types/database";
import { won } from "@/lib/utils";
import ProductImage from "./ProductImage";

type CardProduct = Pick<Product, "slug" | "name" | "price" | "image_url" | "stock" | "brand" | "summary">;

export default function ProductCard({ product }: { product: CardProduct }) {
  const soldOut = product.stock <= 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square bg-white">
        <ProductImage src={product.image_url} alt={product.name} sizes="(max-width: 640px) 50vw, 25vw" />
        {soldOut && (
          <span className="absolute left-2 top-2 rounded bg-gray-800 px-2 py-0.5 text-xs font-semibold text-white">품절</span>
        )}
        {product.brand === "Arduino" && (
          <span className="absolute right-2 top-2 rounded bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">정품</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-gray-100 p-3">
        <p className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-brand-700">{product.name}</p>
        {product.summary && <p className="line-clamp-1 text-xs text-gray-500">{product.summary}</p>}
        <p className="mt-auto pt-1 text-base font-bold">{won(product.price)}</p>
      </div>
    </Link>
  );
}
