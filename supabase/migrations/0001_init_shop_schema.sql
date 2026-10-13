-- ============ 사용자 프로필 ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  zipcode text,
  address1 text,
  address2 text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 일반 사용자가 자기 role을 admin으로 바꾸지 못하게 막음 (SQL 에디터/서비스 롤에서는 변경 가능)
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ============ 카테고리 / 상품 ============
create table public.categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0
);

create table public.products (
  id bigserial primary key,
  slug text not null unique,
  category_id int not null references public.categories(id),
  name text not null,
  brand text,
  summary text,
  description text,
  price int not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  specs jsonb not null default '{}'::jsonb,
  image_url text,
  image_credit text,
  source_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sales_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);

-- ============ 장바구니 ============
create table public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity int not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index cart_items_product_idx on public.cart_items(product_id);

-- ============ 주문 ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','paid','preparing','shipped','delivered','cancelled')),
  order_name text not null,
  items_total int not null,
  shipping_fee int not null,
  total int not null,
  recipient text not null,
  phone text not null,
  zipcode text,
  address1 text not null,
  address2 text,
  memo text,
  payment_key text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id, created_at desc);

create table public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  image_url text,
  price int not null,
  quantity int not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);

-- ============ 리뷰 ============
create table public.reviews (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  content text not null check (char_length(content) between 2 and 1000),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_user_idx on public.reviews(user_id);

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

create policy "profiles: 본인 또는 관리자 조회" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: 본인 수정" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "categories: 누구나 조회" on public.categories for select using (true);
create policy "categories: 관리자 추가" on public.categories for insert to authenticated
  with check ((select public.is_admin()));
create policy "categories: 관리자 수정" on public.categories for update to authenticated
  using ((select public.is_admin()));
create policy "categories: 관리자 삭제" on public.categories for delete to authenticated
  using ((select public.is_admin()));

create policy "products: 판매중 조회" on public.products for select
  using (is_active or (select public.is_admin()));
create policy "products: 관리자 추가" on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy "products: 관리자 수정" on public.products for update to authenticated
  using ((select public.is_admin()));
create policy "products: 관리자 삭제" on public.products for delete to authenticated
  using ((select public.is_admin()));

create policy "cart: 본인만" on public.cart_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- 주문 생성/결제 처리는 security definer 함수와 Edge Function에서만 수행
create policy "orders: 본인 또는 관리자 조회" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "orders: 관리자 상태 변경" on public.orders for update to authenticated
  using ((select public.is_admin()));

create policy "order_items: 본인 또는 관리자 조회" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (o.user_id = (select auth.uid()) or (select public.is_admin()))));

create policy "reviews: 누구나 조회" on public.reviews for select using (true);
create policy "reviews: 본인 작성" on public.reviews for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "reviews: 본인 또는 관리자 삭제" on public.reviews for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ============ 주문 생성 함수 (가격은 DB 기준으로 계산) ============
create or replace function public.create_order(
  p_items jsonb,            -- [{"product_id": 1, "quantity": 2}, ...]
  p_recipient text,
  p_phone text,
  p_zipcode text,
  p_address1 text,
  p_address2 text,
  p_memo text
) returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_qty int;
  v_items_total int := 0;
  v_shipping int;
  v_first_name text;
  v_count int := 0;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception '주문할 상품이 없습니다.'; end if;
  if coalesce(trim(p_recipient),'') = '' or coalesce(trim(p_phone),'') = '' or coalesce(trim(p_address1),'') = '' then
    raise exception '배송 정보를 모두 입력해 주세요.';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    select * into v_product from public.products where id = (v_item->>'product_id')::bigint and is_active;
    if not found then raise exception '판매하지 않는 상품이 포함되어 있습니다.'; end if;
    if v_qty < 1 or v_qty > 99 then raise exception '수량이 올바르지 않습니다.'; end if;
    if v_product.stock < v_qty then raise exception '% 재고가 부족합니다. (남은 수량 %개)', v_product.name, v_product.stock; end if;
    v_items_total := v_items_total + v_product.price * v_qty;
    if v_first_name is null then v_first_name := v_product.name; end if;
    v_count := v_count + 1;
  end loop;

  v_shipping := case when v_items_total >= 30000 then 0 else 3000 end;

  insert into public.orders (order_no, user_id, order_name, items_total, shipping_fee, total,
                             recipient, phone, zipcode, address1, address2, memo)
  values (
    to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 8)),
    v_uid,
    case when v_count > 1 then v_first_name || ' 외 ' || (v_count - 1) || '건' else v_first_name end,
    v_items_total, v_shipping, v_items_total + v_shipping,
    trim(p_recipient), trim(p_phone), p_zipcode, trim(p_address1), p_address2, p_memo
  ) returning * into v_order;

  insert into public.order_items (order_id, product_id, product_name, image_url, price, quantity)
  select v_order.id, p.id, p.name, p.image_url, p.price, (i->>'quantity')::int
  from jsonb_array_elements(p_items) i
  join public.products p on p.id = (i->>'product_id')::bigint;

  return v_order;
end;
$$;

revoke execute on function public.create_order(jsonb, text, text, text, text, text, text) from public, anon;
grant execute on function public.create_order(jsonb, text, text, text, text, text, text) to authenticated;

-- 결제 승인 후 Edge Function(service_role)에서만 호출
create or replace function public.complete_order_payment(
  p_order_id uuid, p_payment_key text, p_method text
) returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  v_order public.orders;
begin
  update public.orders
     set status = 'paid', payment_key = p_payment_key, payment_method = p_method, paid_at = now()
   where id = p_order_id and status = 'pending'
   returning * into v_order;
  if not found then raise exception '이미 처리되었거나 존재하지 않는 주문입니다.'; end if;

  update public.products p
     set stock = greatest(p.stock - oi.quantity, 0),
         sales_count = p.sales_count + oi.quantity
    from public.order_items oi
   where oi.order_id = p_order_id and oi.product_id = p.id;

  -- 장바구니 비우기는 Edge Function(confirm-payment)에서 처리
  return v_order;
end;
$$;

revoke execute on function public.complete_order_payment(uuid, text, text) from public, anon, authenticated;
grant execute on function public.complete_order_payment(uuid, text, text) to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
