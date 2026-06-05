import type { IRepository } from './IRepository';
import { MockRepository } from './MockRepository';
import { SupabaseRepository } from './SupabaseRepository';

export * from './IRepository';
export * from './MockRepository';
export * from './SupabaseRepository';

// Usa Supabase si la URL está configurada, MockRepository como fallback
const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL);

export const apiRepository: IRepository = hasSupabase
  ? new SupabaseRepository()
  : new MockRepository();

console.log(`[Aurea API] Repositorio: ${hasSupabase ? 'SUPABASE ✓' : 'LOCAL_MOCK'}`);
