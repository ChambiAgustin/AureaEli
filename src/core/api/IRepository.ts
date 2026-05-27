export interface Product {
  id: string;
  name: string;
  description: string;
  sensoryDescription: string; // Ej: "Una fragancia cálida pensada para acompañar..."
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  subcategory: string;
  ingredients: string[];
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  aroma: string; // Para filtros
  color: string;
  material: string;
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
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  saveProduct(product: Product): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  getRituals(): Promise<Ritual[]>;
  getRitualById(id: string): Promise<Ritual | null>;
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(profile: UserProfile): Promise<UserProfile>;
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber'>): Promise<Order>;
  getOrders(): Promise<Order[]>;
}
