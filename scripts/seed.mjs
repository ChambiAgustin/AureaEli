/**
 * Aurea Eli — Seed Script
 * Inserta datos iniciales en Supabase (productos, categorías, content blocks)
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

const CATEGORIES = [
  { name: 'Aromaterapia', subcategories: ['Velas', 'Inciensos', 'Brumas', 'Óleos'], sort_order: 1 },
  { name: 'Bienestar y Spa', subcategories: ['Sales de baño', 'Arcillas'], sort_order: 2 },
  { name: 'Hogar con intención', subcategories: ['Cerámicas', 'Textiles'], sort_order: 3 },
  { name: 'Kits', subcategories: ['Santuario'], sort_order: 4 },
  { name: 'Moda', subcategories: ['Prendas'], sort_order: 5 },
];

const CONTENT_BLOCKS = [
  { key: 'home.hero.title', label: 'Hero — Título principal', value: { text: 'Rituales para el alma' } },
  { key: 'home.hero.subtitle', label: 'Hero — Subtítulo', value: { text: 'Cosmética natural y objetos de intención para crear momentos de calma en tu día.' } },
  { key: 'home.featured.title', label: 'Destacados — Título', value: { text: 'Destacados' } },
  { key: 'home.featured.subtitle', label: 'Destacados — Subtítulo', value: { text: 'Una selección de aromas, texturas y rituales para tu bienestar.' } },
  { key: 'home.about.title', label: 'Nosotros — Título', value: { text: 'Nuestra filosofía' } },
  { key: 'home.about.text', label: 'Nosotros — Texto', value: { text: 'Creemos en la belleza lenta. En el ritual como forma de cuidado. En que cada producto debe tener intención detrás.' } },
  { key: 'catalog.title', label: 'Catálogo — Título', value: { text: 'Catálogo' } },
  { key: 'catalog.subtitle', label: 'Catálogo — Subtítulo', value: { text: 'Explorá nuestra colección de productos naturales con intención.' } },
  { key: 'catalog.filter.aroma.label', label: 'Filtro Aroma — Label', value: { text: 'Aroma' } },
  { key: 'catalog.filter.category.label', label: 'Filtro Categoría — Label', value: { text: 'Categoría' } },
  { key: 'catalog.filter.all.label', label: 'Filtro — Opción "Todos"', value: { text: 'Todos' } },
];

const PRODUCTS = [
  {
    name: 'Bruma Ancestral — Vela de Soja Aromática',
    description: 'Vela de soja premium perfumada con aceites esenciales naturales en envase de vidrio templado.',
    sensory_description: 'Una caricia templada de lavanda silvestre y sándalo sagrado, diseñada para disolver las tensiones del día y envolver tu espacio en un abrazo de serenidad eterna. El crujido de su pabilo de madera orgánica recrea el susurro reconfortante de un fuego calmo en la penumbra.',
    price: 4200, stock: 15,
    image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia', subcategory: 'Velas',
    ingredients: ['Cera de soja premium 100% natural', 'Aceite esencial de Lavanda silvestre', 'Extracto botánico de Sándalo sagrado', 'Pabilo de madera orgánica certificada FSC'],
    tags: ['Relajación', 'Noche', 'Equilibrio', 'Lavanda'],
    is_featured: true, is_new: false, aroma: 'Lavanda y Sándalo', color: 'Crema marfil', material: 'Vidrio templado y madera'
  },
  {
    name: 'Sahumerios Botánicos — Copal y Rosas',
    description: 'Sahumerios artesanales de resinas naturales de alta pureza y flores secas.',
    sensory_description: 'Humo sagrado que teje puentes entre la tierra y el cielo. Las notas balsámicas y ancestrales del copal blanco mexicano se entrelazan con la dulzura mística de pétalos de rosa secados al sol.',
    price: 2800, stock: 30,
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia', subcategory: 'Inciensos',
    ingredients: ['Copal blanco puro de Chiapas', 'Pétalos triturados de Rosa Damascena', 'Resina natural de Olíbano sagrado', 'Aglutinante vegetal orgánico'],
    tags: ['Purificación', 'Meditación', 'Amor Propio', 'Flores'],
    is_featured: false, is_new: true, aroma: 'Dulce y Balsámico', color: 'Terracota rústico', material: 'Caja de cartón kraft reciclable'
  },
  {
    name: 'Sales del Himalaya — Baño de Respiro e Intención',
    description: 'Sales minerales puras para baño de inmersión o spa de pies.',
    sensory_description: 'Cristales milenarios saturados de energía mineral pura, infusionados con aceites esenciales de eucalipto medicinal, menta piperita y caléndula suavizante.',
    price: 3500, stock: 22,
    image_url: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=800&q=80',
    category: 'Bienestar y Spa', subcategory: 'Sales de baño',
    ingredients: ['Sal rosa del Himalaya cristalizada de roca natural', 'Aceite esencial puro de Eucalipto', 'Hojas de Menta orgánica trituradas a mano', 'Flores deshidratadas de Caléndula'],
    tags: ['Bienestar', 'Recuperación', 'Spa', 'Refrescante'],
    is_featured: true, is_new: false, aroma: 'Eucalipto y Menta', color: 'Rosado mineral', material: 'Frasco de vidrio premium con tapón de corcho natural'
  },
  {
    name: 'Cuenco Ritual — Humo y Ceniza',
    description: 'Cuenco cerámico artesanal diseñado para sostener sahumerios y atados botánicos.',
    sensory_description: 'Modelado a mano en arcilla rústica por artesanos locales, cada cuenco es una pieza única de meditación visual.',
    price: 6500, stock: 8,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención', subcategory: 'Cerámicas',
    ingredients: ['Arcilla natural de alta temperatura', 'Esmalte mineral natural libre de plomo', 'Horneado a leña tradicional'],
    tags: ['Artesanal', 'Diseño', 'Soporte', 'Hogar'],
    is_featured: false, is_new: false, aroma: 'Neutro', color: 'Arena tostada', material: 'Cerámica de gres rústica'
  },
  {
    name: 'Manta de Meditación — Abrazo de Algodón',
    description: 'Manta tejida a mano con hilos de algodón orgánico para cobijar tu práctica.',
    sensory_description: 'Tejida en telar manual con hilos gruesos de algodón nativo sin teñir ni tratar químicamente.',
    price: 12500, stock: 12,
    image_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención', subcategory: 'Textiles',
    ingredients: ['Hilos de algodón 100% orgánico certificado', 'Tejido artesanal en telar de pedal'],
    tags: ['Confort', 'Meditación', 'Abrigo', 'Textil'],
    is_featured: true, is_new: true, aroma: 'Neutro', color: 'Crudo natural', material: 'Algodón orgánico hilado a mano'
  },
  {
    name: 'Bruma Botánica — Aurora del Despertar',
    description: 'Rocío botánico energizante para ambientes y textiles de algodón.',
    sensory_description: 'Un rocío energético de cítricos dorados, romero medicinal y menta silvestre, creado para purificar el campo áurico y despertar la claridad mental.',
    price: 3100, stock: 18,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia', subcategory: 'Brumas',
    ingredients: ['Hidrolato de Romero silvestre orgánico', 'Aceite esencial de Naranja Dulce prensada en frío', 'Aceite esencial destilado de Menta piperita'],
    tags: ['Energía', 'Despertar', 'Claridad', 'Herbal'],
    is_featured: false, is_new: false, aroma: 'Cítrico y Herbal', color: 'Ámbar traslúcido', material: 'Frasco de vidrio ámbar con atomizador'
  },
  {
    name: 'Alquimia de Calma — Kit de Relajación Profunda',
    description: 'Set ritual completo para crear un espacio de paz mental e introspección.',
    sensory_description: 'El portal definitivo hacia la quietud mental. Combina la calidez de la vela de soja, la purificación del sahumerio y la nobleza del Cuenco Ritual.',
    price: 11800, stock: 10,
    image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    category: 'Kits', subcategory: 'Santuario',
    ingredients: ['1x Bruma Ancestral — Vela de Soja', '1x Sahumerios Botánicos — Copal y Rosas', '1x Cuenco Ritual de cerámica artesanal', 'Guía impresa ilustrada con el ritual'],
    tags: ['Kit', 'Favorito', 'Intención', 'Regalo'],
    is_featured: true, is_new: false, aroma: 'Lavanda, Sándalo, Copal y Rosas', color: 'Variado armónico', material: 'Vidrio, Cerámica, Madera y Algodón'
  },
  {
    name: 'Alquimia de Desconexión — Kit Digital Detox',
    description: 'Set diseñado para el reseteo del sistema nervioso frente a la fatiga tecnológica.',
    sensory_description: 'Creado para los momentos en que el ruido digital abruma tu mente. Une el abrigo físico de la manta, la frescura botánica de la bruma y el Cuenco Ritual.',
    price: 18500, stock: 5,
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    category: 'Kits', subcategory: 'Santuario',
    ingredients: ['1x Manta de Meditación de algodón orgánico', '1x Bruma Botánica Aurora del Despertar', '1x Cuenco Ritual de cerámica artesanal'],
    tags: ['Kit', 'Lujo', 'Detox', 'Mindfulness'],
    is_featured: true, is_new: true, aroma: 'Cítrico, Herbal, Lavanda', color: 'Crudo, Arena y Ámbar', material: 'Algodón orgánico, Vidrio ámbar, Cerámica artesanal'
  },
  {
    name: 'Oleo Sagrado — Sándalo y Jazmín del Atardecer',
    description: 'Elixir de aceites esenciales puros prensados en frío para masajes de calma en sienes y cuello.',
    sensory_description: 'Una fragancia de ensueño donde el magnetismo amaderado del sándalo de Mysore se rinde ante el misterio nocturno del jazmín absoluto.',
    price: 5900, stock: 16,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia', subcategory: 'Óleos',
    ingredients: ['Aceite de Jojoba orgánica como base', 'Aceite esencial puro de Sándalo', 'Jazmín absoluto destilado al vapor', 'Vitamina E pura conservante natural'],
    tags: ['Relajación', 'Óleos', 'Sensualidad', 'Claridad'],
    is_featured: true, is_new: true, aroma: 'Jazmín y Sándalo profundo', color: 'Dorado ámbar líquido', material: 'Gotero de vidrio premium'
  },
  {
    name: 'Arcilla del Altar — Mascarilla Detox de Manzanilla',
    description: 'Arcilla volcánica pura con flores deshidratadas para purificar y calmar el tejido cutáneo.',
    sensory_description: 'Tierra sagrada rica en sílice y oligoelementos que absorbe las impurezas celulares y la contaminación urbana.',
    price: 4800, stock: 25,
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    category: 'Bienestar y Spa', subcategory: 'Arcillas',
    ingredients: ['Caolín blanco micronizado de alta pureza', 'Arcilla bentonita volcánica purificada', 'Flores de Manzanilla pulverizadas a mano', 'Avena coloidal orgánica fina'],
    tags: ['Cuidado', 'Piel', 'Purificación', 'Manzanilla'],
    is_featured: false, is_new: true, aroma: 'Herbal suave y Manzanilla dulce', color: 'Crema verdoso sutil', material: 'Bolsa de lino rústica'
  },
  {
    name: 'Cascada de Humo — Porta Incensario de Piedra y Arcilla',
    description: 'Soporte escultórico artesanal diseñado para la combustión de sahumerios y conos.',
    sensory_description: 'Una escultura orgánica moldeada en gres refractario que rinde homenaje a la erosión natural de las rocas.',
    price: 7200, stock: 10,
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención', subcategory: 'Cerámicas',
    ingredients: ['Arcilla refractaria texturada de alta temperatura', 'Esmaltes de ceniza de madera natural'],
    tags: ['Artesanal', 'Incienso', 'Altar', 'Gres'],
    is_featured: true, is_new: false, aroma: 'Neutro', color: 'Marrón tierra y ceniza gris', material: 'Cerámica gres texturada refractaria'
  },
  {
    name: 'Kimono Calma — Lino Orgánico de la Tierra',
    description: 'Kimono de corte holgado confeccionado en lino puro para habitar tu cuerpo en absoluta paz.',
    sensory_description: 'Confeccionado en puro lino europeo de caída etérea y tacto rústico pero increíblemente suave.',
    price: 24500, stock: 7,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    category: 'Moda', subcategory: 'Prendas',
    ingredients: ['Hilos de lino 100% orgánico certificado por OEKO-TEX', 'Tintes naturales biodegradables extraídos de cortezas de árboles'],
    tags: ['Textil', 'Lino', 'Cuerpo', 'Kimono'],
    is_featured: true, is_new: true, aroma: 'Fresco neutro', color: 'Crudo lino original', material: 'Lino puro texturado biodegradable'
  }
];

async function seed() {
  console.log('🌱 Aurea Eli — Iniciando seed de datos...\n');

  // Categorías
  console.log('📂 Insertando categorías...');
  const { error: catError } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'name' });
  if (catError) console.error('  ❌', catError.message);
  else console.log(`  ✓ ${CATEGORIES.length} categorías`);

  // Content blocks
  console.log('\n📝 Insertando content blocks...');
  const { error: cbError } = await supabase
    .from('content_blocks')
    .upsert(CONTENT_BLOCKS, { onConflict: 'key' });
  if (cbError) console.error('  ❌', cbError.message);
  else console.log(`  ✓ ${CONTENT_BLOCKS.length} bloques de contenido`);

  // Productos
  console.log('\n🛍️  Insertando productos...');
  for (const product of PRODUCTS) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'name' });
    if (error) {
      console.error(`  ❌ ${product.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${product.name}`);
    }
  }

  // Verificación final
  console.log('\n🔍 Verificando datos insertados...');
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: cbCount } = await supabase.from('content_blocks').select('*', { count: 'exact', head: true });

  console.log(`  ✓ ${prodCount} productos en BD`);
  console.log(`  ✓ ${catCount} categorías en BD`);
  console.log(`  ✓ ${cbCount} content blocks en BD`);
  console.log('\n🎉 Seed completado. Base de datos lista.');
}

seed().catch(console.error);
