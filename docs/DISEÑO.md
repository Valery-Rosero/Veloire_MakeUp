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

### Piezas base

- **`MotionProvider`** (`src/components/ui/MotionProvider.tsx`, montado en el layout raíz): `MotionConfig reducedMotion="user"`. Si la persona activó "reducir movimiento", framer salta desplazamientos y escalas en **toda** la app y deja solo los fundidos. Los efectos atados al scroll (parallax del hero) no pasan por acá y revisan `useReducedMotion()` a mano.
- **`Reveal` / `RevealGroup` / `RevealItem`** (`src/components/ui/Reveal.tsx`): "aparecer al hacer scroll" con el mismo ritmo en toda la tienda. Variantes `up`, `fade`, `slideX`, `pop`, `growY`, `growX`, `curtain`. Se usan desde Server Components. Se disparan una sola vez, cuando el elemento ya entró ~12 % en pantalla.
- **`SectionHeading`** (`src/components/ui/SectionHeading.tsx`): título con la barrita rosa. La barrita crece de abajo hacia arriba y el título se desliza al lado. Es la firma visual: usarlo en cada título de sección nuevo.
- Reglas: animar solo `opacity`/`transform` (y `clip-path` en `curtain`). Nada de `width`/`height`/`top`. Nada de animación en checkout, pago, formularios, páginas legales ni admin. Probar siempre con `npm run build && npm start`, porque en `dev` se ven tirones que en producción no existen.

### Dónde está cada una

| Componente | Animación |
|---|---|
| `HeroSection` | El título entra línea por línea desde un recorte (`MaskLine`) y la rayita rosa se dibuja. Al hacer scroll, la imagen baja más lento y el texto sube y se desvanece (parallax). |
| `ProductSpotlight` | Slide horizontal entre productos. Se pausa con hover o foco, con la pestaña oculta y con "reducir movimiento". |
| `FaceMap` | La cara aparece con un fundido y escala. Después cada zona con productos destella una vez, de arriba hacia abajo, como pista de que se puede tocar. Los botones de zona entran escalonados. |
| Destacados (home) | La tarjeta grande se descubre como una cortina que sube (`curtain`) y sus tonos aparecen uno por uno (`pop`). |
| Franja de beneficios (home) | Ítems escalonados, el ícono hace `pop` y los divisores se dibujan (`growY`). |
| `ProductCard` | Fade + subida al entrar, escalonado por fila (`index % 4`, máx. 0,18 s). |
| Nosotras | El título entra con `MaskLine`. Los títulos de sección hacen crecer su barrita fina. Los párrafos de la historia aparecen uno a uno, la "V" de la firma hace `pop`, las tarjetas de valores entran escalonadas con el ícono en `pop`, y el cierre (CTA) sube escalonado. |
| `CatalogoFilters` | La píldora activa se marca al instante (`useOptimistic` + `startTransition`, sin esperar al servidor) y su fondo negro se desliza a la nueva (`layoutId`). |
| `ProductGrid` | Al filtrar o reordenar, las tarjetas que siguen se deslizan a su nuevo lugar (`layout="position"`, key = id), las que salen se desvanecen y las nuevas aparecen (`AnimatePresence mode="popLayout"`). La pantalla de carga (`loading.tsx`) no aparece al cambiar filtros, así que el reacomodo sí se ve. |
| `ShadeSelector` | El anillo del tono elegido es un solo elemento (`layoutId` único por selector) que se desliza de un tono al otro. |
| "También te puede gustar" (producto) | `SectionHeading` + las tarjetas entran al hacer scroll. |
| `CompareTray` / `CompareModal` | La barra sube desde abajo y se sacude si se pasa del máximo. La ventana sube como hoja en móvil y aparece con escala + fade en desktop. |
| `CartDrawer` | Slide desde la derecha (`x: '100%' → 0`), hoja desde abajo en móvil |
| `AdminLayoutShell` | Drawer móvil slide desde la izquierda |
| Modal de salida admin | Scale + fade |
| `OrderCheckAnimation` | Animación de check al confirmar pedido |
| Overlay del drawer | Fade (`bg-black/50`) |
| Agregar al carrito (`src/lib/fly-to-cart.ts`) | Un punto del color del tono sale del botón, hace un arco y cae en el ícono del carrito (`data-cart-icon`), que rebota. Va fuera de React (Web Animations API), no deja nada en el DOM al terminar y no corre con "reducir movimiento". Si el header está escondido (móvil), le pide volver con el evento `veloire:show-header`. |
| `Header` (móvil) | Se esconde al bajar y vuelve apenas se sube (umbral de 8px, siempre visible en los primeros 80px). No se esconde con el menú o la búsqueda abiertos, y vuelve si se llega con Tab. En desktop no se mueve. |
| Entrada de página (`(store)/template.tsx`) | Fundido de 0,35 s en cada navegación, con CSS puro (`.page-enter` en `globals.css`). **Solo opacity**: un `transform` volvería al contenedor el ancla de los `position: fixed` de la página. Filtrar el catálogo no remonta el template, así que el reacomodo de tarjetas sigue funcionando. |
| 404 (`app/not-found.tsx`) | El título entra con `MaskLine` y los círculos del hero flotan detrás (`.float-y`, CSS puro). Se achican en celular para no tapar el texto. |

Detalles de convivencia en móvil (ficha de producto): el aviso de "añadido" sale arriba, bajo el header, y el botón de WhatsApp sube sobre la barra fija de "Añadir al carrito" (`body:has([data-sticky-cart-bar]) .wa-fab` en `globals.css`).

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
- **Checkout**: 2 pasos — (1) Datos de envío pre-llenados desde el perfil, (2) Instrucciones de pago (Nequi).
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
