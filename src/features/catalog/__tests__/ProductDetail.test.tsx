import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProductDetail } from '../ProductDetail';
import type { Product } from '../../../core/api/IRepository';

// Mock contexts
vi.mock('../../../core/context/CartContext', () => ({
  useCart: () => ({
    addItem: vi.fn(),
  }),
}));

vi.mock('../../../core/context/FavoritesContext', () => ({
  useFavorites: () => ({
    isFavorite: vi.fn().mockReturnValue(false),
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock('../../../core/seo/useSEO', () => ({
  useSEO: vi.fn(),
}));

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Bruma Áurica de Lavanda',
  description: 'Bruma relajante para armonizar el campo áurico.',
  sensoryDescription: 'Toques herbales de lavanda y notas etéreas.',
  price: 4500,
  imageUrl: 'https://example.com/lavanda.jpg',
  category: 'brumas',
  subcategory: 'aurea',
  ingredients: ['Lavanda', 'Agua de vertiente'],
  tags: ['calma', 'noche'],
  isFeatured: true,
  isNew: false,
  stock: 10,
  aroma: 'Lavanda Silvestre',
};

describe('ProductDetail Component', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('renderiza la ficha de producto dentro de document.body mediante portal', () => {
    const handleClose = vi.fn();
    render(<ProductDetail product={mockProduct} onClose={handleClose} />);

    expect(screen.getByText('Bruma Áurica de Lavanda')).toBeDefined();
    const backdrop = document.querySelector('.product-detail-backdrop') as HTMLElement;
    expect(backdrop).not.toBeNull();
    expect(backdrop.parentElement).toBe(document.body);
  });

  it('aplica z-index: 9999 al backdrop y z-index: 10000 a la caja del modal', () => {
    const handleClose = vi.fn();
    render(<ProductDetail product={mockProduct} onClose={handleClose} />);

    const backdrop = document.querySelector('.product-detail-backdrop') as HTMLElement;
    const modal = document.querySelector('.product-detail-modal') as HTMLElement;

    expect(backdrop.style.zIndex).toBe('9999');
    expect(backdrop.style.position).toBe('fixed');
    expect(modal.style.zIndex).toBe('10000');
    expect(modal.style.margin).toBe('auto');
  });

  it('bloquea el scroll del body al montarse y lo restaura al desmontarse', () => {
    const handleClose = vi.fn();
    const { unmount } = render(<ProductDetail product={mockProduct} onClose={handleClose} />);

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('cierra el modal al presionar la tecla Escape', () => {
    const handleClose = vi.fn();
    render(<ProductDetail product={mockProduct} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el modal al hacer clic en el botón de cierre', () => {
    const handleClose = vi.fn();
    render(<ProductDetail product={mockProduct} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText('Cerrar detalle de producto');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
