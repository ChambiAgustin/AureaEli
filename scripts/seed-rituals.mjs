import './env-loader.mjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mvsqqvorumqrhlxbtxjq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Obtener IDs reales de productos desde Supabase
const { data: products } = await sb.from('products').select('id, name');
const find = (keyword) => products?.find(p => p.name.toLowerCase().includes(keyword.toLowerCase()))?.id ?? null;

const IDS = {
  vela:     find('Vela de Soja'),
  sales:    find('Himalaya'),
  manta:    find('Meditaci'),
  kit1:     find('Kit de Relajaci'),
  kit2:     find('Digital Detox'),
  bruma:    find('Aurora'),
  incienso: find('Copal'),
  cuenco:   find('Cuenco'),
};

console.log('IDs mapeados:', IDS);

const rituals = [
  {
    title: 'Ritual de Calma al Atardecer',
    description: 'Una pausa consciente al final del dia para disolver el cansancio acumulado e iniciar una transicion suave hacia un sueno profundo y reparador.',
    duration_minutes: 15,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    steps: [
      'Prepara el espacio atenuando las luces principales y enciende tu vela de soja Bruma Ancestral. Observa la llama y deja que el sutil crujido de su pabilo de madera empiece a armonizar el entorno.',
      'Busca una postura comoda y sientate sobre un cojin o colchoneta. Envuelve tus hombros y espalda con la manta de algodon organico para crear un limite amoroso y calido con el exterior.',
      'Cierra suavemente los ojos. Inhala profundamente en 4 tiempos, retiene el aire 4 tiempos y exhala lentamente en 6 tiempos soltando cualquier tension fisica.',
      'Reproduce el audio guia para dejarte guiar por la meditacion corta de respiracion, permaneciendo presente en el fluir del aire.',
      'Termina el ritual agradeciendo mentalmente a tu cuerpo por este momento de pausa sagrada. Permanece en silencio dos minutos mas contemplando el resplandor calido de la vela.'
    ],
    product_ids: [IDS.vela, IDS.manta, IDS.kit1].filter(Boolean)
  },
  {
    title: 'Ritual de Florecimiento Sensorial',
    description: 'Un ritual botanico de purificacion energetica y conexion con tu creatividad interior empleando humo sagrado de resinas naturales.',
    duration_minutes: 20,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    steps: [
      'Coloca un sahumerio de Copal y Rosas en tu Cuenco Ritual de ceramica. Enciende la punta con un fosforo de madera e insufla aire suavemente hasta que comience a fluir el humo sagrado.',
      'Toma el cuenco firmemente entre tus manos. Dibuja con cuidado circulos en el aire a tu alrededor, permitiendo que el aroma balsamico limpie tu campo energetico.',
      'Apoya el cuenco frente a vos, sientate con la espalda erguida y los hombros relajados. Siente la conexion solida de tus caderas con el suelo.',
      'Respira a paso lento el aroma dulce y mistico de la rosa y la pureza del copal. Con cada inhalacion, visualiza luz dorada expandiendose en tu centro creativo.',
      'Toma un papel y un lapiz. Escribe de forma intuitiva tres intenciones que desees ver florecer en tu vida y colocalas debajo del cuenco ritual hasta que el sahumerio termine.'
    ],
    product_ids: [IDS.incienso, IDS.cuenco, IDS.kit1].filter(Boolean)
  },
  {
    title: 'Ritual de Desconexion Digital',
    description: 'Un retorno absoluto a la quietud fisica y mental. Disenado para desacelerar la mente sobreestimulada por la luz azul y el flujo informativo digital.',
    duration_minutes: 30,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    steps: [
      'Apaga y aparta todos tus dispositivos electronicos (celulares, pantallas) y llevalos fuera de la habitacion al menos dos horas antes de dormir.',
      'Prepara un bano de inmersion tibio. Esparce generosamente las Sales del Himalaya en el agua y revuelve suavemente para disolver los minerales y activar los aceites esenciales.',
      'Antes de sumergirte, vaporiza la bruma botanica Aurora en el aire para liberar el eucalipto y menta silvestre en forma de vapor aromaterapeutico.',
      'Sumergete por completo en el agua y cierra los ojos. Pon total atencion en el fluir del agua templada sobre tu piel, permitiendo que disuelva tus cargas mentales.',
      'Al salir del agua, abrigate en tu manta de algodon organico. Bebe un te herbal tibio en silencio mientras sientes como tu mente reposa en su centro natural.'
    ],
    product_ids: [IDS.sales, IDS.manta, IDS.bruma, IDS.kit2].filter(Boolean)
  }
];

const { error } = await sb.from('rituals').insert(rituals);

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('3 rituales insertados correctamente');
  const { data: check } = await sb.from('rituals').select('title, product_ids');
  check?.forEach(r => console.log(' -', r.title, '| productos vinculados:', r.product_ids?.length ?? 0));
}
