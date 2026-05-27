import type { IRepository, Product, Ritual, UserProfile, Order } from './IRepository';

const STORAGE_KEYS = {
  PROFILE: 'aurea_user_profile',
  ORDERS: 'aurea_orders',
  PRODUCTS: 'aurea_products',
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-vela-calma',
    name: 'Bruma Ancestral — Vela de Soja Aromática',
    description: 'Vela de soja premium perfumada con aceites esenciales naturales en envase de vidrio templado.',
    sensoryDescription: 'Una caricia templada de lavanda silvestre y sándalo sagrado, diseñada para disolver las tensiones del día y envolver tu espacio en un abrazo de serenidad eterna. El crujido de su pabilo de madera orgánica recrea el susurro reconfortante de un fuego calmo en la penumbra.',
    price: 4200,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia',
    subcategory: 'Velas',
    ingredients: [
      'Cera de soja premium 100% natural',
      'Aceite esencial de Lavanda silvestre (Lavandula angustifolia)',
      'Extracto botánico de Sándalo sagrado (Amyris balsamifera)',
      'Pabilo de madera orgánica certificada FSC'
    ],
    tags: ['Relajación', 'Noche', 'Equilibrio', 'Lavanda'],
    isFeatured: true,
    isNew: false,
    aroma: 'Lavanda y Sándalo',
    color: 'Crema marfil',
    material: 'Vidrio templado y madera'
  },
  {
    id: 'prod-incienso-florecer',
    name: 'Sahumerios Botánicos — Copal y Rosas',
    description: 'Sahumerios artesanales de resinas naturales de alta pureza y flores secas.',
    sensoryDescription: 'Humo sagrado que teje puentes entre la tierra y el cielo. Las notas balsámicas y ancestrales del copal blanco mexicano se entrelazan con la dulzura mística de pétalos de rosa secados al sol, liberando una fragancia que limpia ambientes, purifica la mente e invita al florecimiento del alma.',
    price: 2800,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia',
    subcategory: 'Inciensos',
    ingredients: [
      'Copal blanco puro de Chiapas',
      'Pétalos triturados de Rosa Damascena',
      'Resina natural de Olíbano sagrado',
      'Aglutinante vegetal orgánico'
    ],
    tags: ['Purificación', 'Meditación', 'Amor Propio', 'Flores'],
    isFeatured: false,
    isNew: true,
    aroma: 'Dulce y Balsámico',
    color: 'Terracota rústico',
    material: 'Caja de cartón kraft reciclable'
  },
  {
    id: 'prod-sales-respiro',
    name: 'Sales del Himalaya — Baño de Respiro e Intención',
    description: 'Sales minerales puras para baño de inmersión o spa de pies.',
    sensoryDescription: 'Cristales milenarios saturados de energía mineral pura, infusionados con aceites esenciales de eucalipto medicinal, menta piperita y caléndula suavizante. Un baño de inmersión sublime que alivia el cansancio físico acumulado, despeja las vías respiratorias y restaura tu centro vital.',
    price: 3500,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=800&q=80',
    category: 'Bienestar y Spa',
    subcategory: 'Sales de baño',
    ingredients: [
      'Sal rosa del Himalaya cristalizada de roca natural',
      'Aceite esencial puro de Eucalipto (Eucalyptus globulus)',
      'Hojas de Menta orgánica trituradas a mano',
      'Flores deshidratadas de Caléndula (Calendula officinalis)'
    ],
    tags: ['Bienestar', 'Recuperación', 'Spa', 'Refrescante'],
    isFeatured: true,
    isNew: false,
    aroma: 'Eucalipto y Menta',
    color: 'Rosado mineral',
    material: 'Frasco de vidrio premium con tapón de corcho natural'
  },
  {
    id: 'prod-cuenco-sagrado',
    name: 'Cuenco Ritual — Humo y Ceniza',
    description: 'Cuenco cerámico artesanal diseñado para sostener sahumerios y atados botánicos.',
    sensoryDescription: 'Modelado a mano en arcilla rústica por artesanos locales, cada cuenco es una pieza única de meditación visual. Acabado con un esmalte mineral mate que celebra la belleza imperfecta de la tierra y del fuego. El compañero ideal para sostener tus rituales de sahumado diario.',
    price: 6500,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención',
    subcategory: 'Cerámicas',
    ingredients: [
      'Arcilla natural de alta temperatura',
      'Esmalte mineral natural libre de plomo',
      'Horneado a leña tradicional'
    ],
    tags: ['Artesanal', 'Diseño', 'Soporte', 'Hogar'],
    isFeatured: false,
    isNew: false,
    aroma: 'Neutro',
    color: 'Arena tostada',
    material: 'Cerámica de gres rústica'
  },
  {
    id: 'prod-manta-pausa',
    name: 'Manta de Meditación — Abrazo de Algodón',
    description: 'Manta tejida a mano con hilos de algodón orgánico para cobijar tu práctica.',
    sensoryDescription: 'Tejida en telar manual con hilos gruesos de algodón nativo sin teñir ni tratar químicamente. Su peso ideal y textura suave proporcionan un anclaje reconfortante sobre tus hombros durante tus meditaciones matutinas o al final de tu día, recordándote la importancia de abrigar tu ser.',
    price: 12500,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
    category: 'Hogar con intención',
    subcategory: 'Textiles',
    ingredients: [
      'Hilos de algodón 100% orgánico certificado',
      'Tejido artesanal en telar de pedal'
    ],
    tags: ['Confort', 'Meditación', 'Abrigo', 'Textil'],
    isFeatured: true,
    isNew: true,
    aroma: 'Neutro (sutil fragancia a algodón puro)',
    color: 'Crudo natural',
    material: 'Algodón orgánico hilado a mano'
  },
  {
    id: 'prod-bruma-aurora',
    name: 'Bruma Botánica — Aurora del Despertar',
    description: 'Rocío botánico energizante para ambientes y textiles de algodón.',
    sensoryDescription: 'Un rocío energético de cítricos dorados, romero medicinal y menta silvestre, creado para purificar el campo áurico y despertar la claridad mental en las primeras horas del alba. Su aroma fresco e impregnado de luz evoca el amanecer en un bosque de coníferas cubierto de rocío fresco.',
    price: 3100,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    category: 'Aromaterapia',
    subcategory: 'Brumas',
    ingredients: [
      'Hidrolato de Romero silvestre orgánico',
      'Aceite esencial de Naranja Dulce prensada en frío',
      'Aceite esencial destilado de Menta piperita',
      'Agua de manantial purificada y alcohol de cereal tridestilado'
    ],
    tags: ['Energía', 'Despertar', 'Claridad', 'Herbal'],
    isFeatured: false,
    isNew: false,
    aroma: 'Cítrico y Herbal',
    color: 'Ámbar traslúcido',
    material: 'Frasco de vidrio ámbar con atomizador de alta dispersión'
  },
  {
    id: 'prod-kit-calma',
    name: 'Alquimia de Calma — Kit de Relajación Profunda',
    description: 'Set ritual completo para crear un espacio de paz mental e introspección.',
    sensoryDescription: 'El portal definitivo hacia la quietud mental. Combina la calidez de la vela de soja Bruma Ancestral, la purificación del sahumerio de Copal y Rosas, y la nobleza del Cuenco Ritual hecho a mano. Una sinergia sensorial creada para transformar cualquier rincón de tu hogar en un santuario personal de introspección.',
    price: 11800,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    category: 'Kits',
    subcategory: 'Santuario',
    ingredients: [
      '1x Bruma Ancestral — Vela de Soja Aromática',
      '1x Sahumerios Botánicos — Copal y Rosas (caja de 6 varillas)',
      '1x Cuenco Ritual — Humo y Ceniza de cerámica artesanal',
      'Guía impresa ilustrada con el ritual paso a paso'
    ],
    tags: ['Kit', 'Favorito', 'Intención', 'Regalo'],
    isFeatured: true,
    isNew: false,
    aroma: 'Lavanda, Sándalo, Copal y Rosas',
    color: 'Variado armónico (Marfil, Arena, Terracota)',
    material: 'Vidrio, Cerámica de gres, Madera y Algodón'
  },
  {
    id: 'prod-kit-desconexion',
    name: 'Alquimia de Desconexión — Kit Digital Detox',
    description: 'Set diseñado para el reseteo del sistema nervioso frente a la fatiga tecnológica.',
    sensoryDescription: 'Creado para los momentos en que el ruido digital abruma tu mente. Este ritual une el abrigo físico de nuestra Manta de Meditación en algodón orgánico, la frescura botánica de la Bruma Aurora para despejar tus sentidos, y el Cuenco Ritual para sahumar el ambiente. Un pasaporte sensorial de regreso a vos mismo.',
    price: 18500,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    category: 'Kits',
    subcategory: 'Santuario',
    ingredients: [
      '1x Manta de Meditación — Abrazo de Algodón',
      '1x Bruma Botánica — Aurora del Despertar',
      '1x Cuenco Ritual — Humo y Ceniza de cerámica artesanal',
      'Antifaz botánico relleno de semillas de lavanda y lino'
    ],
    tags: ['Kit', 'Lujo', 'Detox', 'Mindfulness'],
    isFeatured: true,
    isNew: true,
    aroma: 'Cítrico, Herbal, Lavanda',
    color: 'Crudo, Arena y Ámbar',
    material: 'Algodón orgánico, Vidrio ámbar, Cerámica artesanal'
  }
];

