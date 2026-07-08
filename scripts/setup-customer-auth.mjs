/**
 * Aurea Eli — Setup de Autenticación de Clientes
 *
 * 1. Crea la tabla `profiles` (perfil + favoritos, uno por usuario autenticado)
 * 2. Crea la tabla `admin_users` (lista blanca de quién puede entrar al Altar
 *    Administrativo — separada de `profiles` a propósito: ningún cliente puede
 *    escribir en esta tabla desde la app, solo este script con la Service Role Key)
 * 3. Agrega `user_id` a `orders` y reemplaza la política de lectura para que
 *    cada cliente solo vea SUS propias órdenes (antes cualquier autenticado
 *    podía leer las órdenes de todos)
 * 4. Si se pasa un email, le otorga acceso de administrador (idempotente)
 *
 * Uso:
 *   node scripts/setup-customer-auth.mjs                    → solo schema
 *   node scripts/setup-customer-auth.mjs admin@dominio.com   → schema + otorga admin
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

const adminEmail = process.argv[2];

const SCHEMA_SQL = `
-- =============================================
-- TABLA: profiles (perfil + favoritos de cada cliente)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  stress_level TEXT DEFAULT 'medium',
  aroma_preferences TEXT[] DEFAULT '{}',
  skin_type TEXT DEFAULT 'normal',
  completed_rituals TEXT[] DEFAULT '{}',
  favorites TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =============================================
-- TABLA: admin_users (lista blanca de administradores)
-- Sin políticas de INSERT/UPDATE/DELETE para 'authenticated':
-- solo este script (con la Service Role Key) puede otorgar admin.
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_own" ON admin_users;
CREATE POLICY "admin_users_select_own" ON admin_users FOR SELECT USING (auth.uid() = id);

-- =============================================
-- ORDERS: dueño real de cada orden + lectura acotada
-- =============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_select_admin" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Realtime para profiles (para que el admin pueda, a futuro, ver altas en vivo)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Las tablas creadas por conexión directa a Postgres (en vez del dashboard)
-- no aparecen para la API REST hasta avisarle a PostgREST que recargue su
-- caché de esquema — si no, admin_users/profiles devuelven 404.
NOTIFY pgrst, 'reload schema';
`;

const GRANT_ADMIN_SQL = `
INSERT INTO admin_users (id)
SELECT id FROM auth.users WHERE email = $1
ON CONFLICT (id) DO NOTHING;
`;

async function run() {
  console.log('🌿 Aurea Eli — Configurando autenticación de clientes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a PostgreSQL establecida\n');

    await client.query(SCHEMA_SQL);
    console.log('✅ Schema aplicado:');
    console.log('   ✓ profiles — perfil y favoritos por cliente (RLS: solo su propia fila)');
    console.log('   ✓ admin_users — lista blanca de administradores (solo este script escribe)');
    console.log('   ✓ orders.user_id — cada cliente ve solo sus propias órdenes\n');

    if (adminEmail) {
      const res = await client.query(GRANT_ADMIN_SQL, [adminEmail]);
      if (res.rowCount && res.rowCount > 0) {
        console.log(`✅ Acceso de administrador otorgado a: ${adminEmail}`);
      } else {
        const check = await client.query('SELECT 1 FROM auth.users WHERE email = $1', [adminEmail]);
        if (check.rowCount === 0) {
          console.log(`⚠️  No existe ningún usuario con el email "${adminEmail}". Creá la cuenta primero con:`);
          console.log(`   node scripts/setup-admin.mjs ${adminEmail} <contraseña>`);
        } else {
          console.log(`ℹ️  "${adminEmail}" ya tenía acceso de administrador (sin cambios).`);
        }
      }
    } else {
      console.log('ℹ️  No se pasó ningún email — nadie tiene acceso de admin todavía.');
      console.log('   Corré: node scripts/setup-customer-auth.mjs tu-email@dominio.com');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
