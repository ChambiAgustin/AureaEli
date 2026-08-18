import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { apiRepository } from '../api';
import type { UserProfile } from '../api/IRepository';
import { useToast } from './ToastContext';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const checkIsAdmin = useCallback(async (userId: string, email?: string): Promise<boolean> => {
    try {
      // 1. Verificación en tabla de admin_users de Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return true;
      }

      // 2. Verificación secundaria por metadatos o dominios designados
      if (email && (email.endsWith('@aureaelizabeth.com') || email.endsWith('@aurea.com'))) {
        return true;
      }
    } catch (err) {
      console.warn('Error verificando privilegios administrativos:', err);
    }
    return false;
  }, []);

  const loadUserProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession || !currentSession.user) {
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      setIsLoading(false);
      return null;
    }

    setUser(currentSession.user);
    setSession(currentSession);

    try {
      // Cargar perfil de usuario desde el repositorio activo
      const profile = await apiRepository.getUserProfile();
      setUserProfile(profile);

      // Verificar rol administrativo
      const adminStatus = await checkIsAdmin(currentSession.user.id, currentSession.user.email);
      setIsAdmin(adminStatus);

      return profile;
    } catch (err) {
      console.error('Error cargando perfil del usuario:', err);
      // Fallback básico si falla la carga completa del perfil
      const fallbackProfile: UserProfile = {
        id: currentSession.user.id,
        name: (currentSession.user.user_metadata?.name as string) || currentSession.user.email?.split('@')[0] || 'Alma Aurea',
        email: currentSession.user.email || '',
        stressLevel: 'medium',
        aromaPreferences: [],
        skinType: 'normal',
        completedRituals: [],
        favorites: [],
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    } finally {
      setIsLoading(false);
    }
  }, [checkIsAdmin]);

  // Inicialización de sesión y suscripción en tiempo real a eventos de Auth
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        loadUserProfile(initialSession);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (isMounted) {
        await loadUserProfile(newSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    return loadUserProfile(currentSession);
  }, [loadUserProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      const userEmail = email.toLowerCase().trim();

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password,
        });

        if (error) {
          const msg =
            error.message === 'Invalid login credentials'
              ? 'Email o contraseña incorrectos.'
              : error.message;
          showToast(msg, 'error');
          return { success: false, error: msg };
        }

        if (data.session) {
          const profile = await loadUserProfile(data.session);
          showToast(`Bienvenida de regreso, ${profile?.name || 'Alma'}.`, 'success');
        }

        closeAuthModal();
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al conectar con tu espacio sagrado.';
        showToast(msg, 'error');
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserProfile, showToast, closeAuthModal]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      const userEmail = email.toLowerCase().trim();

      try {
        const { data, error } = await supabase.auth.signUp({
          email: userEmail,
          password,
          options: {
            data: { name: name.trim() },
          },
        });

        if (error) {
          showToast(error.message, 'error');
          return { success: false, error: error.message };
        }

        if (!data.session) {
          showToast('Alma registrada. Revisá tu correo para confirmar la cuenta.', 'info');
          return { success: true, needsEmailConfirmation: true };
        }

        await loadUserProfile(data.session);
        showToast('Alma registrada con éxito. Iniciando diario de calma...', 'success');
        closeAuthModal();
        return { success: true, needsEmailConfirmation: false };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al registrar tu Alma.';
        showToast(msg, 'error');
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserProfile, showToast, closeAuthModal]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      showToast('Sesión cerrada en paz.', 'info');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }, [showToast]);

  const updateProfile = useCallback(
    async (updated: Partial<UserProfile>): Promise<UserProfile | null> => {
      if (!userProfile) return null;

      const fullUpdated: UserProfile = {
        ...userProfile,
        ...updated,
      };

      setUserProfile(fullUpdated);

      try {
        const result = await apiRepository.updateUserProfile(fullUpdated);
        setUserProfile(result);
        return result;
      } catch (err) {
        console.error('Error al actualizar perfil de usuario:', err);
        showToast('Error al sincronizar perfil.', 'error');
        return fullUpdated;
      }
    },
    [userProfile, showToast]
  );

  const value: AuthContextValue = {
    user,
    session,
    userProfile,
    isAdmin,
    isLoading,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    login,
    signUp,
    logout,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }
  return context;
};
