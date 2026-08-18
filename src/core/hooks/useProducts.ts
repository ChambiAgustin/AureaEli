import { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../api';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { Product } from '../api/IRepository';

/**
 * Hook que carga productos desde Supabase y escucha cambios en tiempo real.
 * @param filter - función opcional para filtrar productos (ej: solo featured)
 */
export function useProducts(filter?: (p: Product) => boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRepository.getProducts();
      setProducts(filter ? data.filter(filter) : data);
    } catch (err) {
      console.error('useProducts error:', err);
      setError('No se pudieron cargar los productos. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();

    if (!isSupabaseConfigured) {
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('products-client')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => load()
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime channel error in useProducts:', err);
    }

    return () => {
      try {
        if (channel) {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        }
      } catch (err) {
        console.warn('Error cleaning up products channel:', err);
      }
    };
  }, [load]);

  return { products, loading, error, reload: load };
}
