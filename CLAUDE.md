# CLAUDE.md — Anna Karamysheva dress & design

Documentación completa del proyecto: arquitectura, decisiones de diseño y guía de desarrollo.

---

## Índice

1. [Visión general del proyecto](#1-visión-general-del-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Base de datos — Supabase](#4-base-de-datos--supabase)
5. [Autenticación y seguridad](#5-autenticación-y-seguridad)
6. [Sistema de diseño](#6-sistema-de-diseño)
7. [Internacionalización (i18n)](#7-internacionalización-i18n)
8. [Composables — lógica compartida](#8-composables--lógica-compartida)
9. [Páginas públicas](#9-páginas-públicas)
10. [Panel de administración](#10-panel-de-administración)
11. [Subida de imágenes](#11-subida-de-imágenes)
12. [SEO y metadatos](#12-seo-y-metadatos)
13. [Configuración del entorno](#13-configuración-del-entorno)
14. [Flujo de trabajo recomendado](#14-flujo-de-trabajo-recomendado)

---

## 1. Visión general del proyecto

Plataforma profesional de moda de lujo para la marca **Anna Karamysheva dress & design**, diseñadora de Voronezh, Rusia.

**Filosofía de marca:** «Любимая. Счастливая. Особенная.» — Amada. Feliz. Especial.

**Inspiración de diseño:** Jacquemus, The Row, Toteme.

El proyecto consta de dos partes:

| Parte | Descripción | Rutas |
|---|---|---|
| **Sitio público** | Editorial de lujo para clientes | `/`, `/gallery`, `/products/[slug]`, `/collections/[slug]`, `/contact` |
| **Panel admin** | CRUD completo para la diseñadora | `/admin/*` |

---

## 2. Stack tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | Nuxt 3 | ^3.13 |
| UI | Vue 3 + Composition API | ^3.5 |
| Lenguaje | TypeScript (strict) | ^5.6 |
| Estilos | TailwindCSS | ^3.4 |
| Backend / DB | Supabase (PostgreSQL) | ^2.45 |
| Storage | Supabase Storage (bucket: `products`) | — |
| Auth | Supabase Auth (admin only) | — |
| i18n | @nuxtjs/i18n | ^8.5 |
| Imágenes | @nuxt/image | ^1.8 |
| Tipografía | Cormorant Garamond (serif) + Inter (sans) | Google Fonts |

---

## 3. Estructura del proyecto

```
anna-karamysheva/
│
├── assets/
│   └── css/
│       └── main.css              # Sistema de diseño completo (Tailwind layers)
│
├── components/
│   ├── admin/
│   │   └── ProductForm.vue       # Formulario reutilizable (crear + editar)
│   ├── collections/
│   │   └── CollectionCard.vue    # Tarjeta de colección
│   ├── layout/
│   │   ├── AppHeader.vue         # Navegación global (transparente en hero)
│   │   └── AppFooter.vue         # Footer editorial oscuro
│   ├── products/
│   │   ├── ProductCard.vue       # Tarjeta de producto con hover
│   │   └── ProductGallery.vue    # Galería con lightbox
│   └── ui/
│       ├── AppButton.vue         # Botón con variantes (primary, ghost, ghost-bone, text)
│       └── AppModal.vue          # Modal accesible con Teleport
│
├── composables/
│   ├── useAuth.ts                # Login, logout, usuario actual
│   ├── useCollections.ts         # CRUD colecciones + localize()
│   ├── useProducts.ts            # CRUD productos + upload de imágenes + localize()
│   └── useSeo.ts                 # Meta tags dinámicos + OpenGraph
│
├── layouts/
│   ├── default.vue               # Layout público: Header + slot + Footer
│   └── admin.vue                 # Layout admin: sidebar fijo + topbar
│
├── locales/
│   ├── en.json                   # Traducciones en inglés
│   └── ru.json                   # Traducciones en ruso (idioma por defecto)
│
├── middleware/
│   └── admin-auth.ts             # Guard: redirige a /admin/login si no autenticado
│
├── pages/
│   ├── index.vue                 # Home: hero, productos destacados, editorial
│   ├── gallery.vue               # Galería filtrable por colección
│   ├── contact.vue               # Formulario de contacto → tabla inquiries
│   ├── products/
│   │   └── [slug].vue            # Detalle de producto con galería + lightbox
│   ├── collections/
│   │   └── [slug].vue            # Colección con hero + grid de productos
│   └── admin/
│       ├── login.vue             # Login con Supabase Auth
│       ├── dashboard.vue         # Estadísticas + resumen reciente
│       ├── products/
│       │   ├── index.vue         # Lista de productos con filtros y delete
│       │   ├── new.vue           # Crear producto
│       │   └── edit/[id].vue     # Editar producto
│       ├── collections/
│       │   └── index.vue         # CRUD de colecciones via modal
│       └── inquiries/
│           └── index.vue         # Bandeja de entrada + archivar + responder
│
├── providers/
│   └── supabase.ts               # Proveedor de imágenes para @nuxt/image
│
├── supabase/
│   └── schema.sql                # Schema PostgreSQL completo con RLS
│
├── types/
│   ├── collection.ts             # Tipos: Collection, CollectionWithProducts
│   └── product.ts                # Tipos: Product, ProductImage, Inquiry, etc.
│
├── .env.example                  # Variables de entorno necesarias
├── app.vue                       # Entrada: <NuxtLayout> + <NuxtPage>
├── i18n.config.ts                # Configuración vue-i18n
├── nuxt.config.ts                # Configuración central de Nuxt
├── package.json                  # Dependencias
└── tailwind.config.ts            # Paleta, tipografía y extensiones del tema
```

---

## 4. Base de datos — Supabase

### Tablas

#### `collections`
Agrupa productos por colección temática o temporal.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Generado automáticamente |
| `title` | JSONB | `{ "en": "...", "ru": "..." }` |
| `description` | JSONB | `{ "en": "...", "ru": "..." }` |
| `slug` | TEXT UNIQUE | URL amigable (ej: `spring-silence`) |
| `year` | INT | Año de la colección |
| `created_at` | TIMESTAMP | Automático |

#### `products`
Cada pieza de vestimenta individual.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Generado automáticamente |
| `title` | JSONB | `{ "en": "...", "ru": "..." }` |
| `description` | JSONB | `{ "en": "...", "ru": "..." }` |
| `slug` | TEXT UNIQUE | URL amigable |
| `price` | DECIMAL(10,2) | Precio en rublos |
| `status` | TEXT | `draft` / `published` / `sold_out` |
| `external_link` | TEXT | URL para botón "Consultar disponibilidad" (WhatsApp, Telegram, etc.) |
| `collection_id` | UUID FK | Referencia a `collections.id` |
| `created_at` | TIMESTAMP | Automático |

#### `product_images`
Imágenes asociadas a un producto, ordenadas por posición.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | — |
| `product_id` | UUID FK | Cascade delete desde `products` |
| `image_url` | TEXT | URL pública de Supabase Storage |
| `position` | INT | Orden de visualización (0 = portada) |

#### `inquiries`
Mensajes de contacto enviados desde el formulario público.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | — |
| `name` | TEXT | Nombre del remitente |
| `email` | TEXT | Email del remitente |
| `message` | TEXT | Contenido del mensaje |
| `status` | TEXT | `new` / `archived` |
| `created_at` | TIMESTAMP | Automático |

### JSONB para campos multilingüe

Los campos `title` y `description` utilizan JSONB para almacenar traducciones en una sola columna:

```json
{
  "en": "Alpaca knitted dress",
  "ru": "Платье из альпаки"
}
```

El helper `localize()` en cada composable extrae el valor según el locale activo:

```typescript
const localize = (field: { en?: string; ru?: string } | null): string => {
  if (!field) return ''
  const lang = locale.value as 'en' | 'ru'
  return field[lang] || field.en || field.ru || ''
}
```

---

## 5. Autenticación y seguridad

### Flujo de autenticación

1. La diseñadora accede a `/admin/login`
2. Introduce email + contraseña (Supabase Auth)
3. `useAuth.login()` llama a `supabase.auth.signInWithPassword()`
4. El middleware `admin-auth.ts` protege todas las rutas `/admin/*`
5. `useSupabaseUser()` es reactivo: si el token expira, el guard redirige automáticamente

### Middleware

```typescript
// middleware/admin-auth.ts
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
```

Se aplica en cada página admin con:
```typescript
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
```

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

| Acción | Público (anon) | Autenticado (admin) |
|---|---|---|
| SELECT productos | Solo `published` / `sold_out` | Todos (incluso `draft`) |
| SELECT colecciones | Sí | Sí |
| SELECT imágenes | Sí | Sí |
| INSERT / UPDATE / DELETE | No | Sí |
| INSERT inquiries | Sí (formulario público) | Sí |
| SELECT inquiries | No | Sí |

### Storage RLS

El bucket `products` es **público para lectura**. Solo usuarios autenticados pueden subir, actualizar o eliminar archivos.

---

## 6. Sistema de diseño

### Paleta de colores

| Token | Valor hex | Uso |
|---|---|---|
| `bone-200` | `#F5F0EB` | Fondos de sección alternativa |
| `bone-50` | `#FDFCFB` | Fondo de páginas admin |
| `white` | `#FFFFFF` | Fondo principal |
| `jet-900` | `#0A0A0A` | Negro principal, textos |
| `jet-700` | `#141414` | Hover de botones |

### Tipografía

- **Serif (Cormorant Garamond):** títulos, citas, elementos editoriales. Peso: 300 (light).
- **Sans (Inter):** navegación, labels, botones, cuerpo de texto. Peso: 300–400.

### Clases de componentes (Tailwind `@layer components`)

```css
.btn-primary      /* Fondo negro, texto blanco */
.btn-ghost        /* Borde negro, hover negro */
.btn-ghost-bone   /* Borde bone, para uso sobre fondos oscuros */
.form-input       /* Input sin borde lateral, solo línea inferior */
.admin-input      /* Input con borde rectangular para el admin */
.badge-published  /* Etiqueta negra "Publicado" */
.badge-draft      /* Etiqueta beige "Borrador" */
.badge-sold-out   /* Etiqueta con borde "Vendido" */
.caption          /* Texto pequeño uppercase tracking-widest */
.label            /* Texto muy pequeño uppercase para subtítulos */
.container-editorial  /* max-w-8xl con padding responsivo */
.section          /* Padding vertical generoso (py-24 → py-40) */
```

---

## 7. Internacionalización (i18n)

### Configuración

- **Idioma por defecto:** Ruso (`ru`) — sin prefijo de URL
- **Inglés:** con prefijo `/en/` en la URL
- **Estrategia:** `prefix_except_default`
- **Detección:** cookie `i18n_redirected`, redirige desde la raíz

```
/              → Ruso (default)
/gallery       → Ruso
/en/gallery    → Inglés
```

### Uso en componentes

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <!-- Traducción de string -->
  <p>{{ $t('product.sold_out') }}</p>

  <!-- Enlace localizado -->
  <NuxtLink :to="localePath('/gallery')">Ver galería</NuxtLink>

  <!-- Cambiar idioma -->
  <button @click="setLocale('en')">EN</button>
</template>
```

### Archivos de traducción

- `locales/ru.json` — Ruso (idioma principal)
- `locales/en.json` — Inglés

Estructura de claves:

```
nav.*           Navegación
home.*          Página de inicio
gallery.*       Galería
collection.*    Página de colección
product.*       Página de producto
contact.*       Formulario de contacto
seo.*           Descripciones para meta tags
errors.*        Mensajes de error 404
```

---

## 8. Composables — lógica compartida

### `useProducts()`

```typescript
const {
  localize,              // (field) → string según locale activo
  formatPrice,           // (price) → "₽12 000" formateado en ruso
  fetchPublishedProducts,    // → ProductWithImages[]
  fetchProductsByCollection, // (collectionId) → ProductWithImages[]
  fetchProductBySlug,        // (slug) → ProductWithImages | null
  fetchAllProductsAdmin,     // → todos incluyendo drafts
  fetchProductById,          // (id) → ProductWithImages | null
  createProduct,             // (payload) → Product
  updateProduct,             // (id, payload) → Product
  deleteProduct,             // (id) → void
  uploadImage,               // (file, productId) → publicUrl string
  saveProductImages,         // (productId, urls[], startPos) → ProductImage[]
  deleteProductImage,        // (imageId, imageUrl) → void (DB + Storage)
  reorderImages,             // (images[]) → void
  submitInquiry,             // (payload) → void
  generateSlug,              // (title) → slug string
} = useProducts()
```

### `useCollections()`

```typescript
const {
  localize,
  fetchCollections,           // Públicas
  fetchCollectionBySlug,      // Con productos anidados
  fetchAllCollectionsAdmin,   // Admin
  createCollection,
  updateCollection,
  deleteCollection,
  generateSlug,
} = useCollections()
```

### `useAuth()`

```typescript
const {
  user,             // Ref<User | null> de Supabase
  isAuthenticated,  // ComputedRef<boolean>
  login,            // (email, password) → void
  logout,           // () → void + redirect a /admin/login
} = useAuth()
```

### `useSeo(options)`

```typescript
useSeo({
  title: 'Nombre del producto',          // Se añade "— Anna Karamysheva"
  description: 'Descripción corta',
  image: 'https://...supabase.../foto.jpg',
  imageAlt: 'Vestido azul de alpaca por Anna Karamysheva',
  type: 'product',                       // 'website' | 'article' | 'product'
  noIndex: false,
})
```

Genera automáticamente: `<title>`, `og:title`, `og:description`, `og:image`, `og:image:alt`, `og:url`, `twitter:card`, `canonical`.

---

## 9. Páginas públicas

### `/` — Home

Estructura editorial de una sola página:

1. **Hero a pantalla completa** — imagen del primer producto publicado + tagline
2. **Brand statement** — texto centrado, generoso espacio en blanco
3. **Featured products** — grid 3 columnas, primeros 3 productos
4. **Editorial strip** — fondo negro, filosofía de la marca, citas
5. **Contact teaser** — CTA hacia `/contact`

El header es transparente sobre el hero y se vuelve blanco al hacer scroll (detección con `window.scrollY > 40`).

### `/gallery` — Galería

- Grid de 2 → 4 columnas según breakpoint
- Filtros sticky por colección (botones con estado activo)
- `TransitionGroup` para animación al filtrar
- Carga todos los productos publicados con `fetchPublishedProducts()`

### `/products/[slug]` — Detalle de producto

- **Galería izquierda:** imagen principal + miniaturas + lightbox con teclado
- **Info derecha:** colección, título, precio, estado, descripción, CTA
- **Botón "Consultar disponibilidad"** → abre `product.external_link` en nueva pestaña
- **Accordion** con detalles, cuidados y envío (traducciones en i18n)
- **Productos relacionados** — misma colección, máx. 4

### `/collections/[slug]` — Colección

- Hero con imagen del primer producto de la colección
- Descripción en cursiva
- Grid de todos los productos de la colección

### `/contact` — Contacto

- Formulario → `useProducts().submitInquiry()` → tabla `inquiries` en Supabase
- Estado de éxito con `Transition`
- Info de contacto: ubicación, email, Instagram
- Cita de la filosofía de la marca

---

## 10. Panel de administración

### Layout admin (`layouts/admin.vue`)

- Sidebar fijo de 224px con navegación
- Topbar con título de página dinámico
- Enlace "Ver sitio" en nueva pestaña
- Botón de logout

### Navegación admin

| Ruta | Descripción |
|---|---|
| `/admin/dashboard` | Estadísticas + actividad reciente |
| `/admin/products` | Lista con filtros por estado |
| `/admin/products/new` | Formulario de creación |
| `/admin/products/edit/[id]` | Formulario de edición |
| `/admin/collections` | CRUD via modales |
| `/admin/inquiries` | Bandeja de entrada |

### `ProductForm.vue` — componente central del admin

Usado tanto por `/admin/products/new` como por `/admin/products/edit/[id]`.

**Funcionalidades:**
- Campos bilingüe (RU + EN) para título y descripción
- Generación automática de slug desde el título en inglés
- Subida de imágenes por clic o drag & drop (múltiples)
- Preview instantáneo antes de guardar (en modo crear)
- Subida inmediata en modo editar
- Eliminación de imágenes (DB + Storage)
- Selector de estado: `draft` / `published` / `sold_out`
- Campo de precio en rublos
- Campo `external_link` para el CTA de consulta
- Asignación a colección

**Diferencia create vs edit:**
- `create`: las imágenes se almacenan localmente (blob URLs) y se suben al guardar (cuando ya se tiene el `product.id`)
- `edit`: las imágenes se suben inmediatamente al seleccionarlas

### Dashboard

Muestra 4 métricas en tiempo real:
- Total de izdelija (productos)
- Productos publicados
- Total de colecciones
- Total de consultas recibidas

---

## 11. Subida de imágenes

### Flujo completo

```
1. Usuario selecciona archivo(s)
        ↓
2. Validación: image/jpeg, image/png, image/webp — máx 10MB
        ↓
3. uploadImage(file, productId)
   → nombre: {productId}/{timestamp}-{random}.{ext}
   → supabase.storage.from('products').upload(...)
        ↓
4. getPublicUrl(path) → URL pública
        ↓
5. saveProductImages(productId, [url], position)
   → INSERT en tabla product_images
        ↓
6. La URL se muestra en la galería pública
```

### Eliminación

```typescript
deleteProductImage(imageId, imageUrl)
// 1. DELETE FROM product_images WHERE id = imageId
// 2. Extrae el path de la URL pública
// 3. supabase.storage.from('products').remove([path])
```

### @nuxt/image

Las imágenes se sirven a través del componente `<NuxtImg>`:

```vue
<NuxtImg
  :src="imageUrl"
  :alt="'Vestido de alpaca azul por Anna Karamysheva'"
  :width="1200"
  :height="1600"
  loading="lazy"
  fit="cover"
  format="webp"
/>
```

Genera automáticamente versiones en `avif`, `webp`, `jpg` según el navegador.

---

## 12. SEO y metadatos

### Patrón de alt text

```
"{título del producto} by Anna Karamysheva"
```

Ejemplos:
- `"Blue alpaca knitted dress by Anna Karamysheva"`
- `"Spring Silence collection by Anna Karamysheva 2025"`

### Meta tags generados por `useSeo()`

```html
<title>Vestido de alpaca — Anna Karamysheva</title>
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://...supabase.../imagen.jpg">
<meta property="og:image:alt" content="Vestido de alpaca por Anna Karamysheva">
<meta property="og:url" content="https://annakaramysheva.com/products/vestido-alpaca">
<meta property="og:type" content="product">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://annakaramysheva.com/products/vestido-alpaca">
```

### Páginas admin excluidas de indexación

Las rutas `/admin/*` no están listadas en el sitemap ni indexadas. El middleware redirige inmediatamente si no hay sesión activa.

---

## 13. Configuración del entorno

### Variables requeridas (`.env`)

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-public-key
SITE_URL=https://annakaramysheva.com
```

`SUPABASE_KEY` debe ser la clave **anon/pública**. La clave de servicio nunca va en el frontend.

### Supabase — pasos de configuración

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** → ejecutar `supabase/schema.sql`
3. En **Storage** → verificar que el bucket `products` existe y es público
4. En **Authentication** → crear el usuario admin con email y contraseña
5. Copiar `Project URL` y `anon key` al `.env`

---

## 14. Flujo de trabajo recomendado

### Publicar una nueva pieza

1. Ir a `/admin/collections` → crear la colección si no existe
2. Ir a `/admin/products/new`
3. Rellenar título en RU y EN → el slug se genera automáticamente
4. Subir fotografías (arrastrar o clic)
5. Asignar colección y precio
6. Añadir `external_link` (WhatsApp, Telegram, etc.)
7. Cambiar status a **Publicado**
8. Guardar → la pieza aparece en `/gallery` y en la home

### Gestionar consultas de clientes

1. Ir a `/admin/inquiries`
2. Clic en una consulta para ver el mensaje completo
3. Clic en **Responder** → abre el cliente de correo predeterminado
4. Clic en **Archivar** cuando esté resuelta

### Añadir traducción o cambiar textos UI

- Editar `locales/ru.json` para textos en ruso
- Editar `locales/en.json` para textos en inglés
- Las claves son idénticas en ambos archivos

### Añadir una página nueva

1. Crear `pages/nueva-pagina.vue`
2. Añadir `definePageMeta({ layout: 'default' })` (o `'admin'`)
3. Llamar `useSeo({ title: '...', description: '...' })` al inicio del `<script setup>`
4. Añadir enlace en `locales/ru.json` y `locales/en.json`
5. Añadir al array `navLinks` en `components/layout/AppHeader.vue` si va en la navegación

---

## Decisiones de arquitectura

### Por qué JSONB para campos multilingüe

Alternativas consideradas: tablas de traducción separadas, columnas duplicadas (`title_en`, `title_ru`). Se eligió JSONB porque:
- Una sola query trae todos los idiomas
- El esquema es limpio y extensible (añadir `fr` no requiere migración)
- Supabase indexa JSONB eficientemente

### Por qué `useAsyncData` y no `useFetch`

`useAsyncData` permite cachear por clave y hacer `refresh()` manual, necesario en el admin después de crear/editar/eliminar registros sin recargar la página.

### Por qué el bucket de Storage es público

Las imágenes de productos son contenido público por naturaleza. Un bucket privado requeriría generar URLs firmadas en cada request, añadiendo latencia sin beneficio de seguridad real.

### Por qué el botón "Consultar disponibilidad" usa `external_link`

La diseñadora prefiere manejar las consultas por WhatsApp, Telegram o un formulario externo según el momento. `external_link` es un campo libre que puede apuntar a cualquier servicio sin cambiar el código.
