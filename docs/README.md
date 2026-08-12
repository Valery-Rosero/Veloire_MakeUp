# Documentación — Vèloire MakeUp

Índice de documentos técnicos del proyecto.

---

| Documento | Descripción |
|---|---|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Estructura del proyecto, patrones de código, flujo de auth, API routes |
| [DISEÑO.md](./DISEÑO.md) | Sistema de diseño, tokens de color, tipografía, animaciones |
| [BASE-DE-DATOS.md](./BASE-DE-DATOS.md) | Tablas, columnas, vistas, RLS, enum de estados |
| [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) | Todo lo que está construido — tienda, auth, admin, API |
| [PENDIENTE.md](./PENDIENTE.md) | Lo que falta: bugs, features, deuda técnica |

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Levantar servidor de desarrollo (requiere Node ≥ 20.9)
npm run dev
# → http://localhost:3000
```

Variables de entorno necesarias (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```