const MOCK_RITUALS: Ritual[] = [
  {
    id: 'ritual-calma',
    title: 'Ritual de Calma al Atardecer',
    description: 'Una pausa consciente al final del día para disolver el cansancio acumulado e iniciar una transición suave hacia un sueño profundo y reparador.',
    durationMinutes: 15,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Audio mock de prueba
    steps: [
      'Prepará el espacio atenuando las luces principales y encendé tu vela de soja "Bruma Ancestral". Observá la llama y dejá que el sutil crujido de su pabilo de madera empiece a armonizar el entorno.',
      'Buscá una postura cómoda y sentate sobre un cojín o colchoneta. Envolvé tus hombros y espalda con la manta de algodón orgánico para crear un límite amoroso y cálido con el exterior.',
      'Cerrá suavemente los ojos. Inhalá profundamente en 4 tiempos reteniendo el aire con las notas de lavanda y sándalo, y exhalá lentamente en 6 tiempos soltando cualquier tensión física de tus hombros y mandíbula.',
      'Reproducí el audio guía para dejarte guiar por la meditación corta de respiración, permaneciendo presente en el fluir del aire.',
      'Terminá el ritual agradeciendo mentalmente a tu cuerpo por este momento de pausa sagrada. Permanecé en silencio dos minutos más contemplando el resplandor cálido de la vela.'
    ],
    productIds: ['prod-vela-calma', 'prod-manta-pausa', 'prod-kit-calma']
  },
  {
    id: 'ritual-florecimiento',
    title: 'Ritual de Florecimiento Sensorial',
    description: 'Un ritual botánico de purificación energética y conexión con tu creatividad interior empleando humo sagrado de resinas naturales.',
    durationMinutes: 20,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    steps: [
      'Colocá un sahumerio de Copal y Rosas en tu Cuenco Ritual de cerámica. Encendé la punta con un fósforo de madera e insuflá aire suavemente hasta que comience a fluir el humo sagrado aromático.',
      'Tomá el cuenco firmemente entre tus manos. Dibujá con cuidado círculos en el aire a tu alrededor, permitiendo que el aroma balsámico limpie tu campo energético y redefina el aire que respirás.',
      'Apoyá el cuenco frente a vos, sentate con la espalda erguida y los hombros relajados. Sentí la conexión sólida de tus caderas con el suelo.',
      'Respirá a paso lento el aroma dulce y místico de la rosa y la pureza del copal. Con cada inhalación, visualizá luz dorada expandiéndose en tu centro creativo (abdomen inferior).',
      'Tomá un papel y un lápiz. Escribí de forma intuitiva tres intenciones botánicas o sueños que desees ver florecer en tu vida, dóblalo y colócalo debajo del cuenco ritual hasta que el sahumerio termine por completo.'
    ],
    productIds: ['prod-incienso-florecer', 'prod-cuenco-sagrado', 'prod-kit-calma']
  },
  {
    id: 'ritual-desconexion',
    title: 'Ritual de Desconexión Digital',
    description: 'Un retorno absoluto a la quietud física y mental. Diseñado para desacelerar la mente sobreestimulada por la luz azul y el flujo informativo digital.',
    durationMinutes: 30,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    steps: [
      'Apagá y apartá todos tus dispositivos electrónicos (celulares, pantallas) y llévalos fuera de la habitación al menos dos horas antes de dormir.',
      'Prepará un baño de inmersión tibio. Esparcí generosamente las Sales del Himalaya en el agua y revolvé suavemente para disolver los minerales y activar los aceites esenciales.',
      'Antes de sumergirte, vaporizá la bruma botánica Aurora en el aire para liberar el eucalipto y menta silvestre en forma de vapor aromaterapéutico.',
      'Sumergite por completo en el agua y cerrá los ojos. Poné total atención en el fluir del agua templada sobre tu piel, permitiendo que disuelva y absorba tus cargas mentales y contracturas.',
      'Al salir del agua, abrígate en tu manta de algodón orgánico. Bebé un té herbal tibio en silencio mientras sentís cómo tu mente reposa en su centro natural sin interrupciones electrónicas.'
    ],
    productIds: ['prod-sales-respiro', 'prod-manta-pausa', 'prod-kit-desconexion']
  }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-default',
  name: 'Alma Aurea',
  email: 'alma@aureaelizabeth.com',
  stressLevel: 'high',
  aromaPreferences: ['Lavanda', 'Sándalo', 'Herbal'],
  skinType: 'sensitive',
  completedRituals: [],
  favorites: ['prod-vela-calma']
};

