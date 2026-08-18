import type { IRepository } from './IRepository';
import { MockRepository } from './MockRepository';
import { SupabaseRepository } from './SupabaseRepository';

export * from './IRepository';
export * from './MockRepository';
export * from './SupabaseRepository';

// Usa Supabase si ambas variables están configuradas, MockRepository como fallback seguro
const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const apiRepository: IRepository = hasSupabase
  ? new SupabaseRepository()
  : new MockRepository();


console.log(`[Aurea API] Repositorio: ${hasSupabase ? 'SUPABASE ✓' : 'LOCAL_MOCK'}`);
