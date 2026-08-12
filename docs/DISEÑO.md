# Sistema de diseño — Vèloire MakeUp

## Identidad visual

Marca de maquillaje artesanal de Pasto, Nariño. La estética es **editorial y femenina** sin caer en lo recargado: tipografía de display con serif, paleta rosa-ciruela-negro, espaciado generoso y animaciones sutiles.

---

## Tokens de color

Definidos como variables CSS en `globals.css`. Se redefinen bajo `@media (prefers-color-scheme: dark)` y bajo `:root[data-theme]` para que el toggle manual gane sobre la preferencia del sistema.

### Modo claro

| Token | Valor | Uso |
|---|---|---|
| `--color-fg` | `#1a1a1a` (noir) | Texto principal |
| `--color-fg-2` | (gris cálido medio) | Texto secundario |
| `--color-fg-3` | (gris cálido suave) | Texto terciario / placeholders |
| `--color-bg` / `page` | Blanco o crema | Fondo de página |
| `--color-alt` | Beige/gris muy claro | Fondo alternativo (secciones) |
| `--color-card` | Blanco | Fondo de tarjetas |
| `--color-highlight` | Beige suave | Hover states, fondos activos |
| `--color-accent` | `#8B2252` | Ciruela — color principal de marca |
| `--color-rim` | (gris claro) | Bordes normales |
| `--color-rim-2` | (gris medio) | Bordes en hover |
| `--color-beige` | `#f5e1d3` | Beige marca (botones oscuros) |
| `--color-noir` | `#1a1a1a` | Negro marca (fondos de botón) |
| `--color-rose-medium` | `#a56583` | Rosa medio decorativo |

### Modo oscuro

Los fondos se invierten a tonos oscuros con bias cálido (no gris puro). El accent sube en luminosidad hacia el pink más vivo (`#ed4a89`) para mantener contraste sobre fondos oscuros.

### Colores de estado (semánticos, separados del accent)

| Token | Color | Uso |
|---|---|---|
| `success` | Verde | Pedido entregado, pago confirmado |
| `warning` | Amarillo/naranja | Pago pendiente, stock bajo |
| `error` | Rojo | Cancelado, errores de formulario |

---

## Tipografía

### Fuentes

| Rol | Familia | Cómo se carga |
|---|---|---|
| **Cuerpo** (`font-body`) | Inter | `next/font/google` → self-hosted, variable `--font-inter` |
| **Display** (`font-display`) | Serif display (Playfair-like) | Definida en `globals.css` |

La fuente de display se usa **solo** para nombres de producto, headings de sección, el logotipo y el hero. El cuerpo de texto siempre usa Inter.

### Escala tipográfica usada

| Rol | Tamaño |
|---|---|
| Hero H1 mobile | 52px |
| Hero H1 desktop | 64px |
| Heading de sección | 24–28px |
| Subtítulos de card | 22px |
| Cuerpo / descripción | 14–15px |
| Labels / eyebrows | 10–11px, `tracking-widest`, uppercase |
| Precios | `font-display`, 20–24px |

---

## Modo oscuro

**Estrategia anti-FOUC (Flash of Unstyled Content):**

En `src/app/layout.tsx` hay un script inline en el `<head>` que corre antes de que React hidrate. Lee `localStorage.getItem('theme')` y añade la clase `dark` al `<html>` si corresponde. Esto previene el parpadeo de tema al cargar la página.

```js
// Simplificado:
(function() {
  var t = localStorage.getItem('theme');
  if (t === 'dark' || (!t && matchMedia('prefers-color-scheme: dark').matches)) {
    document.documentElement.classList.add('dark');
  }
})()
```

El toggle vive en `ThemeProvider` (`src/components/ui/ThemeProvider.tsx`) y escribe en `localStorage`. También actualiza `data-theme` en el root para que los tokens CSS respondan.

---

## Animaciones (Framer Motion)

