-- ============================================================
-- ANNA KARAMYSHEVA — Supabase PostgreSQL Schema + RLS
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  slug        TEXT UNIQUE NOT NULL,
  year        INT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         JSONB NOT NULL DEFAULT '{}',
  description   JSONB NOT NULL DEFAULT '{}',
  slug          TEXT UNIQUE NOT NULL,
  price         DECIMAL(10, 2),
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'sold_out')),
  external_link TEXT,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0
);

-- Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new'
               CHECK (status IN ('new', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_collection_id ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(product_id, position);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE collections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES — Collections
-- ============================================================

-- Public can read published collections (and their products)
CREATE POLICY "Public can read collections"
  ON collections FOR SELECT
  USING (true);

-- Only authenticated users (admin) can insert
CREATE POLICY "Authenticated can insert collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated can update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated can delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- POLICIES — Products
-- ============================================================

-- Public can read published products
CREATE POLICY "Public can read published products"
  ON products FOR SELECT
  USING (status = 'published' OR status = 'sold_out');

-- Authenticated admin sees all products including drafts
CREATE POLICY "Authenticated can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- POLICIES — Product Images
-- ============================================================

CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- POLICIES — Inquiries
-- ============================================================

-- Anyone can insert (submit contact form)
CREATE POLICY "Public can insert inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Only authenticated admin can read inquiries
CREATE POLICY "Authenticated can read inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete inquiries"
  ON inquiries FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Run in Supabase Dashboard > Storage after creating the bucket named "products"
-- Or via SQL editor with storage schema access:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: public read
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Authenticated upload
CREATE POLICY "Authenticated can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Authenticated update/delete
CREATE POLICY "Authenticated can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products');

CREATE POLICY "Authenticated can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');

-- ============================================================
-- SEED DATA (optional example)
-- ============================================================

-- INSERT INTO collections (title, description, slug, year) VALUES
-- (
--   '{"en": "Spring Silence", "ru": "Весенняя Тишина"}',
--   '{"en": "A meditation on quiet mornings and linen.", "ru": "Медитация о тихих утрах и льне."}',
--   'spring-silence',
--   2025
-- );
