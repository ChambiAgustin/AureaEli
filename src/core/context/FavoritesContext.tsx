import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface FavoritesContextValue {
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  clearFavorites: () => void;
}

const FAVS_STORAGE_KEY = 'aurea_favs';
const LEGACY_FAVS_STORAGE_KEY = 'aurea_favorites_v1';

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      const legacySaved = localStorage.getItem(LEGACY_FAVS_STORAGE_KEY);
      if (legacySaved) {
        return JSON.parse(legacySaved);
      }
      return [];
    } catch (e) {
      console.error('Error al inicializar favoritos:', e);
      return [];
    }
  });

  // Sincronizar favoritos locales con el perfil autenticado
  useEffect(() => {
    if (userProfile && userProfile.favorites) {
      setFavorites((prev) => {
        // Unir favoritos locales con los de base de datos sin duplicados
        const merged = Array.from(new Set([...prev, ...userProfile.favorites]));
        return merged;
      });
    }
  }, [userProfile?.id]);

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVS_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error al persistir favoritos en localStorage:', e);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const isCurrentlyFav = favorites.includes(productId);
      const updatedFavs = isCurrentlyFav
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      setFavorites(updatedFavs);

      // Si el usuario está autenticado, sincronizar con Supabase / Repositorio
      if (userProfile) {
        try {
          await updateProfile({ favorites: updatedFavs });
        } catch (err) {
          console.error('Error sincronizando favoritos con el perfil:', err);
        }
      }

      showToast(
        isCurrentlyFav
          ? 'Eliminado de tus intenciones.'
          : 'Guardado en tus intenciones sagradas.',
        'gold'
      );
    },
    [favorites, userProfile, updateProfile, showToast]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const value: FavoritesContextValue = {
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe ser utilizado dentro de un <FavoritesProvider>');
  }
  return context;
};