| Componente | Animación |
|---|---|
| `HeroSection` | Fade + slide up al montar (texto y imagen) |
| `ProductSpotlight` | Slide horizontal entre productos (carrusel) |
| `CartDrawer` | Slide desde la derecha (`x: '100%' → 0`) |
| `AdminLayoutShell` | Drawer móvil slide desde la izquierda |
| Modal de salida admin | Scale + fade |
| `OrderCheckAnimation` | Animación de check al confirmar pedido |
| Overlay del drawer | Fade (`bg-black/50`) |

Todas las animaciones respetan `prefers-reduced-motion` (Framer Motion lo hace automáticamente cuando se configura).

---

## Componentes UI primitivos

En `src/components/ui/`:

| Componente | Descripción |
|---|---|
| `Header` | Navbar de la tienda con logo, links, búsqueda e ícono de carrito |
| `Footer` | Footer con navegación, redes sociales, copyright |
| `Badge` | Pill de estado con variantes de color semántico |
| `Button` | Botón base con variantes (primary, secondary, ghost) |
| `Input` | Input field con label, error y estados focus |
| `CopyButton` | Botón que copia texto al clipboard con feedback |
| `ThemeProvider` | Contexto de tema + hook `useTheme()` |
| `WhatsAppFAB` | Botón flotante de WhatsApp (fixed, bottom-right) |

---

## Layout y contenedores

| Ancho | Uso |
|---|---|
| `max-w-7xl` | Contenedor principal de secciones (home, catálogo) |
| `max-w-5xl` | Secciones medianas (categorías) |
| `max-w-3xl` | Cuenta, checkout |
| `max-w-xl` | Configuración admin |
| `px-4` | Padding horizontal estándar en móvil |

El sistema usa **flexbox y grid con `gap`** para spacing entre elementos — no márgenes individuales.

---

## Páginas de diseño implementado

### Tienda

- **Home**: Hero con imagen rotativa de productos, sección de categorías con `FaceMap` (mapa interactivo del rostro), grid asimétrico de destacados (hero card 2×2 + cards secundarias), `ValueBanner`, `ShadeWall` (pared de tonos como decoración).
- **Catálogo**: Grid de productos con filtros por categoría y ordenamiento. Loading skeleton con `animate-pulse`.
- **Producto**: Galería de imágenes, selector de tonos con color swatch, descripción, productos relacionados.
- **Carrito**: Drawer lateral con lista de items, subtotal, costo de envío y CTA a checkout.
- **Checkout**: 2 pasos — (1) Datos de envío pre-llenados desde el perfil, (2) Instrucciones de pago (Nequi, Bancolombia, efectivo).
- **Cuenta**: Perfil editable (nombre, teléfono), historial de pedidos con badges de estado.

### Admin

- **Dashboard**: Cards de métricas (`StatCard`), gráfico de ingresos de área (`RevenueChart`), gráfico de dona (`DonutChart`), barras horizontales (`HorizontalBars`), alertas de stock bajo.
- **Pedidos**: Lista searchable con `OrdersSearch`, detalle de pedido con `OrderStatusUpdater`, botón de confirmar pago, botón de cancelar/eliminar.
- **Productos**: Lista searchable, toggle de estado activo/inactivo, formulario completo con imágenes y tonos.
- **Inventario**: Tabla de stock (`InventoryTable`).
- **Wizard de proveedor**: 4 pasos — (1) Upload de Excel, (2) Asignar productos, (3) Asignar tonos, (4) Confirmación.

---

## Qué falta en el diseño

Ver [PENDIENTE.md](./PENDIENTE.md) para la lista completa. Resumen de los gaps de diseño:

- Páginas `/nosotras`, `/contacto`, `/envios` enlazadas en el footer pero no creadas
- Página de seguimiento de pedido para el cliente (solo existe la confirmación)
- `SearchOverlay` construido pero no integrado en el Header
- No hay página de error 404 personalizada
- No hay página de error 500 personalizada
- No hay `loading.tsx` en todas las rutas (solo en catálogo)
- Falta diseño de email de cancelación de pedido
