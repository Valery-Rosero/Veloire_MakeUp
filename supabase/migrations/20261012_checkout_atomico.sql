-- ══════════════════════════════════════════════════════════════════════════
-- Checkout atómico: reserva de stock al pedir + cancelación automática
-- Pegar completo en el SQL Editor de Supabase. Se puede correr más de una vez.
--
-- Qué arregla:
--   · Descuento doble de stock (al pedir y otra vez al confirmar el pago).
--   · Compras simultáneas de la última unidad (dos pedidos por una unidad).
--   · Precios enviados desde el navegador (manipulables).
--   · Cancelaciones que no devolvían el stock, o lo devolvían de más.
--   · Pedidos sin pagar que bloqueaban stock para siempre.
-- ══════════════════════════════════════════════════════════════════════════


-- 1. Confirmar el pago ya no toca el stock ─────────────────────────────────
-- El stock ahora se aparta al crear el pedido (create_order). Este trigger
-- lo volvía a descontar al marcar "pagado".
drop trigger if exists trg_discount_stock on public.orders;
drop function if exists public.discount_stock_on_payment();


-- 2. Vencimiento de pedidos sin pagar ──────────────────────────────────────
-- Solo lo llena create_order para Nequi/Bancolombia. Efectivo (contra entrega)
-- y pedidos manuales del admin quedan en null: nunca vencen.
alter table public.orders add column if not exists payment_expires_at timestamptz;


-- 3. Un pedido cancelado no puede volver a otro estado ─────────────────────
-- Al cancelar se devuelve el stock; si el pedido "reviviera", esas unidades
-- quedarían vendidas dos veces.
create or replace function public.fn_block_uncancel()
returns trigger
language plpgsql
set search_path to 'pg_catalog', 'public'
as $$
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'El pedido % está cancelado y no puede cambiar de estado', old.order_number;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_block_uncancel on public.orders;
create trigger trg_block_uncancel
  before update of status on public.orders
  for each row execute function public.fn_block_uncancel();


-- 4. Reactivar productos cuando vuelve el stock ────────────────────────────
-- Con la reserva al pedir, apartar la última unidad desactiva el producto. Si
-- ese pedido se cancela, el producto debe volver a la tienda — pero solo si lo
-- desactivó el sistema, no si la admin lo desactivó a propósito.
alter table public.products
  add column if not exists auto_deactivated boolean not null default false;

create or replace function public.fn_auto_deactivate_product()
returns trigger
language plpgsql
set search_path to 'pg_catalog', 'public'
as $$
begin
  if exists (
    select 1 from product_shades where product_id = new.product_id and stock > 0
  ) then
    update products
    set status = 'active', auto_deactivated = false, updated_at = now()
    where id = new.product_id and status = 'inactive' and auto_deactivated;
  else
    update products
    set status = 'inactive', auto_deactivated = true, updated_at = now()
    where id = new.product_id and status = 'active';
  end if;
  return new;
end;
$$;

-- Si la admin cambia el estado a mano, ese estado manda: deja de contar como
-- "desactivado automáticamente".
create or replace function public.fn_clear_auto_deactivated()
returns trigger
language plpgsql
set search_path to 'pg_catalog', 'public'
as $$
begin
  if new.status is distinct from old.status
     and new.auto_deactivated is not distinct from old.auto_deactivated then
    new.auto_deactivated := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clear_auto_deactivated on public.products;
create trigger trg_clear_auto_deactivated
  before update on public.products
  for each row execute function public.fn_clear_auto_deactivated();


-- 5. cancel_order: cancela y devuelve el stock exactamente una vez ─────────
-- El UPDATE condicional sobre el pedido hace que, si dos cancelaciones llegan
-- a la vez (clienta + admin + cancelación automática), solo una devuelva stock.
-- p_only_if_status: para la clienta, que solo puede cancelar si sigue pendiente
-- (evita cancelar un pedido que la admin acaba de marcar como pagado).
create or replace function public.cancel_order(
  p_order_id uuid,
  p_only_if_status text default null
)
returns boolean
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_id uuid;
begin
  update orders
  set status = 'cancelled'
  where id = p_order_id
    and status not in ('cancelled', 'delivered')
    and (p_only_if_status is null or status::text = p_only_if_status)
  returning id into v_id;

  if v_id is null then
    return false;
  end if;

  update product_shades ps
  set stock = ps.stock + oi.qty
  from (
    select shade_id, sum(quantity) as qty
    from order_items
    where order_id = p_order_id and shade_id is not null
    group by shade_id
  ) oi
  where ps.id = oi.shade_id;

  return true;
end;
$$;


-- 6. cancel_expired_orders: cancela los pedidos vencidos sin pagar ─────────
create or replace function public.cancel_expired_orders()
returns integer
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_id uuid;
  v_count integer := 0;
begin
  for v_id in
    select id from orders
    where status = 'pending_payment' and payment_expires_at < now()
  loop
    if public.cancel_order(v_id, 'pending_payment') then
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end;
$$;


