import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Imagen que se ve al compartir un link de la tienda (WhatsApp, Instagram,
// Facebook, X). Mismos colores y fuente que el panel de /login.
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_ALT = 'Vèloire — Maquillaje hecho para ti, pensado en Pasto'

const PINK = '#D4537E'
const NUDE = '#f5e1d3'

export async function renderBrandImage() {
  const dreamAvenue = await readFile(join(process.cwd(), 'public/fonts/dream-avenue.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: PINK,
          position: 'relative',
          fontFamily: 'Dream Avenue',
          color: NUDE,
        }}
      >
        <div style={{ position: 'absolute', top: -160, left: -160, width: 520, height: 520, borderRadius: '50%', background: NUDE, opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: -140, right: -120, width: 420, height: 420, borderRadius: '50%', background: NUDE, opacity: 0.75 }} />
        <div style={{ position: 'absolute', bottom: 60, left: 170, width: 130, height: 130, borderRadius: '50%', background: NUDE, opacity: 0.5 }} />

        <div style={{ fontSize: 168, letterSpacing: 6, lineHeight: 1 }}>VÈLOIRE</div>
        <div style={{ marginTop: 36, fontSize: 30, letterSpacing: 10, opacity: 0.9 }}>
          MAQUILLAJE · PASTO, NARIÑO
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: 'Dream Avenue', data: dreamAvenue, style: 'normal', weight: 400 }],
    }
  )
}
