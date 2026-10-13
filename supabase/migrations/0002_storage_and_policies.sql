-- 상품 이미지 출처 URL
alter table public.products add column if not exists image_credit_url text;

-- 관리자 상품 이미지 업로드용 Storage 버킷
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "product-images: 관리자 업로드" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product-images: 관리자 수정" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product-images: 관리자 삭제" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

-- is_admin() 은 로그인 사용자만 실행 (보안 어드바이저 권고)
drop policy "products: 판매중 조회" on public.products;
create policy "products: 비로그인 판매중 조회" on public.products for select to anon
  using (is_active);
create policy "products: 로그인 사용자 조회" on public.products for select to authenticated
  using (is_active or (select public.is_admin()));
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
