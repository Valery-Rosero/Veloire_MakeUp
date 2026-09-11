# Pendiente — Vèloire MakeUp

Lo que falta construir, mejorar o terminar. Organizado por prioridad.

---

## Alta prioridad — Bloqueantes para producción

### ~~Páginas en el footer que no existen~~ ✅ Completado

`/nosotras`, `/contacto` y `/envios` están implementadas.

### ~~`SearchOverlay` — componente construido, no integrado~~ ✅ Completado

Overlay conectado al Header en desktop y mobile. API `/api/search` funcional. El catálogo recibe `?q=` para mostrar resultados con título y conteo.

### ~~Email de cancelación de pedido~~ ✅ Completado

Plantilla `OrderCancelled` creada. Se envía automáticamente cuando el cliente o el admin cancela un pedido desde sus respectivos `actions.ts`.

### ~~Páginas de error personalizadas~~ ✅ Completado

- `src/app/not-found.tsx` — 404 con diseño de Vèloire (font display italic, CTA a catálogo e inicio)
- `src/app/error.tsx` — error boundary con botón "Intentar de nuevo" y enlace a inicio

### ~~Comparador de productos~~ ✅ Completado

Las clientas pueden comparar 2-4 productos lado a lado (ingredientes, tipo de piel, acabado, duración, etc.), con campos que varían según la categoría. Probado y confirmado funcionando en producción (el importador Excel, la generación de SKU, y el comparador en la tienda).

- `src/lib/comparison-fields.ts` — única fuente de verdad de qué campos tiene cada categoría y sus valores permitidos (fijo en código, no editable desde el admin). Ver `CATEGORY_FIELDS` ahí para la lista completa por categoría.
- `products.sku` (autogenerado `{MARCA}-{CATEGORIA}-{NNN}`, editable), `products.comparison` (jsonb), `categories.sku_prefix`.
- Importador unificado en `/admin/productos/importar` (reemplazó al wizard de "pedido a proveedor"): Excel con una hoja por categoría, dropdowns reales vía `exceljs`, plantilla descargable, validación estricta al importar. El SKU vincula cada fila a un producto existente (actualiza) o nuevo (crea).
- Comparador en `/comparar`: permite comparar entre categorías distintas, mostrando solo los campos en común. Botón de agregar/quitar en las tarjetas de `/catalogo`, bandeja flotante, ficha técnica en cada producto.

---

## Media prioridad — Mejoras importantes

### ~~Loading states faltantes~~ ✅ Completado

`loading.tsx` agregado en `/producto/[slug]`, `/cuenta`, `/admin/pedidos`, `/admin/productos` y `/admin/inventario`, cada uno replicando el layout real de su página (mismo grid/columnas) para no generar salto de layout al terminar de cargar.

### ~~Rate limiter en memoria — no escala~~ ✅ Completado

`src/lib/rate-limit.ts` ahora usa la tabla `rate_limit_hits` en Supabase en vez de un `Map` en memoria — el límite se comparte entre todas las instancias serverless. Se evaluó Upstash Redis pero se prefirió reutilizar Supabase (ya está pagado/configurado) en vez de sumar otro servicio externo. Probado en vivo: 5 requests pasan, la 6ª devuelve 429, IPs distintas no se bloquean entre sí.

Nota para el futuro: la tabla no tiene limpieza automática de filas viejas — con el tráfico actual no es un problema, pero si crece mucho conviene un `DELETE` periódico (`created_at` más viejo que unas horas) vía SQL manual o un cron.

### ~~SEO — Structured data~~ ✅ Completado

`/producto/[slug]/page.tsx` ya genera el JSON-LD de `Product` (nombre, descripción, imágenes, oferta con precio/disponibilidad) — se descubrió implementado al revisar este pendiente, este doc estaba desactualizado.

### ~~Sitemap y robots.txt~~ ✅ Completado

`src/app/sitemap.ts` (home, catálogo, nosotras, contacto, envíos, y cada producto activo) y `src/app/robots.ts` (bloquea `/admin`, `/cuenta`, `/checkout`, `/api`, `/pedido`). El dominio sale de `NEXT_PUBLIC_SITE_URL` (`src/lib/site.ts`, cae a `localhost:3000` si no está seteada) — **falta configurar esa variable de entorno con el dominio real cuando exista**. También se agregó `metadataBase` al layout raíz, que faltaba.

### ~~Paginación en `/cuenta`~~ ✅ Completado

10 pedidos por página, mismo patrón de paginación que `/admin/pedidos` y `/admin/productos` (`?page=N`, `range()` + `count: 'exact'`).

---

## Baja prioridad — Features adicionales

### ~~Reseñas y valoraciones~~ ✅ Completado

