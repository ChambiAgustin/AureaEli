import { MockRepository } from './MockRepository';

/**
 * SupabaseRepository
 * Placeholder para la integración con Supabase.
 * En esta Fase 2 funciona heredando de MockRepository para mantener
 * consistencia de datos mientras no esté activa la conexión real en la Fase 4.
 */
export class SupabaseRepository extends MockRepository {
  constructor() {
    super();
    console.warn(
      'AUREA SYSTEM: SupabaseRepository instanciado en modo de transición. ' +
      'Los datos se mockearán localmente hasta completar la Fase 4.'
    );
  }
}
