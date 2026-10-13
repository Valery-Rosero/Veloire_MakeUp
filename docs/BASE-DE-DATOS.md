# Base de datos — Vèloire MakeUp

Motor: **PostgreSQL** vía **Supabase**. RLS (Row Level Security) activo en tablas sensibles. Los tipos se generan automáticamente en `src/types/database.ts`.

---

## Tablas

### `profiles`

Extensión de `auth.users`. Se crea automáticamente con un trigger cuando un usuario se registra.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | FK → `auth.users.id` |
| `full_name` | text | Nombre del usuario |
| `email` | text | Email (duplicado de auth.users) |
| `phone` | text | Teléfono celular (10 dígitos) |
| `role` | `user_role` (enum) | `'customer'`, `'admin'` o `'superadmin'` — ver [ARQUITECTURA.md](ARQUITECTURA.md) para el modelo de permisos |
| `created_at` | timestamp | — |

**RLS:** Los usuarios solo pueden leer y editar su propio perfil. El admin puede leer todos (via service role).

---

### `admin_activity_log`

Historial de auditoría de todo lo que se hace en el panel admin (productos, categorías, pedidos, configuración, altas/bajas de admin). Solo visible para `superadmin` en `/admin/historial`. Insertado por `src/lib/audit-log.ts::logAdminAction()` desde cada Server Action mutante del admin.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `actor_id` | uuid | FK → `profiles.id`, `on delete set null` |
| `actor_email` | text | Snapshot del email de quien hizo la acción |
| `action` | text | Ej: `'product.create'`, `'admin.promote'` |
| `entity_type` | text | Ej: `'product'`, `'order'`, `'profile'` |
| `entity_id` | text | Nullable |
| `entity_label` | text | Nombre legible para mostrar en el historial |
| `details` | jsonb | Datos extra según la acción (ej. `{from, to}` en cambios de estado) |
| `created_at` | timestamp | — |

**RLS:** activo, sin policies permisivas — solo `createAdminClient()` (service role) puede leer/escribir.

---

### `rate_limit_hits`

Respaldo del rate limiter (`src/lib/rate-limit.ts::isRateLimited()`) — reemplaza al `Map` en memoria que no se compartía entre instancias serverless. Usado hoy por `POST /api/orders` (5 solicitudes/min por IP).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint (identity) | PK |
| `key` | text | Ej: la IP del cliente (`getClientIp()`) |
| `created_at` | timestamptz | — |

**RLS:** activo, sin policies permisivas — solo `createAdminClient()`. No tiene limpieza automática de filas viejas todavía (ver `PENDIENTE.md`).

---

### `reviews`

Reseñas de producto. Solo puede reseñar quien compró el producto (verificado en la propia policy de RLS, no solo en la app).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products.id`, `on delete cascade` |
| `user_id` | uuid | FK → `profiles.id`, `on delete cascade` |
| `rating` | smallint | 1 a 5 (`check`) |
| `comment` | text | Opcional |
| `reviewer_name` | text | Snapshot del nombre al momento de reseñar (no un join a `profiles`, que tiene RLS de solo-lectura-propia) |
| `created_at` | timestamp | — |

Restricción `unique(product_id, user_id)` — una reseña por clienta por producto; escribir de nuevo actualiza la existente (`upsert`).

**RLS:**
- SELECT: público (`using (true)`).
- INSERT: `auth.uid() = user_id` **y** debe existir un `order_items` + `orders` de esa clienta (`customer_email = auth.email()`) para ese `product_id` con estado `paid`/`preparing`/`shipped`/`delivered`.
- UPDATE/DELETE: solo la propia fila (`auth.uid() = user_id`).

---

### `categories`

Categorías de maquillaje. Cada una puede estar asociada a una zona del rostro.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Nombre (ej: "Labiales", "Bases") |
| `slug` | text | URL amigable único |
| `sort_order` | int | Orden de aparición |
| `is_active` | bool | Visible en la tienda |
| `face_region` | text | Zona del rostro para el FaceMap |
| `sku_prefix` | text | Prefijo de 3 letras para el SKU autogenerado de sus productos (ej. `'LAB'`, `'BAS'`) — ver [FUNCIONALIDADES.md](FUNCIONALIDADES.md#comparador-de-productos) |

---

### `products`

Producto principal (sin variantes de tono).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `category_id` | uuid | FK → `categories.id` |
| `name` | text | Nombre del producto |
| `slug` | text | URL amigable único |
| `sku` | text | Único. `{MARCA_ABREV}-{CATEGORIA_ABREV}-{NNN}`, autogenerado y editable. Ver `src/lib/sku.ts` |
| `description` | text | Descripción larga |
| `comparison` | jsonb | Valores de los campos de comparación de su categoría (`{tipo_de_piel: 'Grasa', ...}`). Los campos válidos por categoría viven en `src/lib/comparison-fields.ts`, NO en la base de datos — es la única fuente de verdad, para que el Excel, el formulario admin y la tabla de comparación nunca diverjan. |
| `price` | numeric | Precio en COP |
| `compare_price` | numeric | Precio tachado (precio anterior) |
| `brand` | text | Marca — usada para generar el SKU |
| `cost_price` | numeric | Costo unitario (calculador de rentabilidad en el importador) |
| `status` | text | `'active'`, `'inactive'`, `'draft'` |
| `auto_deactivated` | bool | `true` si lo desactivó el sistema por quedarse sin stock (no la admin). Solo esos productos se reactivan solos cuando vuelve el stock (ej. al cancelarse un pedido). Cualquier cambio manual de `status` lo pone en `false`. |
| `is_featured` | bool | Aparece en destacados del home |
| `meta_title` | text | Título SEO |
| `meta_description` | text | Descripción SEO |
| `created_at` | timestamp | — |

---

### `product_images`

Imágenes de un producto. Un producto puede tener múltiples.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products.id` |
| `url` | text | URL de Supabase Storage |
| `alt_text` | text | Texto alternativo |
| `is_main` | bool | Si es la imagen principal |
| `sort_order` | int | Orden en la galería |

