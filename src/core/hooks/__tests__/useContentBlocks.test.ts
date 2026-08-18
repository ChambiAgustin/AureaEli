import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useContentBlocks } from '../useContentBlocks';
import { apiRepository } from '../../api';
import type { ContentBlock } from '../../api/IRepository';

// Mock del cliente Supabase Realtime
vi.mock('../../supabase/client', () => ({
  isSupabaseConfigured: true,
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock del repositorio
vi.mock('../../api', () => ({
  apiRepository: {
    getContentBlocks: vi.fn(),
  },
}));

describe('useContentBlocks', () => {
  const mockBlocks: ContentBlock[] = [
    {
      key: 'home.hero.title',
      label: 'Título Hero',
      value: { text: 'Alquimia Botánica & Ritualidad' },
    },
    {
      key: 'home.hero.subtitle',
      label: 'Subtítulo Hero',
      value: { text: 'Descubrí la paz en tu rutina' },
    },
    {
      key: 'empty.block',
      label: 'Bloque Vacío',
      value: { text: '   ' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga los bloques de contenido iniciales y finaliza el estado de loading', async () => {
    vi.mocked(apiRepository.getContentBlocks).mockResolvedValueOnce(mockBlocks);

    const { result } = renderHook(() => useContentBlocks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.blocks['home.hero.title']).toBe('Alquimia Botánica & Ritualidad');
    expect(result.current.blocks['home.hero.subtitle']).toBe('Descubrí la paz en tu rutina');
  });

  it('retorna el texto del CMS cuando la clave existe y no está vacía', async () => {
    vi.mocked(apiRepository.getContentBlocks).mockResolvedValueOnce(mockBlocks);

    const { result } = renderHook(() => useContentBlocks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const val = result.current.getBlock('home.hero.title', 'Fallback por defecto');
    expect(val).toBe('Alquimia Botánica & Ritualidad');
  });

  it('retorna el fallback cuando la clave no existe en el CMS', async () => {
    vi.mocked(apiRepository.getContentBlocks).mockResolvedValueOnce(mockBlocks);

    const { result } = renderHook(() => useContentBlocks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const fallbackVal = result.current.getBlock('non.existent.key', 'Texto alternativo seguro');
    expect(fallbackVal).toBe('Texto alternativo seguro');
  });

  it('retorna el fallback cuando el bloque existe pero contiene solo espacios en blanco', async () => {
    vi.mocked(apiRepository.getContentBlocks).mockResolvedValueOnce(mockBlocks);

    const { result } = renderHook(() => useContentBlocks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const val = result.current.getBlock('empty.block', 'Texto de respaldo por estar vacío');
    expect(val).toBe('Texto de respaldo por estar vacío');
  });

  it('el método text funciona como alias compatible con getBlock', async () => {
    vi.mocked(apiRepository.getContentBlocks).mockResolvedValueOnce(mockBlocks);

    const { result } = renderHook(() => useContentBlocks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.text('home.hero.title', 'Fallback')).toBe('Alquimia Botánica & Ritualidad');
    expect(result.current.text('inexistente', 'Fallback')).toBe('Fallback');
  });

  it('maneja errores en getContentBlocks de forma resiliente', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(apiRepository.getContentBlocks).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useContentBlocks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.blocks).toEqual({});
    expect(result.current.getBlock('any.key', 'Respaldo seguro')).toBe('Respaldo seguro');

    consoleSpy.mockRestore();
  });
});
