import { describe, it, expect } from 'vitest';
import {
  mapRitual,
  toProduct,
  fromProduct,
  toCategory,
  fromCategory,
  toContentBlock,
  toProfile,
  mapOrder,
} from '../SupabaseRepository';
import type { Product } from '../IRepository';

describe('SupabaseRepository Mappers', () => {
  describe('mapRitual audio assignment and structure', () => {
    it('asigna audio calma si el título contiene "calma"', () => {
      const dbRow = {
        id: 'ritual-1',
        title: 'Ritual de Calma Nocturna',
        description: 'Paz para antes de dormir',
        duration_minutes: 10,
        audio_url: '',
        steps: ['Paso 1', 'Paso 2'],
        product_ids: ['prod-1'],
      };

      const mapped = mapRitual(dbRow);
      expect(mapped.audioUrl).toBe('/audio/calma-mindfulness.mp3');
      expect(mapped.id).toBe('ritual-1');
      expect(mapped.title).toBe('Ritual de Calma Nocturna');
      expect(mapped.durationMinutes).toBe(10);
      expect(mapped.steps).toEqual(['Paso 1', 'Paso 2']);
      expect(mapped.productIds).toEqual(['prod-1']);
    });

    it('asigna audio florecimiento si el título contiene "florecimiento"', () => {
      const dbRow = {
        id: 'ritual-2',
        title: 'Ritual de Florecimiento & Creatividad',
        description: 'Despertar de los sentidos',
        duration_minutes: 15,
        audio_url: 'https://www.soundhelix.com/audio1.mp3', // soundhelix reemplazo
        steps: ['Respirar', 'Intencionar'],
        product_ids: ['prod-2'],
      };

      const mapped = mapRitual(dbRow);
      expect(mapped.audioUrl).toBe('/audio/florecimiento-meditacion.mp3');
    });

    it('asigna audio desconexion si el título contiene "desconexion" o "desconex"', () => {
      const dbRow = {
        id: 'ritual-3',
        title: 'Ritual de Desconexión Digital Profunda',
        description: 'Volver al eje',
        duration_minutes: 8,
        audio_url: null,
        steps: [],
        product_ids: [],
      };

      const mapped = mapRitual(dbRow);
      expect(mapped.audioUrl).toBe('/audio/desconexion-weightless.mp3');
    });

    it('asigna audio default si no coincide ninguna keyword', () => {
      const dbRow = {
        id: 'ritual-unknown',
        title: 'Ritual Energético Sagrado',
        audio_url: '',
      };

      const mapped = mapRitual(dbRow);
      expect(mapped.audioUrl).toBe('/audio/calma-mindfulness.mp3');
    });

    it('mantiene la audio_url si ya es una URL válida personalizada distinta de soundhelix', () => {
      const customAudio = 'https://storage.supabase.co/audios/custom-meditation.mp3';
      const dbRow = {
        id: 'ritual-custom',
        title: 'Ritual Personalizado',
        audio_url: customAudio,
      };

      const mapped = mapRitual(dbRow);
      expect(mapped.audioUrl).toBe(customAudio);
    });
  });

  describe('Product Mappers (toProduct & fromProduct)', () => {
    it('transforma fila de base de datos snake_case a Product camelCase con toProduct', () => {
      const dbProduct = {
        id: 'prod-100',
        name: 'Óleo de Jazmín & Nerolí',
        description: 'Esencia pura destilada',
        sensory_description: 'Aroma floral dulce y relajante',
        price: '18500',
        promo_price: '14500',
        stock: '12',
        image_url: 'https://aurea.com/oleo.jpg',
        category: 'Aromaterapia',
        subcategory: 'Aceites',
        ingredients: ['Jazmín', 'Nerolí', 'Jojoba'],
        tags: ['relax', 'floral'],
        is_featured: 1,
        is_new: 0,
        aroma: 'Floral',
        color: 'Dorado',
        material: 'Vidrio ámbar',
      };

      const product = toProduct(dbProduct);

      expect(product.id).toBe('prod-100');
      expect(product.name).toBe('Óleo de Jazmín & Nerolí');
      expect(product.sensoryDescription).toBe('Aroma floral dulce y relajante');
      expect(product.price).toBe(18500);
      expect(product.promoPrice).toBe(14500);
      expect(product.stock).toBe(12);
      expect(product.imageUrl).toBe('https://aurea.com/oleo.jpg');
      expect(product.isFeatured).toBe(true);
      expect(product.isNew).toBe(false);
      expect(product.ingredients).toEqual(['Jazmín', 'Nerolí', 'Jojoba']);
      expect(product.tags).toEqual(['relax', 'floral']);
      expect(product.aroma).toBe('Floral');
    });

    it('maneja promo_price nulo o indefinido correctamente en toProduct', () => {
      const dbProduct = {
        id: 'prod-101',
        name: 'Sahumerio Artesanal',
        price: 3500,
        promo_price: null,
        stock: 50,
      };

      const product = toProduct(dbProduct);
      expect(product.promoPrice).toBeUndefined();
      expect(product.description).toBe('');
      expect(product.ingredients).toEqual([]);
    });

    it('transforma objeto Product de aplicación a payload snake_case con fromProduct', () => {
      const appProduct: Product = {
        id: 'prod-200',
        name: 'Vela Botánica Sanadora',
        description: 'Vela de cera de soja pura',
        sensoryDescription: 'Toques de sándalo y cedro',
        price: 12000,
        promoPrice: 9500,
        stock: 8,
        imageUrl: '/images/vela-sanadora.png',
        category: 'Velas',
        subcategory: 'Soja',
        ingredients: ['Soja vegetal', 'Sándalo'],
        tags: ['sanacion'],
        isFeatured: true,
        isNew: true,
        aroma: 'Amaderado',
        color: 'Crema',
        material: 'Cerámica',
      };

      const row = fromProduct(appProduct);

      expect(row.id).toBe('prod-200');
      expect(row.name).toBe('Vela Botánica Sanadora');
      expect(row.sensory_description).toBe('Toques de sándalo y cedro');
      expect(row.price).toBe(12000);
      expect(row.promo_price).toBe(9500);
      expect(row.stock).toBe(8);
      expect(row.image_url).toBe('/images/vela-sanadora.png');
      expect(row.is_featured).toBe(true);
      expect(row.is_new).toBe(true);
    });

    it('omite el id si es nuevo (prefijo new- o vacío) en fromProduct', () => {
      const newProduct: Product = {
        id: 'new-12345',
        name: 'Nuevo Aceite Alquímico',
        description: '',
        sensoryDescription: '',
        price: 5000,
        stock: 10,
        imageUrl: '',
        category: 'Alquimia',
        subcategory: '',
        ingredients: [],
        tags: [],
        isFeatured: false,
        isNew: true,
        aroma: 'Lavanda',
        color: 'Dorado',
        material: 'Cera de soja',
      };

      const row = fromProduct(newProduct);
      expect(row.id).toBeUndefined();
    });
  });

  describe('Category, ContentBlock, Profile & Order Mappers', () => {
    it('mapea categorías correctamente con toCategory y fromCategory', () => {
      const dbCategory = {
        id: 'cat-1',
        name: 'Aromaterapia',
        subcategories: ['Brumas', 'Óleos'],
        sort_order: 1,
        is_visible: true,
      };

      const category = toCategory(dbCategory);
      expect(category.id).toBe('cat-1');
      expect(category.name).toBe('Aromaterapia');
      expect(category.subcategories).toEqual(['Brumas', 'Óleos']);
      expect(category.sortOrder).toBe(1);
      expect(category.isVisible).toBe(true);

      const dbRow = fromCategory(category);
      expect(dbRow.sort_order).toBe(1);
      expect(dbRow.is_visible).toBe(true);
    });

    it('mapea bloques de contenido con toContentBlock', () => {
      const dbBlock = {
        key: 'home.hero.slogan',
        label: 'Slogan Principal',
        value: { text: 'Alquimia Botánica & Ritualidad Consciente' },
        updated_at: '2026-08-18T10:00:00Z',
      };

      const block = toContentBlock(dbBlock);
      expect(block.key).toBe('home.hero.slogan');
      expect(block.label).toBe('Slogan Principal');
      expect(block.value?.text).toBe('Alquimia Botánica & Ritualidad Consciente');
      expect(block.updatedAt).toBe('2026-08-18T10:00:00Z');
    });

    it('mapea perfil de usuario con toProfile', () => {
      const dbProfile = {
        id: 'user-123',
        name: 'Agustín',
        email: 'agustin@aurea.com',
        stress_level: 'high',
        aroma_preferences: ['Lavanda', 'Sándalo'],
        skin_type: 'sensitive',
        completed_rituals: ['ritual-calma'],
        favorites: ['prod-1'],
      };

      const profile = toProfile(dbProfile);
      expect(profile.id).toBe('user-123');
      expect(profile.stressLevel).toBe('high');
      expect(profile.aromaPreferences).toEqual(['Lavanda', 'Sándalo']);
      expect(profile.skinType).toBe('sensitive');
      expect(profile.completedRituals).toEqual(['ritual-calma']);
    });

    it('mapea órdenes de compra con mapOrder', () => {
      const dbOrder = {
        id: 'order-999',
        user_id: 'user-123',
        items: [{ product: { id: 'prod-1', name: 'Bruma' }, quantity: 2 }],
        status: 'completed',
        total: 16000,
        payment_method: 'mercadopago',
        address: 'Av. Libertador 1234',
        created_at: '2026-08-18T12:00:00Z',
        tracking_number: 'AR-999888',
        customer_phone: '11 1234-5678',
        mercadopago_preference_id: 'mp-pref-123',
        payment_status: 'approved',
      };

      const order = mapOrder(dbOrder);
      expect(order.id).toBe('order-999');
      expect(order.total).toBe(16000);
      expect(order.status).toBe('completed');
      expect(order.paymentMethod).toBe('mercadopago');
      expect(order.trackingNumber).toBe('AR-999888');
      expect(order.mercadopagoPreferenceId).toBe('mp-pref-123');
      expect(order.paymentStatus).toBe('approved');
    });
  });
});