---

### `product_shades`

Variantes de tono de un producto. Cada tono tiene su propio stock.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products.id` |
| `name` | text | Nombre del tono |
| `hex_color` | text | Color hexadecimal (`#RRGGBB`) |
| `image_url` | text | Imagen específica del tono |
| `stock` | int | Unidades disponibles (ya descontadas las apartadas por pedidos pendientes). `check (stock >= 0)` |
| `is_active` | bool | Disponible para compra |
| `sort_order` | int | Orden de aparición |

---

### `orders`

Pedidos de la tienda.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `order_number` | text | Número legible (ej: `VEL-20260908-00012`) |
| `status` | OrderStatus | Ver enum más abajo |
| `customer_name` | text | — |
| `customer_email` | text | — |
| `customer_phone` | text | — |
| `address` | text | Dirección de entrega |
| `neighborhood` | text | Barrio |
| `city` | text | Ciudad (Pasto) |
| `department` | text | Departamento (Nariño) |
| `notes` | text | Notas adicionales del cliente |
| `payment_method` | text | `'nequi'` (efectivo y Bancolombia se retiraron el 2026-10-12; los pedidos viejos conservan su valor) |
| `subtotal` | numeric | Total sin domicilio |
| `delivery_fee` | numeric | Costo de domicilio |
| `total` | numeric | `subtotal + delivery_fee` |
| `payment_confirmed_at` | timestamp | Cuándo se confirmó el pago |
| `payment_expires_at` | timestamptz | Hasta cuándo se aparta el stock sin pago. Pedidos de la tienda: 24 h. `null` en pedidos manuales del admin, que nunca vencen |
| `created_at` | timestamp | — |

Los pedidos **no se crean con `insert` directo**: siempre vía `create_order()` (ver Funciones), que aparta stock y crea el pedido en una sola transacción.

#### `OrderStatus` (enum)

| Valor | Descripción |
|---|---|
| `pending_payment` | Creado, esperando pago (estado inicial) |
| `paid` | Pago confirmado por el admin |
| `preparing` | En preparación |
| `shipped` | Enviado / en camino |
| `delivered` | Entregado |
| `cancelled` | Cancelado |

---

### `order_items`

Líneas de un pedido.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `order_id` | uuid | FK → `orders.id` |
| `product_id` | uuid | FK → `products.id` (nullable si el producto fue eliminado) |
| `product_name` | text | Snapshot del nombre (no cambia si el producto cambia) |
| `shade_id` | uuid | FK → `product_shades.id` (nullable) |
| `shade_name` | text | Snapshot del nombre del tono |
| `shade_hex` | text | Snapshot del color hex |
| `image_url` | text | Snapshot de la imagen |
| `quantity` | int | Cantidad |
| `unit_price` | numeric | Precio unitario al momento de compra |
| `subtotal` | numeric | `unit_price × quantity` |

---

### `order_status_history`

Log de cambios de estado de un pedido (lo llena el trigger `log_order_status_change()`).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `order_id` | uuid | FK → `orders.id` |
| `status` | OrderStatus | Estado al que cambió |
| `note` | text | Nota del admin |
| `changed_at` | timestamp | — |

---

### `email_notifications`

Cola de notificaciones de email. Se inserta desde `POST /api/notifications` (requiere admin). Actualmente la cola **no tiene consumidor activo** — los emails transaccionales se envían directamente desde las Server Actions vía Resend.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `order_id` | uuid | FK → `orders.id` |
| `type` | NotificationType | Ver enum más abajo |
| `recipient_email` | text | Email del destinatario |
| `status` | text | `'pending'`, `'sent'`, `'failed'` |
| `created_at` | timestamp | — |

#### `NotificationType` (enum)

| Valor | Descripción |
|---|---|
| `order_confirmation` | Pedido creado |
| `payment_confirmed` | Pago confirmado |
| `order_shipped` | Pedido enviado |
| `order_delivered` | Pedido entregado |

---

### `store_config`

Configuración global de la tienda (clave-valor).

