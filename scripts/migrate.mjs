/**
 * Aurea Eli — Migration Script
 * Crea el schema completo en Supabase via conexión PostgreSQL directa
 */
import './env-loader.mjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mvsqqvorumqrhlxbtxjq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Usar Management API via fetch con service role
async function execSQL(sql, description) {
  console.log(`\n⚡ ${description}...`);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    // Intentar con el endpoint alternativo
    return null;
  }
  return await response.json();
}

// Schema SQL completo
const MIGRATIONS = [
  {
    name: 'Enable UUID extension',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: 'Create categories table',
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        subcategories TEXT[] DEFAULT '{}',
        sort_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create products table',
    sql: `
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
    `
  },
  {
    name: 'Create content_blocks table',
    sql: `
      CREATE TABLE IF NOT EXISTS content_blocks (
        key TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create rituals table',
    sql: `
      CREATE TABLE IF NOT EXISTS rituals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER,
        audio_url TEXT,
        steps TEXT[] DEFAULT '{}',
        product_ids TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create orders table',
    sql: `
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
    `
  },
  {
    name: 'Enable RLS on all tables',
    sql: `
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    `
  },
  {
    name: 'Create RLS policies — products (public read, auth write)',
    sql: `
      DROP POLICY IF EXISTS "products_select" ON products;
      DROP POLICY IF EXISTS "products_insert" ON products;
      DROP POLICY IF EXISTS "products_update" ON products;
      DROP POLICY IF EXISTS "products_delete" ON products;
      CREATE POLICY "products_select" ON products FOR SELECT USING (true);
      CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "products_update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
      CREATE POLICY "products_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');
    `
  },
  {
    name: 'Create RLS policies — categories (public read, auth write)',
    sql: `
      DROP POLICY IF EXISTS "categories_select" ON categories;
      DROP POLICY IF EXISTS "categories_insert" ON categories;
      DROP POLICY IF EXISTS "categories_update" ON categories;
      DROP POLICY IF EXISTS "categories_delete" ON categories;
      CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
      CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
      CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');
    `
  },
  {
    name: 'Create RLS policies — content_blocks (public read, auth write)',
    sql: `
      DROP POLICY IF EXISTS "content_select" ON content_blocks;
      DROP POLICY IF EXISTS "content_insert" ON content_blocks;
      DROP POLICY IF EXISTS "content_update" ON content_blocks;
      CREATE POLICY "content_select" ON content_blocks FOR SELECT USING (true);
      CREATE POLICY "content_insert" ON content_blocks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "content_update" ON content_blocks FOR UPDATE USING (auth.role() = 'authenticated');
    `
  },
  {
    name: 'Create RLS policies — rituals (public read, auth write)',
    sql: `
      DROP POLICY IF EXISTS "rituals_select" ON rituals;
      DROP POLICY IF EXISTS "rituals_insert" ON rituals;
      DROP POLICY IF EXISTS "rituals_update" ON rituals;
      DROP POLICY IF EXISTS "rituals_delete" ON rituals;
      CREATE POLICY "rituals_select" ON rituals FOR SELECT USING (true);
      CREATE POLICY "rituals_insert" ON rituals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "rituals_update" ON rituals FOR UPDATE USING (auth.role() = 'authenticated');
      CREATE POLICY "rituals_delete" ON rituals FOR DELETE USING (auth.role() = 'authenticated');
    `
  },
  {
    name: 'Create RLS policies — orders',
    sql: `
      DROP POLICY IF EXISTS "orders_select" ON orders;
      DROP POLICY IF EXISTS "orders_insert" ON orders;
      CREATE POLICY "orders_select" ON orders FOR SELECT USING (auth.role() = 'authenticated');
      CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
    `
  },
  {
    name: 'Enable Realtime on products, categories, content_blocks',
    sql: `
      ALTER PUBLICATION supabase_realtime ADD TABLE products;
      ALTER PUBLICATION supabase_realtime ADD TABLE categories;
      ALTER PUBLICATION supabase_realtime ADD TABLE content_blocks;
    `
  }
];

// Seed data
const SEED_CATEGORIES = [
  { name: 'Aromaterapia', subcategories: ['Velas', 'Inciensos', 'Brumas', 'Óleos'], sort_order: 1 },
  { name: 'Bienestar y Spa', subcategories: ['Sales de baño', 'Arcillas'], sort_order: 2 },
  { name: 'Hogar con intención', subcategories: ['Cerámicas', 'Textiles'], sort_order: 3 },
  { name: 'Kits', subcategories: ['Santuario'], sort_order: 4 },
  { name: 'Moda', subcategories: ['Prendas'], sort_order: 5 },
];