-- 7. create_order: todo el pedido en una sola transacción ──────────────────
-- Por cada tono descuenta el stock SOLO si alcanza (stock >= cantidad). Ese
-- UPDATE bloquea la fila del tono: si dos clientas compran la última unidad a
-- la vez, la segunda espera, ve stock 0 y recibe 'stock_insuficiente' — y como
-- todo es una transacción, no queda ningún pedido a medias.
-- Los precios, nombres e imágenes salen de la base de datos, nunca del navegador.
-- p_items: [{"shade_id": "<uuid>", "quantity": 2}, ...]
create or replace function public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address text,
  p_neighborhood text,
  p_city text,
  p_department text,
  p_notes text,
  p_payment_method public.orders.payment_method%type,
  p_items jsonb,
  p_expires_in interval default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_item record;
  v_shade record;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_delivery_fee numeric;
  v_order_id uuid;
  v_order_number text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'carrito_vacio';
  end if;

  -- Libera primero las unidades de pedidos vencidos, por si el cron aún no corrió.
  perform public.cancel_expired_orders();

  for v_item in
    select (e->>'shade_id')::uuid as shade_id, sum((e->>'quantity')::int) as quantity
    from jsonb_array_elements(p_items) e
    group by 1
    order by 1  -- mismo orden de bloqueo en pedidos simultáneos: evita deadlocks
  loop
    if v_item.shade_id is null or v_item.quantity is null or v_item.quantity < 1 then
      raise exception 'cantidad_invalida';
    end if;

    update product_shades ps
    set stock = ps.stock - v_item.quantity
    from products p
    where ps.id = v_item.shade_id
      and p.id = ps.product_id
      and ps.is_active
      and p.status = 'active'
      and ps.stock >= v_item.quantity
    returning ps.product_id, ps.name as shade_name, ps.hex_color, ps.image_url,
              p.name as product_name, p.price
    into v_shade;

    if not found then
      raise exception 'stock_insuficiente' using detail = coalesce((
        select json_build_object(
          'product_name', p.name,
          'shade_name', ps.name,
          'available', case when ps.is_active and p.status = 'active' then ps.stock else 0 end
        )::text
        from product_shades ps
        join products p on p.id = ps.product_id
        where ps.id = v_item.shade_id
      ), '{}');
    end if;

    v_lines := v_lines || jsonb_build_object(
      'product_id', v_shade.product_id,
      'shade_id', v_item.shade_id,
      'product_name', v_shade.product_name,
      'shade_name', v_shade.shade_name,
      'shade_hex', v_shade.hex_color,
      'image_url', coalesce(v_shade.image_url, (
        select url from product_images
        where product_id = v_shade.product_id
        order by is_main desc, sort_order
        limit 1
      )),
      'quantity', v_item.quantity,
      'unit_price', v_shade.price
    );
    v_subtotal := v_subtotal + v_shade.price * v_item.quantity;
  end loop;

  select nullif(value, '')::numeric into v_delivery_fee
  from store_config where key = 'delivery_fee';
  v_delivery_fee := coalesce(v_delivery_fee, 5000);

  v_order_number := public.generate_order_number();

  insert into orders (
    order_number, customer_name, customer_email, customer_phone, address,
    neighborhood, city, department, notes, payment_method,
    subtotal, delivery_fee, total, status, payment_expires_at
  ) values (
    v_order_number, p_customer_name, p_customer_email, p_customer_phone, p_address,
    p_neighborhood, p_city, p_department, nullif(p_notes, ''), p_payment_method,
    v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee, 'pending_payment',
    now() + p_expires_in
  )
  returning id into v_order_id;

  insert into order_items (
    order_id, product_id, shade_id, product_name, shade_name, shade_hex,
    image_url, quantity, unit_price, subtotal
  )
  select
    v_order_id,
    (l->>'product_id')::uuid,
    (l->>'shade_id')::uuid,
    l->>'product_name',
    l->>'shade_name',
    l->>'shade_hex',
    l->>'image_url',
    (l->>'quantity')::int,
    (l->>'unit_price')::numeric,
    (l->>'unit_price')::numeric * (l->>'quantity')::int
  from jsonb_array_elements(v_lines) l;

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
end;
$$;


-- 8. Solo el servidor puede llamar estas funciones ─────────────────────────
-- Son SECURITY DEFINER y viven en "public", que la API REST expone: sin esto,
-- cualquiera con la llave pública podría cancelar pedidos ajenos.
revoke execute on function public.create_order from public, anon, authenticated;
revoke execute on function public.cancel_order from public, anon, authenticated;
revoke execute on function public.cancel_expired_orders from public, anon, authenticated;
grant execute on function public.create_order to service_role;
grant execute on function public.cancel_order to service_role;
grant execute on function public.cancel_expired_orders to service_role;


-- 9. Cancelación automática cada 10 minutos ────────────────────────────────
-- Si este paso falla, activa pg_cron en Database → Extensions y corre solo
-- estas dos líneas de nuevo.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'cancelar-pedidos-vencidos',
  '*/10 * * * *',
  $$select public.cancel_expired_orders()$$
);
