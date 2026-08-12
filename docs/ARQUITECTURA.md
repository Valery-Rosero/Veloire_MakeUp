# Arquitectura del sistema — Vèloire MakeUp

## Visión general

Tienda de maquillaje online para Pasto, Nariño. Monorepo Next.js con panel de administración integrado. El mismo repositorio sirve la tienda pública y el panel admin bajo rutas distintas.

---

## Stack principal

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | 16.2.6 |
| Lenguaje | TypeScript | ^5 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS v4 | ^4 |
| Base de datos | Supabase (PostgreSQL) | — |
| Autenticación | Supabase Auth + @supabase/ssr | 0.10.3 |
| Estado cliente | Zustand | ^5 |
| Validación | Zod | ^4 |
| Animaciones | Framer Motion | ^12 |
| Emails | Resend + React Email | ^6 |
| Íconos | Lucide React | ^1.16 |
| Gráficas | Recharts | ^3 |
| Excel | xlsx | ^0.18 |
| Runtime | Node.js | ≥ 20.9.0 |

---

## Estructura de directorios

```
src/
├── app/
│   ├── (store)/          ← Tienda pública (layout con Header + Footer)
│   │   ├── page.tsx          Home
│   │   ├── catalogo/         Catálogo con filtros
│   │   ├── producto/[slug]/  Detalle de producto
│   │   ├── carrito/          Carrito (redirige al drawer)
│   │   ├── checkout/         Formulario de envío
│   │   ├── checkout/pago/    Paso de pago
│   │   ├── pedido/           Confirmación de pedido
│   │   ├── pedido/[num]/     Detalle de un pedido
│   │   └── cuenta/           Perfil de usuario + historial
│   ├── (auth)/           ← Auth (layout centrado sin nav)
│   │   ├── login/
│   │   ├── registro/
│   │   ├── recuperar-contrasena/
│   │   └── nueva-contrasena/
│   ├── admin/            ← Panel privado (sin route group — su propio layout)
│   │   ├── page.tsx          Dashboard con métricas
│   │   ├── pedidos/          Lista y detalle de pedidos
│   │   ├── pedidos/nuevo/    Crear pedido manual
│   │   ├── productos/        CRUD de productos
│   │   ├── productos/pedido-proveedor/  Wizard 4 pasos
│   │   ├── categorias/       CRUD de categorías
│   │   ├── inventario/       Vista de stock
│   │   └── configuracion/    Ajustes de la tienda
│   ├── api/
│   │   ├── orders/route.ts           POST: crear pedido
│   │   ├── orders/[id]/status/       PUT: cambiar estado
│   │   ├── search/route.ts           GET: búsqueda de productos
│   │   └── notifications/route.ts   POST: notificaciones
│   └── layout.tsx        ← Root layout (Inter font, ThemeProvider, anti-FOUC)
├── components/
│   ├── store/            ← Componentes de la tienda
│   ├── admin/            ← Componentes del panel
│   ├── auth/             ← Formularios de auth
│   ├── cuenta/           ← Perfil de usuario
│   └── ui/               ← Primitivos compartidos (Header, Footer, Badge, Input…)
├── lib/
│   ├── supabase/         ← Clientes server.ts y client.ts
│   ├── store/            ← Zustand stores (cart, supplier-order)
│   ├── validations/      ← Schemas Zod (checkout, product, category)
│   ├── email/templates/  ← Plantillas React Email
│   ├── auth-guard.ts
│   ├── catalogo.ts       ← Fetcher del catálogo con filtros
│   ├── excel-parser.ts   ← Parser de Excel para pedido proveedor
│   ├── face-regions.ts   ← Mapeo de categorías a zonas del rostro
│   ├── format.ts         ← Utilidades de formato (precio, fecha, slug)
│   └── rate-limit.ts     ← Rate limiter en memoria (sliding window)
├── hooks/
│   ├── useClickOutside.ts
│   ├── useConfirmAction.ts
│   └── useIsMobile.ts
├── types/
│   ├── database.ts       ← Tipos generados de Supabase
│   ├── product.ts        ← Tipos de producto (manual)
│   ├── orders.ts         ← Tipos de pedidos
│   ├── catalog.ts        ← Tipos del catálogo
│   └── inventory.ts      ← Tipos de inventario
└── proxy.ts              ← Middleware de auth/routing
```

