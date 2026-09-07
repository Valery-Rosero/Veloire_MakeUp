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

---

## 🚧 En construcción

### Comparador de productos

Las clientas van a poder comparar 2-4 productos lado a lado (ingredientes, tipo de piel, acabado, duración, etc.), con campos que varían según la categoría del producto. Los datos de comparación se llenan por Excel, en un importador unificado que **reemplaza** al wizard actual de "pedido a proveedor".

Piezas del diseño (plan completo en `.claude/plans/rustling-cuddling-engelbart.md` de la sesión donde se diseñó):
- `src/lib/comparison-fields.ts` — única fuente de verdad de qué campos tiene cada categoría y sus valores permitidos (fijo en código, no editable desde el admin).
- `products.sku` (autogenerado `{MARCA}-{CATEGORIA}-{NNN}`, editable) y `products.comparison` (jsonb) — nuevas columnas.
- `categories.sku_prefix` — prefijo de 3 letras por categoría para el SKU.
- Excel unificado: una hoja por categoría, con columnas de inventario (Marca, Nombre, Tonos, Cantidad, Precio, Costo unitario) + las de comparación de esa categoría. Dropdowns reales vía `exceljs` (nueva dependencia) + validación estricta al importar.
- El SKU vincula cada fila del Excel a un producto existente (actualiza) o nuevo (crea) — ya no hace falta el matching por nombre.
- Comparador en `/comparar`: permite comparar entre categorías distintas, mostrando solo los campos en común.

Categorías actuales y sus campos específicos de comparación: ver `CATEGORY_FIELDS` en `src/lib/comparison-fields.ts`.

---

## Media prioridad — Mejoras importantes

### Loading states faltantes

Solo `/catalogo` tiene `loading.tsx`. Las siguientes rutas no tienen skeleton ni spinner:
- `/producto/[slug]`
- `/cuenta`
- `/admin/pedidos`
- `/admin/productos`
- `/admin/inventario`

### Rate limiter en memoria — no escala

`src/lib/rate-limit.ts` usa un `Map` en memoria. En Vercel (serverless) cada función corre en una instancia separada, por lo que el límite **no se comparte entre instancias**. Para producción real, reemplazar con **Upstash Redis** + `@upstash/ratelimit`.

### SEO — Structured data

Los productos tienen `meta_title` y `meta_description` pero no tienen Schema.org `Product` markup (JSON-LD). Esto mejora el ranking en Google y permite rich snippets (precio, disponibilidad, valoraciones).

```tsx
// Agregar en /producto/[slug]/page.tsx
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "offers": { "@type": "Offer", "price": product.price, ... }
  })}
</script>
```

### Sitemap y robots.txt

No hay `src/app/sitemap.ts` ni `src/app/robots.ts`. Los bots no saben qué indexar.

### Paginación en `/cuenta`

El historial de pedidos en cuenta muestra máximo 20. Si hay más, no hay forma de ver los anteriores. Agregar paginación simple o scroll infinito.

---

## Baja prioridad — Features adicionales

### Reseñas y valoraciones

No hay sistema de reseñas. Las clientas no pueden dejar feedback sobre los productos. Implicaría una tabla `reviews` nueva en Supabase y un componente de estrellas.

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

### Multi-imagen por tono

`product_shades.image_url` guarda una sola imagen por tono. El formulario de producto permite subirla, pero la galería del producto no muestra la imagen del tono seleccionado (siempre muestra la imagen principal del producto).

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