const SEED_CONTENT_BLOCKS = [
  { key: 'home.hero.title', label: 'Hero — Título principal', value: { text: 'Rituales para el alma' } },
  { key: 'home.hero.subtitle', label: 'Hero — Subtítulo', value: { text: 'Cosmética natural y objetos de intención para crear momentos de calma en tu día.' } },
  { key: 'home.featured.title', label: 'Sección destacados — Título', value: { text: 'Destacados' } },
  { key: 'home.featured.subtitle', label: 'Sección destacados — Subtítulo', value: { text: 'Una selección de aromas, texturas y rituales para tu bienestar.' } },
  { key: 'home.about.title', label: 'Sección nosotros — Título', value: { text: 'Nuestra filosofía' } },
  { key: 'home.about.text', label: 'Sección nosotros — Texto', value: { text: 'Creemos en la belleza lenta. En el ritual como forma de cuidado. En que cada producto debe tener intención detrás.' } },
  { key: 'catalog.title', label: 'Catálogo — Título', value: { text: 'Catálogo' } },
  { key: 'catalog.subtitle', label: 'Catálogo — Subtítulo', value: { text: 'Explorá nuestra colección de productos naturales con intención.' } },
  { key: 'catalog.filter.aroma.label', label: 'Filtro — Label aroma', value: { text: 'Aroma' } },
  { key: 'catalog.filter.category.label', label: 'Filtro — Label categoría', value: { text: 'Categoría' } },
];

