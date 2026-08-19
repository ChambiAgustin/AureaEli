import { supabase } from '../supabase/client';
import type { Order, CartItem } from '../api/IRepository';

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
  isDemo?: boolean;
}

export class MercadoPagoService {
  /**
   * Crea una preferencia de pago en Mercado Pago Checkout Pro mediante Supabase Edge Functions.
   * Cuenta con fallback transparente en caso de desarrollo o ausencia de credenciales.
   */
  static async createPreference(
    order: Order,
    items: CartItem[]
  ): Promise<MercadoPagoPreferenceResponse> {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const payload = {
      orderId: order.id,
      items: items.map((item) => ({
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.promoPrice ?? item.product.price,
        currency_id: 'ARS',
        description: item.product.description || undefined,
        picture_url: item.product.imageUrl || undefined,
      })),
      payer: {
        name: order.userProfile?.name || 'Cliente Aurea',
        email: order.userProfile?.email || 'cliente@aurea.com',
        phone: order.customerPhone || undefined,
        address: order.address || undefined,
      },
      backUrls: {
        success: `${origin}/checkout?status=success&order_id=${encodeURIComponent(order.id)}`,
        failure: `${origin}/checkout?status=failure&order_id=${encodeURIComponent(order.id)}`,
        pending: `${origin}/checkout?status=pending&order_id=${encodeURIComponent(order.id)}`,
      },
    };

    try {
      const { data, error } = await supabase.functions.invoke<MercadoPagoPreferenceResponse>(
        'create-mp-preference',
        {
          body: payload,
        }
      );

      if (error) {
        console.warn(
          '[MercadoPagoService] No se pudo generar la preferencia vía Edge Function. Aplicando fallback de desarrollo:',
          error
        );
        return this.getFallbackPreference(order);
      }

      if (data && data.init_point && data.id) {
        return data;
      }

      console.warn(
        '[MercadoPagoService] Respuesta inesperada de Edge Function, aplicando fallback:',
        data
      );
      return this.getFallbackPreference(order);
    } catch (err) {
      console.warn(
        '[MercadoPagoService] Error de red o invocación en createPreference. Utilizando fallback:',
        err
      );
      return this.getFallbackPreference(order);
    }
  }

  /**
   * Proveedor de preferencia simulada para entornos locales / sin MP_ACCESS_TOKEN configurado.
   */
  private static getFallbackPreference(order: Order): MercadoPagoPreferenceResponse {
    return {
      id: `demo-${order.id}`,
      isDemo: true,
    };
  }
}

