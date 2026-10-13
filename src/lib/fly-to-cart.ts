// "Puntito que vuela al carrito": al agregar un producto, un punto del color
// del tono sale del botón, hace un pequeño arco y cae en el ícono del carrito
// del header, que rebota al recibirlo.
//
// Vive fuera de React a propósito: el punto se crea en el <body> y lo anima la
// Web Animations API (compositor del navegador), así no se re-renderiza nada
// mientras vuela. El header marca su ícono con `data-cart-icon`.

/** El header escucha este evento para reaparecer si estaba escondido. */
export const SHOW_HEADER_EVENT = 'veloire:show-header'

const DOT_SIZE = 14
const DURATION_MS = 700
const FALLBACK_COLOR = '#ed4a89'

function safeColor(hex: string) {
  // Se mete en un style: solo se acepta un hex válido.
  return /^#[0-9a-f]{3,8}$/i.test(hex) ? hex : FALLBACK_COLOR
}

export function flyToCart(from: DOMRect, color: string) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Hay un ícono en el header móvil y otro en el de desktop: el visible es el
  // que tiene tamaño (el otro está dentro de un contenedor con display:none).
  const icon = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-icon]')).find(
    (el) => el.getBoundingClientRect().width > 0
  )
  if (!icon) return

  // En móvil el header se esconde al bajar: se le pide volver, y el destino se
  // calcula donde va a quedar (arriba del todo), no donde está ahora.
  window.dispatchEvent(new Event(SHOW_HEADER_EVENT))
  const header = icon.closest('header')
  const headerOffset = header ? header.getBoundingClientRect().top : 0
  const to = icon.getBoundingClientRect()

  const startX = from.left + from.width / 2
  const startY = from.top + from.height / 2
  const dx = to.left + to.width / 2 - startX
  const dy = to.top + to.height / 2 - headerOffset - startY

  // Dos capas: la de afuera se mueve en X de forma pareja y la de adentro en Y
  // primero sube un poco y después cae acelerando. Juntas dibujan un arco.
  const outer = document.createElement('div')
  outer.setAttribute('aria-hidden', 'true')
  outer.style.cssText = `position:fixed;left:${startX - DOT_SIZE / 2}px;top:${startY - DOT_SIZE / 2}px;z-index:60;pointer-events:none;`
  const dot = document.createElement('div')
  dot.style.cssText = `width:${DOT_SIZE}px;height:${DOT_SIZE}px;border-radius:9999px;background:${safeColor(color)};box-shadow:0 0 0 2px #fff,0 4px 12px rgba(0,0,0,.25);`
  outer.appendChild(dot)
  document.body.appendChild(outer)

  outer.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], {
    duration: DURATION_MS,
    easing: 'cubic-bezier(.3,0,.7,1)',
    fill: 'forwards',
  })
  const flight = dot.animate(
    [
      { transform: 'translateY(0) scale(.6)', opacity: 1, easing: 'cubic-bezier(.2,.8,.4,1)' },
      { offset: 0.22, transform: 'translateY(-36px) scale(1.15)', opacity: 1, easing: 'cubic-bezier(.55,0,.85,.35)' },
      { offset: 0.9, opacity: 1 },
      { transform: `translateY(${dy}px) scale(.45)`, opacity: 0 },
    ],
    { duration: DURATION_MS, fill: 'forwards' }
  )

  flight.finished
    .then(() => {
      icon.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], {
        duration: 350,
        easing: 'ease-out',
      })
    })
    .catch(() => {})
    .finally(() => outer.remove())
}
