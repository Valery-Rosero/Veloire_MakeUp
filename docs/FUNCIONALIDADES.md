# Funcionalidades implementadas — Vèloire MakeUp

Estado: **En desarrollo activo**. El core de la tienda y el panel admin están operativos.

---

## Tienda pública

### Home (`/`)

- Hero con rotación automática de productos nuevos (carrusel con `AnimatePresence`)
- Sección "Explora por zona" con `FaceMap`: mapa interactivo del rostro con fondo `bg-alt`, ilustración 300×450, gradiente radial detrás usando `var(--bg-highlight)` (adapta a dark mode), y tarjetas de zona en grid 2 columnas que al hover también iluminan el rostro
- Grid asimétrico de productos destacados: hero card 2×2 en desktop, grid 2 columnas en móvil
- `ValueBanner`: 4 propuestas de valor (envíos, Nequi, tonos, atención)
- ShadeWall decorativa

### Catálogo (`/catalogo`)

- Grid de productos (2 col móvil / 3 col tablet / 4 col desktop)
- Filtros por categoría (pills clickables)
- Ordenamiento: más reciente, precio asc/desc
- Loading skeleton con `animate-pulse`
- Paginación (`CatalogoPagination`)
- Los productos sin stock activo no se muestran
- Botón de comparar en cada tarjeta (ver [Comparador de productos](#comparador-de-productos))

### Producto (`/producto/[slug]`)

- Galería de imágenes con imagen principal y thumbnails
- Selector de tonos con color swatches y nombre
- Precio + precio de comparación tachado si existe
- Botón "Agregar al carrito" — agrega al store de Zustand
- Descripción del producto
- Ficha técnica con los campos de comparación de su categoría (ver [Comparador de productos](#comparador-de-productos))
- Reseñas y valoración promedio — solo clientas que compraron el producto pueden reseñar (verificado por RLS), publicación inmediata, una reseña por clienta por producto (editable). `aggregateRating` se agrega al JSON-LD cuando hay reseñas
- Sección de productos relacionados (misma categoría)
- Metadata SEO dinámica (`meta_title`, `meta_description` por producto) + JSON-LD `Product` (Schema.org)
- `notFound()` si el slug no existe o el producto está inactivo

### Comparador de productos (`/comparar`)

- Botón de agregar/quitar (ícono de balanza) en las tarjetas del catálogo — hasta 4 productos, guardados en `localStorage` vía Zustand (`src/lib/store/compare.ts`, key `veloire-compare`)
- Bandeja flotante (`CompareTray`) visible con 2+ productos seleccionados, con link a `/comparar`
- Tabla lado a lado en `/comparar` — permite comparar productos de **categorías distintas**, mostrando solo los campos en común
- Los campos por categoría (fijos, no editables desde el admin) viven en `src/lib/comparison-fields.ts` — única fuente de verdad compartida con el formulario de producto, el importador Excel y esta tabla
- Los valores de cada producto se guardan en `products.comparison` (jsonb)

### Carrito

- Drawer lateral deslizable desde la derecha
- Lista de items con imagen, nombre, tono, precio y cantidad
- Controles de cantidad (+ / -)
- Eliminar item individual
- Subtotal + costo de domicilio + total
- CTA a checkout (requiere sesión — si no hay sesión, va a login)
- Persiste en `localStorage` (clave `veloire-cart`) via Zustand `persist`

### Checkout (`/checkout`)

- **Requiere sesión activa** — redirige a `/login?redirectTo=/checkout` si no
- Paso 1: Formulario de datos de envío (nombre, email, teléfono, dirección, barrio, notas)
  - Pre-llenado con datos del perfil del usuario
  - Validación en tiempo real con Zod
- Paso 2: Instrucciones de pago
  - Métodos: Nequi, Bancolombia, Efectivo
  - Número de Nequi/cuenta con botón CopyButton
  - Botón "Ya realicé el pago" que llama a `POST /api/orders`
- Al crear el pedido: descuenta stock en `product_shades`, envía email de confirmación, limpia el carrito

### Confirmación de pedido (`/pedido` y `/pedido/[orderNumber]`)

- Animación de check al llegar
- Número de pedido, resumen de items, total
- Instrucciones del próximo paso
- Link a historial de pedidos en `/cuenta`
- El cliente puede cancelar si el estado es `pending_payment` — al cancelar se envía email `OrderCancelled` automáticamente

### Sobre nosotras (`/nosotras`)

- Historia de la fundadora Valery "Lery" Rosero
- Mensaje creativo centrado en Pasto y en el maquillaje como expresión
- 3 tarjetas de valores: Hecho con amor, Para quien crea, Orgullo pastuso
- Firma con nombre, título y enlace a Instagram personal `@leery.me`
- CTA a catálogo y contacto

### Contacto (`/contacto`)

- Fetcha `whatsapp_number` e `instagram_url` de `store_config` con fallback a valores de producción
- 4 tarjetas: WhatsApp (canal principal), Email (`veloirev.f@gmail.com`), Instagram (`@veloire.v`), Horarios
- FAQ con 5 preguntas frecuentes sobre pedidos, tonos, devoluciones y pagos

### Política de envíos (`/envios`)

- Fetcha `delivery_fee` de `store_config` (default 5 000 COP)
- Cobertura: Pasto, Nariño — 1 a 2 días hábiles
- Proceso en 4 pasos: pedido → pago → confirmación → entrega
- Métodos de pago con colores de marca (Nequi, Bancolombia, Efectivo)
- Política de devoluciones (ventana de 24 h, excepción por higiene)

### Páginas de error

- **`src/app/not-found.tsx`**: 404 con diseño Vèloire, font display italic, CTA a catálogo e inicio
- **`src/app/error.tsx`**: error boundary global (`'use client'`), botón "Intentar de nuevo" (`reset()`), enlace a inicio

### Cuenta del usuario (`/cuenta`)

- **Requiere sesión** — protegida por el proxy
- Perfil: nombre completo y teléfono editables
- Historial de los últimos 20 pedidos con badge de estado coloreado
- Cada pedido linkea a su detalle en `/pedido/[orderNumber]`
- Botón de cerrar sesión

---

## Autenticación (`/login`, `/registro`, etc.)

### Login (`/login`)

- Formulario email + contraseña
- Validación de credenciales con Supabase Auth
- Después de login: `window.location.replace()` al admin si `role === 'admin'`, o al `redirectTo` query param, o a `/`
- El historial no guarda `/login` (replace, no push)

### Registro (`/registro`)

- Formulario con nombre completo, email, contraseña
- Indicador de fortaleza de contraseña (`PasswordStrength`)
- Crea usuario en `auth.users` y perfil en `profiles`

### Recuperar contraseña (`/recuperar-contrasena`)

- Envía email de recuperación via Supabase Auth

### Nueva contraseña (`/nueva-contrasena`)

- Formulario para establecer nueva contraseña después del link de recuperación

---

## Panel de administración

Acceso: `role === 'admin'` en `profiles`. Verificado en el proxy y en el layout.

### Dashboard (`/admin`)

- **StatCard** × 4: Ingresos del mes, pedidos activos, productos activos, stock bajo
- **RevenueChart**: Gráfico de área con ingresos de los últimos 30 días (Recharts + tema)
- **DonutChart**: Distribución de pedidos por estado
- **HorizontalBars**: Productos más vendidos
- **StockAlert**: Lista de productos con stock crítico

### Pedidos (`/admin/pedidos`)

- Lista de pedidos con búsqueda en tiempo real (`OrdersSearch`)
- Filtro por estado
- `OrderCard`: vista compacta con número, cliente, estado, total, fecha
- Detalle de pedido (`/admin/pedidos/[id]`):
  - Lista de items con imagen, tono, cantidad, precio
  - Historial de cambios de estado
  - `OrderStatusUpdater`: selector de estado + nota
  - `ConfirmPaymentButton`: confirma pago y envía email
  - `CancelOrderButton` / `DeleteOrderButton`

### Crear pedido manual (`/admin/pedidos/nuevo`)

- `CreateOrderForm`: crear un pedido en nombre de un cliente sin que ellos pasen por el checkout
- Útil para pedidos por WhatsApp

### Productos (`/admin/productos`)

- Lista searchable de productos con estado y stock
- `ToggleProductStatus`: activar/desactivar sin entrar al formulario
- `DeleteProductButton`: eliminar con confirmación
- **Formulario de producto** (`ProductForm`):
  - Nombre, slug (auto-generado), marca, categoría, precio, precio comparación
  - SKU: autogenerado al elegir marca + categoría (`{MARCA}-{CATEGORIA}-{NNN}`), siempre editable
  - Ficha de comparación: campos según la categoría elegida (ver [Comparador de productos](#comparador-de-productos)); no aparece para la categoría "Otros"
  - Estado (`draft`, `active`, `inactive`) y destacado
  - Meta title y meta description
  - `ImageUploader`: subir múltiples imágenes a Supabase Storage, reordenar, marcar principal
  - `ShadeForm`: gestionar tonos (nombre, color hex, stock, imagen, activo)

### Importar productos (`/admin/productos/importar`)

Reemplaza al antiguo wizard de "pedido a proveedor". Sigue siendo un asistente de 4 pasos, pero ahora es una sola herramienta que crea productos nuevos **o** actualiza los existentes, y llena la ficha de comparación de una vez:

1. **Subir Excel**: una hoja por categoría (nombre de hoja = nombre de categoría), con columnas de inventario (SKU, Marca, Nombre, Descripción, Tono/Referencia, Cantidad, Precio, Costo unitario) más las de comparación de esa categoría. Botón para descargar la plantilla (con dropdowns reales generados por `exceljs`) desde `/admin/productos/importar/plantilla`. Si un valor no está en la lista permitida, la importación se bloquea con el error exacto (hoja, fila, columna, valor, valores permitidos) — parser y validación en `src/lib/product-import/`.
2. **Revisar productos**: precio de venta, SKU (editable), ficha de comparación prellenada — la categoría ya viene resuelta de la hoja, no se vuelve a preguntar. Sigue mostrando el calculador de rentabilidad (costo vs. precio) del wizard anterior.
3. **Tonos e imágenes**: igual que antes — imagen principal, color/imagen por tono.
4. **Confirmar**: si la fila traía un SKU que ya existe, **actualiza** ese producto (nunca borra tonos ausentes del lote); si no, **crea** uno nuevo.

Estado del wizard persiste en `useProductImportStore` (Zustand, key `veloire-product-import`).

### Categorías (`/admin/categorias`)

- Lista de categorías con `sort_order`
- CRUD completo: nombre, slug, prefijo de SKU (3 letras, usado para autogenerar el SKU de sus productos), zona del rostro (`face_region`), activa/inactiva
- `CategoryForm` con validación Zod

### Inventario (`/admin/inventario`)

- `InventoryTable`: tabla de todos los tonos de todos los productos con su stock actual
- Visualización de alertas de stock bajo

### Configuración (`/admin/configuracion`)

- `ConfigForm`: editar `store_config` (WhatsApp, Instagram, costo de domicilio)
- Cambios se reflejan inmediatamente en la tienda (no hay caché)

---

## API Routes

### `POST /api/orders`

Crea un pedido. Flujo:
1. Valida body con schema Zod (`checkoutSchema`)
2. Rate limit: 5 requests/min por IP
3. Verifica que el usuario esté autenticado
4. Verifica stock de cada item
5. Inserta `orders` + `order_items`
6. Descuenta stock en `product_shades`
7. Envía `OrderConfirmation` email al cliente
8. Retorna `{ orderId, orderNumber }`

### `PUT /api/orders/[id]/status`

Actualiza estado de un pedido. Solo admin. Si el nuevo estado es `shipped`, envía `OrderShipped` email.

### `GET /api/search`

Búsqueda de productos por nombre. Usado por `SearchOverlay`. Devuelve nombre, slug y precio.

### `POST /api/notifications`

Inserta un registro en `email_notifications` con `status: 'pending'`. Solo accesible para admins. **No envía el email directamente** — es una cola sin consumidor activo. Los emails transaccionales se envían inline desde las Server Actions.

---

## Emails transaccionales

Enviados con **Resend** desde Server Actions. Plantillas en `src/lib/email/templates/` — HTML inline con estilos, sin dependencias externas de CSS.

| Plantilla | Cuándo se envía | Desde |
|---|---|---|
| `OrderConfirmation` | Al crear el pedido | `POST /api/orders` |
| `PaymentConfirmed` | Al confirmar el pago | `POST /api/orders/[id]/status` |
| `OrderShipped` | Al marcar como enviado | `POST /api/orders/[id]/status` |
| `OrderCancelled` | Al cancelar el pedido (cliente o admin) | `pedido/actions.ts` y `admin/pedidos/actions.ts` |

Todas usan `process.env.RESEND_API_KEY`. El `from` se configura con `process.env.RESEND_FROM_EMAIL` (fallback: `Vèloire <noreply@veloire.co>`).

El email de confirmación de cuenta (registro) está personalizado con HTML de marca en `docs/supabase-email-confirm-signup.html` — se pega en Supabase → Authentication → Email Templates.

---

## Footer y redes sociales

El `Footer` siempre muestra:
- **Instagram** `@veloire.v` → `https://www.instagram.com/veloire.v?igsh=eTRjY3N5N3U1NDhi` (o el valor de `store_config.instagram_url`)
- **Email** `veloirev.f@gmail.com`
- **WhatsApp** (si `store_config.whatsapp_number` está configurado)

---

## Hooks custom

| Hook | Descripción |
|---|---|
| `useClickOutside` | Cierra un elemento al hacer click fuera |
| `useConfirmAction` | Maneja el estado de confirmación de acciones destructivas |
| `useIsMobile` | Detecta si el viewport es móvil (< 1024px) |

---

## Utilidades (`src/lib/`)

| Archivo | Descripción |
|---|---|
| `format.ts` | `formatPrice` (COP), `formatDate` (re-exporta `slugify` de `slug.ts`) |
| `slug.ts` | `slugify` y `uniqueSlug` (colisiones), compartido por productos/categorías |
| `sku.ts` | `abbreviateBrand` y `nextSkuForBrandCategory` — genera el SKU de un producto |
| `comparison-fields.ts` | Campos de comparación fijos por categoría — única fuente de verdad (ver [Comparador de productos](#comparador-de-productos)) |
| `catalogo.ts` | Fetcher del catálogo con filtros y paginación |
| `face-regions.ts` | Mapeo de `face_region` a coordenadas del FaceMap |
| `product-import/` | Parser, validación y generación de plantilla (`exceljs`) del importador de productos |
| `auth-guard.ts` | Helper para verificar auth en Server Actions |
| `rate-limit.ts` | Sliding window limiter en memoria |
