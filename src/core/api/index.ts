import type { IRepository } from './IRepository';
import { MockRepository } from './MockRepository';
import { SupabaseRepository } from './SupabaseRepository';

export * from './IRepository';
export * from './MockRepository';
export * from './SupabaseRepository';

const useSupabase = import.meta.env?.VITE_USE_SUPABASE === 'true';

// Singleton del repositorio correspondiente
export const apiRepository: IRepository = useSupabase
  ? new SupabaseRepository()
  : new MockRepository();

console.log(
  `[Aurea API] Inicializado repositorio en modo: ${
    useSupabase ? 'SUPABASE (Mock/Fase 4)' : 'LOCAL_MOCK'
  }`
);
