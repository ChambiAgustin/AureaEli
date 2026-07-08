/**
 * Aurea Eli — Fix Storage Policies
 * Agrega las políticas RLS de storage.objects que faltaban (sin ellas,
 * ningún upload autenticado funciona y el guardado de productos aborta),
 * crea el bucket de audios de rituales y suma rituals a realtime.
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

const FIX_SQL = `
-- =============================================
-- STORAGE: bucket para audios de rituales
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ritual-audio', 'ritual-audio', true, 10485760, ARRAY['audio/mpeg', 'audio/mp3'])
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE: políticas RLS para product-images
-- (el bucket público solo permite lectura; para subir hace falta INSERT)
-- =============================================
DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "product_images_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "product_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- =============================================
-- STORAGE: políticas RLS para ritual-audio
-- =============================================
DROP POLICY IF EXISTS "ritual_audio_select" ON storage.objects;
DROP POLICY IF EXISTS "ritual_audio_insert" ON storage.objects;
DROP POLICY IF EXISTS "ritual_audio_update" ON storage.objects;
DROP POLICY IF EXISTS "ritual_audio_delete" ON storage.objects;
CREATE POLICY "ritual_audio_select" ON storage.objects FOR SELECT USING (bucket_id = 'ritual-audio');
CREATE POLICY "ritual_audio_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ritual-audio' AND auth.role() = 'authenticated');
CREATE POLICY "ritual_audio_update" ON storage.objects FOR UPDATE USING (bucket_id = 'ritual-audio' AND auth.role() = 'authenticated');
CREATE POLICY "ritual_audio_delete" ON storage.objects FOR DELETE USING (bucket_id = 'ritual-audio' AND auth.role() = 'authenticated');

-- =============================================
-- REALTIME: rituals quedó fuera en create-schema.mjs
-- =============================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE rituals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

async function fixStoragePolicies() {
  console.log('🌿 Aurea Eli — Arreglando políticas de Storage...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a PostgreSQL establecida\n');

    await client.query(FIX_SQL);
    console.log('✅ Políticas aplicadas exitosamente\n');
    console.log('Storage:');
    console.log('  ✓ Bucket "ritual-audio" creado (público, máx 10MB, solo MP3)');
    console.log('  ✓ product-images — lectura pública, escritura autenticados');
    console.log('  ✓ ritual-audio — lectura pública, escritura autenticados');
    console.log('\nRealtime:');
    console.log('  ✓ rituals — escucha activa');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

fixStoragePolicies();
