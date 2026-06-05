/**
 * Aurea Eli — Schema Creator
 * Crea todas las tablas en Supabase via conexión directa PostgreSQL
 */
import './env-loader.mjs';
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: process.env.SUPABASE_DB_HOST || 'db.mvsqqvorumqrhlxbtxjq.supabase.co',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const SCHEMA_SQL = `
-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: categories (categorías dinámicas)
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  subcategories TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: products (catálogo completo)
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sensory_description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  promo_price NUMERIC(10,2),
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  subcategory TEXT,
  ingredients TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  aroma TEXT,
  color TEXT,
  material TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at automático en products
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TABLA: content_blocks (CMS de textos)
-- =============================================
CREATE TABLE IF NOT EXISTS content_blocks (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: rituals (rituales guiados)
-- =============================================
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  audio_url TEXT,
  steps TEXT[] DEFAULT '{}',
  product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: orders (órdenes de compra)
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile JSONB,
  items JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'shipped')),
  total NUMERIC(10,2),
  payment_method TEXT,
  address TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: lectura pública, escritura solo autenticados
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Categories: lectura pública, escritura solo autenticados
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;
DROP POLICY IF EXISTS "categories_delete" ON categories;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Content blocks: lectura pública, escritura solo autenticados
DROP POLICY IF EXISTS "content_select" ON content_blocks;
DROP POLICY IF EXISTS "content_insert" ON content_blocks;
DROP POLICY IF EXISTS "content_update" ON content_blocks;
CREATE POLICY "content_select" ON content_blocks FOR SELECT USING (true);
CREATE POLICY "content_insert" ON content_blocks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "content_update" ON content_blocks FOR UPDATE USING (auth.role() = 'authenticated');

-- Rituals: lectura pública, escritura solo autenticados
DROP POLICY IF EXISTS "rituals_select" ON rituals;
DROP POLICY IF EXISTS "rituals_insert" ON rituals;
DROP POLICY IF EXISTS "rituals_update" ON rituals;
DROP POLICY IF EXISTS "rituals_delete" ON rituals;
CREATE POLICY "rituals_select" ON rituals FOR SELECT USING (true);
CREATE POLICY "rituals_insert" ON rituals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "rituals_update" ON rituals FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "rituals_delete" ON rituals FOR DELETE USING (auth.role() = 'authenticated');

-- Orders: lectura solo autenticados, inserción pública
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);

-- =============================================
-- REALTIME (escucha de cambios en vivo)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE content_blocks;

-- =============================================
-- STORAGE: bucket para imágenes
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
`;

async function createSchema() {
  console.log('🌿 Aurea Eli — Creando schema en Supabase...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a PostgreSQL establecida\n');

    await client.query(SCHEMA_SQL);
    console.log('✅ Schema creado exitosamente\n');
    console.log('Tablas creadas:');
    console.log('  ✓ categories');
    console.log('  ✓ products');
    console.log('  ✓ content_blocks');
    console.log('  ✓ rituals');
    console.log('  ✓ orders');
    console.log('\nSeguridad:');
    console.log('  ✓ RLS habilitado en todas las tablas');
    console.log('  ✓ Políticas configuradas');
    console.log('\nRealtime:');
    console.log('  ✓ products — escucha activa');
    console.log('  ✓ categories — escucha activa');
    console.log('  ✓ content_blocks — escucha activa');
    console.log('\nStorage:');
    console.log('  ✓ Bucket "product-images" creado (público)');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

createSchema();
