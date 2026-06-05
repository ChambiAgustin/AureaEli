import { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../api';
import { supabase } from '../supabase/client';
import type { ContentBlock } from '../api/IRepository';

/**
 * Hook que carga los content blocks desde Supabase y escucha cambios en tiempo real.
 * Uso: const { text } = useContentBlocks();
 *      text('home.hero.title', 'Fallback')
 */
export function useContentBlocks() {
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiRepository.getContentBlocks();
      const map: Record<string, string> = {};
      data.forEach((b: ContentBlock) => {
        map[b.key] = b.value.text ?? '';
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

    // Realtime: escucha cambios en content_blocks
    const channel = supabase
      .channel('content-blocks-client')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'content_blocks' },
        (payload) => {
          const updated = payload.new as { key: string; value: { text: string } };
          setBlocks(prev => ({ ...prev, [updated.key]: updated.value.text ?? '' }));
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); supabase.removeChannel(channel); };
  }, [load]);

  /**
   * Obtiene el texto de un bloque por key.
   * Si no existe o aún está cargando, devuelve el fallback.
   */
  const text = (key: string, fallback: string = ''): string =>
    blocks[key] ?? fallback;

  return { text, loading, blocks };
}
