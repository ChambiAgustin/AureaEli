import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSEO } from '../useSEO';

describe('useSEO Hook', () => {
  beforeEach(() => {
    document.title = '';
    // Limpiar meta tags de prueba previos
    document.head.querySelectorAll('meta').forEach((el) => el.remove());
  });

  it('asigna el título por defecto y meta tags básicos si no se pasan opciones', () => {
    renderHook(() => useSEO());

    expect(document.title).toBe('Aurea Elizabeth — Alquimia Botánica & Ritualidad');

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toContain('Un espacio dedicado a nutrir tu bienestar');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('Aurea Elizabeth — Alquimia Botánica & Ritualidad');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toContain('/corazon.png');

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
  });

  it('actualiza reactivamente document.title, Open Graph y Twitter Cards con props personalizadas', () => {
    const { rerender } = renderHook(
      (props) => useSEO(props),
      {
        initialProps: {
          title: 'Óleo Relajante',
          description: 'Extractos puros botánicos',
          image: '/images/oleo.jpg',
          type: 'product',
        },
      }
    );

    expect(document.title).toBe('Óleo Relajante | Aurea Elizabeth');

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toBe('Extractos puros botánicos');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('Óleo Relajante | Aurea Elizabeth');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toContain('/images/oleo.jpg');

    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute('content')).toBe('product');

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    expect(twitterTitle?.getAttribute('content')).toBe('Óleo Relajante | Aurea Elizabeth');

    // Probar actualización reactiva
    rerender({
      title: 'Vela de Soja & Lavanda',
      description: 'Cera vegetal aromática',
      image: '/images/vela.jpg',
      type: 'product',
    });

    expect(document.title).toBe('Vela de Soja & Lavanda | Aurea Elizabeth');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Cera vegetal aromática');
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain('/images/vela.jpg');
  });
});
