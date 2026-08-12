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
| `role` | text | `'admin'` o `'customer'` |
| `created_at` | timestamp | — |

**RLS:** Los usuarios solo pueden leer y editar su propio perfil. El admin puede leer todos (via service role).

---

### `categories`

Categorías de maquillaje. Cada una puede estar asociada a una zona del rostro.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Nombre (ej: "Labios", "Ojos") |
| `slug` | text | URL amigable único |
| `sort_order` | int | Orden de aparición |
| `is_active` | bool | Visible en la tienda |
| `face_region` | text | Zona del rostro para el FaceMap |

---

### `products`

Producto principal (sin variantes de tono).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `category_id` | uuid | FK → `categories.id` |
| `name` | text | Nombre del producto |
| `slug` | text | URL amigable único |
| `description` | text | Descripción larga |
| `price` | numeric | Precio en COP |
| `compare_price` | numeric | Precio tachado (precio anterior) |
| `status` | text | `'active'`, `'inactive'`, `'draft'` |
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
| `stock` | int | Unidades disponibles |
| `is_active` | bool | Disponible para compra |
| `sort_order` | int | Orden de aparición |

---

### `orders`

Pedidos de la tienda.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `order_number` | text | Número legible (ej: `VL-001`) |
| `status` | OrderStatus | Ver enum más abajo |
| `customer_name` | text | — |
| `customer_email` | text | — |
| `customer_phone` | text | — |
| `address` | text | Dirección de entrega |
| `neighborhood` | text | Barrio |
| `city` | text | Ciudad (Pasto) |
| `department` | text | Departamento (Nariño) |
| `notes` | text | Notas adicionales del cliente |
| `payment_method` | text | `'nequi'`, `'bancolombia'`, `'efectivo'` |
| `subtotal` | numeric | Total sin domicilio |
| `delivery_fee` | numeric | Costo de domicilio |
| `total` | numeric | `subtotal + delivery_fee` |
| `payment_confirmed_at` | timestamp | Cuándo se confirmó el pago |
| `created_at` | timestamp | — |

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

### `order_history`

Log de cambios de estado de un pedido.

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
| `log_order_status_change()` | Trigger que inserta en `order_history` al cambiar estado del pedido |
| `generate_order_number()` | Genera números de pedido correlativos (`VL-001`, `VL-002`, …) |
| `discount_stock_on_payment()` | Trigger que descuenta stock cuando el pago es confirmado |
| `fn_auto_deactivate_product()` | Desactiva un producto automáticamente si todo su stock llega a 0 |

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
