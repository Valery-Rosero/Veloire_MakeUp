// Dominio de producción — configurar NEXT_PUBLIC_SITE_URL cuando haya un
// dominio final. Sin esa variable, cae a localhost (dev) para no romper nada.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
