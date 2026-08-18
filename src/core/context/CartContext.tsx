import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '../api/IRepository';
import { useToast } from './ToastContext';

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export interface CartContextValue {
  items: CartItem[];
  cartItems: CartItem[];
  isCartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  cartSavings: number;
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  addMultipleItems: (products: Product[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  syncWithProducts: (freshProducts: Product[]) => void;
}

const CART_STORAGE_KEY = 'aurea_cart_v2';
const LEGACY_CART_STORAGE_KEY = 'aurea_cart_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      // Migración desde versión v1 si existe
      const legacySaved = localStorage.getItem(LEGACY_CART_STORAGE_KEY);
      if (legacySaved) {
        const parsed = JSON.parse(legacySaved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch (e) {
      console.error('Error al inicializar el carrito desde localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Persistencia automática
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error al persistir el carrito en localStorage:', e);
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback(
    (product: Product, quantity: number = 1, variant?: string) => {
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => item.product.id === product.id && item.variant === variant
        );

        if (existingIndex > -1) {
          const updated = [...prevItems];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
          };
          showToast(`Se incrementó la dosis de: ${product.name}`, 'gold');
          return updated;
        }

        showToast(`Agregado a tu altar: ${product.name}`, 'gold');
        return [...prevItems, { product, quantity, variant }];
      });
    },
    [showToast]
  );

  const addMultipleItems = useCallback(
    (products: Product[]) => {
      setItems((prevItems) => {
        let updated = [...prevItems];
        products.forEach((product) => {
          const existingIndex = updated.findIndex((item) => item.product.id === product.id);
          if (existingIndex > -1) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + 1,
            };
          } else {
            updated.push({ product, quantity: 1 });
          }
        });
        showToast(`Se agregaron ${products.length} elementos a tu altar`, 'gold');
        return updated;
      });
    },
    [showToast]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
      showToast('Elemento removido del altar.', 'info');
    },
    [showToast]
  );

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const syncWithProducts = useCallback((freshProducts: Product[]) => {
    setItems((prevItems) => {
      return prevItems
        .map((item) => {
          const match = freshProducts.find((p) => p.id === item.product.id);
          return match ? { ...item, product: match } : item;
        })
        .filter((item) => freshProducts.some((p) => p.id === item.product.id));
    });
  }, []);

  // Cálculos reactivos memorizados
  const cartCount = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const cartTotal = useMemo(() => {
    return items.reduce((acc, curr) => {
      const price = curr.product.promoPrice ?? curr.product.price;
      return acc + price * curr.quantity;
    }, 0);
  }, [items]);

  const cartSavings = useMemo(() => {
    return items.reduce((acc, curr) => {
      if (curr.product.promoPrice && curr.product.promoPrice < curr.product.price) {
        return acc + (curr.product.price - curr.product.promoPrice) * curr.quantity;
      }
      return acc;
    }, 0);
  }, [items]);

  const value: CartContextValue = {
    items,
    cartItems: items,
    isCartOpen,
    cartCount,
    cartTotal,
    cartSavings,
    addItem,
    addMultipleItems,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    syncWithProducts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un <CartProvider>');
  }
  return context;
};
