import { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../api';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { ContentBlock } from '../api/IRepository';

/**
 * Hook que carga los content blocks desde Supabase y escucha cambios en tiempo real.
 * Uso: const { getBlock } = useContentBlocks();
 *      getBlock('home.hero.slogan', 'Fallback...')
 */
export function useContentBlocks() {
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiRepository.getContentBlocks();
      const map: Record<string, string> = {};
      data.forEach((b: ContentBlock) => {
        map[b.key] = b.value?.text ?? '';
      });
      setBlocks(map);
    } catch (err) {
      console.error('useContentBlocks error:', err);
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
      // Realtime: escucha cambios en content_blocks
      channel = supabase
        .channel('content-blocks-client')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'content_blocks' },
          (payload) => {
            if (payload.new && 'key' in payload.new) {
              const updated = payload.new as { key: string; value: { text: string } };
              setBlocks(prev => ({ ...prev, [updated.key]: updated.value?.text ?? '' }));
            } else {
              load();
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime channel error in useContentBlocks:', err);
    }

    return () => {
      try {
        if (channel) {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        }
      } catch (err) {
        console.warn('Error cleaning up content blocks channel:', err);
      }
    };
  }, [load]);

  /**
   * Obtiene el contenido de la clave si existe en el estado de blocks (y no está vacío),
   * o defaultText si no existe o está vacío.
   */
  const getBlock = useCallback((key: string, defaultText: string = ''): string => {
    const val = blocks[key];
    return val && val.trim() !== '' ? val : defaultText;
  }, [blocks]);

  /**
   * Obtiene el texto de un bloque por key (compatibilidad hacia atrás).
   */
  const text = useCallback((key: string, fallback: string = ''): string => {
    return getBlock(key, fallback);
  }, [getBlock]);

  return { text, getBlock, loading, blocks };
}

