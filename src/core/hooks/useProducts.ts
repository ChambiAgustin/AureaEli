import { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../api';
import { supabase } from '../supabase/client';
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

    const channel = supabase
      .channel('products-client')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => load()
      )
      .subscribe();

    return () => { channel.unsubscribe(); supabase.removeChannel(channel); };
  }, [load]);

  return { products, loading, error, reload: load };
}
