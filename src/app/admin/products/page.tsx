import Image from "next/image";
import Link from "next/link";
import QuickEditRow from "@/components/admin/QuickEditRow";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "상품 관리" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, price, stock, is_active, image_url, category:categories(name)")
    .order("category_id")
    .order("id");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <Link href="/admin/products/new" className="btn-primary">+ 상품 등록</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2">상품</th>
              <th className="px-3 py-2">카테고리</th>
              <th className="px-3 py-2">가격</th>
              <th className="px-3 py-2">재고</th>
              <th className="px-3 py-2">판매</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((p) => (
              <QuickEditRow key={p.id} product={{ id: p.id, price: p.price, stock: p.stock, is_active: p.is_active }}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 shrink-0">
                      {p.image_url && <Image src={p.image_url} alt="" fill sizes="40px" className="object-contain" />}
                    </div>
                    <Link href={`/products/${p.slug}`} className="hover:text-brand-700">{p.name}</Link>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{p.category?.name}</td>
              </QuickEditRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
