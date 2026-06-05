import { supabase } from '../supabase/client';
import type {
  IRepository,
  Product,
  Category,
  ContentBlock,
  Ritual,
  UserProfile,
  Order,
} from './IRepository';

// ─── Mappers: snake_case (BD) ↔ camelCase (app) ───────────────────────────

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    sensoryDescription: (row.sensory_description as string) ?? '',
    price: Number(row.price),
    promoPrice: row.promo_price != null ? Number(row.promo_price) : undefined,
    stock: Number(row.stock),
    imageUrl: (row.image_url as string) ?? '',
    category: (row.category as string) ?? '',
    subcategory: (row.subcategory as string) ?? '',
    ingredients: (row.ingredients as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    isFeatured: Boolean(row.is_featured),
    isNew: Boolean(row.is_new),
    aroma: (row.aroma as string) ?? '',
    color: (row.color as string) ?? '',
    material: (row.material as string) ?? '',
  };
}

function fromProduct(p: Product): Record<string, unknown> {
  return {
    ...(p.id && !p.id.startsWith('new-') ? { id: p.id } : {}),
    name: p.name,
    description: p.description,
    sensory_description: p.sensoryDescription,
    price: p.price,
    promo_price: p.promoPrice ?? null,
    stock: p.stock,
    image_url: p.imageUrl,
    category: p.category,
    subcategory: p.subcategory,
    ingredients: p.ingredients,
    tags: p.tags,
    is_featured: p.isFeatured,
    is_new: p.isNew,
    aroma: p.aroma,
    color: p.color,
    material: p.material,
  };
}

function toCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    subcategories: (row.subcategories as string[]) ?? [],
    sortOrder: Number(row.sort_order ?? 0),
    isVisible: Boolean(row.is_visible ?? true),
  };
}

function fromCategory(c: Category): Record<string, unknown> {
  return {
    ...(c.id ? { id: c.id } : {}),
    name: c.name,
    subcategories: c.subcategories,
    sort_order: c.sortOrder,
    is_visible: c.isVisible,
  };
}

function toContentBlock(row: Record<string, unknown>): ContentBlock {
  return {
    key: row.key as string,
    label: row.label as string,
    value: row.value as ContentBlock['value'],
    updatedAt: row.updated_at as string | undefined,
  };
}

// ─── Repositorio ──────────────────────────────────────────────────────────

export class SupabaseRepository implements IRepository {

