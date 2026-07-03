export interface Product {
  id: string;
  name: string;
  description: string;
  sensoryDescription: string;
  price: number;
  promoPrice?: number; // Precio promocional opcional
  stock: number;
  imageUrl: string;
  category: string;
  subcategory: string;
  ingredients: string[];
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  aroma: string;
  color: string;
  material: string;
}

// Categoría dinámica (editable desde el admin)
export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  sortOrder: number;
  isVisible: boolean;
}

// Bloque de contenido editable (textos de la página)
export interface ContentBlock {
  key: string;
  label: string;
  value: { text: string; [key: string]: unknown };
  updatedAt?: string;
}

export interface Ritual {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  audioUrl: string;
  steps: string[];
  productIds: string[]; // Productos recomendados para el kit
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  stressLevel: string;
  aromaPreferences: string[];
  skinType: string;
  completedRituals: string[]; // IDs de rituales completados
  favorites: string[]; // IDs de productos favoritos
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userProfile: UserProfile;
  items: OrderItem[];
  status: 'pending' | 'completed' | 'shipped';
  total: number;
  paymentMethod: 'mercadopago' | 'whatsapp';
  address: string;
  createdAt: string;
  trackingNumber?: string;
}

export interface IRepository {
  // Productos
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  saveProduct(product: Product): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;

  // Categorías dinámicas
  // includeHidden: true para el admin, que necesita ver también las ocultas
  getCategories(includeHidden?: boolean): Promise<Category[]>;
  saveCategory(category: Category): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;

  // Content blocks (textos editables)
  getContentBlocks(): Promise<ContentBlock[]>;
  updateContentBlock(key: string, value: ContentBlock['value']): Promise<ContentBlock>;

  // Rituales
  getRituals(): Promise<Ritual[]>;
  getRitualById(id: string): Promise<Ritual | null>;
  saveRitual(ritual: Ritual): Promise<Ritual>;

  // Usuario y órdenes
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(profile: UserProfile): Promise<UserProfile>;
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber'>): Promise<Order>;
  getOrders(): Promise<Order[]>;
}