Solo pueden reseñar quienes compraron el producto (verificado vía RLS contra `orders`/`order_items` con estado `paid`/`preparing`/`shipped`/`delivered`) — probado en vivo: compra real acepta, sin compra la política RLS rechaza el insert. Publicación inmediata, sin moderación. Una reseña por clienta por producto (`unique(product_id, user_id)`, editable). Se muestra solo en `/producto/[slug]` (no en las tarjetas del catálogo). Agrega `aggregateRating` al JSON-LD del producto cuando hay reseñas.

- Tabla `reviews` (RLS: lectura pública, escritura solo compra verificada y dueño de la fila).
- `src/components/store/StarRating.tsx`, `ReviewsSection.tsx`.
- `src/app/(store)/producto/[slug]/actions.ts` — `submitReview()`, `deleteReview()`.

### Cupones y descuentos

No existe sistema de códigos de descuento. Agregar requeriría tabla `coupons` y validación en `POST /api/orders`.

### Wishlist / Lista de deseos

No hay forma de guardar productos favoritos sin agregarlos al carrito.

### Seguimiento de pedido en tiempo real

Actualmente el cliente puede ver el estado del pedido en `/cuenta`. No hay notificaciones en tiempo real cuando el estado cambia. Opciones:
- Email al cliente en cada cambio de estado (ya parcialmente implementado para `paid` y `shipped`)
- Polling desde el cliente con `revalidatePath`
- Supabase Realtime subscriptions

### WhatsApp — automatización

El FAB de WhatsApp abre un chat pre-escrito. No hay integración con la API de WhatsApp Business para:
- Confirmar pedidos automáticamente por WhatsApp
- Notificar cambios de estado por WhatsApp

### Analytics

No hay integración de analytics (Google Analytics, Plausible, Fathom). No se puede medir tráfico, conversiones ni abandono de carrito.

### ISR / SSG para el catálogo

Actualmente `/catalogo` y `/producto/[slug]` son completamente dinámicos (SSR en cada request). Se podrían usar con ISR (`revalidate`) para mejorar el tiempo de carga y reducir queries a Supabase.

### ~~Multi-imagen por tono~~ ✅ Ya funcionaba (doc desactualizado)

Este pendiente estaba mal — `ProductClient.tsx::handleShadeSelect` ya cambia la imagen principal a `shade.image_url` al seleccionar un tono (y también en la carga inicial, vía `firstInStock`). Nunca se había notado porque ningún tono tenía todavía una imagen propia cargada. Probado en vivo asignándole una imagen a un tono: la página sí la muestra correctamente. El aro de "seleccionado" en `ShadeSelector` ya indica el tono activo — no hacía falta que la miniatura de la galería también se resaltara, son dos indicadores distintos y está bien así.

Si en el futuro se quiere ir más allá (varias fotos por tono, no solo una), eso sí sería una feature nueva: tabla `shade_images` + `ImageUploader` múltiple en `ProductForm` — no se hizo, no se pidió esta vez.

---

## Deuda técnica

| Item | Descripción |
|---|---|
| `notifications/route.ts` | Inserta en `email_notifications` con `status: 'pending'` pero nadie lee esa cola. O se elimina la tabla y se deja el envío inline (como ya funciona), o se crea una Supabase Edge Function que procese los `pending`. |
| Tipado de la DB | `src/types/database.ts` requiere regenerarse si el schema cambia. Correr `supabase gen types typescript`. |
| Tokens CSS del admin | El `RevenueChart` usa `--bg-card`, `--border-soft`, `--fg-tertiary`, `--accent-rose` directamente en lugar de las clases Tailwind del sistema. Unificar con `bg-card`, `border-rim`, etc. |
| Test coverage | No hay tests unitarios ni de integración. Priorizar al menos tests de las Server Actions críticas (crear pedido, cambiar estado). |
| RESEND_FROM_EMAIL | Configurar el dominio `veloire.co` en Resend y setear `RESEND_FROM_EMAIL` en producción. Sin esto los emails salen de `noreply@veloire.co` sin dominio verificado y pueden ir a spam. |

---

## Seguridad aplicada (Security Advisor Supabase)

Aplicado en esta sesión:

- Esquema `private` creado; `handle_new_user()` e `is_admin()` movidas allí — ya no están expuestas por PostgREST
- `search_path = pg_catalog, public` fijado en las 6 funciones señaladas por el advisor
- Políticas RLS de `orders`, `order_items` y `email_notifications` reemplazadas por checks reales en vez de `WITH CHECK (true)`
- Email de confirmación de cuenta personalizado con HTML de marca (`docs/supabase-email-confirm-signup.html`)