---

## Autenticación y seguridad

### Dos clientes de Supabase

```
createClient()       ← anon key   → valida JWT del usuario desde cookies
createAdminClient()  ← service role → bypasea RLS, solo en el servidor
```

**Regla de oro:** `auth.getUser()` siempre se llama con `createClient()` (anon key). El `createAdminClient()` solo se usa para queries a tablas con RLS estricto donde la anon key no tiene permiso de SELECT.

### Proxy (`src/proxy.ts`)

Actúa como middleware de Next.js. Intercepts todas las rutas excepto assets estáticos. Sus responsabilidades:

1. **Rutas públicas** — deja pasar la request sin tocar cookies. Un error de auth transitorio no limpia la sesión.
2. **Rutas protegidas** (`/admin`, `/cuenta`) — si el token JWT es inválido, limpia cookies `sb-*` y redirige a `/login`.
3. **Ruta `/admin`** — además de validar el JWT, consulta la tabla `profiles` con service role para verificar `role === 'admin'`. Si no, redirige a `/`.
4. **Ruta `/cuenta`** — requiere usuario autenticado. Si no, redirige a `/login?redirectTo=...`.
5. **Login/Registro con sesión activa** — redirige a `/`.

### Sesiones

`@supabase/ssr` v0.10.3 establece `maxAge: 400 * 24 * 60 * 60` (400 días) en las cookies de auth. Las sesiones sobreviven al cierre del navegador por diseño.

### Navegación del admin

`AdminLayoutShell` intercepta el evento `popstate` para evitar que el botón "atrás" del navegador saque al admin del panel. Si detecta que la URL cambió fuera de `/admin`, llama `history.go(1)` en un loop hasta volver a `/admin` y muestra un modal de confirmación para salir.

---

## Patrones de componentes

### Server vs Client

- **Server Components** hacen las queries a Supabase directamente con `await`. No reciben props de estado del cliente.
- **Client Components** (`'use client'`) solo cuando usan: hooks de React, eventos DOM, stores de Zustand, o APIs del navegador.
- El patrón **Shell**: el Server Component fetches los datos y los pasa como props a un Client Component shell que encapsula la lógica de navegación/UI.

### Navegación post-auth

`window.location.replace()` en lugar de `router.push()` para eliminar `/login` del historial del navegador. Esto evita que al presionar "atrás" se vuelva al formulario de login.

---

## API Routes

| Ruta | Método | Descripción |
|---|---|---|
| `/api/orders` | POST | Crea un pedido. Valida Zod, descuenta stock, envía email de confirmación. Rate limit: 5 req/min por IP. |
| `/api/orders/[id]/status` | PUT | Actualiza estado del pedido (solo admin). Puede enviar email si el estado es `shipped`. |
| `/api/search` | GET | Busca productos por nombre. Usado por el `SearchOverlay`. |
| `/api/notifications` | POST | Endpoint de notificaciones (en desarrollo). |

---

## Rate limiting

`src/lib/rate-limit.ts` implementa un sliding window limiter en memoria. Apropiado para un solo servidor (Vercel single-instance o VPS). Para escala multi-instancia, reemplazar con Upstash Redis.

---

## Emails

Tres plantillas en `src/lib/email/templates/`:

| Plantilla | Cuándo se envía |
|---|---|
| `OrderConfirmation.tsx` | Al crear un pedido nuevo |
| `PaymentConfirmed.tsx` | Al confirmar el pago (estado `paid`) |
| `OrderShipped.tsx` | Al marcar como enviado (estado `shipped`) |

Enviados con Resend desde las API routes del servidor.
