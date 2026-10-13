import ProductForm from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "상품 등록" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">상품 등록</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
