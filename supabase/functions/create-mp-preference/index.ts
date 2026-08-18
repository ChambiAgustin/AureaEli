import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PreferenceItem {
  title: string;
  unit_price: number;
  quantity: number;
  currency_id?: string;
  description?: string;
  picture_url?: string;
}

interface PreferencePayer {
  name?: string;
  surname?: string;
  email?: string;
  phone?: {
    area_code?: string;
    number?: string;
  } | string;
  address?: {
    street_name?: string;
    street_number?: number;
    zip_code?: string;
  } | string;
}

interface PreferencePayload {
  orderId: string;
  items: PreferenceItem[];
  payer?: PreferencePayer;
  backUrls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
}

Deno.serve(async (req: Request) => {
  // Manejo de CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) {
      console.warn('[create-mp-preference] Falta MP_ACCESS_TOKEN en las variables de entorno.');
      return new Response(
        JSON.stringify({
          error: 'MP_ACCESS_TOKEN_MISSING',
          message: 'No se ha configurado la variable de entorno MP_ACCESS_TOKEN en Supabase Edge Functions.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: PreferencePayload = await req.json();
    const { orderId, items, payer, backUrls } = body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'INVALID_PAYLOAD',
          message: 'Se requiere orderId y al menos un item para crear la preferencia de pago.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Formateo de Items para Mercado Pago
    const formattedItems = items.map((item) => ({
      title: item.title || 'Producto Aurea Elizabeth',
      unit_price: Number(item.unit_price) || 0,
      quantity: Number(item.quantity) || 1,
      currency_id: 'ARS',
      ...(item.description ? { description: item.description } : {}),
      ...(item.picture_url ? { picture_url: item.picture_url } : {}),
    }));

    // Formateo de Payer
    let formattedPhone = undefined;
    if (typeof payer?.phone === 'string' && payer.phone.trim()) {
      formattedPhone = { number: payer.phone.replace(/\D/g, '') };
    } else if (payer?.phone && typeof payer.phone === 'object') {
      formattedPhone = payer.phone;
    }

    let formattedAddress = undefined;
    if (typeof payer?.address === 'string' && payer.address.trim()) {
      formattedAddress = { street_name: payer.address };
    } else if (payer?.address && typeof payer.address === 'object') {
      formattedAddress = payer.address;
    }

    const formattedPayer = {
      name: payer?.name || 'Cliente Aurea',
      surname: payer?.surname || '',
      email: payer?.email || 'cliente@aurea.com',
      ...(formattedPhone ? { phone: formattedPhone } : {}),
      ...(formattedAddress ? { address: formattedAddress } : {}),
    };

    // URLs de Retorno
    const defaultOrigin = req.headers.get('origin') || req.headers.get('referer') || 'https://aurea-elizabeth.vercel.app';
    const cleanOrigin = defaultOrigin.endsWith('/') ? defaultOrigin.slice(0, -1) : defaultOrigin;

    const mpBackUrls = {
      success: backUrls?.success || `${cleanOrigin}/checkout?status=success&order_id=${encodeURIComponent(orderId)}`,
      failure: backUrls?.failure || `${cleanOrigin}/checkout?status=failure&order_id=${encodeURIComponent(orderId)}`,
      pending: backUrls?.pending || `${cleanOrigin}/checkout?status=pending&order_id=${encodeURIComponent(orderId)}`,
    };

    const mpBody = {
      items: formattedItems,
      payer: formattedPayer,
      back_urls: mpBackUrls,
      auto_return: 'approved',
      external_reference: orderId,
      statement_descriptor: 'AUREA ELIZABETH',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(mpBody),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('[create-mp-preference] Error retornado por Mercado Pago API:', mpData);
      return new Response(
        JSON.stringify({
          error: 'MP_API_ERROR',
          message: mpData.message || 'Error al comunicarse con Mercado Pago',
          details: mpData,
        }),
        {
          status: mpRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point || mpData.init_point,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[create-mp-preference] Excepción no controlada:', errMessage);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_SERVER_ERROR',
        message: errMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