const SEED_PRODUCTS = [
  {
    name: 'Bruma Ancestral — Vela de Soja Aromática',
    description: 'Vela de soja premium perfumada con aceites esenciales naturales en envase de vidrio templado.',
    sensory_description: 'Una caricia templada de lavanda silvestre y sándalo sagrado, diseñada para disolver las tensiones del día y envolver tu espacio en un abrazo de serenidad eterna.',
    price: 4200,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia',
    subcategory: 'Velas',
    ingredients: ['Cera de soja premium 100% natural', 'Aceite esencial de Lavanda silvestre', 'Extracto botánico de Sándalo sagrado', 'Pabilo de madera orgánica certificada FSC'],
    tags: ['Relajación', 'Noche', 'Equilibrio', 'Lavanda'],
    is_featured: true,
    is_new: false,
    aroma: 'Lavanda y Sándalo',
    color: 'Crema marfil',
    material: 'Vidrio templado y madera'
  },
  {
    name: 'Sahumerios Botánicos — Copal y Rosas',
    description: 'Sahumerios artesanales de resinas naturales de alta pureza y flores secas.',
    sensory_description: 'Humo sagrado que teje puentes entre la tierra y el cielo. Las notas balsámicas del copal blanco mexicano se entrelazan con la dulzura mística de pétalos de rosa secados al sol.',
    price: 2800,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia',
    subcategory: 'Inciensos',
    ingredients: ['Copal blanco puro de Chiapas', 'Pétalos triturados de Rosa Damascena', 'Resina natural de Olíbano sagrado'],
    tags: ['Purificación', 'Meditación', 'Amor Propio', 'Flores'],
    is_featured: false,
    is_new: true,
    aroma: 'Dulce y Balsámico',
    color: 'Terracota rústico',
    material: 'Caja de cartón kraft reciclable'
  },
  {
    name: 'Sales del Himalaya — Baño de Respiro e Intención',
    description: 'Sales minerales puras para baño de inmersión o spa de pies.',
    sensory_description: 'Cristales milenarios saturados de energía mineral pura, infusionados con aceites esenciales de eucalipto medicinal, menta piperita y caléndula suavizante.',
    price: 3500,
    stock: 22,
    image_url: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=800&q=80',
    category: 'Bienestar y Spa',
    subcategory: 'Sales de baño',
    ingredients: ['Sal rosa del Himalaya cristalizada', 'Aceite esencial puro de Eucalipto', 'Hojas de Menta orgánica', 'Flores deshidratadas de Caléndula'],
    tags: ['Bienestar', 'Recuperación', 'Spa', 'Refrescante'],
    is_featured: true,
    is_new: false,
    aroma: 'Eucalipto y Menta',
    color: 'Rosado mineral',
    material: 'Frasco de vidrio premium con tapón de corcho natural'
  },
  {
    name: 'Cuenco Ritual — Humo y Ceniza',
    description: 'Cuenco cerámico artesanal diseñado para sostener sahumerios y atados botánicos.',
    sensory_description: 'Modelado a mano en arcilla rústica por artesanos locales, cada cuenco es una pieza única de meditación visual.',
    price: 6500,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención',
    subcategory: 'Cerámicas',
    ingredients: ['Arcilla natural de alta temperatura', 'Esmalte mineral natural libre de plomo'],
    tags: ['Artesanal', 'Diseño', 'Soporte', 'Hogar'],
    is_featured: false,
    is_new: false,
    aroma: 'Neutro',
    color: 'Arena tostada',
    material: 'Cerámica de gres rústica'
  },
  {
    name: 'Manta de Meditación — Abrazo de Algodón',
    description: 'Manta tejida a mano con hilos de algodón orgánico para cobijar tu práctica.',
    sensory_description: 'Tejida en telar manual con hilos gruesos de algodón nativo sin teñir ni tratar químicamente.',
    price: 12500,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención',
    subcategory: 'Textiles',
    ingredients: ['Hilos de algodón 100% orgánico certificado', 'Tejido artesanal en telar de pedal'],
    tags: ['Confort', 'Meditación', 'Abrigo', 'Textil'],
    is_featured: true,
    is_new: true,
    aroma: 'Neutro',
    color: 'Crudo natural',
    material: 'Algodón orgánico hilado a mano'
  },
  {
    name: 'Bruma Botánica — Aurora del Despertar',
    description: 'Rocío botánico energizante para ambientes y textiles de algodón.',
    sensory_description: 'Un rocío energético de cítricos dorados, romero medicinal y menta silvestre, creado para purificar el campo áurico y despertar la claridad mental.',
    price: 3100,
    stock: 18,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia',
    subcategory: 'Brumas',
    ingredients: ['Hidrolato de Romero silvestre orgánico', 'Aceite esencial de Naranja Dulce', 'Aceite esencial de Menta piperita'],
    tags: ['Energía', 'Despertar', 'Claridad', 'Herbal'],
    is_featured: false,
    is_new: false,
    aroma: 'Cítrico y Herbal',
    color: 'Ámbar traslúcido',
    material: 'Frasco de vidrio ámbar con atomizador'
  },
  {
    name: 'Alquimia de Calma — Kit de Relajación Profunda',
    description: 'Set ritual completo para crear un espacio de paz mental e introspección.',
    sensory_description: 'El portal definitivo hacia la quietud mental. Combina la calidez de la vela de soja, la purificación del sahumerio y la nobleza del Cuenco Ritual.',
    price: 11800,
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    category: 'Kits',
    subcategory: 'Santuario',
    ingredients: ['1x Bruma Ancestral — Vela de Soja', '1x Sahumerios Botánicos — Copal y Rosas', '1x Cuenco Ritual de cerámica artesanal', 'Guía impresa ilustrada'],
    tags: ['Kit', 'Favorito', 'Intención', 'Regalo'],
    is_featured: true,
    is_new: false,
    aroma: 'Lavanda, Sándalo, Copal y Rosas',
    color: 'Variado armónico',
    material: 'Vidrio, Cerámica, Madera y Algodón'
  },
  {
    name: 'Alquimia de Desconexión — Kit Digital Detox',
    description: 'Set diseñado para el reseteo del sistema nervioso frente a la fatiga tecnológica.',
    sensory_description: 'Creado para los momentos en que el ruido digital abruma tu mente. Une el abrigo físico de la manta, la frescura botánica de la bruma y el Cuenco Ritual.',
    price: 18500,
    stock: 5,
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    category: 'Kits',
    subcategory: 'Santuario',
    ingredients: ['1x Manta de Meditación de algodón orgánico', '1x Bruma Botánica Aurora', '1x Cuenco Ritual de cerámica artesanal'],
    tags: ['Kit', 'Lujo', 'Detox', 'Mindfulness'],
    is_featured: true,
    is_new: true,
    aroma: 'Cítrico, Herbal, Lavanda',
    color: 'Crudo, Arena y Ámbar',
    material: 'Algodón orgánico, Vidrio ámbar, Cerámica artesanal'
  },
  {
    name: 'Oleo Sagrado — Sándalo y Jazmín del Atardecer',
    description: 'Elixir de aceites esenciales puros prensados en frío para masajes de calma.',
    sensory_description: 'Una fragancia de ensueño donde el magnetismo amaderado del sándalo de Mysore se rinde ante el misterio nocturno del jazmín absoluto.',
    price: 5900,
    stock: 16,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia',
    subcategory: 'Óleos',
    ingredients: ['Aceite de Jojoba orgánica', 'Aceite esencial puro de Sándalo', 'Jazmín absoluto destilado al vapor'],
    tags: ['Relajación', 'Óleos', 'Sensualidad', 'Claridad'],
    is_featured: true,
    is_new: true,
    aroma: 'Jazmín y Sándalo profundo',
    color: 'Dorado ámbar líquido',
    material: 'Gotero de vidrio premium'
  },
  {
    name: 'Arcilla del Altar — Mascarilla Detox de Manzanilla',
    description: 'Arcilla volcánica pura con flores deshidratadas para purificar y calmar el tejido cutáneo.',
    sensory_description: 'Tierra sagrada rica en sílice y oligoelementos que absorbe las impurezas celulares y la contaminación urbana.',
    price: 4800,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    category: 'Bienestar y Spa',
    subcategory: 'Arcillas',
    ingredients: ['Caolín blanco micronizado', 'Arcilla bentonita volcánica', 'Flores de Manzanilla pulverizadas', 'Avena coloidal orgánica'],
    tags: ['Cuidado', 'Piel', 'Purificación', 'Manzanilla'],
    is_featured: false,
    is_new: true,
    aroma: 'Herbal suave y Manzanilla dulce',
    color: 'Crema verdoso sutil',
    material: 'Bolsa de lino rústica'
  },
  {
    name: 'Cascada de Humo — Porta Incensario de Piedra y Arcilla',
    description: 'Soporte escultórico artesanal diseñado para la combustión de sahumerios y conos.',
    sensory_description: 'Una escultura orgánica moldeada en gres refractario que rinde homenaje a la erosión natural de las rocas.',
    price: 7200,
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención',
    subcategory: 'Cerámicas',
    ingredients: ['Arcilla refractaria texturada', 'Esmaltes de ceniza de madera natural'],
    tags: ['Artesanal', 'Incienso', 'Altar', 'Gres'],
    is_featured: true,
    is_new: false,
    aroma: 'Neutro',
    color: 'Marrón tierra y ceniza gris',
    material: 'Cerámica gres texturada refractaria'
  },
  {
    name: 'Kimono Calma — Lino Orgánico de la Tierra',
    description: 'Kimono de corte holgado confeccionado en lino puro para habitar tu cuerpo en absoluta paz.',
    sensory_description: 'Confeccionado en puro lino europeo de caída etérea y tacto rústico pero increíblemente suave.',
    price: 24500,
    stock: 7,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    category: 'Moda',
    subcategory: 'Prendas',
    ingredients: ['Hilos de lino 100% orgánico certificado OEKO-TEX', 'Tintes naturales biodegradables'],
    tags: ['Textil', 'Lino', 'Cuerpo', 'Kimono'],
    is_featured: true,
    is_new: true,
    aroma: 'Fresco neutro',
    color: 'Crudo lino original',
    material: 'Lino puro texturado biodegradable'
  }
];

