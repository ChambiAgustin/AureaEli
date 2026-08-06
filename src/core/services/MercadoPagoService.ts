import type { Order, CartItem } from '../api/IRepository';

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export class MercadoPagoService {
  static async createPreference(order: Order, items: CartItem[]): Promise<MercadoPagoPreferenceResponse> {
    const mpItems = items.map(item => ({
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.promoPrice ?? item.product.price,
      currency_id: 'ARS'
    }));

    const prefId = `PREF-${order.id.slice(0, 8)}-${Date.now()}`;
    const checkoutUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${prefId}`;

    return {
      id: prefId,
      init_point: checkoutUrl,
      sandbox_init_point: checkoutUrl
    };
  }
}