| Columna | Tipo | Notas |
|---|---|---|
| `key` | text | PK. Ej: `'whatsapp_number'`, `'delivery_fee'`, `'instagram_url'` |
| `value` | text | Valor |
| `description` | text | Descripción legible para el admin |

#### Claves conocidas

| Key | Descripción |
|---|---|
| `whatsapp_number` | Número para WhatsApp (con código de país) |
| `delivery_fee` | Costo de domicilio en COP |
| `instagram_url` | URL del perfil de Instagram |

---

## Vistas (Views)

### `v_orders_detail`

Vista que agrega datos de pedidos con conteo de items. Usada en `/cuenta` para el historial del usuario.

Columnas principales: `id`, `order_number`, `status`, `total`, `created_at`, `item_count`, `customer_email`.

---

## Almacenamiento (Storage)

Supabase Storage se usa para las imágenes de productos y tonos. Las URLs son públicas y se guardan directamente en `product_images.url` y `product_shades.image_url`.

---

## Funciones de base de datos

### Esquema `private` (no expuesto por PostgREST)

Las funciones SECURITY DEFINER que no deben ser accesibles desde la API REST viven en el esquema `private`. PostgREST solo expone `public`.

| Función | Descripción |
|---|---|
| `private.handle_new_user()` | Trigger que crea el perfil en `profiles` al registrarse un usuario en `auth.users` |
| `private.is_admin()` | Devuelve `true` si el usuario actual tiene `role = 'admin'` en `profiles`. Usada en políticas RLS. |

`anon` y `authenticated` tienen `EXECUTE` sobre `private.is_admin()` para que las políticas RLS funcionen.

### Funciones en `public` (con `search_path` fijo)

Estas funciones tienen `search_path = pg_catalog, public` para evitar ataques de search_path hijacking:

| Función | Descripción |
|---|---|
| `set_updated_at()` | Trigger para actualizar `updated_at` automáticamente |
| `log_order_status_change()` | Trigger que inserta en `order_status_history` al cambiar estado del pedido |
| `generate_order_number()` | Genera números de pedido con formato `VEL-YYYYMMDD-NNNNN` |
| `fn_auto_deactivate_product()` | Trigger en `product_shades.stock`: desactiva el producto si todos sus tonos quedan en 0 (marcándolo `auto_deactivated`), y lo reactiva si vuelve el stock y lo había desactivado el sistema |
| `fn_clear_auto_deactivated()` | Trigger en `products`: un cambio manual de `status` limpia `auto_deactivated` |
| `fn_block_uncancel()` | Trigger en `orders`: un pedido cancelado no puede volver a otro estado (su stock ya se devolvió) |

### Checkout y stock (solo `service_role`)

Definidas en `supabase/migrations/20261012_checkout_atomico.sql`. Son `SECURITY DEFINER` y tienen `EXECUTE` revocado para `anon`/`authenticated` — solo el servidor las llama, vía `src/lib/orders.ts`.

| Función | Descripción |
|---|---|
| `create_order(...)` | Crea el pedido en una sola transacción: por cada tono descuenta el stock solo si alcanza (`stock >= cantidad`, el `UPDATE` bloquea la fila, así dos compras simultáneas de la última unidad nunca se venden dos veces), toma precios/nombres/imágenes de la base (nunca del navegador), calcula totales y crea `orders` + `order_items`. Si un tono no alcanza, lanza `stock_insuficiente` y no queda nada a medias |
| `cancel_order(id, solo_si_estado)` | Cancela y devuelve el stock exactamente una vez, aunque lleguen varias cancelaciones a la vez. `solo_si_estado = 'pending_payment'` lo usa la clienta para no cancelar un pedido que la admin acaba de marcar como pagado |
| `cancel_expired_orders()` | Cancela los pedidos `pending_payment` con `payment_expires_at` vencido. La corre `pg_cron` cada 10 min (job `cancelar-pedidos-vencidos`) y también `create_order` antes de apartar stock |

> El stock se aparta **al crear el pedido**; confirmar el pago ya no lo toca (el antiguo trigger `discount_stock_on_payment` lo descontaba por segunda vez y fue eliminado).

---

## RLS — Estrategia de seguridad

| Tabla | Política |
|---|---|
| `profiles` | SELECT/UPDATE solo por el propio usuario. Admin via service role. |
| `products` | SELECT público. INSERT/UPDATE/DELETE solo admin (service role). |
| `product_shades` | SELECT público. Mutaciones solo admin. |
| `orders` | SELECT por `customer_email = auth.email()`. INSERT con `user_id IS NULL OR user_id = auth.uid()`. |
| `order_items` | INSERT solo si el `order_id` padre pertenece al usuario o es invitado. |
| `email_notifications` | INSERT solo si `private.is_admin()` es `true`. |
| `store_config` | SELECT público. UPDATE solo admin. |

> **Nota:** Las Server Actions del admin usan `createAdminClient()` (service role key), por lo que el RLS no se evalúa en esas operaciones. El RLS protege acceso directo vía PostgREST o desde el cliente anon/authenticated.

El proxy (`src/proxy.ts`) verifica `role === 'admin'` antes de dar acceso a `/admin`.
