import { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../api';
import { supabase } from '../supabase/client';
import type { Category } from '../api/IRepository';

/**
 * Hook que carga las categorías desde Supabase y escucha cambios en tiempo real.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRepository.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('useCategories error:', err);
      setError('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('categories-client')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => load()
      )
      .subscribe();

    return () => { channel.unsubscribe(); supabase.removeChannel(channel); };
  }, [load]);

  /** Nombres de todas las categorías visibles */
  const categoryNames = categories.map(c => c.name);

  /** Subcategorías de una categoría por nombre */
  const subcategoriesFor = (name: string): string[] =>
    categories.find(c => c.name === name)?.subcategories ?? [];

  return { categories, categoryNames, subcategoriesFor, loading, error, reload: load };
}
