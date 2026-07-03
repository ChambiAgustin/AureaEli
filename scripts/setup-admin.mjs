/**
 * Aurea Eli — Setup de Administrador
 *
 * 1. Crea (o actualiza) el usuario administrador en Supabase Auth
 * 2. Asegura que el bucket `product-images` exista y sea público
 * 3. Crea las políticas RLS de Storage (lectura pública, escritura autenticada)
 *
 * Uso:
 *   node scripts/setup-admin.mjs <email> <password>   → todo (usuario + bucket + políticas)
 *   node scripts/setup-admin.mjs                      → solo bucket + políticas de Storage
 */
import './env-loader.mjs';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mvsqqvorumqrhlxbtxjq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const [email, password] = process.argv.slice(2);

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY en el .env');
  process.exit(1);
}
if (email && (!password || password.length < 8)) {
  console.error('❌ La contraseña es obligatoria y debe tener al menos 8 caracteres');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureAdminUser() {
  console.log(`\n👤 Creando usuario admin: ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (/already.*(registered|exists)/i.test(error.message)) {
      console.log('   ℹ️  El usuario ya existe — actualizando contraseña...');
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw new Error(`listUsers: ${listErr.message}`);
      const existing = list.users.find((u) => u.email === email);
      if (!existing) throw new Error('Usuario existente no encontrado en listUsers');
      const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      if (updErr) throw new Error(`updateUser: ${updErr.message}`);
      console.log('   ✓ Contraseña actualizada');
      return;
    }
    throw new Error(`createUser: ${error.message}`);
  }
  console.log(`   ✓ Usuario creado (id: ${data.user.id})`);
}

async function ensureBucket() {
  console.log('\n🪣 Verificando bucket product-images...');
  const { data: bucket } = await supabase.storage.getBucket('product-images');

  if (!bucket) {
    const { error } = await supabase.storage.createBucket('product-images', { public: true });
    if (error) throw new Error(`createBucket: ${error.message}`);
    console.log('   ✓ Bucket creado (público)');
  } else if (!bucket.public) {
    const { error } = await supabase.storage.updateBucket('product-images', { public: true });
    if (error) throw new Error(`updateBucket: ${error.message}`);
    console.log('   ✓ Bucket marcado como público');
  } else {
    console.log('   ✓ Bucket ya existe y es público');
  }
}

const STORAGE_POLICIES_SQL = `
DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;

CREATE POLICY "product_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "product_images_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "product_images_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
`;

async function ensureStoragePolicies() {
  console.log('\n🔐 Creando políticas RLS de Storage...');
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST || 'db.mvsqqvorumqrhlxbtxjq.supabase.co',
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    user: process.env.SUPABASE_DB_USER || 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(STORAGE_POLICIES_SQL);
    console.log('   ✓ Políticas de Storage creadas');
  } catch (err) {
    console.error(`   ⚠️  No se pudieron crear vía SQL directo: ${err.message}`);
    console.error('   👉 Ejecutá este SQL manualmente en el SQL Editor del dashboard de Supabase:');
    console.error(STORAGE_POLICIES_SQL);
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  console.log('🌿 Aurea Eli — Setup de Administrador');
  if (email) {
    await ensureAdminUser();
  } else {
    console.log('\n👤 Sin email/password — se omite la creación de usuario admin');
  }
  await ensureBucket();
  await ensureStoragePolicies();
  console.log('\n✅ Setup completo. Recordá desactivar los registros públicos en:');
  console.log('   Dashboard Supabase → Authentication → Sign In / Up → "Allow new users to sign up" → OFF\n');
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
