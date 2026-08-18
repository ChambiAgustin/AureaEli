import { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../api';
import { supabase, isSupabaseConfigured } from '../supabase/client';
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

    if (!isSupabaseConfigured) {
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('categories-client')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          () => load()
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime channel error in useCategories:', err);
    }

    return () => {
      try {
        if (channel) {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        }
      } catch (err) {
        console.warn('Error cleaning up categories channel:', err);
      }
    };
  }, [load]);

  /** Nombres de todas las categorías visibles */
  const categoryNames = categories.map(c => c.name);

  /** Subcategorías de una categoría por nombre */
  const subcategoriesFor = (name: string): string[] =>
    categories.find(c => c.name === name)?.subcategories ?? [];

  return { categories, categoryNames, subcategoriesFor, loading, error, reload: load };
}
