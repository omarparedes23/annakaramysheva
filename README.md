# Anna Karamysheva — dress & design

Sitio editorial de moda de lujo para la diseñadora Anna Karamysheva (Voronezh, Rusia), con panel de administración para gestionar productos, colecciones y consultas.

> «Любимая. Счастливая. Особенная.» — Amada. Feliz. Especial.

Documentación completa (arquitectura, base de datos, decisiones de diseño): ver [`CLAUDE.md`](./CLAUDE.md).

## Stack

Nuxt 3 · Vue 3 (Composition API) · TypeScript · TailwindCSS · Supabase (PostgreSQL + Auth) · Cloudflare R2 (media) · @nuxtjs/i18n (ru/en)

## Requisitos

- Node.js ≥ 18
- Proyecto de Supabase (schema en `supabase/schema.sql`)
- Bucket de Cloudflare R2 (público) para imágenes y videos

## Setup

```bash
npm install
```

Crear `.env` en la raíz con:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-public-key

R2_ACCOUNT_ID=tu-account-id
R2_ACCESS_KEY_ID=tu-access-key
R2_SECRET_ACCESS_KEY=tu-secret-key
R2_BUCKET_NAME=annakaramysheva
R2_PUBLIC_URL=https://tu-bucket-publico.r2.dev

SITE_URL=https://annakaramysheva.com
```

`SUPABASE_KEY` debe ser la clave **anon/pública**; las credenciales de R2 solo se usan server-side (`server/api/upload.*`) y nunca llegan al browser.

## Scripts

```bash
npm run dev        # desarrollo local
npm run build       # build de producción
npm run generate    # generación estática
npm run preview     # preview del build
```

## Estructura

Ver la sección [3. Estructura del proyecto](./CLAUDE.md#3-estructura-del-proyecto) en `CLAUDE.md` para el detalle completo de carpetas, composables, páginas y panel admin.