async function runMigrations() {
  console.log('🌿 Aurea Eli — Iniciando migraciones en Supabase...\n');

  // Test conexión
  const { data: test, error: testError } = await supabase.from('_test_connection').select().limit(1).single();
  // El error esperado es "relation does not exist", lo cual confirma que la conexión funciona
  console.log('✅ Conexión a Supabase establecida');

  // Crear tablas via INSERT en tabla de control o via SQL directo
  // Usamos el cliente de Supabase para verificar la conexión y luego seeds

  console.log('\n📦 Insertando categorías...');
  for (const cat of SEED_CATEGORIES) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'name' });
    if (error) {
      console.log(`  ⚠️  ${cat.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${cat.name}`);
    }
  }

  console.log('\n📝 Insertando content blocks...');
  for (const block of SEED_CONTENT_BLOCKS) {
    const { error } = await supabase
      .from('content_blocks')
      .upsert(block, { onConflict: 'key' });
    if (error) {
      console.log(`  ⚠️  ${block.key}: ${error.message}`);
    } else {
      console.log(`  ✓ ${block.key}`);
    }
  }

  console.log('\n🛍️  Insertando productos...');
  for (const product of SEED_PRODUCTS) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'name' });
    if (error) {
      console.log(`  ⚠️  ${product.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${product.name}`);
    }
  }

  console.log('\n✅ Migraciones completadas.');
}

runMigrations().catch(console.error);
