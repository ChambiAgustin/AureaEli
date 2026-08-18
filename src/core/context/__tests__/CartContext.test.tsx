import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { ToastProvider } from '../ToastContext';
import type { Product } from '../../api/IRepository';

const mockProduct1: Product = {
  id: 'prod-1',
  name: 'Bruma Áurea de Lavanda',
  description: 'Bruma relajante botánica',
  sensoryDescription: 'Toque etéreo de lavanda silvestre',
  price: 10000,
  promoPrice: 8000,
  stock: 15,
  imageUrl: '/images/bruma.jpg',
  category: 'Aromaterapia',
  subcategory: 'Brumas',
  ingredients: ['Lavanda', 'Agua de rosas'],
  tags: ['calma', 'noche'],
  isFeatured: true,
  isNew: false,
};

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Vela de Soja & Sándalo',
  description: 'Vela aromática pura',
  sensoryDescription: 'Calidez amaderada profunda',
  price: 15000,
  stock: 10,
  imageUrl: '/images/vela.jpg',
  category: 'Velas',
  subcategory: 'Cera de soja',
  ingredients: ['Cera de soja', 'Aceite de sándalo'],
  tags: ['meditacion'],
  isFeatured: false,
  isNew: true,
};

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>
    <CartProvider>{children}</CartProvider>
  </ToastProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('inicializa con carrito vacío si no hay datos guardados', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.cartCount).toBe(0);
    expect(result.current.cartTotal).toBe(0);
    expect(result.current.cartSavings).toBe(0);
    expect(result.current.isCartOpen).toBe(false);
  });

  it('permite agregar un producto con addItem y actualiza cartCount', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct1, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-1');
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.cartCount).toBe(2);
  });

  it('calcula correctamente el subtotal con promoPrice y cartSavings', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // mockProduct1: price 10000, promoPrice 8000 (qty 2) -> total 16000, savings 4000
    // mockProduct2: price 15000, promoPrice undefined (qty 1) -> total 15000, savings 0
    act(() => {
      result.current.addItem(mockProduct1, 2);
      result.current.addItem(mockProduct2, 1);
    });

    expect(result.current.cartTotal).toBe(16000 + 15000); // 31000
    expect(result.current.cartSavings).toBe((10000 - 8000) * 2); // 4000
    expect(result.current.cartCount).toBe(3);
  });

  it('incrementa la cantidad si se vuelve a agregar el mismo producto', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct1, 1);
    });
    expect(result.current.items[0].quantity).toBe(1);

    act(() => {
      result.current.addItem(mockProduct1, 3);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(4);
    expect(result.current.cartCount).toBe(4);
  });

  it('remueve un producto correctamente con removeItem', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct1, 1);
      result.current.addItem(mockProduct2, 1);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem('prod-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-2');
    expect(result.current.cartCount).toBe(1);
  });

  it('actualiza la cantidad con updateQuantity y no disminuye por debajo de 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct1, 2);
    });

    act(() => {
      result.current.updateQuantity('prod-1', 1);
    });
    expect(result.current.items[0].quantity).toBe(3);

    act(() => {
      result.current.updateQuantity('prod-1', -5);
    });
    expect(result.current.items[0].quantity).toBe(1); // Math.max(1, 3 - 5) = 1
  });

  it('permite agregar múltiples items de una vez con addMultipleItems', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addMultipleItems([mockProduct1, mockProduct2]);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.cartCount).toBe(2);
  });

  it('vacía el carrito con clearCart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct1, 2);
      result.current.addItem(mockProduct2, 1);
    });
    expect(result.current.cartCount).toBe(3);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.cartCount).toBe(0);
    expect(result.current.cartTotal).toBe(0);
  });

  it('controla el estado de apertura con openCart, closeCart y toggleCart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.isCartOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });
    expect(result.current.isCartOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });
    expect(result.current.isCartOpen).toBe(false);

    act(() => {
      result.current.toggleCart();
    });
    expect(result.current.isCartOpen).toBe(true);
  });

  it('sincroniza items con productos actualizados con syncWithProducts', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct1, 2);
      result.current.addItem(mockProduct2, 1);
    });

    const updatedProduct1: Product = {
      ...mockProduct1,
      price: 12000,
      promoPrice: 9000,
    };

    act(() => {
      // Pasamos solo el producto 1 actualizado; el producto 2 se excluye si ya no existe en el catálogo fresco
      result.current.syncWithProducts([updatedProduct1]);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.price).toBe(12000);
    expect(result.current.items[0].product.promoPrice).toBe(9000);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('persiste automáticamente los items en localStorage con la clave aurea_cart_v2', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct1, 2);
    });

    const saved = localStorage.getItem('aurea_cart_v2');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].product.id).toBe('prod-1');
    expect(parsed[0].quantity).toBe(2);
  });

  it('carga datos previos desde localStorage v2 al inicializar', () => {
    const initialItems = [{ product: mockProduct2, quantity: 3 }];
    localStorage.setItem('aurea_cart_v2', JSON.stringify(initialItems));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-2');
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.cartCount).toBe(3);
  });

  it('migra datos desde localStorage v1 si v2 no existe', () => {
    const legacyItems = [{ product: mockProduct1, quantity: 1 }];
    localStorage.setItem('aurea_cart_v1', JSON.stringify(legacyItems));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-1');
    expect(result.current.cartCount).toBe(1);
  });
});
