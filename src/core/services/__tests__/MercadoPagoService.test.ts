import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MercadoPagoService } from '../MercadoPagoService';
import { supabase } from '../../supabase/client';
import type { Order, CartItem } from '../../api/IRepository';

vi.mock('../../supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('MercadoPagoService', () => {
  const mockOrder: Order = {
    id: 'ord-test-12345',
    userProfile: {
      id: 'usr-1',
      name: 'Alma Test',
      email: 'alma@test.com',
      stressLevel: 'low',
      aromaPreferences: [],
      skinType: 'normal',
      completedRituals: [],
      favorites: [],
    },
    items: [],
    status: 'pending',
    total: 15000,
    paymentMethod: 'mercadopago',
    address: 'Av. Libertador 1234',
    createdAt: '2026-08-19T00:00:00.000Z',
    customerPhone: '1122334455',
  };

  const mockItems: CartItem[] = [
    {
      product: {
        id: 'p-1',
        name: 'Vela Aromática Mirra',
        description: 'Vela de cera de soja con aroma a mirra y sándalo.',
        sensoryDescription: 'Cálido',
        price: 15000,
        stock: 5,
        imageUrl: 'https://example.com/vela.jpg',
        category: 'velas',
        subcategory: 'rituales',
        ingredients: ['Soja', 'Mirra'],
        tags: ['calma'],
        isFeatured: true,
        isNew: false,
      },
      quantity: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna la preferencia real cuando la Edge Function responde exitosamente con init_point', async () => {
    const mockMpResponse = {
      id: 'mp-real-pref-999',
      init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mp-real-pref-999',
      sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mp-real-pref-999',
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: mockMpResponse,
      error: null,
    } as any);

    const result = await MercadoPagoService.createPreference(mockOrder, mockItems);

    expect(result).toEqual(mockMpResponse);
    expect(result.id).toBe('mp-real-pref-999');
    expect(result.init_point).toBe('https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mp-real-pref-999');
    expect(result.isDemo).toBeUndefined();
  });

  it('retorna fallback demo sin URLs falsas cuando la Edge Function falla con error', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: new Error('Missing MP_ACCESS_TOKEN or Edge function error'),
    } as any);

    const result = await MercadoPagoService.createPreference(mockOrder, mockItems);

    expect(result).toEqual({
      id: `demo-${mockOrder.id}`,
      isDemo: true,
    });
    expect(result.init_point).toBeUndefined();
    expect(result.sandbox_init_point).toBeUndefined();
  });

  it('retorna fallback demo si la Edge Function responde data sin init_point', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { id: 'some-empty-data' },
      error: null,
    } as any);

    const result = await MercadoPagoService.createPreference(mockOrder, mockItems);

    expect(result).toEqual({
      id: `demo-${mockOrder.id}`,
      isDemo: true,
    });
    expect(result.init_point).toBeUndefined();
  });

  it('retorna fallback demo si ocurre una excepción de red', async () => {
    vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(new Error('Network offline'));

    const result = await MercadoPagoService.createPreference(mockOrder, mockItems);

    expect(result).toEqual({
      id: `demo-${mockOrder.id}`,
      isDemo: true,
    });
  });
});