export class MockRepository implements IRepository {
  private delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getStoredData<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      this.setStoredData(key, defaultValue);
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStoredData<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage at key: ${key}`, e);
    }
  }

  async getProducts(): Promise<Product[]> {
    await this.delay(350);
    return this.getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.delay(200);
    const products = await this.getProducts();
    const product = products.find((p) => p.id === id);
    return product || null;
  }

  async saveProduct(product: Product): Promise<Product> {
    await this.delay(400);
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    
    if (index >= 0) {
      products[index] = product;
    } else {
      if (!product.id) {
        product.id = `prod-${Math.random().toString(36).substr(2, 9)}`;
      }
      products.push(product);
    }
    
    this.setStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.delay(300);
    const products = await this.getProducts();
    const initialLength = products.length;
    const filteredProducts = products.filter((p) => p.id !== id);
    
    if (filteredProducts.length < initialLength) {
      this.setStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, filteredProducts);
      return true;
    }
    return false;
  }

  async getRituals(): Promise<Ritual[]> {
    await this.delay(300);
    return MOCK_RITUALS;
  }

  async getRitualById(id: string): Promise<Ritual | null> {
    await this.delay(200);
    const ritual = MOCK_RITUALS.find((r) => r.id === id);
    return ritual || null;
  }

  async getUserProfile(): Promise<UserProfile> {
    await this.delay(400);
    return this.getStoredData<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    await this.delay(500);
    this.setStoredData<UserProfile>(STORAGE_KEYS.PROFILE, profile);
    return profile;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber'>): Promise<Order> {
    await this.delay(600);
    const orders = this.getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
    
    const newOrder: Order = {
      ...orderData,
      id: `order-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      trackingNumber: `AR-${Math.floor(100000000 + Math.random() * 900000000)}`
    };

    orders.unshift(newOrder); // Las órdenes más nuevas primero
    this.setStoredData<Order[]>(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    await this.delay(450);
    return this.getStoredData<Order[]>(STORAGE_KEYS.ORDERS, []);
  }
}
