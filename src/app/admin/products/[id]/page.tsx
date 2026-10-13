import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "상품 수정" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">상품 수정</h1>
      <ProductForm product={product} categories={categories ?? []} />
    </div>
  );
}