  // ── PRODUCTOS ────────────────────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`getProducts: ${error.message}`);
    return (data ?? []).map(toProduct);
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data ? toProduct(data) : null;
  }

  async saveProduct(product: Product): Promise<Product> {
    const row = fromProduct(product);
    const isNew = !product.id || product.id.startsWith('new-');

    if (isNew) {
      const { data, error } = await supabase
        .from('products')
        .insert(row)
        .select()
        .single();
      if (error) throw new Error(`saveProduct (insert): ${error.message}`);
      return toProduct(data);
    } else {
      const { data, error } = await supabase
        .from('products')
        .update(row)
        .eq('id', product.id)
        .select()
        .single();
      if (error) throw new Error(`saveProduct (update): ${error.message}`);
      return toProduct(data);
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`deleteProduct: ${error.message}`);
    return true;
  }

  // ── CATEGORÍAS ───────────────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`getCategories: ${error.message}`);
    return (data ?? []).map(toCategory);
  }

  async saveCategory(category: Category): Promise<Category> {
    const row = fromCategory(category);
    const isNew = !category.id;

    if (isNew) {
      const { data, error } = await supabase
        .from('categories')
        .insert(row)
        .select()
        .single();
      if (error) throw new Error(`saveCategory (insert): ${error.message}`);
      return toCategory(data);
    } else {
      const { data, error } = await supabase
        .from('categories')
        .update(row)
        .eq('id', category.id)
        .select()
        .single();
      if (error) throw new Error(`saveCategory (update): ${error.message}`);
      return toCategory(data);
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`deleteCategory: ${error.message}`);
    return true;
  }

  // ── CONTENT BLOCKS ───────────────────────────────────────────────────────

  async getContentBlocks(): Promise<ContentBlock[]> {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw new Error(`getContentBlocks: ${error.message}`);
    return (data ?? []).map(toContentBlock);
  }

  async updateContentBlock(
    key: string,
    value: ContentBlock['value']
  ): Promise<ContentBlock> {
    const { data, error } = await supabase
      .from('content_blocks')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw new Error(`updateContentBlock: ${error.message}`);
    return toContentBlock(data);
  }

  // ── RITUALES ─────────────────────────────────────────────────────────────

  async getRituals(): Promise<Ritual[]> {
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`getRituals: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string) ?? '',
      durationMinutes: Number(row.duration_minutes ?? 0),
      audioUrl: (row.audio_url as string) ?? '',
      steps: (row.steps as string[]) ?? [],
      productIds: (row.product_ids as string[]) ?? [],
    }));
  }

  async saveRitual(ritual: Ritual): Promise<Ritual> {
    const { data, error } = await supabase
      .from('rituals')
      .update({
        title: ritual.title,
        description: ritual.description,
        duration_minutes: ritual.durationMinutes,
        audio_url: ritual.audioUrl,
        steps: ritual.steps,
        product_ids: ritual.productIds,
      })
      .eq('id', ritual.id)
      .select()
      .single();

    if (error) throw new Error(`saveRitual: ${error.message}`);
    return {
      id: data.id as string,
      title: data.title as string,
      description: (data.description as string) ?? '',
      durationMinutes: Number(data.duration_minutes ?? 0),
      audioUrl: (data.audio_url as string) ?? '',
      steps: (data.steps as string[]) ?? [],
      productIds: (data.product_ids as string[]) ?? [],
    };
  }

  async getRitualById(id: string): Promise<Ritual | null> {
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data
      ? {
          id: data.id as string,
          title: data.title as string,
          description: (data.description as string) ?? '',
          durationMinutes: Number(data.duration_minutes ?? 0),
          audioUrl: (data.audio_url as string) ?? '',
          steps: (data.steps as string[]) ?? [],
          productIds: (data.product_ids as string[]) ?? [],
        }
      : null;
  }

  // ── USUARIO ──────────────────────────────────────────────────────────────

  async getUserProfile(): Promise<UserProfile> {
    // Por ahora retorna perfil por defecto — en próxima fase se conecta a Supabase Auth
    return {
      id: 'user-default',
      name: 'Alma Aurea',
      email: 'alma@aureaelizabeth.com',
      stressLevel: 'high',
      aromaPreferences: ['Lavanda', 'Sándalo', 'Herbal'],
      skinType: 'sensitive',
      completedRituals: [],
      favorites: [],
    };
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    return profile;
  }

  // ── ÓRDENES ──────────────────────────────────────────────────────────────

  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber'>
  ): Promise<Order> {
    const trackingNumber = `AR-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_profile: orderData.userProfile,
        items: orderData.items,
        total: orderData.total,
        payment_method: orderData.paymentMethod,
        address: orderData.address,
        status: 'pending',
        tracking_number: trackingNumber,
      })
      .select()
      .single();

    if (error) throw new Error(`createOrder: ${error.message}`);

    return {
      id: data.id as string,
      userProfile: orderData.userProfile,
      items: orderData.items,
      status: 'pending',
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      address: orderData.address,
      createdAt: data.created_at as string,
      trackingNumber,
    };
  }

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`getOrders: ${error.message}`);

    return (data ?? []).map((row) => ({
      id: row.id as string,
      userProfile: row.user_profile as UserProfile,
      items: row.items as Order['items'],
      status: row.status as Order['status'],
      total: Number(row.total),
      paymentMethod: row.payment_method as Order['paymentMethod'],
      address: (row.address as string) ?? '',
      createdAt: row.created_at as string,
      trackingNumber: row.tracking_number as string | undefined,
    }));
  }
}
